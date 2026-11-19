<template>
  <div class="page admin-login-wrap">
    <div class="admin-card">
      <div class="admin-badge">🔐</div>
      <h1 class="title">后台管理系统</h1>
      <p class="subtitle">仅管理员可登录（权限 0）</p>

      <form @submit.prevent="submit" style="margin-top:28px">
        <div class="field">
          <label>管理员账号</label>
          <div class="input-row"><span class="icon">👤</span>
            <input v-model="username" type="text" placeholder="请输入管理员账号" autocomplete="off" />
          </div>
        </div>
        <div class="field">
          <label>密码</label>
          <div class="input-row"><span class="icon">🔒</span>
            <input v-model="password" type="password" placeholder="请输入密码" autocomplete="off" />
          </div>
        </div>
        <p v-if="msg" class="msg">{{ msg }}</p>
        <button type="submit" class="btn btn-primary submit-btn" :disabled="loading">
          {{ loading ? '验证中…' : '进入后台' }}
        </button>
      </form>
      <p class="hint">普通用户无法登录后台 · <router-link to="/home">返回首页</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminLogin } from '../api'

const router = useRouter()
const username = ref('')
const password = ref('')
const msg = ref('')
const loading = ref(false)

async function submit() {
  msg.value = ''
  if (!username.value.trim() || !password.value.trim()) {
    msg.value = '请输入账号和密码'; return
  }
  loading.value = true
  try {
    const res = await adminLogin(username.value.trim(), password.value)
    if (res.code === 200 && res.data.role === 0) {
      sessionStorage.setItem('pokemon_user', JSON.stringify(res.data))
      msg.value = '验证成功，正在进入后台…'
      setTimeout(() => router.push('/admin'), 500)
    } else {
      msg.value = res.msg || '登录失败：仅管理员可进入后台'
    }
  } catch (e) {
    msg.value = '连接服务器失败，请确认后端已启动'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
.admin-card { width: 100%; max-width: 400px; background: #fff; border: 3px solid var(--poke-blue); border-radius: 24px; box-shadow: var(--shadow); padding: 40px 34px 28px; text-align: center; }
.admin-badge { font-size: 52px; }
.title { font-size: 26px; color: var(--poke-blue); letter-spacing: 2px; margin-top: 8px; }
.subtitle { color: var(--ink-light); font-size: 13px; margin-top: 6px; }
.field { text-align: left; margin-bottom: 16px; }
.field label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 7px; }
.input-row { display: flex; align-items: center; border: 2px solid var(--line); border-radius: 12px; padding: 0 12px; background: #fbfcff; }
.input-row:focus-within { border-color: var(--poke-blue); }
.icon { font-size: 18px; margin-right: 8px; }
.input-row input { flex: 1; border: none; outline: none; background: transparent; padding: 12px 0; font-size: 15px; }
.msg { font-size: 13px; color: var(--poke-red); margin: -2px 0 12px; }
.submit-btn { width: 100%; }
.submit-btn:disabled { opacity: .6; }
.hint { font-size: 12px; color: var(--ink-light); margin-top: 18px; }
.hint a { color: var(--poke-blue); font-weight: 700; }
</style>
