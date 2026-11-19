<template>
  <div class="page auth-wrap">
    <div class="particles"><span v-for="n in 14" :key="n" :style="pStyle(n)"></span></div>
    <div class="auth-card">
      <div class="logo"><img src="/pokemon/133.png" alt="伊布" class="pika" /></div>
      <h1 class="title">加入训练家</h1>
      <p class="subtitle">注册账号 · 开启你的宝可梦图鉴之旅</p>

      <form @submit.prevent="submit" style="margin-top:26px">
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
        <div class="field">
          <label>确认密码</label>
          <div class="input-row"><span class="icon">✅</span>
            <input v-model="confirm" type="password" placeholder="请再次输入密码" autocomplete="off" />
          </div>
        </div>
        <div class="field">
          <label>图形验证码 <span class="captcha-tip">（看不清点击图片刷新）</span></label>
          <Captcha ref="captchaRef" v-model="captcha" @enter="submit" />
        </div>
        <p v-if="msg" class="msg" :class="{ ok: success }">{{ msg }}</p>
        <button type="submit" class="btn btn-primary submit-btn" :disabled="loading">
          {{ loading ? '请稍候…' : '注册成为训练家' }}
        </button>
      </form>
      <p class="hint">已有账号？<router-link to="/login">返回登录</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api'
import Captcha from '../components/Captcha.vue'

const router = useRouter()
const username = ref('')
const password = ref('')
const confirm = ref('')
const captcha = ref('')
const captchaRef = ref(null)
const msg = ref('')
const success = ref(false)
const loading = ref(false)

function pStyle(n) {
  return {
    left: ((n * 41) % 100) + '%',
    animationDelay: (n % 5) * 0.7 + 's',
    width: (6 + (n % 3) * 4) + 'px',
    height: (6 + (n % 3) * 4) + 'px'
  }
}

async function submit() {
  msg.value = ''
  if (!username.value.trim() || !password.value.trim()) {
    success.value = false; msg.value = '请填写用户名和密码'; return
  }
  if (password.value !== confirm.value) {
    success.value = false; msg.value = '两次输入的密码不一致'; return
  }
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
  loading.value = true
  try {
    const res = await register(username.value.trim(), password.value)
    if (res.code === 200) {
      success.value = true
      msg.value = '注册成功！正在跳转登录…'
      setTimeout(() => router.push('/login'), 800)
    } else {
      success.value = false
      msg.value = res.msg || '注册失败'
    }
  } catch (e) {
    success.value = false
    msg.value = '连接服务器失败，请确认后端已启动'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
.particles { position: fixed; inset: 0; overflow: hidden; pointer-events: none; }
.particles span { position: absolute; top: 100%; background: var(--poke-yellow); border-radius: 50%; opacity: .5; animation: float 9s linear infinite; }
@keyframes float { 0%{transform:translateY(0) rotate(0);opacity:0} 10%{opacity:.6} 90%{opacity:.5} 100%{transform:translateY(-110vh) rotate(360deg);opacity:0} }
.auth-card { width: 100%; max-width: 420px; background: var(--card); border: 3px solid var(--poke-yellow); border-radius: 24px; box-shadow: var(--shadow); padding: 40px 34px 30px; text-align: center; }
.pika { width: 96px; height: 96px; object-fit: contain; filter: drop-shadow(0 6px 8px rgba(0,0,0,.12)); }
.title { font-size: 28px; letter-spacing: 3px; color: var(--poke-red); text-shadow: 2px 2px 0 var(--poke-yellow); margin-top: 12px; }
.subtitle { color: var(--ink-light); font-size: 13px; letter-spacing: 1px; margin-top: 4px; }
.field { text-align: left; margin-bottom: 15px; }
.field label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 7px; }
.input-row { display: flex; align-items: center; border: 2px solid var(--line); border-radius: 12px; padding: 0 12px; background: #fffdf7; }
.input-row:focus-within { border-color: var(--poke-yellow); }
.icon { font-size: 18px; margin-right: 8px; }
.input-row input { flex: 1; border: none; outline: none; background: transparent; padding: 12px 0; font-size: 15px; }
.msg { font-size: 13px; margin: -2px 0 12px; color: var(--poke-red); }
.msg.ok { color: #2e9e4f; }
.submit-btn { width: 100%; margin-top: 6px; }
.submit-btn:disabled { opacity: .6; cursor: not-allowed; }
.hint { font-size: 13px; color: var(--ink-light); margin-top: 18px; }
.hint a { color: var(--poke-blue); font-weight: 700; }
.captcha-tip { font-size: 11px; color: #aaa; font-weight: 400; }
</style>
