import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getAuthUser } from '@/app/lib/auth'
import { ok, unauthorized } from '@/app/lib/response'

/**
 * GET /api/auth/me
 * 从 Authorization 头解析 JWT，返回当前用户信息（需鉴权）
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) {
    return unauthorized()
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      phone: true,
      nickname: true,
      avatar: true,
      role: true,
      is_active: true,
      createdAt: true,
    },
  })

  if (!user || !user.is_active) {
    return unauthorized('用户不存在或已被禁用')
  }

  return ok(user, 'ok')
}
