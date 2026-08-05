import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { signToken, TOKEN_EXPIRES_IN } from '@/app/lib/auth'
import { fail, ok } from '@/app/lib/response'

/**
 * POST /api/auth/login
 * 邮箱+密码登录，签发 7 天有效期的 JWT Token，返回 token + 用户信息
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const { email, password } = body || {}

    if (!email || !password) {
      return fail('邮箱和密码不能为空')
    }

    const user = await prisma.user.findUnique({ where: { email } })
    // 用户不存在或已禁用，统一提示"邮箱或密码错误"
    if (!user || !user.is_active) {
      return fail('邮箱或密码错误')
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return fail('邮箱或密码错误')
    }

    const token = signToken({ userId: user.id, role: user.role })

    return ok(
      {
        token,
        expiresIn: TOKEN_EXPIRES_IN,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role,
        },
      },
      '登录成功',
    )
  }
  catch (error) {
    console.error('[login] error:', error)
    return fail('登录失败，请稍后重试', 500, 500)
  }
}
