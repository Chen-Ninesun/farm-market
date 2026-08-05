import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getAuthUser } from '@/app/lib/auth'
import redis from '@/app/lib/redis'
import { fail, ok, unauthorized } from '@/app/lib/response'

/**
 * GET /api/products/:id
 * 产品详情（调用模拟 Redis 的 incr 增加浏览数，返回完整信息含卖家昵称）
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, nickname: true, avatar: true } },
      },
    })
    if (!product) {
      return fail('产品不存在或已下架', 404, 404)
    }

    // 模拟 Redis incr + 真实浏览数落库
    await redis.incr(`product:view:${id}`)
    await prisma.product.update({
      where: { id },
      data: { view_count: { increment: 1 } },
    })

    return ok({ ...product, price: Number(product.price), view_count: product.view_count + 1 })
  }
  catch (error) {
    console.error('[product detail] error:', error)
    return fail('获取产品详情失败', 500, 500)
  }
}

/**
 * PUT /api/products/:id
 * 编辑产品（需鉴权，仅该产品的卖家可操作）
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await getAuthUser(req)
    if (!auth) {
      return unauthorized()
    }

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return fail('产品不存在', 404, 404)
    }
    if (product.seller_id !== auth.userId) {
      return fail('只能编辑自己发布的产品', 403)
    }

    const body = await req.json().catch(() => null)
    const { title, description, category, price, unit, images, stock, origin } = body || {}

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: title ?? product.title,
        description: description ?? product.description,
        category: category ?? product.category,
        price: price != null ? String(price) : product.price,
        unit: unit ?? product.unit,
        images: Array.isArray(images) ? images : product.images,
        stock: stock != null && stock !== '' ? Number(stock) : product.stock,
        origin: origin ?? product.origin,
      },
    })

    return ok({ ...updated, price: Number(updated.price) }, '更新成功')
  }
  catch (error) {
    console.error('[product update] error:', error)
    return fail('更新产品失败', 500, 500)
  }
}

/**
 * DELETE /api/products/:id
 * 删除产品（软删除：将 is_published 设为 false）
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await getAuthUser(req)
    if (!auth) {
      return unauthorized()
    }

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return fail('产品不存在', 404, 404)
    }
    if (product.seller_id !== auth.userId) {
      return fail('只能删除自己发布的产品', 403)
    }

    await prisma.product.update({
      where: { id },
      data: { is_published: false },
    })

    return ok(null, '删除成功')
  }
  catch (error) {
    console.error('[product delete] error:', error)
    return fail('删除产品失败', 500, 500)
  }
}
