<script lang="ts" setup>
import { CATEGORY_OPTIONS, categoryLabel, getProductList } from '@/api/product'
import type { IProduct, ProductCategory } from '@/api/product'
import { resolveAssetUrl } from '@/utils/request'

defineOptions({
  name: 'Home',
})
definePage({
  // 使用 type: "home" 属性设置首页，其他页面不需要设置，默认为page
  type: 'home',
  style: {
    // 'custom' 表示开启自定义导航栏，默认 'default'
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
    enablePullDownRefresh: true,
  },
})

const keyword = ref('')
const activeCategory = ref<ProductCategory | ''>('')
const list = ref<IProduct[]>([])
const page = ref(1)
const total = ref(0)
const loading = ref(false)
const finished = ref(false)

// 顶部安全区高度（自定义导航栏需避开状态栏/刘海）。
// 用 getSystemInfoSync 动态获取（开发者工具模拟器与真机均准确），
// 不依赖 CSS env()/var(--status-bar-height)（模拟器可能不模拟导致搜索框被刘海遮挡）
const statusBarHeight = ref(0)
try {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
}
catch { /* 兜底 0 */ }

async function fetchList(reset = false) {
  if (loading.value) {
    return
  }
  loading.value = true
  try {
    const p = reset ? 1 : page.value
    const res = await getProductList({
      page: p,
      pageSize: 10,
      category: activeCategory.value || undefined,
      keyword: keyword.value || undefined,
    })
    list.value = reset ? res.list : [...list.value, ...res.list]
    total.value = res.total
    page.value = p + 1
    finished.value = list.value.length >= res.total
  }
  catch (error) {
    console.error('获取产品列表失败', error)
  }
  finally {
    loading.value = false
  }
}

onLoad(() => {
  fetchList(true)
})

onPullDownRefresh(async () => {
  await fetchList(true)
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  if (!finished.value && !loading.value) {
    fetchList()
  }
})

function onSearch() {
  fetchList(true)
}

function selectCategory(cat: ProductCategory | '') {
  activeCategory.value = cat
  fetchList(true)
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/product/detail?id=${id}` })
}

function goListPage() {
  uni.navigateTo({ url: '/pages/product/list' })
}
</script>

<template>
  <view class="flex min-h-screen flex-col bg-[#f7f8fa]">
    <!-- 顶部搜索 -->
    <view class="bg-white px-4 pb-3" :style="{ paddingTop: `${statusBarHeight}px` }">
      <wd-search
        v-model="keyword"
        placeholder="搜索农家好物"
        :cancel-show="false"
        @search="onSearch"
      />
    </view>

    <!-- 分类导航 -->
    <scroll-view scroll-x class="whitespace-nowrap bg-white px-2 pb-3">
      <view
        class="inline-block mx-1 rounded-full px-4 py-1 text-sm"
        :class="activeCategory === '' ? 'bg-[#018d71] text-white' : 'bg-gray-100 text-gray-600'"
        @click="selectCategory('')"
      >
        全部
      </view>
      <view
        v-for="item in CATEGORY_OPTIONS"
        :key="item.value"
        class="inline-block mx-1 rounded-full px-4 py-1 text-sm"
        :class="activeCategory === item.value ? 'bg-[#018d71] text-white' : 'bg-gray-100 text-gray-600'"
        @click="selectCategory(item.value)"
      >
        {{ item.label }}
      </view>
    </scroll-view>

    <!-- 产品网格 -->
    <view class="flex-1 px-3 py-3">
      <view v-if="list.length === 0 && !loading" class="py-20 text-center text-sm text-gray-400">
        暂无产品，去逛逛别的分类吧
      </view>
      <view class="flex flex-wrap justify-between">
        <view
          v-for="item in list"
          :key="item.id"
          class="mb-3 w-[48.5%] overflow-hidden rounded-xl bg-white shadow-sm"
          @click="goDetail(item.id)"
        >
          <image
            :src="resolveAssetUrl(item.images?.[0])"
            mode="aspectFill"
            class="h-40 w-full"
          />
          <view class="p-2">
            <view class="truncate text-sm text-gray-800">
              {{ item.title }}
            </view>
            <view class="mt-1 flex items-center justify-between">
              <view class="text-base font-bold text-[#e54d42]">
                ¥{{ item.price }}
                <text class="text-xs font-normal text-gray-400">
                  /{{ item.unit }}
                </text>
              </view>
              <text class="text-xs text-gray-400">
                {{ categoryLabel(item.category) }}
              </text>
            </view>
            <view v-if="item.origin" class="mt-1 text-xs text-gray-400">
              产地：{{ item.origin }}
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="py-4 text-center text-xs text-gray-400">
        <text v-if="loading">
          加载中...
        </text>
        <text v-else-if="finished && list.length > 0">
          已经到底啦~
        </text>
      </view>
    </view>
  </view>
</template>
