import jwt from 'jsonwebtoken'
import type { NextRequest } from 'next/server'
import { isTokenBlacklisted } from './redis'

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod'
// Token 有效期：7 天（秒）
export const TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60

export interface JwtPayload {
  userId: string
  role: string
  [key: string]: unknown
}

/**
 * 签发 JWT Token
 */
export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
}

/**
 * 校验 JWT Token，无效返回 null
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  }
  catch {
    return null
  }
}

/**
 * 解析 token 剩余有效秒数（用于 logout 黑名单过期时间）
 */
export function getTokenRemainingSeconds(token: string) {
  const decoded = jwt.decode(token) as { exp?: number } | null
  if (!decoded?.exp) {
    return 0
  }
  return Math.max(0, Math.floor(decoded.exp - Date.now() / 1000))
}

/**
 * 从 Authorization 头解析 token（格式：Bearer <token>）
 */
export function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : null
}

/**
 * 从请求中解析当前登录用户（含黑名单校验），未登录返回 null
 */
export async function getAuthUser(req: NextRequest) {
  const token = getTokenFromRequest(req)
  if (!token) {
    return null
  }
  // 校验是否在黑名单中（logout 后的 token 失效）
  if (await isTokenBlacklisted(token)) {
    return null
  }
  return verifyToken(token)
}
