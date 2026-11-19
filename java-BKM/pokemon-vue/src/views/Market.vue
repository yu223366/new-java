<template>
  <div class="page">
    <NavBar />
    <div class="wrap">
      <div class="page-head">
        <h1>🛒 市集</h1>
        <span class="sub">用金币购买精灵球、药品与技能道具 · 所有道具为一次性消耗品</span>
      </div>

      <!-- 余额与容量 -->
      <div class="coin-bar">
        <span class="coin-num">💰 我的金币：<b>{{ game.coins }}</b> 币</span>
        <span class="coin-tip">道具种类 {{ kinds }} / {{ ITEM_KIND_MAX }} · 每种上限 {{ ITEM_MAX }}</span>
        <router-link to="/adventure" class="btn btn-primary btn-sm">去野外赚金币 →</router-link>
      </div>

      <!-- 分类 -->
      <div class="tabs">
        <button v-for="c in SHOP_CATEGORIES" :key="c.key" :class="['tab-btn', { active: cat === c.key }]" @click="cat = c.key">
          {{ c.label }}
        </button>
      </div>

      <!-- 商品 -->
      <div class="grid-auto">
        <div v-for="it in curItems" :key="it.name" class="shop-card">
          <div class="shop-top">
            <GameIcon :kind="iconKind(it)" :name="it.name" :size="36" />
            <div class="shop-info">
              <b>{{ it.name }}</b>
              <p class="hint-line">{{ it.desc || it.effect }}</p>
            </div>
          </div>
          <div class="shop-foot">
            <span class="price">{{ it.price }} 币</span>
            <span class="owned">持有 {{ itemCount(it.name) }}</span>
            <button class="buy-btn" :disabled="game.coins < it.price || itemCount(it.name) >= ITEM_MAX" @click="buy(it)">
              {{ itemCount(it.name) >= ITEM_MAX ? '已满' : '购买' }}
            </button>
          </div>
        </div>
      </div>

      <p class="hint-line" style="margin-top: 18px; text-align: center">
        提示：金币可通过野外对战、道馆挑战获得；大师球 / 公园球价格极高，请谨慎购买。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import GameIcon from '../components/GameIcon.vue'
import { game, buyItem, itemCount, ITEM_MAX, ITEM_KIND_MAX } from '../data/gameStore'
import { SHOP_CATEGORIES } from '../data/shop'
import { fetchShop } from '../api/game'
import { toastOk, toastWarn } from '../utils/toast'

const cat = ref('balls')
const serverItems = ref(null)
const catMap = { balls: '精灵球', medicines: '药品', skills: '技能道具' }

const curItems = computed(() => {
  if (serverItems.value) {
    return serverItems.value.filter(it => it.category === catMap[cat.value] && it.enabled !== 0)
  }
  const c = SHOP_CATEGORIES.find(x => x.key === cat.value)
  return c ? c.items : []
})

// 根据商品所在分类映射到 GameIcon 的 kind
function iconKind(it) {
  if (cat.value === 'balls') return 'ball'
  if (cat.value === 'medicines') return 'medicine'
  if (it.name === '技能光盘TM' || it.name === '秘传学习器HM') return 'tm'
  if (it.name === '心之鳞片' || it.name === '神奇糖果') return 'gem'
  return 'pp'
}

onMounted(async () => {
  const d = await fetchShop()
  if (d && d.length) serverItems.value = d
})

const kinds = computed(() =>
  Object.keys(game.bagItems).length + Object.keys(game.balls).filter(k => game.balls[k] > 0).length
)

function buy(it) {
  // 传入服务端展示价，后台改价后按实际展示价扣除，避免前后端价格不一致
  const r = buyItem(it.name, 1, it.price)
  if (r.ok) toastOk(r.msg)
  else toastWarn(r.msg)
}
</script>

<style scoped>
.coin-bar { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; background: linear-gradient(135deg, var(--poke-orange-soft), var(--poke-blue-soft)); border: 2px solid #ffe0b8; border-radius: 16px; padding: 14px 18px; margin-bottom: 4px; }
.coin-num { font-size: 15px; color: var(--ink); }
.coin-num b { font-size: 20px; color: var(--poke-red); }
.coin-tip { font-size: 12px; color: var(--ink-light); }
.coin-bar .btn { margin-left: auto; }

.shop-card { background: #fff; border: 2px solid var(--line); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: all .18s; }
.shop-card:hover { border-color: var(--poke-orange); box-shadow: var(--shadow); transform: translateY(-3px); }
.shop-top { display: flex; gap: 12px; align-items: flex-start; }
.shop-top .game-icon { margin-top: 2px; }
.shop-info b { font-size: 15px; color: var(--ink); }
.shop-info .hint-line { margin-top: 3px; }
.shop-foot { display: flex; align-items: center; gap: 10px; padding-top: 10px; border-top: 1px dashed var(--line); }
.price { font-size: 14px; font-weight: 900; color: var(--poke-red); }
.owned { font-size: 11.5px; color: var(--ink-light); }
.buy-btn { margin-left: auto; padding: 6px 18px; border-radius: 16px; font-size: 12.5px; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--poke-blue), var(--poke-blue-dark)); transition: all .15s; }
.buy-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(76, 110, 245, .28); }
.buy-btn:disabled { background: #cfd5e2; cursor: not-allowed; }
</style>
