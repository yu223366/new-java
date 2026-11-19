<template>
  <!-- ============ 精灵球（原著经典外观） ============ -->
  <svg v-if="kind === 'ball'" :width="size" :height="size" viewBox="0 0 32 32" class="game-icon" aria-hidden="true">
    <circle cx="16" cy="16" r="13.6" :fill="ball.bottom" stroke="#1b1b1b" stroke-width="1.5" />
    <path d="M2.4 16 a13.6 13.6 0 0 1 27.2 0 z" :fill="ball.top" />
    <rect x="2.4" y="14.9" width="27.2" height="2.2" fill="#1b1b1b" />
    <circle cx="16" cy="16" r="4.5" fill="#1b1b1b" />
    <circle cx="16" cy="16" r="3.1" :fill="ball.btn || '#fff'" stroke="#1b1b1b" stroke-width="0.9" />
    <text v-if="ball.letter" x="16" y="17.6" text-anchor="middle" font-size="4.6" font-weight="900" :fill="ball.letterColor || '#1b1b1b'">{{ ball.letter }}</text>
    <ellipse cx="11" cy="8.6" rx="3.6" ry="2" fill="rgba(255,255,255,.55)" />
  </svg>

  <!-- ============ 道馆徽章（金属勋章 + 属性宝石） ============ -->
  <svg v-else-if="kind === 'badge'" :width="size" :height="size" viewBox="0 0 32 32" class="game-icon" aria-hidden="true">
    <rect x="12.6" y="1" width="6.8" height="5.2" rx="2" fill="#d8a834" stroke="#8a6d1a" stroke-width="1" />
    <circle cx="16" cy="18" r="13" fill="#e8c34a" stroke="#a87f1e" stroke-width="1.6" />
    <circle cx="16" cy="18" r="10.6" fill="#f7d774" />
    <circle cx="16" cy="18" r="8.3" :fill="badge.color" stroke="#1b1b1b" stroke-width="1" />
    <text x="16" y="21.6" text-anchor="middle" font-size="9.5" font-weight="900" fill="#fff" stroke="rgba(0,0,0,.25)" stroke-width="0.5">{{ badge.symbol }}</text>
    <ellipse cx="12.8" cy="14.6" rx="3" ry="2" fill="rgba(255,255,255,.5)" />
  </svg>

  <!-- ============ 药品（喷雾瓶原著外观） ============ -->
  <svg v-else-if="kind === 'medicine'" :width="size" :height="size" viewBox="0 0 32 32" class="game-icon" aria-hidden="true">
    <rect x="14.2" y="4.5" width="3.6" height="3.6" fill="#9a9a9a" stroke="#1b1b1b" stroke-width="1" />
    <rect x="12" y="7" width="8" height="2.2" fill="#8a8a8a" stroke="#1b1b1b" stroke-width="1" />
    <rect x="12.4" y="9" width="7.2" height="3.6" rx="1.4" fill="#5b5b5b" stroke="#1b1b1b" stroke-width="1" />
    <rect x="11" y="12.5" width="10" height="15.5" rx="2.6" :fill="med.color" stroke="#1b1b1b" stroke-width="1.5" />
    <rect x="11" y="17" width="10" height="5.6" fill="rgba(255,255,255,.88)" />
    <ellipse cx="13.8" cy="10.8" rx="1.8" ry="1" fill="rgba(255,255,255,.4)" />
  </svg>

  <!-- ============ 技能道具（TM 光盘） ============ -->
  <svg v-else-if="kind === 'tm'" :width="size" :height="size" viewBox="0 0 32 32" class="game-icon" aria-hidden="true">
    <circle cx="16" cy="16" r="13.4" fill="#dfe6f3" stroke="#1b1b1b" stroke-width="1.5" />
    <path d="M6 9 A13.4 13.4 0 0 1 26 6" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="16" cy="16" r="4.4" fill="#fff" stroke="#1b1b1b" stroke-width="1.3" />
    <circle cx="16" cy="16" r="1.6" fill="#c9d2e4" />
  </svg>

  <!-- ============ 技能道具（PP 补剂瓶） ============ -->
  <svg v-else-if="kind === 'pp'" :width="size" :height="size" viewBox="0 0 32 32" class="game-icon" aria-hidden="true">
    <rect x="13" y="5" width="6" height="4" rx="1.5" fill="#8a8a8a" stroke="#1b1b1b" stroke-width="1" />
    <path d="M12 12 q4 -3 8 0 l-1 15 q-3 2 -6 0 z" :fill="pp.color" stroke="#1b1b1b" stroke-width="1.5" />
    <rect x="12.4" y="13.5" width="7.2" height="6" fill="rgba(255,255,255,.7)" />
    <text x="16" y="19" text-anchor="middle" font-size="5" font-weight="900" fill="#1b1b1b">PP</text>
  </svg>

  <!-- ============ 进化石 / 其他道具（彩色宝石） ============ -->
  <svg v-else-if="kind === 'gem'" :width="size" :height="size" viewBox="0 0 32 32" class="game-icon" aria-hidden="true">
    <path d="M16 3 L27 12 L16 29 L5 12 Z" :fill="gem.color" stroke="#1b1b1b" stroke-width="1.5" />
    <path d="M5 12 L16 16 L27 12" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.6" />
    <path d="M16 16 L16 29" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="1.2" />
  </svg>

  <!-- ============ 兜底：圆形图标 ============ -->
  <svg v-else :width="size" :height="size" viewBox="0 0 32 32" class="game-icon" aria-hidden="true">
    <circle cx="16" cy="16" r="13.5" fill="#eef1f6" stroke="#1b1b1b" stroke-width="1.5" />
    <text x="16" y="21" text-anchor="middle" font-size="11" font-weight="900" fill="#5b6472">?</text>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  kind: { type: String, default: 'ball' },   // ball | badge | medicine | tm | pp | gem
  name: { type: String, default: '' },        // 名称（球名 / 药名 / 道具名）
  type: { type: String, default: '' },        // 徽章属性
  size: { type: [Number, String], default: 24 }
})

