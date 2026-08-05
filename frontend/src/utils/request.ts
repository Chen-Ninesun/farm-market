import type { CustomRequestOptions } from '@/http/types'
import { http } from '@/http/http'
import { useTokenStore } from '@/store/token'

/**
 * 解析请求 URL：
 * - H5：返回相对路径（如 /api/xxx），由 Vite dev server 代理转发到后端
 * - 微信小程序：拼接完整域名（uni.request 需要绝对地址）
 */
export function resolveUrl(url: string) {
  // #ifdef MP-WEIXIN
  if (/^https?:\/\//.test(url)) {
    return url
  }
  const base = import.meta.env.VITE_SERVER_BASEURL__WEIXIN_DEVELOP || import.meta.env.VITE_SERVER_BASEURL
  return `${base}${url}`
  // #endif
  // #ifndef MP-WEIXIN
  return url
  // #endif
}

/**
 * 解析图片/静态资源 URL（后端上传的资源为相对路径 /uploads/xxx）：
 * - H5：拼接后端 dev server 地址（<image> 不受浏览器 CORS 限制）
 * - 微信小程序：拼接完整域名
 */
export function resolveAssetUrl(url?: string | null) {
  if (!url) {
    return ''
  }
  if (/^https?:\/\//.test(url) || url.startsWith('/static/')) {
    return url
  }
  // #ifdef MP-WEIXIN
  const base = import.meta.env.VITE_SERVER_BASEURL__WEIXIN_DEVELOP || import.meta.env.VITE_SERVER_BASEURL
  return `${base}${url}`
  // #endif
  // #ifndef MP-WEIXIN
  return `${import.meta.env.VITE_SERVER_BASEURL}${url}`
  // #endif
}

/**
 * 统一请求封装（基于 uni.request）：
 * - 自动从 token store 获取 token 放入 Authorization 头（Bearer <token>）
 * - 401 自动清理登录态并跳转登录页（由 http.ts 统一处理）
 * - 返回 Promise<T>（resolve 业务 data）
 */
export function request<T>(options: CustomRequestOptions) {
  const token = useTokenStore().updateNowTime().validToken
  return http<T>({
    ...options,
    url: resolveUrl(options.url),
    header: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.header,
    },
  })
}

/**
 * GET 请求
 */
export function requestGet<T>(url: string, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return request<T>({ url, query, method: 'GET', header, ...options })
}

/**
 * POST 请求
 */
export function requestPost<T>(url: string, data?: Record<string, any>, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return request<T>({ url, data, query, method: 'POST', header, ...options })
}

/**
 * PUT 请求
 */
export function requestPut<T>(url: string, data?: Record<string, any>, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return request<T>({ url, data, query, method: 'PUT', header, ...options })
}

/**
 * PATCH 请求
 */
export function requestPatch<T>(url: string, data?: Record<string, any>, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return request<T>({ url, data, query, method: 'PATCH', header, ...options })
}

/**
 * DELETE 请求
 */
export function requestDelete<T>(url: string, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return request<T>({ url, query, method: 'DELETE', header, ...options })
}
