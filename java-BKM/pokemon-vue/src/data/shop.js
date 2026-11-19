/**
 * 市集商品与捕捉率系统
 * 货币统一：币（coin）
 * 捕捉率公式（终稿）：
 *   基础捕获率 × 血量倍率 × 异常倍率 × 精灵球倍率，封顶 90%
 *   大师球 / 公园球 100% 必捕
 */

// ============ 精灵球 ============
export const BALLS = [
  { name: '精灵球', price: 30, mult: 1, icon: '⚪', desc: '基础捕捉球' },
  { name: '超级球', price: 80, mult: 1.5, icon: '🔵', desc: '倍率 ×1.5' },
  { name: '高级球', price: 200, mult: 2.2, icon: '🟡', desc: '倍率 ×2.2' },
  { name: '先机球', price: 150, mult: 3, cond: 'first', icon: '🟠', desc: '首回合倍率 ×3' },
  { name: '黑暗球', price: 160, mult: 3, cond: 'cave', icon: '⚫', desc: '山洞内倍率 ×3' },
  { name: '计时球', price: 160, mult: 3, cond: 'late', icon: '⏱️', desc: '5 回合后倍率 ×3' },
  { name: '诱饵球', price: 160, mult: 3, cond: 'water', icon: '🎣', desc: '水域倍率 ×3' },
  { name: '治愈球', price: 180, mult: 1.2, heal: true, icon: '💚', desc: '捕获后满血并清除异常' },
  { name: '豪华球', price: 300, mult: 1, luxury: true, icon: '✨', desc: '亲密度提升' },
  { name: '公园球', price: 100000, mult: 99, sure: true, icon: '🟢', desc: '100% 必定捕获' },
  { name: '大师球', price: 120000, mult: 99, sure: true, icon: '🟣', desc: '100% 必定捕获' }
]

// ============ 药品 ============
export const MEDICINES = [
  { name: '伤药', price: 25, heal: 20, icon: '💉', desc: '回复 20 HP' },
  { name: '好伤药', price: 60, heal: 60, icon: '🧪', desc: '回复 60 HP' },
  { name: '厉害伤药', price: 130, heal: 120, icon: '🧴', desc: '回复 120 HP' },
  { name: '全满药', price: 600, heal: 9999, icon: '🍬', desc: '回复全部 HP' },
  { name: '全复药', price: 800, heal: 9999, cureAll: true, icon: '💊', desc: '回满 HP 并清除异常' },
  { name: '解毒药', price: 20, cure: '中毒', icon: '🍶', desc: '解除中毒' },
  { name: '解麻药', price: 20, cure: '麻痹', icon: '⚡', desc: '解除麻痹' },
  { name: '烧伤药', price: 20, cure: '烧伤', icon: '🔥', desc: '解除烧伤' },
  { name: '解冻药', price: 20, cure: '冰冻', icon: '❄️', desc: '解除冰冻' },
  { name: '复活草', price: 950, revive: true, icon: '🌿', desc: '复活并回复一半 HP' }
]

// ============ 技能道具 ============
export const SKILL_ITEMS = [
  { name: 'PP小补剂', price: 120, icon: '📗', desc: '单个技能回复 10 PP' },
  { name: 'PP全补剂', price: 400, icon: '📘', desc: '单只宝可梦全部技能 PP 回满' },
  { name: '技能光盘TM', price: 500, icon: '💿', desc: '消耗品，习得指定技能' },
  { name: '秘传学习器HM', price: 800, icon: '📀', desc: '学习特殊秘传技能' },
  { name: '心之鳞片', price: 300, icon: '💗', desc: '回忆起被遗忘的技能' },
  { name: 'PP提升剂', price: 600, icon: '🧪', desc: '提升技能 PP 上限' },
  { name: '神奇糖果', price: 1000, icon: '🍬', desc: '让宝可梦直接升 1 级' }
]

export const SHOP_CATEGORIES = [
  { key: 'balls', label: '⚪ 精灵球', items: BALLS },
  { key: 'medicines', label: '💊 药品', items: MEDICINES },
  { key: 'skills', label: '💿 技能道具', items: SKILL_ITEMS }
]

/** 快速按名称取商品 */
export function findShopItem(name) {
  return [...BALLS, ...MEDICINES, ...SKILL_ITEMS].find(i => i.name === name) || null
}

// ============ 捕捉率 ============
/** 基础捕获率：满血 + 普通精灵球 */
export const BASE_CATCH = {
  '普通': 0.40,
  '稀有': 0.16,
  '闪光': 0.06,
  '神兽': 0.01
}

/** 稀有度归一化：把图鉴 5 档映射到捕捉 4 类 */
export function catchTier(rarity, shiny) {
  if (shiny) return '闪光'
  if (rarity === '神兽' || rarity === '幻兽') return '神兽'
  if (rarity === '史诗' || rarity === '稀有') return '稀有'
  return '普通'
}

/**
 * 计算捕获率
 * @param {object} p
 * @param {string} p.tier       '普通' | '稀有' | '闪光' | '神兽'
 * @param {number} p.hpRatio    剩余血量比例 0~1
 * @param {boolean} p.hasStatus 是否处于麻痹/睡眠/冰冻
 * @param {object} p.ball       球对象（含 mult/cond/sure）
 * @param {number} p.turn       当前回合数
 * @param {string} p.zoneKind   场景类型（草丛/山洞/水域…）
 */
export function calcCatchRate({ tier = '普通', hpRatio = 1, hasStatus = false, ball, turn = 1, zoneKind = '' }) {
  if (!ball) ball = BALLS[0]
  if (ball.sure) return { rate: 1, parts: { base: BASE_CATCH[tier] || 0.4, hp: 1, status: 1, ball: '必捕', final: 1 } }

  const base = BASE_CATCH[tier] || 0.4
  const hpMult = hpRatio > 0.7 ? 1 : hpRatio > 0.3 ? 1.5 : 2.0
  const statusMult = hasStatus ? 2 : 1

  // 球的条件倍率
  let ballMult = ball.mult || 1
  if (ball.cond === 'first' && turn > 1) ballMult = 1
  if (ball.cond === 'cave' && zoneKind !== '山洞') ballMult = 1
  if (ball.cond === 'water' && zoneKind !== '水域') ballMult = 1
  if (ball.cond === 'late' && turn < 5) ballMult = 1

  let rate = base * hpMult * statusMult * ballMult
  const capped = Math.min(0.9, rate)

  return {
    rate: capped,
    parts: {
      base,
      hp: hpMult,
      status: statusMult,
      ball: ballMult,
      final: capped,
      capped: rate > 0.9
    }
  }
}

/** 血量倍率文案 */
export function hpRangeText(hpRatio) {
  if (hpRatio > 0.7) return '70%–100%（无加成）'
  if (hpRatio > 0.3) return '30%–70%（×1.5）'
  return '0%–30% 残血（×2.0）'
}
