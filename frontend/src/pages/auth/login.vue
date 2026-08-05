<script lang="ts" setup>
import { REGISTER_PAGE } from '@/router/config'
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationBarTitleText: '登录',
  },
})

const tokenStore = useTokenStore()
const form = reactive({
  email: '',
  password: '',
})

async function handleLogin() {
  if (!form.email || !form.password) {
    uni.showToast({ title: '请输入邮箱和密码', icon: 'none' })
    return
  }
  try {
    await tokenStore.login({
      email: form.email,
      password: form.password,
    })
    uni.navigateBack()
  }
  catch (error) {
    console.log('登录失败', error)
  }
}
</script>

<template>
  <view class="flex min-h-screen flex-col justify-center bg-[#f8f8f8] px-8">
    <view class="mb-10">
      <view class="text-4xl font-bold text-[#018d71]">
        农家优选
      </view>
      <view class="mt-2 text-sm text-gray-400">
        农家产品销售展示平台
      </view>
    </view>

    <view class="rounded-2xl bg-white p-6 shadow-sm">
      <wd-input
        v-model="form.email"
        type="email"
        placeholder="请输入邮箱"
        clearable
        class="mb-4"
      />
      <wd-input
        v-model="form.password"
        type="password"
        placeholder="请输入密码"
        show-password
        class="mb-6"
      />
      <wd-button type="primary" block size="large" @click="handleLogin">
        登 录
      </wd-button>
    </view>

    <view class="mt-6 text-center text-sm text-gray-500" @click="uni.navigateTo({ url: REGISTER_PAGE })">
      还没有账号？
      <text class="text-[#018d71]">
        去注册
      </text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
//
</style>
