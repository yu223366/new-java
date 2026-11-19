<template>
  <div class="page auth-wrap">
    <!-- 装饰：飘浮的精灵球 -->
    <div class="pokeballs-deco">
      <span v-for="n in 8" :key="n" class="mini-ball" :style="pStyle(n)"></span>
    </div>

    <div class="auth-card">
      <!-- 皮卡丘 + 精灵球 -->
      <div class="logo">
        <img src="/pokemon/025.png" alt="皮卡丘" class="pika" />
        <span class="logo-ball"><span></span></span>
      </div>
      <h1 class="title">精灵宝可梦</h1>
      <p class="subtitle">POKéMON · 训练家登录中心</p>

      <div class="tabs">
        <button :class="['tab', { active: mode === 'login' }]" @click="switchMode('login')">登录</button>
        <button :class="['tab', { active: mode === 'register' }]" @click="switchMode('register')">注册</button>
      </div>

      <form @submit.prevent="submit">
        <div class="field">
          <label>训练家名称</label>
          <div class="input-row"><span class="icon">👤</span>
            <input v-model="username" type="text" placeholder="请输入用户名" autocomplete="off" />
          </div>
        </div>
        <div class="field">
          <label>密码</label>
          <div class="input-row"><span class="icon">🔒</span>
            <input v-model="password" type="password" placeholder="请输入密码" autocomplete="off" />
          </div>
        </div>
        <div class="field" v-if="mode === 'register'">
          <label>图形验证码 <span class="captcha-tip">（看不清点击图片刷新）</span></label>
          <Captcha ref="captchaRef" v-model="captcha" @enter="submit" />
        </div>
        <p v-if="msg" class="msg" :class="{ ok: success }">{{ msg }}</p>
        <button type="submit" class="btn btn-primary submit-btn" :disabled="loading">
          {{ loading ? '请稍候…' : (mode === 'login' ? '开始冒险' : '注册成为训练家') }}
        </button>
      </form>

      <p class="hint">
        <template v-if="mode === 'login'">还没有账号？<a @click="switchMode('register')">立即注册</a></template>
        <template v-else>已有账号？<a @click="switchMode('login')">返回登录</a></template>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '../api'
import Captcha from '../components/Captcha.vue'
import { reloadForUser, loadFromServer, pauseCloudSync, resumeCloudSync } from '../data/gameStore'

const router = useRouter()
const mode = ref('login')
const username = ref('')
const password = ref('')
const captcha = ref('')
const captchaRef = ref(null)
const msg = ref('')
const success = ref(false)
const loading = ref(false)

function pStyle(n) {
  return {
    left: ((n * 29 + 5) % 100) + '%',
    animationDelay: (n % 5) * 0.8 + 's',
    top: ((n * 17) % 80) + '%'
  }
}

function switchMode(m) {
  mode.value = m
  msg.value = ''
  if (m === 'register') {
    captcha.value = ''
    setTimeout(() => captchaRef.value?.refresh(), 0)
  }
}

async function submit() {
  msg.value = ''
  if (!username.value.trim() || !password.value.trim()) {
    success.value = false; msg.value = '请输入用户名和密码'; return
  }
  // 注册模式：校验图形验证码
  if (mode.value === 'register') {
    if (!captcha.value.trim()) {
      success.value = false; msg.value = '请输入图形验证码'; return
    }
    if (!captchaRef.value?.validate(captcha.value)) {
      success.value = false
      msg.value = '验证码错误，请重新输入'
      captcha.value = ''
      captchaRef.value?.refresh()
      return
    }
  }
  loading.value = true
  try {
    const res = mode.value === 'login'
      ? await login(username.value.trim(), password.value)
      : await register(username.value.trim(), password.value)
    if (res.code === 200) {
      if (mode.value === 'register') {
        success.value = true; msg.value = '注册成功！请登录开始冒险。'; mode.value = 'login'
      } else {
        sessionStorage.setItem('pokemon_user', JSON.stringify(res.data))
        // 切换到该账号的独立存档，并从云端恢复（新账号将强制弹出选择御三家）
        // 先暂停云端同步，避免用本地空存档覆盖云端进度（换设备恢复的竞态）
        pauseCloudSync()
        reloadForUser()
        await loadFromServer()
        resumeCloudSync()
        success.value = true; msg.value = '登录成功，正在进入图鉴…'
        setTimeout(() => router.push('/home'), 600)
      }
    } else {
      success.value = false; msg.value = res.msg || '操作失败'
    }
  } catch (e) {
    success.value = false; msg.value = '连接服务器失败，请确认后端已启动'
  } finally { loading.value = false }
}
</script>

<style scoped>
.auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
.pokeballs-deco { position: fixed; inset: 0; overflow: hidden; pointer-events: none; }
.mini-ball { position: absolute; width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(33,33,33,.25); background: linear-gradient(180deg, rgba(238,21,21,.35) 0 50%, rgba(255,255,255,.7) 50% 100%); animation: bob 5s ease-in-out infinite; }
@keyframes bob { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-14px) rotate(25deg)} }
.auth-card { width: 100%; max-width: 420px; background: #fff; border: 4px solid var(--poke-yellow); border-radius: 24px; box-shadow: 0 14px 40px rgba(238,21,21,.18); padding: 34px 34px 26px; text-align: center; position: relative; z-index: 1; }
.logo { display: flex; align-items: center; justify-content: center; gap: 6px; position: relative; }
.pika { width: 110px; height: 110px; object-fit: contain; filter: drop-shadow(0 6px 8px rgba(0,0,0,.12)); }
.logo-ball { width: 30px; height: 30px; border-radius: 50%; border: 3px solid var(--ink); background: linear-gradient(180deg, var(--poke-red) 0 48%, #fff 48% 100%); position: relative; }
.logo-ball span { position: absolute; left: 50%; top: 50%; width: 10px; height: 10px; border-radius: 50%; background: #fff; border: 3px solid var(--ink); transform: translate(-50%,-50%); }
.title { font-size: 30px; letter-spacing: 3px; color: var(--poke-red); text-shadow: 2px 2px 0 var(--poke-yellow); }
.subtitle { color: var(--ink-light); font-size: 12px; letter-spacing: 2px; margin-top: 4px; }
.tabs { display: flex; gap: 8px; margin: 22px 0 18px; background: #f4f6fb; padding: 5px; border-radius: 30px; }
.tab { flex: 1; padding: 10px; border-radius: 24px; background: transparent; color: var(--ink-light); font-weight: 700; font-size: 15px; }
.tab.active { background: #fff; color: var(--poke-red); box-shadow: 0 2px 8px rgba(0,0,0,.1); }
.field { text-align: left; margin-bottom: 16px; }
.field label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 7px; }
.input-row { display: flex; align-items: center; border: 2px solid var(--line); border-radius: 12px; padding: 0 12px; background: #fbfcff; }
.input-row:focus-within { border-color: var(--poke-yellow); }
.icon { font-size: 18px; margin-right: 8px; }
.input-row input { flex: 1; border: none; outline: none; background: transparent; padding: 12px 0; font-size: 15px; }
.msg { font-size: 13px; margin: -4px 0 12px; color: var(--poke-red); }
.msg.ok { color: #2e9e4f; }
.submit-btn { width: 100%; margin-top: 6px; }
.submit-btn:disabled { opacity: .6; cursor: not-allowed; }
.hint { font-size: 13px; color: var(--ink-light); margin-top: 18px; }
.hint a { cursor: pointer; font-weight: 700; margin-left: 4px; color: var(--poke-blue); }
.captcha-tip { font-size: 11px; color: #aaa; font-weight: 400; }
</style>
