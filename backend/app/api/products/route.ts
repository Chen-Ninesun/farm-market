import type { Prisma, ProductCategory } from '@prisma/client'
import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getAuthUser } from '@/app/lib/auth'
import { fail, ok, unauthorized } from '@/app/lib/response'

// 公开的产品字段（含卖家昵称/头像）
const productInclude = {
  seller: {
    select: { id: true, nickname: true, avatar: true },
  },
} satisfies Prisma.ProductInclude

/**
 * GET /api/products
 * 产品列表：page/pageSize/category/keyword/sortBy(price_asc|price_desc|created_desc)
 * sellerId：筛选指定卖家的产品（本人可查看含下架的产品）
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(searchParams.get('pageSize') || '10', 10) || 10))
    const category = searchParams.get('category')
    const keyword = searchParams.get('keyword')?.trim()
    const sortBy = searchParams.get('sortBy')
    const sellerId = searchParams.get('sellerId')

    // 仅本人查询自己的产品时才包含未发布（下架）的
    const auth = sellerId ? await getAuthUser(req) : null
    const isSelf = !!(auth && auth.userId === sellerId)

    const where: Prisma.ProductWhereInput = {
      ...(isSelf ? {} : { is_published: true }),
      ...(sellerId ? { seller_id: sellerId } : {}),
      ...(category ? { category: category as ProductCategory } : {}),
      ...(keyword ? { title: { contains: keyword, mode: 'insensitive' } } : {}),
    }

    const sortMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      created_desc: { createdAt: 'desc' },
    }
    const orderBy = sortMap[sortBy || ''] || { createdAt: 'desc' as const }

    const [total, list] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: productInclude,
      }),
    ])

    return ok({
      list: list.map(p => ({ ...p, price: Number(p.price) })),
      total,
      page,
      pageSize,
    })
  }
  catch (error) {
    console.error('[products list] error:', error)
    return fail('获取产品列表失败', 500, 500)
  }
}

/**
 * POST /api/products
 * 发布产品（需鉴权，仅 SELLER 角色）
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req)
    if (!auth) {
      return unauthorized()
    }
    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!user) {
      return unauthorized('用户不存在')
    }
    if (user.role !== 'SELLER') {
      return fail('仅卖家可以发布产品', 403)
    }

    const body = await req.json().catch(() => null)
    const { title, description, category, price, unit, images, stock, origin } = body || {}

    if (!title || !description || !category || price == null || !unit) {
      return fail('请填写完整的产品信息（标题/描述/分类/价格/单位）')
    }
    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      return fail('价格不合法')
    }

    const product = await prisma.product.create({
      data: {
        seller_id: user.id,
        title,
        description,
        category,
        price: String(price),
        unit,
        images: Array.isArray(images) ? images.filter(i => typeof i === 'string') : [],
        stock: stock != null && stock !== '' ? Number(stock) : null,
        origin: origin || null,
      },
    })

    return ok({ ...product, price: Number(product.price) }, '发布成功')
  }
  catch (error) {
    console.error('[products create] error:', error)
    return fail('发布产品失败', 500, 500)
  }
}
