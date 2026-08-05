import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getAuthUser } from '@/app/lib/auth'
import { ok, unauthorized } from '@/app/lib/response'

/**
 * PUT /api/users/profile
 * 更新个人信息（需鉴权），可修改 nickname / avatar
 */
export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser(req)
    if (!auth) {
      return unauthorized()
    }

    const body = await req.json().catch(() => null)
    const { nickname, avatar, role } = body || {}

    // 买家可自助申请成为卖家（卖家不可降级）
    let newRole: string | undefined
    if (role === 'SELLER') {
      const current = await prisma.user.findUnique({ where: { id: auth.userId } })
      if (current && current.role === 'BUYER') {
        newRole = 'SELLER'
      }
    }

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        ...(typeof nickname === 'string' && nickname.trim() ? { nickname: nickname.trim() } : {}),
        ...(typeof avatar === 'string' ? { avatar: avatar || null } : {}),
        ...(newRole ? { role: newRole } : {}),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        nickname: true,
        avatar: true,
        role: true,
        is_active: true,
      },
    })

    return ok(user, '更新成功')
  }
  catch (error) {
    console.error('[user update] error:', error)
    return ok(null, '更新失败')
  }
}
