<template>
  <div v-if="show" class="ss-mask">
    <div class="ss-box">
      <div class="ss-head">
        <span class="pokeball ss-ball"></span>
        <h2>选择你的初始伙伴</h2>
        <p>从全世代 27 只御三家与皮卡丘中选出 1 只，开启你的训练家之旅</p>
        <div class="ss-bonus">
          🎁 开局赠送：<b>1000 币</b> · 精灵球 ×12 · 伤药 ×5
        </div>
      </div>

      <div class="ss-body">
        <div v-for="g in GENERATIONS" :key="g.gen" class="ss-gen">
          <span class="ss-gen-label">第 {{ g.gen }} 世代 · {{ g.region }}</span>
          <div class="ss-row">
            <div v-for="id in g.ids" :key="id" :class="['ss-card', { picked: picked === id }]" @click="picked = id">
              <PokeImg v-if="map[id]" :src="map[id].image" :alt="map[id].name" img-class="ss-img" />
              <b>{{ map[id] ? map[id].name : '—' }}</b>
              <div v-if="map[id]" class="ss-types">
                <span :class="['type', 'type-' + map[id].category]">{{ map[id].category }}</span>
                <span v-if="map[id].category2" :class="['type', 'type-' + map[id].category2]">{{ map[id].category2 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ss-foot">
        <p class="ss-picked">
          已选择：<b>{{ picked && map[picked] ? map[picked].name : '尚未选择' }}</b>
        </p>
        <button class="btn btn-primary" :disabled="!picked" @click="confirm">🌱 开始冒险</button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 开局强制选择初始精灵（全世代 27 只御三家）
 * 选择后发放：1000 币 + 精灵球×12 + 伤药×5
 */
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import PokeImg from './PokeImg.vue'
import { game, chooseStarter } from '../data/gameStore'
import { GENERATIONS } from '../data/starters'
import { STARTER_DEX } from '../data/starterDex'
import { toastOk, toastWarn } from '../utils/toast'

const route = useRoute()
const map = computed(() => Object.fromEntries(STARTER_DEX.map(p => [Number(p.id), p])))

const picked = ref(null)
const show = ref(false)

// 仅在「已登录 + 未完成开局 + 非登录注册页」时强制弹出
watch(
  () => [route.path, game.starterChosen],
  ([p, chosen]) => {
    const authPages = ['/login', '/register', '/admin-login', '/admin']
    show.value = !authPages.includes(p) && !chosen
  },
  { immediate: true }
)

function confirm() {
  const item = map.value[picked.value]
  if (!item) { toastWarn('请先选择一只御三家'); return }
  const r = chooseStarter(item, 5)
  if (r.ok) {
    show.value = false
    toastOk(`获得了 ${r.fighter.name}！1000 币 + 精灵球×12 + 伤药×5 已到账`)
  } else {
    toastWarn(r.msg)
  }
}
</script>

<style scoped>
.ss-mask { position: fixed; inset: 0; background: rgba(38, 44, 56, .58); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 18px; }
.ss-box { width: 100%; max-width: 880px; max-height: 92vh; display: flex; flex-direction: column; background: #fff; border-radius: 22px; box-shadow: 0 20px 56px rgba(30, 40, 70, .26); overflow: hidden; animation: ss-in .28s ease; }
@keyframes ss-in { from { opacity: 0; transform: translateY(16px) scale(.98) } to { opacity: 1; transform: none } }

.ss-head { text-align: center; padding: 22px 24px 16px; background: linear-gradient(135deg, var(--poke-blue-soft), var(--poke-orange-soft)); border-bottom: 1px dashed var(--line); }
.ss-ball { width: 34px; height: 34px; margin-bottom: 8px; }
.ss-head h2 { font-size: 22px; color: var(--ink); }
.ss-head p { font-size: 13px; color: var(--ink-light); margin-top: 5px; }
.ss-bonus { display: inline-block; margin-top: 10px; font-size: 12.5px; background: #fff; border: 1px solid #ffe0b8; color: #8a5a1a; padding: 6px 14px; border-radius: 12px; }
.ss-bonus b { color: var(--poke-red); }

.ss-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
.ss-gen { margin-bottom: 14px; }
.ss-gen-label { display: inline-block; font-size: 11.5px; font-weight: 800; color: var(--poke-blue); background: var(--poke-blue-soft); padding: 3px 10px; border-radius: 10px; margin-bottom: 8px; }
.ss-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.ss-card { background: #f9fafd; border: 2px solid var(--line); border-radius: 14px; padding: 10px; text-align: center; cursor: pointer; transition: all .15s; position: relative; }
.ss-card:hover { border-color: var(--poke-orange); transform: translateY(-3px); }
.ss-card.picked { border-color: var(--poke-red); background: #fff5f5; box-shadow: 0 6px 18px rgba(232, 93, 74, .18); }
.ss-card.picked::after { content: "✓"; position: absolute; top: 6px; right: 8px; width: 18px; height: 18px; border-radius: 50%; background: var(--poke-red); color: #fff; font-size: 11px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
.ss-img { width: 68px; height: 68px; object-fit: contain; }
.ss-card b { display: block; font-size: 13.5px; color: var(--ink); }
.ss-types { display: flex; gap: 4px; justify-content: center; margin-top: 4px; }

.ss-foot { padding: 14px 24px 18px; border-top: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.ss-picked { font-size: 13px; color: var(--ink-light); }
.ss-picked b { color: var(--poke-red); }

@media (max-width: 640px) { .ss-row { grid-template-columns: repeat(3, 1fr); gap: 7px; } .ss-img { width: 52px; height: 52px; } }
</style>
