import { requestDelete, requestGet, requestPatch, requestPost, requestPut } from '@/utils/request'

/** 产品分类枚举（与后端一致） */
export type ProductCategory = 'VEGETABLE' | 'FRUIT' | 'GRAIN' | 'MEAT' | 'DAIRY' | 'OTHER'

/** 分类选项（用于分类导航/选择器） */
export const CATEGORY_OPTIONS: { label: string; value: ProductCategory }[] = [
  { label: '蔬菜', value: 'VEGETABLE' },
  { label: '水果', value: 'FRUIT' },
  { label: '粮食', value: 'GRAIN' },
  { label: '肉类', value: 'MEAT' },
  { label: '蛋奶', value: 'DAIRY' },
  { label: '其他', value: 'OTHER' },
]

export function categoryLabel(value: string) {
  return CATEGORY_OPTIONS.find(item => item.value === value)?.label || '其他'
}

/** 产品（含卖家信息） */
export interface IProduct {
  id: string
  seller_id: string
  title: string
  description: string
  category: ProductCategory
  price: number
  unit: string
  images: string[]
  stock: number | null
  origin: string | null
  is_published: boolean
  view_count: number
  createdAt: string
  seller?: {
    id: string
    nickname: string
    avatar: string | null
  }
}

/** 产品列表分页结果 */
export interface IProductListRes {
  list: IProduct[]
  total: number
  page: number
  pageSize: number
}

/** 产品列表查询参数 */
export interface IProductQuery {
  page?: number
  pageSize?: number
  category?: ProductCategory
  keyword?: string
  sortBy?: 'price_asc' | 'price_desc' | 'created_desc'
  sellerId?: string
}

/** 发布/编辑产品表单 */
export interface IProductForm {
  title: string
  description: string
  category: ProductCategory
  price: number | string
  unit: string
  images?: string[]
  stock?: number
  origin?: string
}

/**
 * 产品列表
 */
export function getProductList(params: IProductQuery = {}) {
  return requestGet<IProductListRes>('/api/products', params as Record<string, any>)
}

/**
 * 产品详情
 */
export function getProductDetail(id: string) {
  return requestGet<IProduct>(`/api/products/${id}`)
}

/**
 * 发布产品（仅 SELLER）
 */
export function createProduct(data: IProductForm) {
  return requestPost<IProduct>('/api/products', data as unknown as Record<string, any>)
}

/**
 * 编辑产品（仅该产品卖家）
 */
export function updateProduct(id: string, data: Partial<IProductForm>) {
  return requestPut<IProduct>(`/api/products/${id}`, data as unknown as Record<string, any>)
}

/**
 * 删除产品（软删除）
 */
export function deleteProduct(id: string) {
  return requestDelete<null>(`/api/products/${id}`)
}

/**
 * 上下架产品
 */
export function toggleProductStatus(id: string) {
  return requestPatch<{ id: string; is_published: boolean }>(`/api/products/${id}/status`)
}