// ===== 精灵球配色（上半 / 下半 / 中央钮 / 字母） =====
const BALL_STYLE = {
  '精灵球': { top: '#e63946', bottom: '#f4f4f4' },
  '超级球': { top: '#4d7cfe', bottom: '#f4f4f4' },
  '高级球': { top: '#2b2b2b', bottom: '#f4c20d' },
  '先机球': { top: '#4dd0e1', bottom: '#f4f4f4' },
  '黑暗球': { top: '#2f3542', bottom: '#3ddc84' },
  '计时球': { top: '#e63946', bottom: '#f4f4f4', letter: '⏱' },
  '诱饵球': { top: '#26a69a', bottom: '#f4f4f4' },
  '月亮球': { top: '#f5d90a', bottom: '#f4f4f4' },
  '治愈球': { top: '#ff8fab', bottom: '#f4f4f4' },
  '豪华球': { top: '#2b2b2b', bottom: '#c0392b' },
  '公园球': { top: '#26a69a', bottom: '#f4f4f4', btn: '#f4c20d' },
  '大师球': { top: '#7b2ff7', bottom: '#f4f4f4', letter: 'M', letterColor: '#7b2ff7' }
}

// ===== 徽章属性配色 / 中央符号 =====
const TYPE_STYLE = {
  '岩石': { color: '#8d6e63', symbol: '岩' },
  '水': { color: '#42a5f5', symbol: '水' },
  '电': { color: '#f5b50a', symbol: '电' },
  '草': { color: '#66bb6a', symbol: '草' },
  '毒': { color: '#ab47bc', symbol: '毒' },
  '超能力': { color: '#ec407a', symbol: '超' },
  '火': { color: '#ef5350', symbol: '火' },
  '地面': { color: '#a1887f', symbol: '地' },
  '飞行': { color: '#64b5f6', symbol: '飞' },
  '虫': { color: '#9ccc65', symbol: '虫' },
  '一般': { color: '#b0bec5', symbol: '普' },
  '幽灵': { color: '#7e57c2', symbol: '幽' },
  '格斗': { color: '#ff7043', symbol: '斗' },
  '钢': { color: '#90a4ae', symbol: '钢' },
  '冰': { color: '#4fc3f7', symbol: '冰' },
  '龙': { color: '#5c6bc0', symbol: '龙' },
  '妖精': { color: '#f48fb1', symbol: '妖' },
  '恶': { color: '#616161', symbol: '恶' }
}

// ===== 药品配色 =====
const MED_STYLE = {
  '伤药': { color: '#f2c14e' },
  '好伤药': { color: '#5aa7f0' },
  '厉害伤药': { color: '#ff9f43' },
  '全满药': { color: '#f06292' },
  '全复药': { color: '#ef5350' },
  '解毒药': { color: '#66bb6a' },
  '万能药': { color: '#b388ff' },
  '元气药片': { color: '#ffb300' },
  '解麻药': { color: '#ffd54f' },
  '烧伤药': { color: '#ff8a65' },
  '解冻药': { color: '#4fc3f7' },
  '复活草': { color: '#43a047' }
}

// ===== PP 补剂配色 =====
const PP_STYLE = {
  'PP小补剂': { color: '#66bb6a' },
  'PP全补剂': { color: '#42a5f5' },
  'PP提升剂': { color: '#7e57c2' }
}

// ===== 进化石 / 道具配色 =====
const GEM_STYLE = {
  '火之石': { color: '#ef5350' },
  '水之石': { color: '#42a5f5' },
  '雷之石': { color: '#f5b50a' },
  '叶之石': { color: '#66bb6a' },
  '太阳之石': { color: '#ffa726' },
  '月之石': { color: '#9c7cf4' },
  '不变之石': { color: '#90a4ae' },
  '幸运蛋': { color: '#f48fb1' },
  '剩饭': { color: '#eceff1' },
  '气势披带': { color: '#ef5350' },
  '心之鳞片': { color: '#ff8a9e' },
  '神奇糖果': { color: '#ff7eb3' }
}

const ball = computed(() => BALL_STYLE[props.name] || BALL_STYLE['精灵球'])
const badge = computed(() => TYPE_STYLE[props.type] || { color: '#9aa3b2', symbol: '?' })
const med = computed(() => MED_STYLE[props.name] || { color: '#f2c14e' })
const pp = computed(() => PP_STYLE[props.name] || { color: '#66bb6a' })
const gem = computed(() => GEM_STYLE[props.name] || { color: '#9aa3b2' })
</script>

<style scoped>
.game-icon { display: inline-block; vertical-align: middle; flex-shrink: 0; }
</style>
