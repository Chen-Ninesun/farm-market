import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getAuthUser } from '@/app/lib/auth'
import { fail, ok, unauthorized } from '@/app/lib/response'

/**
 * PATCH /api/products/:id/status
 * 上下架产品（切换 is_published，需鉴权，仅该产品的卖家可操作）
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      return fail('只能操作自己发布的产品', 403)
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { is_published: !product.is_published },
    })

    return ok({ id: updated.id, is_published: updated.is_published }, updated.is_published ? '已上架' : '已下架')
  }
  catch (error) {
    console.error('[product status] error:', error)
    return fail('操作失败', 500, 500)
  }
}
