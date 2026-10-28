<script setup>
import { ref, computed } from 'vue'

/* ---------- 海贼团配色主题 ---------- */
const THEMES = {
  straw:      { '--straw':'#f6a623', '--straw-dark':'#d6841a', '--sea':'#1b6fb3', '--sea-deep':'#0d3b5c', '--paper':'#f3e3c3', '--paper-dark':'#e3caa0', '--red':'#c0392b', '--jolly':'#1a1a1a' },
  redhair:    { '--straw':'#e13b3b', '--straw-dark':'#a81f1f', '--sea':'#7a1f1f', '--sea-deep':'#3a0d0d', '--paper':'#f3dcd0', '--paper-dark':'#e0c0ad', '--red':'#b71c1c', '--jolly':'#111111' },
  blackbeard: { '--straw':'#8e44ad', '--straw-dark':'#5e2d75', '--sea':'#2c3e50', '--sea-deep':'#0d1117', '--paper':'#d9d4e0', '--paper-dark':'#bcb6c8', '--red':'#6c3483', '--jolly':'#000000' },
  whitebeard: { '--straw':'#34495e', '--straw-dark':'#1f2d3d', '--sea':'#2c7fb8', '--sea-deep':'#0d3b5c', '--paper':'#f5f5f5', '--paper-dark':'#e2e2e2', '--red':'#c0392b', '--jolly':'#222222' }
}
const CREWS = [
  { key: 'straw', name: '草帽团' },
  { key: 'redhair', name: '红发团' },
  { key: 'blackbeard', name: '黑胡子' },
  { key: 'whitebeard', name: '白胡子' }
]

const currentCrew = ref('straw')
const themeVars = computed(() => THEMES[currentCrew.value])
function selectCrew(key) {
  currentCrew.value = key
  blip(660)
}

/* ---------- 音效 (Web Audio 合成，无版权风险) ---------- */
const soundOn = ref(false)
let audioCtx = null
let oceanGain = null
function initAudio() {
  const AC = window.AudioContext || window.webkitAudioContext
  audioCtx = new AC()
  const size = audioCtx.sampleRate * 2
  const buf = audioCtx.createBuffer(1, size, audioCtx.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < size; i++) {
    const w = Math.random() * 2 - 1
    last = (last + 0.02 * w) / 1.02
    d[i] = last * 3.5
  }
  const noise = audioCtx.createBufferSource()
  noise.buffer = buf
  noise.loop = true
  const lp = audioCtx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 550
  oceanGain = audioCtx.createGain()
  oceanGain.gain.value = 0
  noise.connect(lp).connect(oceanGain).connect(audioCtx.destination)
  noise.start()
}
function blip(freq) {
  if (!soundOn.value || !audioCtx) return
  const o = audioCtx.createOscillator()
  const g = audioCtx.createGain()
  o.type = 'square'
  o.frequency.value = freq || 520
  g.gain.setValueAtTime(0.0001, audioCtx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18)
  o.connect(g).connect(audioCtx.destination)
  o.start()
  o.stop(audioCtx.currentTime + 0.2)
}
function toggleSound() {
  if (!audioCtx) initAudio()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  soundOn.value = !soundOn.value
  if (oceanGain) oceanGain.gain.linearRampToValueAtTime(soundOn.value ? 0.12 : 0, audioCtx.currentTime + 0.5)
  if (soundOn.value) blip(720)
}

/* ---------- 名字实时同步到通缉令 ---------- */
const user = ref('')
const pass = ref('')
const posterName = computed(() => user.value.trim() || '草帽小子 · 蒙奇D路飞')

