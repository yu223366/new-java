<template>
  <div class="page">
    <NavBar />
    <div class="wrap">
      <div class="page-head">
        <h1>📖 宝可梦图鉴</h1>
        <span class="sub">全国图鉴 1–1025 · 编号搜索 · 多条件筛选 · 点击卡片查看完整资料</span>
      </div>

      <!-- 搜索 -->
      <div class="search-row">
        <span class="s-ico">🔍</span>
        <input v-model="keyword" placeholder="输入全国编号或名称，如：025 / 皮卡丘 / Pikachu" />
        <button v-if="keyword" class="clear" @click="keyword = ''">✕</button>
      </div>

      <!-- 多条件筛选 -->
      <div class="filter-block">
        <div class="filter-line">
          <span class="fl">图鉴分类</span>
          <div class="chip-row">
            <button :class="['chip', { active: scope === 'all' }]" @click="scope = 'all'">全部</button>
            <button :class="['chip', { active: scope === 'starter' }]" @click="scope = 'starter'">🌱 御三家 {{ starterCaught }}/{{ starterTotal }}</button>
            <button :class="['chip', { active: scope === 'legend' }]" @click="scope = 'legend'">🌟 神兽 {{ legendCaught }}/{{ legendTotal }}</button>
          </div>
        </div>
        <div class="filter-line">
          <span class="fl">属性</span>
          <div class="chip-row">
            <button v-for="t in typeOptions" :key="t" :class="['chip', { active: type === t }]" @click="type = t">{{ t }}</button>
          </div>
        </div>
        <div class="filter-line">
          <span class="fl">稀有度</span>
          <div class="chip-row">
            <button v-for="l in levelOptions" :key="l" :class="['chip', { active: level === l }]" @click="level = l">{{ l }}</button>
          </div>
        </div>
        <div class="filter-line">
          <span class="fl">地区</span>
          <div class="chip-row">
            <button v-for="r in regionOptions" :key="r" :class="['chip', { active: region === r }]" @click="region = r">{{ r }}</button>
          </div>
        </div>
      </div>

      <p class="hint-line" style="margin: 14px 0 18px">
        共 <b>{{ filtered.length }}</b> 只 · 第 {{ page }} / {{ totalPages }} 页
        · 御三家 <b>{{ starterCaught }}/{{ starterTotal }}</b>
        · 神兽 <b>{{ legendCaught }}/{{ legendTotal }}</b>
        · 本地已收服 {{ caughtCount }} 只
      </p>

      <div v-if="filtered.length === 0" class="empty-tip">
        <span class="big">😶‍🌫️</span>没有找到匹配的宝可梦，换个编号或条件试试
      </div>
      <div v-else class="grid-auto">
        <div v-for="p in paged" :key="p.id" class="dex-card" @click="open(p)">
          <div class="card-top">
            <span class="no">No.{{ p.number }}</span>
            <span class="badge" :class="'lv-' + p.level">{{ p.level }}</span>
          </div>
          <PokeImg :src="p.image" :alt="p.name" img-class="dex-img" />
          <b>{{ p.name }}</b>
          <small class="en">{{ p.nameEn }}</small>
          <div class="type-row">
            <span :class="['type', 'type-' + p.category]">{{ p.category }}</span>
            <span v-if="p.category2" :class="['type', 'type-' + p.category2]">{{ p.category2 }}</span>
          </div>
          <div class="card-foot">
            <span v-if="caughtSet.has(String(p.number))" class="caught">✓ 已收服</span>
            <span v-else class="uncaught">未收服</span>
            <span class="fav" @click.stop="toggleFavorite(p.number)">{{ game.favorites.includes(String(p.number)) ? '⭐' : '☆' }}</span>
          </div>
          <!-- 悬浮简介 -->
          <div class="hover-info">
            <span>种族值总和 <b>{{ totalOf(p) }}</b></span>
            <span>特性：{{ p.ability }}</span>
            <span class="hi-tip">点击查看更多 →</span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pager">
        <button class="btn-sm-ghost" :disabled="page === 1" @click="page--">← 上一页</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="btn-sm-ghost" :disabled="page >= totalPages" @click="page++">下一页 →</button>
        <input v-model.number="jump" type="number" min="1" :max="totalPages" class="jump-input" placeholder="页码" @keyup.enter="goPage" />
        <button class="btn-sm-ghost" @click="goPage">跳转</button>
      </div>
    </div>

    <!-- 完整资料弹窗 -->
    <div v-if="cur" class="modal-mask" @click.self="cur = null">
      <div class="detail">
        <button class="close" @click="cur = null">✕</button>

        <div class="d-head">
          <PokeImg :src="cur.image" :alt="cur.name" img-class="detail-img" />
          <div>
            <span class="no">No.{{ cur.number }} · {{ cur.region }}</span>
            <h2>{{ cur.name }} <small>{{ cur.nameEn }}</small></h2>
            <div class="type-row" style="justify-content: flex-start">
              <span :class="['type', 'type-' + cur.category]">{{ cur.category }}</span>
              <span v-if="cur.category2" :class="['type', 'type-' + cur.category2]">{{ cur.category2 }}</span>
            </div>
            <button class="fav-btn" @click="toggleFavorite(cur.number)">
              {{ game.favorites.includes(String(cur.number)) ? '⭐ 已收藏' : '☆ 加入收藏' }}
            </button>
          </div>
        </div>

        <p class="d-desc">{{ cur.description }}</p>

        <!-- 种族值 -->
        <div class="d-block">
          <h4>📊 种族值</h4>
          <div v-for="s in statList" :key="s.key" class="stat-row">
            <span class="stat-label">{{ s.label }}</span>
            <div class="bar" style="height: 10px"><i :style="{ width: Math.min(100, s.val / 160 * 100) + '%', background: s.color }"></i></div>
            <b class="stat-num">{{ s.val }}</b>
          </div>
          <p class="hint-line">种族值总和：<b>{{ statTotal }}</b></p>
        </div>

        <!-- 特性 -->
        <div class="d-block">
          <h4>✨ 特性 / 隐藏特性</h4>
          <p class="line"><span class="tagline">特性</span> {{ cur.ability }}</p>
          <p class="line"><span class="tagline">隐藏特性</span> {{ cur.hidden }}</p>
        </div>

        <!-- 进化链 -->
        <div class="d-block">
          <h4>🧬 完整进化链</h4>
          <div class="evo-chain">
            <template v-for="(e, i) in (cur.evo || [])" :key="i">
              <span :class="['evo-node', { self: e === cur.name }]">{{ e }}</span>
              <span v-if="i < (cur.evo || []).length - 1" class="evo-arrow">→</span>
            </template>
            <span v-if="!(cur.evo || []).length" class="hint-line">该宝可梦没有进化形态</span>
          </div>
        </div>

        <!-- 地区形态 -->
        <div class="d-block">
          <h4>🌏 各地区形态对比</h4>
          <div class="chip-row">
            <span v-for="f in cur.forms" :key="f" class="form-chip">{{ f }}</span>
          </div>
        </div>

        <!-- 蛋群 / 孵化 -->
        <div class="d-block">
          <h4>🥚 蛋群 · 遗传 · 孵化步数</h4>
          <p class="line"><span class="tagline">蛋群</span> {{ (cur.egg || []).join(' / ') || '—' }}</p>
          <p class="line"><span class="tagline">孵化步数</span> {{ cur.steps ? cur.steps.toLocaleString() + ' 步' : '暂无数据' }}</p>
        </div>

        <!-- 专属招式 -->
        <div class="d-block">
          <h4>⚔️ 专属招式 · 专属能力</h4>
          <p class="line">{{ cur.signature || '—' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import PokeImg from '../components/PokeImg.vue'
import { ALL_DEX } from '../data/dex'
import { STARTER_IDS } from '../data/starters'
import { TYPES, REGIONS } from '../data/gameData'
import { pokemonList } from '../api'
import { game, caughtSet, toggleFavorite } from '../data/gameStore'

const route = useRoute()
const keyword = ref(route.query.keyword || '')
const type = ref(route.query.type || '全部')
const level = ref(route.query.level || '全部')
const scope = ref(route.query.scope || 'all')
const region = ref(route.query.region || '全部')

// 图鉴数据：优先用后端 t_pokemon（在线覆盖同编号），离线用静态 ALL_DEX
const dexData = ref(ALL_DEX)

// 御三家 / 神兽统计
const starterTotal = STARTER_IDS.length
const legendTotal = computed(() => dexData.value.filter(p => ['神兽', '幻兽'].includes(p.rarity)).length)
const starterCaught = computed(() =>
  dexData.value.filter(p => STARTER_IDS.includes(Number(p.id)) && caughtSet.value.has(String(p.number))).length
)
const legendCaught = computed(() =>
  dexData.value.filter(p => ['神兽', '幻兽'].includes(p.rarity) && caughtSet.value.has(String(p.number))).length
)

const typeOptions = ['全部', ...TYPES]
const levelOptions = ['全部', '普通', '稀有', '史诗', '传说']
const regionOptions = ['全部', ...REGIONS]

const PER = 48
const page = ref(1)
const jump = ref(null)

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return dexData.value.filter(p => {
    const okKw = !kw
      || String(p.number).includes(kw)
      || String(p.name).toLowerCase().includes(kw)
      || String(p.nameEn || '').toLowerCase().includes(kw)
    const okType = type.value === '全部' || p.category === type.value || p.category2 === type.value
    const okLevel = level.value === '全部' || p.level === level.value
    const okRegion = region.value === '全部' || p.region === region.value
    const okScope = scope.value === 'all'
      || (scope.value === 'starter' && STARTER_IDS.includes(Number(p.id)))
      || (scope.value === 'legend' && ['神兽', '幻兽'].includes(p.rarity))
    return okKw && okType && okLevel && okRegion && okScope
  })
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER)))
const paged = computed(() => filtered.value.slice((page.value - 1) * PER, page.value * PER))
const caughtCount = computed(() => dexData.value.filter(p => caughtSet.value.has(String(p.number))).length)

