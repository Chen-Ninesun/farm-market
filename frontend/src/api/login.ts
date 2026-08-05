import type { IUserInfoRes } from './types/login'
import { http } from '@/http/http'
import { login as _login, logout as _logout, register as _register } from './auth'
import type { ILoginForm, ILoginRes, IRegisterForm } from './auth'

export type { ILoginForm, ILoginRes, IRegisterForm } from './auth'
export { register } from './auth'

/**
 * 用户登录（邮箱 + 密码）
 * @param loginForm 登录表单
 */
export function login(loginForm: ILoginForm) {
  return _login(loginForm)
}

/**
 * 退出登录
 */
export function logout() {
  return _logout()
}

/**
 * 获取用户信息（映射后端字段：userId = id, username = email）
 */
export function getUserInfo() {
  return http.get<IUserInfoRes>('/api/auth/me').then((data) => {
    return {
      ...data,
      userId: data.id ?? data.userId,
      username: data.email ?? data.username,
    }
  })
}

/**
 * 刷新token（预留：后端暂未实现双 token 模式）
 */
export function refreshToken(refreshToken: string) {
  return http.post<ILoginRes>('/api/auth/login', { refreshToken })
}

/**
 * 获取微信登录凭证
 * @returns Promise 包含微信登录凭证(code)
 */
export function getWxCode() {
  return new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: res => resolve(res),
      fail: err => reject(new Error(err)),
    })
  })
}

/**
 * 微信登录（预留：后端暂未实现，MVP 阶段使用邮箱登录）
 */
export function wxLogin(data: { code: string }) {
  return http.post<ILoginRes>('/api/auth/login', data)
}
