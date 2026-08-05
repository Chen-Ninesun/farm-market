import type { IAuthLoginRes, IUserInfoRes } from './types/login'
import { requestGet, requestPost } from '@/utils/request'

/**
 * 注册表单
 */
export interface IRegisterForm {
  email: string
  password: string
  phone?: string
  nickname?: string
}

/**
 * 登录表单（邮箱 + 密码）
 */
export interface ILoginForm {
  email: string
  password: string
}

/**
 * 登录响应：token 信息 + 用户信息
 */
export type ILoginRes = IAuthLoginRes & { user: IUserInfoRes }

/**
 * 注册
 * @param data 注册表单
 */
export function register(data: IRegisterForm) {
  return requestPost<{ id: string }>('/api/auth/register', data)
}

/**
 * 登录
 * @param data 登录表单
 */
export function login(data: ILoginForm) {
  return requestPost<ILoginRes>('/api/auth/login', data)
}

/**
 * 退出登录（token 加入黑名单）
 */
export function logout() {
  return requestPost<null>('/api/auth/logout')
}

/**
 * 获取当前登录用户信息
 */
export function getMe() {
  return requestGet<IUserInfoRes>('/api/auth/me')
}
