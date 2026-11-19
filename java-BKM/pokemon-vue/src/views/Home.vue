<template>
  <div class="page">
    <NavBar />

    <!-- 欢迎封面 Banner -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-text">
          <span class="badge-hero">最终完整版 · 9 大模块</span>
          <h1>成为<span class="hl">宝可梦大师</span>的旅程，从这里开始</h1>
          <p>图鉴查询 · 野外捕捉 · 道馆徽章 · 玩家对战 · 精灵孵化 · 联盟冠军 —— 一个网页装下整个宝可梦世界。</p>
          <div class="hero-btns">
            <router-link to="/adventure" class="btn btn-yellow">🌿 出发冒险</router-link>
            <router-link to="/pokedex" class="btn btn-ghost">📖 查询图鉴</router-link>
          </div>

          <!-- 首页搜索栏 -->
          <div class="hero-search">
            <span class="hs-ico">🔍</span>
            <input
              v-model="keyword"
              @keyup.enter="doSearch"
              placeholder="搜索宝可梦名称或全国编号，如：025 / 皮卡丘"
              aria-label="搜索宝可梦"
            />
            <button class="btn btn-primary btn-sm" @click="doSearch">搜索</button>
          </div>
          <div class="hot-tags">
            <span class="ht-label">热门搜索：</span>
            <a v-for="t in hotTags" :key="t" @click.prevent="quickSearch(t)">{{ t }}</a>
          </div>

          <div class="hero-stats">
            <span><b>{{ nationalTotal }}</b> 只全国图鉴</span>
            <span><b>{{ game.bag.length }}</b> 只已收服</span>
            <span><b>{{ game.badges.length }}/16</b> 枚徽章</span>
          </div>
        </div>
        <img class="hero-pika" src="/pokemon/025.png" alt="皮卡丘" />
      </div>
    </section>

    <div class="wrap">
      <!-- 全部功能快捷入口 -->
      <h3 class="block-title">🚀 全部功能快捷入口</h3>
      <div class="shortcuts">
        <router-link v-for="s in shortcuts" :key="s.path" :to="s.path" class="shortcut">
          <span class="s-ico">{{ s.icon }}</span>
          <b>{{ s.name }}</b>
          <small>{{ s.desc }}</small>
        </router-link>
      </div>

      <!-- 最新简报 -->
      <h3 class="block-title">📋 最新简报</h3>
      <div class="two-col">
        <div class="panel">
          <h3>🌿 冒险简报</h3>
          <div v-if="game.lastAdventure" class="last-item">
            <img :src="game.lastAdventure.image" :alt="game.lastAdventure.name" />
            <div>
              <p class="last-main">在「{{ game.lastAdventure.zone }}」遇到了 <b>{{ game.lastAdventure.name }}</b></p>
              <p class="hint-line">{{ game.lastAdventure.time }}</p>
            </div>
          </div>
          <p v-else class="empty-tip" style="padding: 22px 0">还没有冒险记录，去野外看看吧 🌱</p>
          <div class="divider"></div>
          <ul class="record-list">
            <li v-for="(r, i) in game.captureLog.slice(0, 3)" :key="i">
              <span class="time">{{ r.time }}</span>
              <span>{{ r.zone }} · {{ r.name }}</span>
              <span class="tagline" style="margin-left: auto">{{ r.result }}</span>
            </li>
          </ul>
        </div>

        <div class="panel">
          <h3>⚔️ 对战简报</h3>
          <div v-if="game.lastBattle" class="last-item">
            <span class="battle-ico">🏟️</span>
            <div>
              <p class="last-main">{{ game.lastBattle.type }} · 对手 <b>{{ game.lastBattle.opponent }}</b></p>
              <p class="hint-line">结果：{{ game.lastBattle.result }}</p>
              <p class="hint-line">{{ game.lastBattle.time }}</p>
            </div>
          </div>
          <p v-else class="empty-tip" style="padding: 22px 0">还没有对战记录，去道馆或对战中心试试 ⚔️</p>
          <div class="divider"></div>
          <ul class="record-list">
            <li v-for="(r, i) in game.battleLog.slice(0, 3)" :key="i">
              <span class="time">{{ r.time }}</span>
              <span>{{ r.type }} · {{ r.opponent }}</span>
              <span class="tagline" style="margin-left: auto">{{ r.result }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 热门宝可梦推荐 -->
      <h3 class="block-title">🔥 热门宝可梦推荐</h3>
      <div class="grid-auto">
        <router-link v-for="p in hot" :key="p.id" :to="{ path: '/pokedex', query: { keyword: p.name } }" class="hot-card">
          <span class="badge" :class="'lv-' + p.level">{{ p.level }}</span>
          <PokeImg :src="p.image" :alt="p.name" img-class="hot-img" />
          <b>{{ p.name }}</b>
          <div class="type-row" style="justify-content: center; margin-top: 6px">
            <span :class="['type', 'type-' + p.category]">{{ p.category }}</span>
            <span v-if="p.category2" :class="['type', 'type-' + p.category2]">{{ p.category2 }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import PokeImg from '../components/PokeImg.vue'
import { game } from '../data/gameStore'
import { BUILTIN_POKEMON } from '../data/pokemon'

const router = useRouter()
const keyword = ref('')
const hotTags = ['皮卡丘', '喷火龙', '甲贺忍蛙', '超梦', '烈咬陆鲨', '路卡利欧']

/** 搜索：跳转图鉴页并按关键词过滤 */
function doSearch() {
  const kw = keyword.value.trim()
  router.push({ path: '/pokedex', query: kw ? { keyword: kw } : {} })
}
function quickSearch(t) {
  keyword.value = t
  doSearch()
}

const nationalTotal = 1025              // 全国图鉴总数（1-1025）
// 热门宝可梦推荐：随机 4 只，每 5 分钟刷新一次
const hot = ref([])
function refreshHot() {
  const pool = [...BUILTIN_POKEMON].sort(() => Math.random() - 0.5)
  hot.value = pool.slice(0, 4)
}
let hotTimer = null
onMounted(() => { refreshHot(); hotTimer = setInterval(refreshHot, 5 * 60 * 1000) })
onUnmounted(() => { if (hotTimer) clearInterval(hotTimer) })

const shortcuts = [
  { path: '/pokedex', name: '宝可梦图鉴', icon: '📖', desc: '编号 · 种族值 · 进化链' },
  { path: '/categories', name: '分级分类', icon: '🏷️', desc: '属性 · 稀有度 · 地区' },
  { path: '/lore', name: '原著资料库', icon: '📚', desc: '动画 · 剧场版 · 名场面' },
  { path: '/adventure', name: '野外捕捉', icon: '🌿', desc: '草丛 · 山洞 · 水域 · 森林' },
  { path: '/gyms', name: '道馆挑战', icon: '🏛️', desc: '八大馆主 · 徽章收集' },
  { path: '/battle', name: '对战中心', icon: '⚔️', desc: '匹配对手 · 回合制对战' },
  { path: '/tools', name: '工具百科', icon: '🧰', desc: '克制表 · 招式 · 道具 · TM' },
  { path: '/trainer', name: '个人中心', icon: '👤', desc: '背包 · 孵化 · 培养 · 联盟' }
]
</script>

<style scoped>
.hero { background: linear-gradient(135deg, #fff8dc 0%, #eef2ff 100%); border-bottom: 4px solid var(--poke-red); padding: 40px 20px; position: relative; overflow: hidden; }
.hero::after { content: ""; position: absolute; right: -80px; top: -80px; width: 320px; height: 320px; border-radius: 50%; border: 26px solid rgba(238, 21, 21, .06); }
.hero-inner { max-width: 1160px; margin: 0 auto; display: flex; align-items: center; gap: 30px; position: relative; z-index: 1; }
.hero-text { flex: 1; }
.badge-hero { display: inline-block; background: var(--poke-red); color: #fff; font-size: 12px; font-weight: 800; padding: 4px 14px; border-radius: 14px; letter-spacing: 1px; }
.hero-text h1 { font-size: 34px; margin: 14px 0 12px; line-height: 1.35; color: var(--ink); }
.hero-text .hl { color: var(--poke-red); text-shadow: 3px 3px 0 var(--poke-yellow); }
.hero-text p { color: var(--ink-light); font-size: 14px; line-height: 1.8; max-width: 620px; }
.hero-btns { display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
/* 首页搜索栏 */
.hero-search { display: flex; align-items: center; gap: 10px; background: #fff; border: 3px solid var(--poke-blue); border-radius: 40px; padding: 6px 8px 6px 18px; max-width: 560px; margin: 22px 0 0; box-shadow: 0 8px 24px rgba(76, 110, 245, .15); transition: box-shadow .2s, border-color .2s; }
.hero-search:focus-within { border-color: var(--poke-orange); box-shadow: 0 10px 28px rgba(255, 176, 103, .28); }
.hs-ico { font-size: 19px; flex-shrink: 0; }
.hero-search input { flex: 1; min-width: 0; border: none; outline: none; padding: 10px 4px; font-size: 15px; background: transparent; color: var(--ink); }
.hero-search input::placeholder { color: #aab2c0; }
.hot-tags { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.ht-label { font-size: 12px; color: var(--ink-light); }
.hot-tags a { font-size: 12px; font-weight: 700; color: var(--poke-blue); background: var(--poke-blue-soft); padding: 4px 11px; border-radius: 11px; cursor: pointer; transition: all .15s; }
.hot-tags a:hover { background: #dfe6ff; transform: translateY(-1px); }

.hero-stats { display: flex; gap: 22px; margin-top: 22px; flex-wrap: wrap; }
.hero-stats span { font-size: 13px; color: var(--ink-light); }
.hero-stats b { color: var(--poke-red); font-size: 20px; font-weight: 900; margin-right: 2px; }
.hero-pika { width: 190px; height: 190px; object-fit: contain; animation: floaty 3.2s ease-in-out infinite; filter: drop-shadow(0 10px 16px rgba(0, 0, 0, .15)); flex-shrink: 0; }
@keyframes floaty { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }

.block-title { font-size: 20px; margin: 26px 0 14px; color: var(--ink); }
.prog-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.prog-head h3 { margin-bottom: 0; }
.prog-num { font-size: 14px; color: var(--ink-light); }
.prog-num b { color: var(--poke-red); font-size: 18px; }

.shortcuts { display: grid; grid-template-columns: repeat(auto-fill, minmax(196px, 1fr)); gap: 14px; }
.shortcut { background: #fff; border: 2px solid var(--line); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 3px; transition: all .18s; position: relative; overflow: hidden; }
.shortcut::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg, var(--poke-yellow), var(--poke-red)); }
.shortcut:hover { transform: translateY(-4px); box-shadow: var(--shadow); border-color: var(--poke-yellow); }
.s-ico { font-size: 24px; }
.shortcut b { font-size: 15px; color: var(--ink); }
.shortcut small { font-size: 12px; color: var(--ink-light); }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.last-item { display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
.last-item img { width: 66px; height: 66px; object-fit: contain; background: #f7f9ff; border-radius: 12px; }
.battle-ico { font-size: 38px; width: 66px; height: 66px; display: flex; align-items: center; justify-content: center; background: #f7f9ff; border-radius: 12px; }
.last-main { font-size: 14px; color: var(--ink); }

.hot-card { background: #fff; border: 2px solid var(--line); border-radius: 16px; padding: 14px; text-align: center; position: relative; transition: all .18s; }
.hot-card:hover { transform: translateY(-5px); box-shadow: var(--shadow); border-color: var(--poke-yellow); }
.hot-card .badge { position: absolute; top: 10px; right: 10px; }
.hot-card img { width: 96px; height: 96px; object-fit: contain; }
.hot-card b { display: block; font-size: 16px; color: var(--ink); margin-top: 4px; }

@media (max-width: 820px) {
  .hero-inner { flex-direction: column-reverse; text-align: center; }
  .hero-text h1 { font-size: 24px; }
  .hero-btns, .hero-stats { justify-content: center; }
  .hero-search { margin: 20px auto 0; }
  .hot-tags { justify-content: center; }
  .hero-pika { width: 130px; height: 130px; }
  .two-col { grid-template-columns: 1fr; }
}
</style>
