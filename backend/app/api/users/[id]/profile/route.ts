import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { fail, ok } from '@/app/lib/response'

/**
 * GET /api/users/:id/profile
 * 查看卖家公开信息（昵称、头像、简介、发布的产品列表）
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        role: true,
        createdAt: true,
        products: {
          where: { is_published: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            unit: true,
            images: true,
            origin: true,
            view_count: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) {
      return fail('用户不存在', 404, 404)
    }

    return ok({
      ...user,
      products: user.products.map(p => ({ ...p, price: Number(p.price) })),
    })
  }
  catch (error) {
    console.error('[user profile] error:', error)
    return fail('获取用户信息失败', 500, 500)
  }
}
