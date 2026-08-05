import { requestGet, requestPut } from '@/utils/request'
import type { IProduct } from './product'

/** 用户公开信息（含产品列表） */
export interface IUserProfile {
  id: string
  nickname: string
  avatar: string | null
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  createdAt: string
  products: IProduct[]
}

/** 更新个人信息（可修改 nickname/avatar，BUYER 可申请升级为 SELLER） */
export function updateProfile(data: { nickname?: string; avatar?: string; role?: 'SELLER' }) {
  return requestPut<{
    id: string
    email: string
    phone: string | null
    nickname: string
    avatar: string | null
    role: 'BUYER' | 'SELLER' | 'ADMIN'
    is_active: boolean
  }>('/api/users/profile', data as unknown as Record<string, any>)
}

/** 查看用户公开信息（含发布的产品列表） */
export function getUserProfile(id: string) {
  return requestGet<IUserProfile>(`/api/users/${id}/profile`)
}
