<script lang="ts" setup>
import { LOGIN_PAGE } from '@/router/config'
import { register } from '@/api/auth'

definePage({
  style: {
    navigationBarTitleText: '注册',
  },
})

const form = reactive({
  email: '',
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

async function handleRegister() {
  const { email, nickname, phone, password, confirmPassword } = form
  if (!email || !password) {
    uni.showToast({ title: '请输入邮箱和密码', icon: 'none' })
    return
  }
  if (password.length < 6) {
    uni.showToast({ title: '密码长度至少 6 位', icon: 'none' })
    return
  }
  if (password !== confirmPassword) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }
  try {
    await register({ email, password, phone: phone || undefined, nickname: nickname || undefined })
    uni.showToast({ title: '注册成功', icon: 'success' })
    // 注册成功后跳转到登录页
    setTimeout(() => {
      uni.navigateTo({ url: LOGIN_PAGE })
    }, 600)
  }
  catch (error) {
    console.log('注册失败', error)
  }
}
</script>

<template>
  <view class="flex min-h-screen flex-col justify-center bg-[#f8f8f8] px-8">
    <view class="mb-10">
      <view class="text-4xl font-bold text-[#018d71]">
        注册账号
      </view>
      <view class="mt-2 text-sm text-gray-400">
        加入农家优选，发现优质农产品
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
        v-model="form.nickname"
        placeholder="昵称（可选）"
        clearable
        class="mb-4"
      />
      <wd-input
        v-model="form.phone"
        type="number"
        placeholder="手机号（可选）"
        clearable
        class="mb-4"
      />
      <wd-input
        v-model="form.password"
        type="password"
        placeholder="请输入密码（至少 6 位）"
        show-password
        class="mb-4"
      />
      <wd-input
        v-model="form.confirmPassword"
        type="password"
        placeholder="请再次输入密码"
        show-password
        class="mb-6"
      />
      <wd-button type="primary" block size="large" @click="handleRegister">
        注 册
      </wd-button>
    </view>

    <view class="mt-6 text-center text-sm text-gray-500" @click="uni.navigateTo({ url: LOGIN_PAGE })">
      已有账号？
      <text class="text-[#018d71]">
        去登录
      </text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
//
</style>
