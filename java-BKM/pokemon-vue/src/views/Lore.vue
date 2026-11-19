<template>
  <div class="page">
    <NavBar />
    <div class="wrap">
      <div class="page-head">
        <h1>📚 原著资料库</h1>
        <span class="sub">严格遵循 TV 动画主线 · 九大篇章顺序 · 剧场版作为番外独立归档</span>
      </div>

      <!-- 篇章导航 -->
      <div class="tabs">
        <button v-for="c in chaptersData" :key="c.id" :class="['tab-btn', { active: tab === c.id }]" @click="switchTab(c.id)">
          {{ c.order }}. {{ c.name }}
        </button>
        <button :class="['tab-btn', { active: tab === 'movies' }]" @click="switchTab('movies')">🎬 剧场版（番外）</button>
      </div>

      <!-- ============ 剧场版（番外独立分区）============ -->
      <template v-if="tab === 'movies'">
        <div class="panel side-note">
          <h3>🎬 剧场版 · 番外分区</h3>
          <p class="hint-line">{{ SIDE_STORIES_NOTE }}</p>
        </div>
        <div class="movie-grid">
          <div v-for="m in pagedMovies" :key="m.no" class="panel movie-card">
            <div class="movie-top">
              <span class="movie-no">{{ m.no }}</span>
              <h3>{{ m.name }}</h3>
              <span class="tagline">{{ m.year }}</span>
            </div>
            <p class="lore-desc">{{ m.desc }}</p>
          </div>
        </div>
        <div v-if="moviePages > 1" class="pager">
          <button class="btn-sm-ghost" :disabled="moviePage === 0" @click="moviePage--">上一页</button>
          <span class="page-info">第 {{ moviePage + 1 }} / {{ moviePages }} 页（共 {{ MOVIES.length }} 部）</span>
          <button class="btn-sm-ghost" :disabled="moviePage >= moviePages - 1" @click="moviePage++">下一页</button>
        </div>
      </template>

      <!-- ============ 主线篇章 ============ -->
      <template v-else>
        <!-- 篇章头 -->
        <div class="panel ch-head">
          <div class="ch-title-row">
            <span class="ch-order">{{ cur.order }}</span>
            <div>
              <h2 class="ch-name">{{ cur.name }} <small>{{ cur.en }}</small></h2>
              <p class="ch-meta">{{ cur.years }} · {{ cur.region }}</p>
            </div>
          </div>
          <p class="ch-tagline">{{ cur.tagline }}</p>
          <p class="narration">「{{ cur.narration }}」</p>
        </div>

        <!-- 地区地图 -->
        <div class="panel">
          <h3>🗺️ 地区地图</h3>
          <p class="hint-line" style="margin-bottom: 12px">{{ cur.mapRoute }}</p>
          <div class="map-stops">
            <template v-for="(s, i) in cur.mapStops" :key="i">
              <span class="stop">{{ s }}</span>
              <span v-if="i < cur.mapStops.length - 1" class="stop-arrow">→</span>
            </template>
          </div>
        </div>

        <div class="two-col">
          <!-- 馆主 -->
          <div class="panel">
            <h3>🏛️ 馆主 / 考验</h3>
            <div class="gym-list-mini">
              <div v-for="(g, i) in cur.gyms" :key="i" class="gym-item">
                <span class="gym-idx">{{ i + 1 }}</span>
                <div class="gym-info">
                  <b>{{ g.leader }}</b>
                  <small>{{ g.city }}</small>
                </div>
                <span v-if="isType(g.type)" :class="['type', 'type-' + g.type]">{{ g.type }}</span>
                <span v-else class="multi-type">{{ g.type }}</span>
                <span class="badge-name">{{ g.badge }}</span>
              </div>
            </div>
          </div>

          <!-- 主角团 / 反派 -->
          <div>
            <div class="panel">
              <h3>👥 主角团</h3>
              <div class="cast-list">
                <div v-for="(c, i) in cur.cast" :key="i" class="cast-item">
                  <span class="cast-avatar">{{ c.name.slice(0, 1) }}</span>
                  <div>
                    <b>{{ c.name }}</b>
                    <small>{{ c.role }}</small>
                  </div>
                </div>
              </div>
            </div>
            <div class="panel">
              <h3>💀 反派组织</h3>
              <div class="chip-row">
                <span v-for="(v, i) in cur.villains" :key="i" class="villain-chip">{{ v }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 主线事件（分页渲染，避免一次渲染过多文字） -->
        <div class="panel">
          <div class="event-head">
            <h3>📜 主线事件</h3>
            <span class="page-info">第 {{ eventPage + 1 }} / {{ eventPages }} 页</span>
          </div>
          <ol class="event-list">
            <li v-for="(e, i) in pagedEvents" :key="i">
              <span class="ev-idx">{{ eventPage * EVENT_PER + i + 1 }}</span>
              <span>{{ e }}</span>
            </li>
          </ol>
          <div v-if="eventPages > 1" class="pager">
            <button class="btn-sm-ghost" :disabled="eventPage === 0" @click="eventPage--">上一页</button>
            <button class="btn-sm-ghost" :disabled="eventPage >= eventPages - 1" @click="eventPage++">下一页</button>
          </div>
        </div>

        <!-- 经典名场面 -->
        <div class="panel">
          <h3>✨ 经典名场面</h3>
          <div class="scene-wrap">
            <span v-for="(s, i) in cur.scenes" :key="i" class="scene-chip">🎬 {{ s }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import { CHAPTERS, SIDE_STORIES_NOTE } from '../data/chapters'
import { MOVIES, TYPES } from '../data/gameData'
import { fetchChapters } from '../api/game'

const typeSet = new Set(TYPES)
const isType = t => typeSet.has(t)

// 篇章 / 番外
const tab = ref(CHAPTERS[0].id)
const chaptersData = ref(CHAPTERS)
const cur = computed(() => chaptersData.value.find(c => c.id === tab.value) || chaptersData.value[0])

onMounted(async () => {
  const d = await fetchChapters()
  if (d && d.length) {
    chaptersData.value = d.map(c => {
      let obj = {}
      try { obj = JSON.parse(c.contentJson || '{}') } catch (e) { obj = {} }
      return { ...obj, id: obj.id || c.name, name: c.name, region: c.region, years: c.years, tagline: c.tagline, narration: c.narration || obj.narration }
    })
    if (chaptersData.value.length && !chaptersData.value.find(c => c.id === tab.value)) tab.value = chaptersData.value[0].id
  }
})

// 主线事件分页
const EVENT_PER = 4
const eventPage = ref(0)
const pagedEvents = computed(() => {
  const list = cur.value.events || []
  return list.slice(eventPage.value * EVENT_PER, (eventPage.value + 1) * EVENT_PER)
})
const eventPages = computed(() => Math.max(1, Math.ceil((cur.value.events || []).length / EVENT_PER)))

// 剧场版分页
const MOVIE_PER = 8
const moviePage = ref(0)
const pagedMovies = computed(() => MOVIES.slice(moviePage.value * MOVIE_PER, (moviePage.value + 1) * MOVIE_PER))
const moviePages = computed(() => Math.max(1, Math.ceil(MOVIES.length / MOVIE_PER)))

function switchTab(id) {
  tab.value = id
  eventPage.value = 0
}
</script>

<style scoped>
/* 篇章头 */
.ch-head { background: linear-gradient(135deg, #fff9e6, #eef2ff); border-color: #ffe28a; }
.ch-title-row { display: flex; align-items: center; gap: 14px; }
.ch-order { width: 46px; height: 46px; border-radius: 14px; background: linear-gradient(135deg, var(--poke-red), var(--poke-yellow)); color: #fff; font-size: 22px; font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ch-name { font-size: 25px; display: flex; align-items: baseline; gap: 8px; }
.ch-name small { font-size: 13px; color: var(--ink-light); font-weight: 400; letter-spacing: 1px; }
.ch-meta { font-size: 12.5px; color: var(--ink-light); margin-top: 3px; }
.ch-tagline { margin-top: 12px; font-size: 14px; font-weight: 800; color: var(--poke-red); }
.narration { margin-top: 10px; font-size: 13.5px; line-height: 2; color: var(--ink); background: rgba(255, 255, 255, .72); border-left: 4px solid var(--poke-yellow); border-radius: 10px; padding: 12px 14px; font-style: normal; }

/* 地图 */
.map-stops { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.stop { background: #eef2ff; color: var(--poke-blue); font-size: 12px; font-weight: 700; padding: 5px 11px; border-radius: 11px; }
.stop-arrow { color: #b9c0d4; font-size: 12px; font-weight: 900; }

/* 两列 */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
.two-col > div > .panel + .panel { margin-top: 18px; }

/* 馆主 */
.gym-list-mini { display: flex; flex-direction: column; gap: 8px; }
.gym-item { display: flex; align-items: center; gap: 9px; background: #f9fafd; border-radius: 11px; padding: 8px 10px; }
.gym-idx { width: 22px; height: 22px; border-radius: 50%; background: var(--poke-blue); color: #fff; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.gym-info { flex: 1; min-width: 0; }
.gym-info b { display: block; font-size: 13px; }
.gym-info small { font-size: 11px; color: var(--ink-light); }
.multi-type { font-size: 11px; font-weight: 700; color: #6b6b6b; background: #eef0f4; padding: 3px 9px; border-radius: 10px; }
.badge-name { font-size: 11px; color: #b8860b; background: #fff7d6; padding: 3px 9px; border-radius: 10px; white-space: nowrap; }

/* 人物 / 反派 */
.cast-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cast-item { display: flex; align-items: center; gap: 9px; }
.cast-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--poke-red), var(--poke-yellow)); color: #fff; font-weight: 900; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cast-item b { display: block; font-size: 13px; }
.cast-item small { font-size: 10.5px; color: var(--ink-light); }
.villain-chip { background: #fdecec; color: #c0392b; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 11px; }

/* 事件 */
.event-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.event-head h3 { margin-bottom: 0; }
.event-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.event-list li { display: flex; gap: 10px; font-size: 13.5px; line-height: 1.85; color: var(--ink); }
.ev-idx { width: 22px; height: 22px; border-radius: 50%; background: var(--poke-yellow); color: #5a4300; font-size: 11px; font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
.page-info { font-size: 12px; color: var(--ink-light); }

/* 名场面 */
.scene-wrap { display: flex; flex-wrap: wrap; gap: 9px; }
.scene-chip { background: #f3e8ff; color: #7d3cc4; font-size: 12.5px; font-weight: 700; padding: 7px 13px; border-radius: 12px; }

/* 剧场版 */
.side-note { background: #fffaf0; border-color: #ffe28a; }
.movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 16px; }
.movie-card { transition: all .18s; }
.movie-card:hover { border-color: var(--poke-yellow); box-shadow: var(--shadow); }
.movie-top { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; margin-bottom: 8px; }
.movie-top h3 { margin-bottom: 0 !important; font-size: 16px; }
.movie-no { background: var(--poke-blue); color: #fff; font-size: 11px; font-weight: 800; padding: 3px 9px; border-radius: 9px; }
.lore-desc { font-size: 13px; line-height: 1.85; color: var(--ink); }

/* 分页器 */
.pager { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 16px; }

@media (max-width: 780px) {
  .two-col { grid-template-columns: 1fr; }
  .cast-list { grid-template-columns: 1fr; }
  .ch-name { font-size: 20px; }
}
</style>
