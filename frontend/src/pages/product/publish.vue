<script lang="ts" setup>
import { CATEGORY_OPTIONS, createProduct } from '@/api/product'
import type { IProductForm } from '@/api/product'
import type { UploadFile } from '@wot-ui/ui/components/wd-upload/types'
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'

definePage({
  style: {
    navigationBarTitleText: '发布产品',
  },
})

const tokenStore = useTokenStore()
const userStore = useUserStore()

// 图片列表（wd-upload 的值：{ url, name?, status?, response? }[]）
const fileList = ref<UploadFile[]>([])
// 已成功上传到后端的图片地址（/uploads/xxx）
const uploadedUrls = ref<string[]>([])

// 上传地址：绝对 URL（避免拦截器重复拼接 /api 前缀）
const uploadAction = `${import.meta.env.VITE_SERVER_BASEURL}/api/upload`

const form = reactive<IProductForm>({
  title: '',
  description: '',
  category: 'VEGETABLE',
  price: '',
  unit: '斤',
  stock: undefined,
  origin: '',
})

const pickerColumns = CATEGORY_OPTIONS.map((item, index) => ({ label: item.label, value: index }))
const pickerIndex = ref(0)
const pickerValue = ref<(string | number)[]>([])

function onCategoryChange({ value }: { value: (string | number)[] }) {
  const idx = Number(value[0])
  pickerIndex.value = idx
  form.category = CATEGORY_OPTIONS[idx].value
}

/**
 * wd-upload 上传成功/变化时，收集后端返回的 /uploads/xxx 地址
 */
function onUploadChange({ fileList: list }: { fileList: Record<string, any>[] }) {
  uploadedUrls.value = list
    .filter(item => item.status === 'success' && item.response)
    .map((item) => {
      try {
        const resp = typeof item.response === 'string' ? JSON.parse(item.response) : item.response
        return resp?.code === 0 ? resp.data?.url : ''
      }
      catch {
        return ''
      }
    })
    .filter(Boolean)
}

async function handlePublish() {
  if (!tokenStore.hasLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  if (userStore.userInfo.role !== 'SELLER') {
    uni.showToast({ title: '仅卖家可以发布产品', icon: 'none' })
    return
  }
  if (!form.title || !form.description || !form.price || !form.unit) {
    uni.showToast({ title: '请填写完整的产品信息', icon: 'none' })
    return
  }
  try {
    await createProduct({
      ...form,
      price: Number(form.price),
      images: uploadedUrls.value,
      stock: form.stock ? Number(form.stock) : undefined,
    })
    uni.showToast({ title: '发布成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 600)
  }
  catch (error) {
    console.error('发布产品失败', error)
  }
}
</script>

<template>
  <view class="min-h-screen bg-[#f7f8fa] pb-10">
    <view class="bg-white px-4 py-2">
      <wd-cell-group border>
        <wd-input v-model="form.title" label="标题" placeholder="请输入产品名称" />
        <wd-textarea
          v-model="form.description"
          :maxlength="500"
          placeholder="介绍一下你的产品"
        />
        <wd-cell title="分类" is-link>
          <wd-picker
            v-model="pickerValue"
            :columns="pickerColumns"
            label="选择分类"
            @confirm="onCategoryChange"
          >
            <view class="text-sm text-gray-600">
              {{ CATEGORY_OPTIONS[pickerIndex].label }}
            </view>
          </wd-picker>
        </wd-cell>
        <wd-input v-model="form.price" label="价格" type="number" placeholder="请输入价格" />
        <wd-input v-model="form.unit" label="单位" placeholder="如：斤/箱/个" />
        <wd-input v-model="form.stock" label="库存" type="number" placeholder="可选" />
        <wd-input v-model="form.origin" label="产地" placeholder="如：四川成都" />
      </wd-cell-group>
    </view>

    <!-- 图片上传 -->
    <view class="mt-2 bg-white px-4 py-4">
      <view class="mb-2 text-sm text-gray-600">
        产品图片
      </view>
      <wd-upload
        v-model:file-list="fileList"
        :action="uploadAction"
        name="file"
        accept="image"
        :limit="6"
        @change="onUploadChange"
      />
    </view>

    <view class="mt-6 px-6">
      <wd-button type="primary" block size="large" @click="handlePublish">
        发布产品
      </wd-button>
    </view>
  </view>
</template>
