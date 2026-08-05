<script lang="ts" setup>
import { categoryLabel, getProductDetail } from '@/api/product'
import type { IProduct } from '@/api/product'
import { resolveAssetUrl } from '@/utils/request'

definePage({
  style: {
    navigationBarTitleText: '产品详情',
  },
})

const product = ref<IProduct | null>(null)
const current = ref(0)
const loading = ref(true)

async function fetchDetail(id: string) {
  loading.value = true
  try {
    product.value = await getProductDetail(id)
  }
  catch (error) {
    console.error('获取产品详情失败', error)
  }
  finally {
    loading.value = false
  }
}

onLoad((options) => {
  const id = options?.id as string
  if (id) {
    fetchDetail(id)
  }
})

function previewImage(index: number) {
  const urls = (product.value?.images || []).map(url => resolveAssetUrl(url))
  if (urls.length === 0) {
    return
  }
  uni.previewImage({ urls, current: urls[index] })
}
</script>

<template>
  <view v-if="product" class="min-h-screen bg-[#f7f8fa] pb-10">
    <!-- 图片轮播 -->
    <swiper
      v-if="product.images && product.images.length > 0"
      class="h-80 w-full bg-gray-200"
      indicator-dots
      circular
      :current="current"
      @change="e => (current = e.detail.current)"
    >
      <swiper-item v-for="(img, index) in product.images" :key="img" @click="previewImage(index)">
        <image :src="resolveAssetUrl(img)" mode="aspectFill" class="h-full w-full" />
      </swiper-item>
    </swiper>
    <view v-else class="flex h-80 w-full items-center justify-center bg-gray-200">
      <text class="text-sm text-gray-400">
        暂无图片
      </text>
    </view>

    <!-- 价格 + 标题 -->
    <view class="mt-2 bg-white p-4">
      <view class="flex items-baseline">
        <text class="text-3xl font-bold text-[#e54d42]">
          ¥{{ product.price }}
        </text>
        <text class="ml-1 text-sm text-gray-400">
          /{{ product.unit }}
        </text>
        <view v-if="product.stock != null" class="ml-auto text-xs text-gray-400">
          库存 {{ product.stock }}
        </view>
      </view>
      <view class="mt-2 text-lg font-medium text-gray-800">
        {{ product.title }}
      </view>
      <view class="mt-2 flex items-center text-xs text-gray-400">
        <text class="rounded bg-gray-100 px-2 py-0.5">
          {{ categoryLabel(product.category) }}
        </text>
        <text v-if="product.origin" class="ml-3">
          产地：{{ product.origin }}
        </text>
        <text class="ml-auto">
          浏览 {{ product.view_count }}
        </text>
      </view>
    </view>

    <!-- 卖家信息 -->
    <view v-if="product.seller" class="mt-2 flex items-center bg-white p-4">
      <image
        :src="resolveAssetUrl(product.seller.avatar) || '/static/images/default-avatar.png'"
        mode="aspectFill"
        class="h-12 w-12 rounded-full bg-gray-100"
      />
      <view class="ml-3">
        <view class="text-sm font-medium text-gray-800">
          {{ product.seller.nickname }}
        </view>
        <view class="text-xs text-gray-400">
          农家卖家
        </view>
      </view>
    </view>

    <!-- 产品描述 -->
    <view class="mt-2 bg-white p-4">
      <view class="mb-2 text-base font-medium text-gray-800">
        产品介绍
      </view>
      <view class="whitespace-pre-wrap text-sm leading-6 text-gray-600">
        {{ product.description }}
      </view>
    </view>
  </view>

  <view v-else-if="loading" class="py-30 text-center text-sm text-gray-400">
    加载中...
  </view>
  <view v-else class="py-30 text-center text-sm text-gray-400">
    产品不存在或已下架
  </view>
</template>