watch([keyword, type, level, scope, region], () => { page.value = 1 })
watch(totalPages, t => { if (page.value > t) page.value = t })

function goPage() {
  const n = Number(jump.value)
  if (!n) return
  page.value = Math.min(totalPages.value, Math.max(1, Math.floor(n)))
  jump.value = null
}

const cur = ref(null)
const statList = computed(() => {
  const s = (cur.value && cur.value.stats) || {}
  return [
    { key: 'hp', label: 'HP', val: s.hp || 0, color: '#e74c3c' },
    { key: 'atk', label: '攻击', val: s.atk || 0, color: '#e67e22' },
    { key: 'def', label: '防御', val: s.def || 0, color: '#f1c40f' },
    { key: 'spa', label: '特攻', val: s.spa || 0, color: '#3498db' },
    { key: 'spd', label: '特防', val: s.spd || 0, color: '#2ecc71' },
    { key: 'spe', label: '速度', val: s.spe || 0, color: '#9b59b6' }
  ]
})
const statTotal = computed(() => statList.value.reduce((n, s) => n + s.val, 0))

function totalOf(p) {
  const s = p.stats || {}
  return ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].reduce((n, k) => n + (s[k] || 0), 0)
}

function open(p) { cur.value = p }

onMounted(async () => {
  // 支持从分类页带 type / level / region 参数进入
  if (route.query.type) type.value = route.query.type
  if (route.query.level) level.value = route.query.level
  if (route.query.region) region.value = route.query.region
  // 在线模式：图鉴完全从数据库读取（detail_json 提供种族值/特性/进化链等完整字段），离线用静态 ALL_DEX 兜底
  // 仅当后端返回完整数据（≥100 条）才覆盖，避免离线/异常时图鉴内容缺失
  const r = await pokemonList()
  if (r && r.code === 200 && r.data && r.data.length >= 100) {
    dexData.value = r.data.map(p => {
      let full = {}
      try { full = JSON.parse(p.detailJson || '{}') } catch (e) { full = {} }
      return {
        ...full,
        id: full.id || p.number,
        number: p.number,
        name: p.name,
        nameEn: p.nameEn || full.nameEn,
        category: p.category,
        category2: p.category2,
        level: p.level,
        rarity: full.rarity || p.level,
        classification: p.classification,
        height: p.height,
        weight: p.weight,
        description: p.description || full.description,
        image: p.image
      }
    })
  }
})
</script>

