<template>
  <div v-if="show" class="guide-mask" @click.self="close">
    <div class="guide-box">
      <div class="guide-hero">
        <span class="pokeball guide-ball"></span>
        <h2>欢迎来到宝可梦世界</h2>
        <p>这里是「最终完整版」宝可梦图鉴与冒险中心</p>
      </div>

      <ul class="guide-list">
        <li>
          <span class="g-ico">📖</span>
          <div><b>查图鉴</b><small>46 只原著宝可梦，种族值、特性、进化链、蛋群一应俱全</small></div>
        </li>
        <li>
          <span class="g-ico">🌿</span>
          <div><b>去捕捉</b><small>草丛、山洞、水域各有不同的宝可梦，神兽与闪光极难遇见</small></div>
        </li>
        <li>
          <span class="g-ico">🏛️</span>
          <div><b>打道馆</b><small>按动画顺序挑战 16 位馆主，集齐一个地区的徽章解锁该地区联盟大赛</small></div>
        </li>
        <li>
          <span class="g-ico">🥚</span>
          <div><b>养精灵</b><small>孵蛋、升级、强化，带着 6 只队伍挑战四天王与冠军</small></div>
        </li>
      </ul>

      <p class="guide-tip">小提示：所有进度会自动保存在本机浏览器，刷新不会丢失。</p>

      <button class="btn btn-primary guide-btn" @click="close">开始冒险</button>
    </div>
  </div>
</template>

<script setup>
/**
 * 新手引导弹窗：首次进入网站时显示一次，关闭后写入标记不再自动弹出。
 */
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const KEY = 'pokemon_guide_seen'
function safeGet(k) {
  try { return typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null } catch { return null }
}
function safeSet(k, v) {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(k, v) } catch { /* ignore */ }
}

const route = useRoute()
const show = ref(false)

// 只在进入主站（非登录/注册页）且从未看过引导时弹出
watch(() => route.path, p => {
  const authPages = ['/login', '/register', '/admin-login']
  if (!authPages.includes(p) && safeGet(KEY) !== '1') show.value = true
}, { immediate: true })

function close() {
  show.value = false
  safeSet(KEY, '1')
}
</script>

<style scoped>
.guide-mask { position: fixed; inset: 0; background: rgba(38, 44, 56, .52); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 9998; padding: 20px; }
.guide-box { width: 100%; max-width: 480px; background: #fff; border-radius: 22px; padding: 26px; box-shadow: 0 18px 50px rgba(30, 40, 70, .22); animation: guide-in .28s ease; }
@keyframes guide-in { from { opacity: 0; transform: translateY(14px) scale(.97) } to { opacity: 1; transform: none } }

.guide-hero { text-align: center; padding-bottom: 16px; border-bottom: 1px dashed var(--line); }
.guide-ball { width: 34px; height: 34px; margin-bottom: 8px; }
.guide-hero h2 { font-size: 21px; color: var(--ink); }
.guide-hero p { font-size: 13px; color: var(--ink-light); margin-top: 5px; }

.guide-list { list-style: none; display: flex; flex-direction: column; gap: 12px; margin: 18px 0; }
.guide-list li { display: flex; gap: 12px; align-items: flex-start; }
.g-ico { width: 34px; height: 34px; border-radius: 11px; background: var(--poke-blue-soft); display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
.guide-list b { display: block; font-size: 14.5px; color: var(--ink); }
.guide-list small { font-size: 12.5px; color: var(--ink-light); line-height: 1.65; }

.guide-tip { font-size: 12px; color: var(--ink-light); background: var(--poke-orange-soft); border-radius: 10px; padding: 10px 12px; line-height: 1.7; }
.guide-btn { width: 100%; margin-top: 18px; }
</style>