/* ---------- 登录 (留空 API_URL 走 mock) ---------- */
const API_URL = '' // ← 改成你的后端地址，例如 'https://api.xxx.com/login'
const toast = ref('⚓ 即将启航，前往伟大航道…')
const toastShow = ref(false)
const loading = ref(false)
async function doLogin(name, pwd) {
  if (!API_URL) {
    await new Promise(r => setTimeout(r, 900))
    return { ok: true, msg: '航海日志已记录，欢迎上船！' }
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: name, pass: pwd })
  })
  if (!res.ok) throw new Error('登录失败 ' + res.status)
  return await res.json()
}
async function onSubmit() {
  const name = user.value.trim() || '无名船长'
  blip(520)
  loading.value = true
  toast.value = '⚓ 校验航海口令中…'
  toastShow.value = true
  try {
    const r = await doLogin(name, pass.value)
    blip(880)
    toast.value = '⚓ ' + name + '，' + (r.msg || '伟大航道已为你敞开！')
  } catch (err) {
    blip(200)
    toast.value = '🌊 ' + err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page" :style="themeVars">
    <div class="cloud c1"></div>
    <div class="cloud c2"></div>

    <!-- 海贼团切换 -->
    <div class="crew-bar">
      <button
        v-for="c in CREWS"
        :key="c.key"
        class="crew-btn"
        :class="{ active: currentCrew === c.key }"
        @click="selectCrew(c.key)"
      >{{ c.name }}</button>
    </div>

    <!-- 音效开关 -->
    <button class="sound-toggle" @click="toggleSound" title="海浪声 / 音效">
      {{ soundOn ? '🔊' : '🔇' }}
    </button>

    <!-- 罗盘 -->
    <svg class="compass" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" stroke-width="3" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="4 4" />
      <path d="M50 8 L56 50 L50 92 L44 50 Z" fill="#fff" />
      <path d="M8 50 L50 44 L92 50 L50 56 Z" fill="#fff" opacity=".6" />
      <circle class="compass-dot" cx="50" cy="50" r="5" />
    </svg>

    <!-- 恶魔果实 -->
    <svg class="fruit f1" viewBox="0 0 40 48"><path d="M20 14 C8 14 4 28 8 40 C12 48 28 48 32 40 C36 28 32 14 20 14Z" fill="#c0392b"/><path d="M20 14 C20 6 26 4 30 6" stroke="#7a4a1f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M27 5 C30 2 34 3 34 7" stroke="#3a8a3a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>
    <svg class="fruit f2" viewBox="0 0 40 48"><path d="M20 14 C8 14 4 28 8 40 C12 48 28 48 32 40 C36 28 32 14 20 14Z" fill="#8e44ad"/><path d="M20 14 C20 6 26 4 30 6" stroke="#7a4a1f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M27 5 C30 2 34 3 34 7" stroke="#3a8a3a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>
    <svg class="fruit f3" viewBox="0 0 40 48"><path d="M20 14 C8 14 4 28 8 40 C12 48 28 48 32 40 C36 28 32 14 20 14Z" fill="#1b6fb3"/><path d="M20 14 C20 6 26 4 30 6" stroke="#7a4a1f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M27 5 C30 2 34 3 34 7" stroke="#3a8a3a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>

    <!-- 悬赏通缉令 -->
    <div class="poster">
      <div class="stamp">DEAD<br />OR<br />ALIVE</div>
      <h1>WANTED</h1>

      <!-- 草帽海贼团骷髅头 (直接展示，无旗帜) -->
      <div class="avatar">
        <svg class="emblem" viewBox="0 0 200 200" aria-hidden="true">
          <!-- 交叉骨 (位于头骨之后，深色便于在米色纸显示) -->
          <g stroke="#2a1a0f" stroke-width="10" stroke-linecap="round">
            <line x1="56" y1="166" x2="144" y2="104" />
            <line x1="144" y1="166" x2="56" y2="104" />
          </g>
          <g fill="#2a1a0f">
            <circle cx="56" cy="166" r="8" /><circle cx="144" cy="166" r="8" />
            <circle cx="56" cy="104" r="8" /><circle cx="144" cy="104" r="8" />
          </g>
          <!-- 草帽 (戴在头上) -->
          <g stroke="#2a1a0f" stroke-width="2">
            <ellipse class="hat-fill" cx="100" cy="70" rx="64" ry="15" />
            <path class="hat-fill" d="M60 68 C60 34 140 34 140 68 Z" />
            <ellipse class="hat-band" cx="100" cy="62" rx="36" ry="11" />
            <path class="hat-band-stroke" d="M64 62 q36 -9 72 0" stroke-width="4" fill="none" />
          </g>
          <!-- 头骨 (白底描边，直接印在通缉令上) -->
          <path
            d="M100 74 C74 74 66 96 66 116 C66 128 72 136 80 140 L80 150 C80 154 84 156 88 156 L112 156 C116 156 120 154 120 150 L120 140 C128 136 134 128 134 116 C134 96 126 74 100 74 Z"
            fill="#fff" stroke="#2a1a0f" stroke-width="3"
          />
          <!-- 眼窝 / 鼻 / 牙缝 -->
          <ellipse cx="86" cy="108" rx="10" ry="12" fill="#000" />
          <ellipse cx="114" cy="108" rx="10" ry="12" fill="#000" />
          <path d="M100 118 l-6 12 12 0 Z" fill="#000" />
          <g stroke="#000" stroke-width="2.5">
            <line x1="92" y1="142" x2="92" y2="155" />
            <line x1="100" y1="142" x2="100" y2="156" />
            <line x1="108" y1="142" x2="108" y2="155" />
            <line x1="84" y1="143" x2="116" y2="143" />
          </g>
        </svg>
      </div>

      <div class="wname"><span class="small">悬赏对象</span><span>{{ posterName }}</span></div>

      <div class="bounty">
        <div class="cap">赏 金</div>
        <div class="amt">1,500,000,000 <span class="berry">☓</span></div>
        <div class="unit">贝 里 (BERRY)</div>
      </div>

      <div class="login-box">
        <div class="title">★ 入 舰 登 记 ★</div>
        <form id="loginForm" @submit.prevent="onSubmit">
          <div class="field">
            <label for="user">船长之名（将印上通缉令）</label>
            <input id="user" v-model="user" type="text" placeholder="输入你的名字 / 罗杰…" @focus="blip(440)" />
          </div>
          <div class="field">
            <label for="pass">航海口令</label>
            <input id="pass" v-model="pass" type="password" placeholder="守护 ONE PIECE 的密码" required @focus="blip(440)" />
          </div>
          <button class="btn" type="submit" :disabled="loading">{{ loading ? '启航中…' : '出 发 ！' }}</button>
        </form>
        <div class="foot">
          <a href="#">忘记口令？</a>
          <a href="#">招募新船员</a>
        </div>
      </div>

      <div class="toast" :class="{ show: toastShow }">{{ toast }}</div>
    </div>

    <!-- 海浪 -->
    <div class="waves">
      <svg class="wave1" viewBox="0 0 1200 120" preserveAspectRatio="none"><path fill="#2b8fc4" d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" /></svg>
      <svg class="wave2" viewBox="0 0 1200 120" preserveAspectRatio="none"><path fill="#0d3b5c" d="M0,70 C200,20 400,110 600,70 C800,30 1000,110 1200,70 L1200,120 L0,120 Z" /></svg>
    </div>
  </div>
</template>

<!-- 全局基础样式 -->
<style>
  html, body, #app { height: 100%; margin: 0; }
  * { box-sizing: border-box; }
</style>

<!-- 组件样式 (保持原网页风格) -->
<style scoped>
  .page {
    font-family: "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #6fc3e8 0%, #2b8fc4 38%, var(--sea-deep) 100%);
    transition: background .6s;
    position: relative;
  }

  /* 顶部海贼团切换 */
  .crew-bar { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 20; flex-wrap: wrap; justify-content: center; }
  .crew-btn { border: 2px solid #fff; background: rgba(0,0,0,.28); color: #fff; padding: 7px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; letter-spacing: 1px; backdrop-filter: blur(4px); transition: transform .15s, background .2s; }
  .crew-btn:hover { transform: translateY(-2px); }
  .crew-btn.active { background: #fff; color: var(--sea-deep); }

  .sound-toggle { position: absolute; top: 16px; right: 16px; z-index: 20; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #fff; background: rgba(0,0,0,.28); color: #fff; font-size: 20px; cursor: pointer; display: grid; place-items: center; backdrop-filter: blur(4px); transition: transform .15s; }
  .sound-toggle:hover { transform: scale(1.08); }

  .cloud { position: absolute; background: rgba(255,255,255,.7); border-radius: 50%; filter: blur(2px); animation: drift 40s linear infinite; }
  .cloud::before, .cloud::after { content: ""; position: absolute; background: inherit; border-radius: 50%; }
  .cloud.c1 { width: 120px; height: 38px; top: 12%; left: -160px; }
  .cloud.c1::before { width: 60px; height: 60px; top: -26px; left: 18px; }
  .cloud.c1::after  { width: 80px; height: 80px; top: -34px; left: 48px; }
  .cloud.c2 { width: 90px; height: 30px; top: 28%; left: -200px; animation-duration: 60s; animation-delay: -20s; }
  .cloud.c2::before { width: 46px; height: 46px; top: -20px; left: 14px; }
  .cloud.c2::after  { width: 60px; height: 60px; top: -28px; left: 38px; }
  @keyframes drift { to { transform: translateX(120vw); } }

  .compass { position: absolute; left: 6%; bottom: 14%; width: 130px; height: 130px; opacity: .35; z-index: 1; animation: spin 36s linear infinite; }
  .compass-dot { fill: var(--straw); }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* 悬赏通缉令 */
  .poster {
    position: relative; width: 360px;
    background:
      repeating-linear-gradient(0deg, rgba(0,0,0,.02) 0 2px, transparent 2px 5px),
      linear-gradient(180deg, var(--paper) 0%, var(--paper-dark) 100%);
    border: 7px solid #fff; border-radius: 4px;
    box-shadow: 0 18px 50px rgba(0,0,0,.45), inset 0 0 0 2px var(--ink);
    padding: 18px 24px 24px; transform: rotate(-1.4deg); z-index: 5; transition: background .6s;
  }
  .poster::after { content: ""; position: absolute; inset: 7px; border: 1.5px dashed rgba(42,26,15,.35); border-radius: 3px; pointer-events: none; }

  .poster h1 {
    text-align: center; font-family: "Georgia", "STKaiti", serif; letter-spacing: 10px;
    font-size: 46px; color: var(--ink); font-weight: 900; text-shadow: 2px 2px 0 rgba(255,255,255,.45);
  }

  /* 草帽海贼团骷髅头 (直接展示，无旗帜) */
  .avatar { margin: 14px auto 8px; width: 160px; height: 160px; display: grid; place-items: center; }
  .emblem { width: 160px; height: 160px; display: block; filter: drop-shadow(0 2px 3px rgba(0,0,0,.25)); }
  .emblem .hat-fill { fill: var(--straw); }
  .emblem .hat-band { fill: var(--straw-dark); }
  .emblem .hat-band-stroke { stroke: var(--straw-dark); }

  .wname { text-align: center; font-size: 20px; font-weight: 900; color: var(--ink); letter-spacing: 2px; margin-top: 2px; min-height: 26px; font-family: "Georgia", serif; }
  .wname .small { font-size: 11px; color: var(--red); font-weight: 700; letter-spacing: 3px; display: block; }

  .stamp {
    position: absolute; top: -16px; right: -16px; width: 74px; height: 74px; background: var(--red); color: #fff;
    border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 800; letter-spacing: 1px;
    text-align: center; line-height: 1.15; transform: rotate(15deg); box-shadow: 0 4px 10px rgba(0,0,0,.35);
    border: 2px dashed rgba(255,255,255,.7); transition: background .6s;
  }

  .bounty { text-align: center; margin: 12px 0 4px; }
  .bounty .cap { font-size: 12px; letter-spacing: 6px; color: var(--ink); font-weight: 700; }
  .bounty .amt { display: block; font-family: "Georgia", serif; font-weight: 900; font-size: 34px; color: var(--ink); letter-spacing: 1px; text-shadow: 1px 1px 0 rgba(255,255,255,.5); }
  .bounty .amt .berry { color: var(--red); font-size: 24px; }
  .bounty .unit { font-size: 13px; color: var(--red); font-weight: 800; letter-spacing: 2px; }

  .login-box { margin-top: 16px; border-top: 2px solid var(--ink); padding-top: 14px; }
  .login-box .title { text-align: center; font-size: 12px; letter-spacing: 4px; color: var(--red); font-weight: 800; margin-bottom: 12px; }
  .field { margin-bottom: 12px; }
  .field label { display: block; font-size: 12px; letter-spacing: 2px; color: var(--ink); margin-bottom: 5px; font-weight: 700; }
  .field input {
    width: 100%; padding: 10px 12px; border: 2px solid var(--ink); border-radius: 4px;
    background: rgba(255,255,255,.65); font-size: 14px; color: var(--ink); outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .field input:focus { border-color: var(--sea); box-shadow: 0 0 0 3px rgba(27,111,179,.25); }
  .btn {
    width: 100%; margin-top: 4px; padding: 12px; border: none; border-radius: 4px;
    background: linear-gradient(180deg, var(--straw) 0%, var(--straw-dark) 100%);
    color: #fff; font-size: 16px; font-weight: 800; letter-spacing: 4px; cursor: pointer;
    box-shadow: 0 4px 0 var(--straw-dark), 0 8px 16px rgba(0,0,0,.3);
    transition: transform .08s, box-shadow .08s, background .6s;
  }
  .btn:hover { filter: brightness(1.05); }
  .btn:active { transform: translateY(4px); box-shadow: 0 0 0 var(--straw-dark), 0 3px 8px rgba(0,0,0,.3); }
  .btn:disabled { opacity: .7; cursor: default; }
  .foot { display: flex; justify-content: space-between; margin-top: 12px; font-size: 11px; color: var(--ink); }
  .foot a { color: var(--sea-deep); text-decoration: none; font-weight: 700; }
  .foot a:hover { text-decoration: underline; }

  .fruit { position: absolute; width: 26px; height: 30px; opacity: .85; z-index: 2; filter: drop-shadow(0 2px 3px rgba(0,0,0,.25)); }
  .fruit.f1 { top: 22%; right: 8%; animation: bob 4s ease-in-out infinite; }
  .fruit.f2 { bottom: 20%; right: 13%; animation: bob 5s ease-in-out infinite .6s; }
  .fruit.f3 { top: 30%; left: 7%; animation: bob 4.5s ease-in-out infinite .3s; }
  @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

  .toast { position: absolute; bottom: -58px; left: 0; right: 0; text-align: center; color: #fff; font-size: 13px; opacity: 0; transition: opacity .3s; text-shadow: 0 1px 4px rgba(0,0,0,.5); }
  .toast.show { opacity: 1; }

  .waves { position: absolute; bottom: 0; left: 0; right: 0; height: 36%; overflow: hidden; }
  .waves svg { width: 200%; height: 100%; display: block; }
  .wave1 { animation: slide 9s linear infinite; }
  .wave2 { animation: slide 14s linear infinite reverse; opacity: .6; }
  @keyframes slide { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  @media (max-width: 420px) {
    .poster { width: 92vw; }
    .compass { display: none; }
  }
</style>