<style scoped>
.search-row { display: flex; align-items: center; gap: 10px; background: #fff; border: 3px solid var(--poke-blue); border-radius: 34px; padding: 6px 16px; max-width: 620px; box-shadow: 0 4px 14px rgba(76, 110, 245, .12); }
.s-ico { font-size: 18px; }
.search-row input { flex: 1; border: none; outline: none; padding: 10px 4px; font-size: 15px; background: transparent; }
.clear { width: 26px; height: 26px; border-radius: 50%; background: #eef0f4; color: #666; font-size: 12px; }

.filter-block { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
.filter-line { display: flex; align-items: flex-start; gap: 10px; }
.fl { font-size: 12px; font-weight: 800; color: var(--ink-light); white-space: nowrap; padding-top: 7px; min-width: 42px; }

.dex-card { background: #fff; border: 2px solid var(--line); border-radius: 16px; padding: 14px; text-align: center; cursor: pointer; position: relative; overflow: hidden; transition: all .18s; }
.dex-card:hover { transform: translateY(-5px); box-shadow: var(--shadow); border-color: var(--poke-orange); }
.card-top { display: flex; justify-content: space-between; align-items: center; }
.no { font-size: 12px; font-weight: 800; color: #999; letter-spacing: .5px; }
.dex-img { width: 110px; height: 110px; object-fit: contain; margin: 6px 0 2px; transition: transform .2s; }
.dex-card:hover .dex-img { transform: scale(1.08); }
.dex-card b { display: block; font-size: 17px; color: var(--ink); }
.en { font-size: 11px; color: #aaa; letter-spacing: .5px; }
.type-row { display: flex; gap: 5px; justify-content: center; margin-top: 8px; }
.card-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--line); font-size: 12px; }
.caught { color: #2e9e4f; font-weight: 800; }
.uncaught { color: #bbb; }
.fav { font-size: 17px; cursor: pointer; }

.hover-info { position: absolute; left: 0; right: 0; bottom: 0; background: rgba(51, 56, 63, .93); color: #fff; padding: 10px 12px; font-size: 11.5px; line-height: 1.65; display: flex; flex-direction: column; gap: 1px; transform: translateY(101%); transition: transform .22s ease; text-align: left; pointer-events: none; }
.dex-card:hover .hover-info { transform: translateY(0); }
.hover-info b { color: var(--poke-orange); }
.hi-tip { color: #AEB6C4; font-size: 10.5px; margin-top: 2px; }

.pager { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
.jump-input { width: 74px; padding: 6px 10px; border-radius: 10px; border: 2px solid var(--line); font-size: 12px; outline: none; }
.jump-input:focus { border-color: var(--poke-blue); }

.modal-mask { position: fixed; inset: 0; background: rgba(33, 33, 33, .58); display: flex; align-items: flex-start; justify-content: center; z-index: 60; padding: 30px 16px; overflow-y: auto; }
.detail { width: 100%; max-width: 620px; background: #fff; border: 4px solid var(--poke-orange); border-radius: 20px; padding: 26px; position: relative; box-shadow: var(--shadow); }
.close { position: absolute; top: 14px; right: 16px; width: 32px; height: 32px; border-radius: 50%; background: var(--line); font-size: 15px; }
.d-head { display: flex; gap: 18px; align-items: center; background: linear-gradient(135deg, rgba(255, 176, 103, .18), rgba(76, 110, 245, .08)); border-radius: 14px; padding: 16px; }
.detail-img { width: 132px; height: 132px; object-fit: contain; flex-shrink: 0; }
.d-head h2 { font-size: 26px; display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.d-head h2 small { font-size: 13px; color: #aaa; font-weight: 400; }
.fav-btn { margin-top: 10px; font-size: 12px; font-weight: 800; padding: 5px 14px; border-radius: 16px; background: var(--poke-orange-soft); color: #8a5a1a; border: 2px solid #ffd9b0; }
.d-desc { font-size: 14px; line-height: 1.9; color: var(--ink); margin: 16px 0; background: #f8f9fc; border-left: 5px solid var(--poke-orange); border-radius: 10px; padding: 12px 14px; }
.d-block { margin-top: 16px; }
.d-block h4 { font-size: 15px; color: var(--poke-blue); margin-bottom: 10px; }
.stat-row { display: grid; grid-template-columns: 46px 1fr 40px; gap: 10px; align-items: center; margin-bottom: 8px; font-size: 13px; }
.stat-num { text-align: right; font-variant-numeric: tabular-nums; }
.line { font-size: 13px; color: var(--ink); line-height: 2; display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.evo-chain { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.evo-node { background: var(--poke-blue-soft); color: var(--poke-blue); font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 12px; }
.evo-node.self { background: linear-gradient(135deg, var(--poke-blue), var(--poke-blue-dark)); color: #fff; }
.evo-arrow { color: #bbb; font-weight: 900; }
.form-chip { background: var(--poke-orange-soft); color: #8a5a1a; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 12px; }
@media (max-width: 560px) { .d-head { flex-direction: column; text-align: center; } .d-head .type-row { justify-content: center !important; } }
</style>
