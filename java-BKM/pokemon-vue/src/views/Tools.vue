<template>
  <div class="page">
    <NavBar />
    <div class="wrap">
      <div class="page-head">
        <h1>🧰 工具百科大全</h1>
        <span class="sub">完整 18 属性克制表 · 全部招式库 · 道具图鉴 · TM/HM 学习器</span>
      </div>

      <div class="tabs">
        <button v-for="t in tabs" :key="t" :class="['tab-btn', { active: tab === t }]" @click="tab = t">{{ t }}</button>
      </div>

      <!-- 属性克制表 -->
      <template v-if="tab === '属性克制表'">
        <div class="panel">
          <h3>🎯 18 属性相克表</h3>
          <p class="hint-line" style="margin-bottom: 12px">
            <span class="legend x2">2</span> 效果拔群　
            <span class="legend x05">½</span> 效果不佳　
            <span class="legend x0">0</span> 没有效果　
            （行 = 攻击属性，列 = 被攻击属性）
          </p>
          <div class="table-scroll">
            <table class="type-table">
              <thead>
                <tr>
                  <th class="corner">攻\\防</th>
                  <th v-for="d in TYPES" :key="d" class="col-head">
                    <span :class="['type-dot', 'type-' + d]"></span>{{ d }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in TYPES" :key="a">
                  <th class="row-head">
                    <span :class="['type-dot', 'type-' + a]"></span>{{ a }}
                  </th>
                  <td v-for="d in TYPES" :key="d" :class="cellClass(cell(a, d))">{{ cellText(cell(a, d)) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- 招式库 -->
      <template v-else-if="tab === '招式库'">
        <div class="panel">
          <h3>⚔️ 全部招式库（{{ filteredMoves.length }} 个）</h3>
          <div class="chip-row" style="margin-bottom: 14px">
            <button v-for="m in moveTypeOptions" :key="m" :class="['chip', { active: moveType === m }]" @click="moveType = m">{{ m }}</button>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr><th>招式</th><th>属性</th><th>分类</th><th>威力</th><th>命中</th><th>效果</th></tr>
              </thead>
              <tbody>
                <tr v-for="m in filteredMoves" :key="m.name">
                  <td><b>{{ m.name }}</b></td>
                  <td><span :class="['type', 'type-' + m.type]">{{ m.type }}</span></td>
                  <td>{{ m.cat }}</td>
                  <td>{{ m.power || '—' }}</td>
                  <td>{{ m.acc }}%</td>
                  <td class="effect-cell">{{ m.effect }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- 道具图鉴 -->
      <template v-else-if="tab === '道具图鉴'">
        <div v-for="k in kinds" :key="k" class="panel">
          <h3>{{ kindIcon(k) }} {{ k }}（{{ itemsOf(k).length }} 种）</h3>
          <div class="grid-wide">
            <div v-for="it in itemsOf(k)" :key="it.name" class="item-card">
              <span class="item-ico"><GameIcon :kind="itemIconKind(it)" :name="it.name" :size="34" /></span>
              <div>
                <b>{{ it.name }}</b>
                <p class="hint-line">{{ it.effect }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- TM / HM -->
      <template v-else>
        <div class="panel">
          <h3>📀 技能学习器 TM / HM 大全</h3>
          <p class="hint-line" style="margin-bottom: 12px">TM = 一般技能学习器，可重复使用；HM = 秘传学习器，用于地图探索。</p>
          <div class="table-scroll">
            <table class="data-table">
              <thead><tr><th>编号</th><th>招式名称</th><th>属性</th><th>威力</th></tr></thead>
              <tbody>
                <tr v-for="t in TMS" :key="t.no">
                  <td><span class="tm-no" :class="{ hm: t.no.startsWith('HM') }">{{ t.no }}</span></td>
                  <td><b>{{ t.name }}</b></td>
                  <td><span :class="['type', 'type-' + t.type]">{{ t.type }}</span></td>
                  <td>{{ t.power || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import GameIcon from '../components/GameIcon.vue'
import { TYPES, TYPE_CHART, MOVES, ITEMS, TMS } from '../data/gameData'
import { fetchSkills } from '../api/game'

const tabs = ['属性克制表', '招式库', '道具图鉴', 'TM / HM']
const tab = ref('属性克制表')

function cell(atk, def) {
  const row = TYPE_CHART[atk] || {}
  return row[def] === undefined ? 1 : row[def]
}
function cellClass(v) {
  return v === 2 ? 'x2' : v === 0.5 ? 'x05' : v === 0 ? 'x0' : ''
}
function cellText(v) {
  return v === 2 ? '2' : v === 0.5 ? '½' : v === 0 ? '0' : ''
}

const moveType = ref('全部')
const moveTypeOptions = ['全部', ...TYPES]
// 招式库：优先用后端（在线），离线用静态 MOVES
const movesData = ref(MOVES)
const filteredMoves = computed(() =>
  moveType.value === '全部' ? movesData.value : movesData.value.filter(m => m.type === moveType.value)
)

onMounted(async () => {
  const d = await fetchSkills()
  if (d && d.length) movesData.value = d.map(s => ({ ...s, cat: s.category, acc: s.accuracy }))
})

const kinds = ['药水', '精灵球', '进化石', '其他']
function itemsOf(k) { return ITEMS.filter(i => i.kind === k) }
function kindIcon(k) { return { '药水': '💉', '精灵球': '⚪', '进化石': '💎', '其他': '🎁' }[k] || '📦' }
// 道具 → GameIcon 的 kind 映射
function itemIconKind(it) {
  if (it.kind === '药水') return 'medicine'
  if (it.kind === '精灵球') return 'ball'
  return 'gem'   // 进化石 / 其他 → 宝石
}
</script>

<style scoped>
.table-scroll { overflow-x: auto; padding-bottom: 6px; }
.type-table { border-collapse: collapse; font-size: 11px; }
.type-table th, .type-table td { width: 30px; height: 28px; text-align: center; border: 1px solid #eef0f4; }
.type-table .corner { background: #f8f9fc; font-weight: 800; color: #999; width: 52px; }
.type-table .col-head, .type-table .row-head { background: #f8f9fc; font-weight: 700; white-space: nowrap; font-size: 10px; }
.type-table .row-head { text-align: left; padding-left: 4px; }
.type-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 2px; vertical-align: middle; }
.type-table td.x2 { background: #ffe3e3; color: #c0392b; font-weight: 900; }
.type-table td.x05 { background: #e3f7e8; color: #1e8449; font-weight: 900; }
.type-table td.x0 { background: #4a4a4a; color: #fff; font-weight: 900; }
.legend { display: inline-block; width: 20px; height: 18px; line-height: 18px; text-align: center; border-radius: 4px; font-weight: 900; font-size: 11px; }
.legend.x2 { background: #ffe3e3; color: #c0392b; }
.legend.x05 { background: #e3f7e8; color: #1e8449; }
.legend.x0 { background: #4a4a4a; color: #fff; }

.data-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 560px; }
.data-table th { background: #f8f9fc; text-align: left; padding: 10px; font-size: 12px; color: var(--ink-light); border-bottom: 2px solid var(--line); }
.data-table td { padding: 9px 10px; border-bottom: 1px dashed var(--line); }
.data-table tr:hover td { background: #fffdf5; }
.effect-cell { color: var(--ink-light); font-size: 12px; }
.tm-no { background: #eef2ff; color: var(--poke-blue); font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 8px; }
.tm-no.hm { background: #fff3cd; color: #8a6d00; }

.item-card { display: flex; gap: 12px; align-items: flex-start; background: #f9fafd; border: 2px solid var(--line); border-radius: 12px; padding: 12px; }
.item-ico { font-size: 24px; flex-shrink: 0; display: flex; align-items: center; }
.item-card b { font-size: 14px; color: var(--ink); }

/* 属性色点：复用全局 .type-* 的背景色 */
.type-dot.type-一般 { background: var(--type-normal); }
.type-dot.type-格斗 { background: var(--type-fighting); }
.type-dot.type-飞行 { background: var(--type-flying); }
.type-dot.type-毒 { background: var(--type-poison); }
.type-dot.type-地面 { background: var(--type-ground); }
.type-dot.type-岩石 { background: var(--type-rock); }
.type-dot.type-虫 { background: var(--type-bug); }
.type-dot.type-幽灵 { background: var(--type-ghost); }
.type-dot.type-钢 { background: var(--type-steel); }
.type-dot.type-火 { background: var(--type-fire); }
.type-dot.type-水 { background: var(--type-water); }
.type-dot.type-草 { background: var(--type-grass); }
.type-dot.type-电 { background: var(--type-electric); }
.type-dot.type-超能力 { background: var(--type-psychic); }
.type-dot.type-冰 { background: var(--type-ice); }
.type-dot.type-龙 { background: var(--type-dragon); }
.type-dot.type-恶 { background: var(--type-dark); }
.type-dot.type-妖精 { background: var(--type-fairy); }
</style>
