<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { LOGIN_PAGE, REGISTER_PAGE } from '@/router/config'
import { categoryLabel, deleteProduct, getProductList, toggleProductStatus } from '@/api/product'
import type { IProduct } from '@/api/product'
import { updateProfile } from '@/api/user'
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'
import { resolveAssetUrl } from '@/utils/request'

definePage({
  style: {
    navigationBarTitleText: '个人中心',
  },
})

const tokenStore = useTokenStore()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const myProducts = ref<IProduct[]>([])
const loading = ref(false)

const roleText: Record<string, string> = {
  BUYER: '买家',
  SELLER: '卖家',
  ADMIN: '管理员',
}

async function fetchMyProducts() {
  if (!tokenStore.hasLogin) {
    myProducts.value = []
    return
  }
  loading.value = true
  try {
    const res = await getProductList({
      sellerId: String(userInfo.value.userId),
      pageSize: 50,
    })
    myProducts.value = res.list
  }
  catch (error) {
    console.error('获取我的产品失败', error)
  }
  finally {
    loading.value = false
  }
}

async function refreshAll() {
  if (tokenStore.hasLogin) {
    await userStore.fetchUserInfo()
  }
  await fetchMyProducts()
}

onShow(() => {
  refreshAll()
})

function goLogin() {
  uni.navigateTo({ url: LOGIN_PAGE })
}

function goRegister() {
  uni.navigateTo({ url: REGISTER_PAGE })
}

function goPublish() {
  uni.navigateTo({ url: '/pages/product/publish' })
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/product/detail?id=${id}` })
}

/** 买家申请成为卖家 */
async function applySeller() {
  uni.showModal({
    title: '提示',
    content: '申请成为卖家后即可发布产品，确认升级？',
    success: async (res) => {
      if (!res.confirm) {
        return
      }
      try {
        await updateProfile({ role: 'SELLER' })
        uni.showToast({ title: '升级成功', icon: 'success' })
        await userStore.fetchUserInfo()
      }
      catch (error) {
        console.error('升级失败', error)
      }
    },
  })
}

/** 上下架 */
async function handleToggle(item: IProduct) {
  try {
    await toggleProductStatus(item.id)
    uni.showToast({ title: '操作成功', icon: 'success' })
    fetchMyProducts()
  }
  catch (error) {
    console.error('操作失败', error)
  }
}

/** 删除（软删除） */
function handleDelete(item: IProduct) {
  uni.showModal({
    title: '提示',
    content: '确定删除该产品吗？',
    success: async (res) => {
      if (!res.confirm) {
        return
      }
      try {
        await deleteProduct(item.id)
        uni.showToast({ title: '删除成功', icon: 'success' })
        fetchMyProducts()
      }
      catch (error) {
        console.error('删除失败', error)
      }
    },
  })
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        await tokenStore.logout()
        uni.showToast({ title: '退出登录成功', icon: 'success' })
        myProducts.value = []
      }
    },
  })
}
</script>

<template>
  <view class="min-h-screen bg-[#f7f8fa] pb-10">
    <!-- 未登录 -->
    <view v-if="!tokenStore.hasLogin" class="flex flex-col items-center bg-white px-6 py-16">
      <image
        src="/static/images/default-avatar.png"
        mode="aspectFill"
        class="h-20 w-20 rounded-full bg-gray-100"
      />
      <view class="mt-4 text-lg font-medium text-gray-700">
        登录后开启农家好物之旅
      </view>
      <view class="mt-6 flex gap-4">
        <wd-button type="primary" @click="goLogin">
          登录
        </wd-button>
        <wd-button plain @click="goRegister">
          注册
        </wd-button>
      </view>
    </view>

    <!-- 已登录 -->
    <template v-else>
      <view class="flex items-center bg-white px-5 py-6">
        <image
          :src="resolveAssetUrl(userInfo.avatar) || '/static/images/default-avatar.png'"
          mode="aspectFill"
          class="h-16 w-16 rounded-full bg-gray-100"
        />
        <view class="ml-4">
          <view class="flex items-center gap-2">
            <text class="text-lg font-medium text-gray-800">
              {{ userInfo.nickname }}
            </text>
            <text class="rounded bg-[#018d71]/10 px-2 py-0.5 text-xs text-[#018d71]">
              {{ roleText[userInfo.role] || '买家' }}
            </text>
          </view>
          <view class="mt-1 text-xs text-gray-400">
            {{ userInfo.email || userInfo.username }}
          </view>
        </view>
      </view>

      <!-- 操作区 -->
      <view class="mt-2 flex bg-white p-4">
        <template v-if="userInfo.role === 'SELLER'">
          <view class="flex-1 text-center" @click="goPublish">
            <text class="text-xl">📦</text>
            <view class="mt-1 text-xs text-gray-600">
              发布产品
            </view>
          </view>
        </template>
        <view v-else class="flex-1 text-center" @click="applySeller">
          <text class="text-xl">🏪</text>
          <view class="mt-1 text-xs text-gray-600">
            成为卖家
          </view>
        </view>
        <view class="flex-1 text-center" @click="handleLogout">
          <text class="text-xl">🚪</text>
          <view class="mt-1 text-xs text-gray-600">
            退出登录
          </view>
        </view>
      </view>

      <!-- 我的发布 -->
      <view class="mt-2 bg-white px-4 py-4">
        <view class="mb-3 flex items-center justify-between">
          <text class="text-base font-medium text-gray-800">
            我的发布
          </text>
          <text class="text-xs text-gray-400">
            共 {{ myProducts.length }} 件
          </text>
        </view>

        <view v-if="myProducts.length === 0" class="py-10 text-center text-sm text-gray-400">
          <template v-if="userInfo.role === 'SELLER'">
            还没有发布产品，去发布第一件吧
          </template>
          <template v-else>
            成为卖家后即可发布产品
          </template>
        </view>

        <view
          v-for="item in myProducts"
          :key="item.id"
          class="mb-3 flex overflow-hidden rounded-xl border border-gray-100 bg-white"
        >
          <image
            :src="resolveAssetUrl(item.images?.[0])"
            mode="aspectFill"
            class="h-24 w-24 flex-shrink-0 bg-gray-100"
          />
          <view class="flex flex-1 flex-col justify-between p-3">
            <view @click="goDetail(item.id)">
              <view class="truncate text-sm text-gray-800">
                {{ item.title }}
              </view>
              <view class="mt-1 flex items-center justify-between">
                <text class="text-base font-bold text-[#e54d42]">
                  ¥{{ item.price }}
                  <text class="text-xs font-normal text-gray-400">
                    /{{ item.unit }}
                  </text>
                </text>
                <text class="text-xs text-gray-400">
                  {{ categoryLabel(item.category) }}
                </text>
              </view>
            </view>
            <view class="flex items-center gap-2">
              <text class="rounded px-1.5 py-0.5 text-xs" :class="item.is_published ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'">
                {{ item.is_published ? '在售' : '已下架' }}
              </text>
              <text class="ml-auto text-xs text-[#018d71]" @click="handleToggle(item)">
                {{ item.is_published ? '下架' : '上架' }}
              </text>
              <text class="text-xs text-red-400" @click="handleDelete(item)">
                删除
              </text>
            </view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>
