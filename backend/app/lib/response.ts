import { NextResponse } from 'next/server'

/**
 * 统一成功响应：{ code: 0, message, data }
 */
export function ok<T>(data: T, message = 'ok') {
  return NextResponse.json({ code: 0, message, data })
}

/**
 * 统一失败响应：{ code: 业务码, message, data: null }
 * @param message 错误信息
 * @param code 业务错误码（默认 400，401 用于未授权）
 * @param status HTTP 状态码（默认 200，401 时传 401 触发前端跳登录）
 */
export function fail(message: string, code = 400, status = 200) {
  return NextResponse.json({ code, message, data: null }, { status })
}

/**
 * 未授权响应（HTTP 401 + 业务码 401，前端会统一跳转登录页）
 */
export function unauthorized(message = '未登录或登录已过期') {
  return fail(message, 401, 401)
}
