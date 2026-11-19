<template>
  <div class="ann-bar">
    <span class="ann-label">📢 全服公告</span>
    <div class="ann-viewport">
      <div class="ann-track" :style="{ animationDuration: duration + 's' }">
        <span v-for="(a, i) in loopList" :key="i" class="ann-item">{{ a.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 导航下方的全服滚动公告栏
 * 触发来源：道馆挑战成功、捕获神兽等（写入 gameStore.announcements）
 * 自动轮播；相同文案去重，不会刷屏
 */
import { ref, computed, onMounted } from 'vue'
import { game } from '../data/gameStore'
import { fetchAnnouncements } from '../api/game'

const DEFAULT_TEXT = '欢迎来到宝可梦世界！完成开局选择后，就可以前往野外冒险捕捉宝可梦啦。'

// 服务端公告（多人联机时所有玩家可见）
const remote = ref([])
onMounted(async () => {
  const list = await fetchAnnouncements()
  if (Array.isArray(list)) remote.value = list.map(a => ({ text: a.content }))
})

const list = computed(() => {
  const local = Array.isArray(game.announcements) ? game.announcements : []
  const merged = [...remote.value, ...local]
  const seen = new Set()
  const uniq = merged.filter(a => {
    const t = String(a.text || '')
    if (!t || seen.has(t)) return false
    seen.add(t)
    return true
  }).slice(0, 8)
  return uniq.length ? uniq : [{ text: DEFAULT_TEXT }]
})

// 复制一份，实现无缝循环滚动
const loopList = computed(() => [...list.value, ...list.value])

const duration = computed(() => {
  const chars = list.value.reduce((n, a) => n + String(a.text).length, 0)
  return Math.max(16, Math.round(chars * 0.6))
})
</script>

<style scoped>
.ann-bar { display: flex; align-items: center; gap: 12px; padding: 6px 28px; background: linear-gradient(90deg, var(--poke-blue-soft), #fff 70%); border-top: 1px solid var(--line); overflow: hidden; }
.ann-label { flex-shrink: 0; font-size: 11.5px; font-weight: 800; color: var(--poke-blue); background: #fff; border: 1px solid #d8e0ff; padding: 3px 10px; border-radius: 10px; white-space: nowrap; }
.ann-viewport { flex: 1; min-width: 0; overflow: hidden; height: 20px; display: flex; align-items: center; }
.ann-track { display: inline-flex; gap: 56px; white-space: nowrap; animation: ann-scroll linear infinite; will-change: transform; }
.ann-item { font-size: 12.5px; color: var(--ink); }
@keyframes ann-scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@media (prefers-reduced-motion: reduce) { .ann-track { animation: none; } }
@media (max-width: 700px) { .ann-bar { padding: 6px 14px; } }
</style>
