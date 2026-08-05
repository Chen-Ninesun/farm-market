import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { fail, ok } from '@/app/lib/response'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/auth/register
 * 邮箱+密码注册，密码 bcrypt 加密（盐值 10）
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const { email, password, phone, nickname } = body || {}

    // 基础校验
    if (!email || !password) {
      return fail('邮箱和密码不能为空')
    }
    if (!EMAIL_REGEX.test(email)) {
      return fail('邮箱格式不正确')
    }
    if (String(password).length < 6) {
      return fail('密码长度至少 6 位')
    }

    // 查重
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: phone || undefined }] },
    })
    if (exists) {
      return fail('邮箱或手机号已被注册')
    }

    // 密码加密（盐值 10）
    const hash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        password: hash,
        nickname: nickname || email.split('@')[0],
      },
    })

    return ok(
      {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
      },
      '注册成功',
    )
  }
  catch (error) {
    console.error('[register] error:', error)
    return fail('注册失败，请稍后重试', 500, 500)
  }
}
