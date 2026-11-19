<template>
  <div class="page">
    <NavBar />
    <div class="wrap">
      <div class="page-head">
        <h1>🏷️ 分级分类</h1>
        <span class="sub">全国图鉴 {{ ALL_DEX.length }} 只 · 按 18 属性 / 稀有度 / 地区 / 御三家 / 神兽幻兽 归类</span>
      </div>

      <div class="tabs">
        <button v-for="t in tabs" :key="t" :class="['tab-btn', { active: tab === t }]" @click="tab = t">{{ t }}</button>
      </div>

      <!-- 按属性 -->
      <template v-if="tab === '按属性'">
        <div v-for="g in typeGroups" :key="g.label" class="panel group">
          <h3>
            <span :class="['type', 'type-' + g.label]">{{ g.label }}</span>
            <span class="count">{{ g.items.length }} 只</span>
          </h3>
          <div class="mini-grid">
            <div v-for="p in g.items.slice(0, SHOW)" :key="p.id" class="mini-card" @click="go(p)">
              <PokeImg :src="p.image" :alt="p.name" img-class="mini-img" />
              <span>{{ p.name }}</span>
            </div>
          </div>
          <p v-if="g.items.length > SHOW" class="more-tip">
            共 {{ g.items.length }} 只
            <router-link :to="{ path: '/pokedex', query: { type: g.label } }">查看全部 →</router-link>
          </p>
        </div>
      </template>

      <!-- 按稀有度 -->
      <template v-else-if="tab === '按稀有度'">
        <div v-for="r in RARITIES" :key="r" class="panel group">
          <h3>
            <span class="badge" :class="'lv-' + rarityToLevel(r)">{{ r }}</span>
            <span class="count">{{ byRarity(r).length }} 只</span>
          </h3>
          <div class="mini-grid">
            <div v-for="p in byRarity(r).slice(0, SHOW)" :key="p.id" class="mini-card" @click="go(p)">
              <PokeImg :src="p.image" :alt="p.name" img-class="mini-img" />
              <span>{{ p.name }}</span>
            </div>
          </div>
          <p v-if="byRarity(r).length > SHOW" class="more-tip">
            共 {{ byRarity(r).length }} 只
            <router-link :to="{ path: '/pokedex', query: { level: rarityToLevel(r) } }">查看全部 →</router-link>
          </p>
        </div>
      </template>

      <!-- 按地区 -->
      <template v-else-if="tab === '按地区'">
        <div v-for="r in REGIONS" :key="r" class="panel group">
          <h3>📍 {{ r }}地区 <span class="count">{{ byRegion(r).length }} 只</span></h3>
          <div class="mini-grid">
            <div v-for="p in byRegion(r).slice(0, SHOW)" :key="p.id" class="mini-card" @click="go(p)">
              <PokeImg :src="p.image" :alt="p.name" img-class="mini-img" />
              <span>{{ p.name }}</span>
            </div>
          </div>
          <p v-if="byRegion(r).length > SHOW" class="more-tip">
            共 {{ byRegion(r).length }} 只
            <router-link :to="{ path: '/pokedex', query: { region: r } }">查看全部 →</router-link>
          </p>
        </div>
      </template>

      <!-- 御三家 -->
      <template v-else-if="tab === '御三家'">
        <div class="panel group">
          <h3>🌱 全部御三家（{{ starters.length }} 只 · 全世代）</h3>
          <div class="mini-grid">
            <div v-for="p in starters" :key="p.id" class="mini-card" @click="go(p)">
              <PokeImg :src="p.image" :alt="p.name" img-class="mini-img" />
              <span>{{ p.name }}</span>
            </div>
          </div>
        </div>
        <div class="panel group">
          <h3>🌏 历代御三家一览</h3>
          <div class="starter-lines">
            <div v-for="s in STARTER_LINES" :key="s.region" class="starter-line">
              <span class="tagline">{{ s.region }}</span>
              <span>{{ s.names }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 神兽 / 幻兽 -->
      <template v-else>
        <div class="panel group">
          <h3>🌟 神兽 · 幻兽（共 {{ legendaries.length }} 只）</h3>
          <p class="hint-line" style="margin-bottom: 12px">神兽指传说中的宝可梦，幻兽指幻之宝可梦，二者在野外极难遇见，捕捉概率极低。</p>
          <div class="mini-grid">
            <div v-for="p in legendaries.slice(0, 24)" :key="p.id" class="mini-card" @click="go(p)">
              <PokeImg :src="p.image" :alt="p.name" img-class="mini-img" />
              <span>{{ p.name }}</span>
            </div>
          </div>
          <p v-if="legendaries.length > 24" class="more-tip">
            共 {{ legendaries.length }} 只
            <router-link :to="{ path: '/pokedex', query: { level: '传说' } }">查看全部 →</router-link>
          </p>
        </div>
        <div class="panel group">
          <h3>📜 原著传说 · 幻之宝可梦名录</h3>
          <div class="chip-row">
            <span v-for="n in LEGENDARY_NAMES" :key="n" class="form-chip">{{ n }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import PokeImg from '../components/PokeImg.vue'
import { ALL_DEX } from '../data/dex'
import { TYPES, RARITIES, REGIONS, STARTER_LINES, LEGENDARY_NAMES } from '../data/gameData'
import { STARTER_IDS } from '../data/starters'

const router = useRouter()
const tabs = ['按属性', '按稀有度', '按地区', '御三家', '神兽 / 幻兽']
const tab = ref('按属性')
const SHOW = 12

const typeGroups = computed(() =>
  TYPES.map(t => ({ label: t, items: ALL_DEX.filter(p => p.category === t || p.category2 === t) }))
)
function rarityOf(p) { return p.rarity || p.level || '普通' }
function rarityToLevel(r) {
  return { '普通': '普通', '稀有': '稀有', '史诗': '史诗', '神兽': '传说', '幻兽': '传说' }[r] || '普通'
}
function byRarity(r) { return ALL_DEX.filter(p => rarityOf(p) === r) }
function byRegion(r) { return ALL_DEX.filter(p => p.region === r) }
const starters = computed(() => ALL_DEX.filter(p => STARTER_IDS.includes(Number(p.id))))
const legendaries = computed(() => ALL_DEX.filter(p => ['神兽', '幻兽'].includes(rarityOf(p))))

function go(p) { router.push({ path: '/pokedex', query: { keyword: p.name } }) }
</script>

<style scoped>
.group h3 { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.count { font-size: 12px; color: #aaa; font-weight: 400; }
.mini-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 10px; }
.mini-card { background: #f9fafd; border: 2px solid var(--line); border-radius: 12px; padding: 8px 4px; text-align: center; cursor: pointer; transition: all .15s; }
.mini-card:hover { border-color: var(--poke-orange); background: #fffdf7; transform: translateY(-3px); }
.mini-card img, .mini-img { width: 62px; height: 62px; object-fit: contain; }
.mini-card span { display: block; font-size: 12px; font-weight: 700; color: var(--ink); }
.more-tip { margin-top: 10px; font-size: 12px; color: var(--ink-light); text-align: right; }
.more-tip a { color: var(--poke-blue); font-weight: 800; }
.starter-lines { display: flex; flex-direction: column; gap: 10px; }
.starter-line { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--ink); flex-wrap: wrap; }
.form-chip { background: var(--poke-orange-soft); color: #8a5a1a; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 12px; }
</style>
