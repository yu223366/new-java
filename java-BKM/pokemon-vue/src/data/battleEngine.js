/**
 * 回合制对战引擎（道馆挑战 / 玩家对战 / 联盟大赛共用）
 * 简化的官方伤害公式：属性克制 × 随机浮动 × 会心一击
 */
import { POKEDEX_EXTRA, movesFor, typeMultiplier } from './gameData.js'

/** 由图鉴数据生成一名对战单位 */
export function createBattleUnit(p, level = 50, shiny = false) {
  const ex = POKEDEX_EXTRA[String(p.number)] || {}
  const st = ex.stats || { hp: 60, atk: 60, def: 60, spa: 60, spd: 60, spe: 60 }
  const maxHp = Math.round((st.hp * 2 * level) / 100 + level + 10)
  return {
    key: String(p.number) + '-' + Math.random().toString(36).slice(2, 6),
    number: String(p.number),
    name: p.name,
    image: p.image,
    types: [p.category, p.category2].filter(Boolean),
    rarity: p.rarity || p.level || '普通',
    level,
    maxHp,
    hp: maxHp,
    atk: Math.round((st.atk * 2 * level) / 100 + 5),
    def: Math.round((st.def * 2 * level) / 100 + 5),
    spa: Math.round((st.spa * 2 * level) / 100 + 5),
    spd: Math.round((st.spd * 2 * level) / 100 + 5),
    spe: Math.round((st.spe * 2 * level) / 100 + 5),
    moves: movesFor(p),
    shiny
  }
}

/** 命中判定 */
export function hitCheck(move) {
  return Math.random() * 100 < (move.acc || 100)
}

/** 伤害计算，返回 { dmg, mult, crit } */
export function calcDamage(attacker, defender, move) {
  if (!move || !move.power) return { dmg: 0, mult: 1, crit: false }
  const physical = move.cat === '物理'
  const atk = physical ? attacker.atk : attacker.spa
  const def = physical ? defender.def : defender.spd
  const mult = typeMultiplier(move.type, defender.types)
  if (mult === 0) return { dmg: 0, mult: 0, crit: false, immune: true }
  const crit = Math.random() < 0.08
  const rand = 0.85 + Math.random() * 0.15
  const base = Math.round((((2 * attacker.level) / 5 + 2) * move.power * (atk / Math.max(1, def))) / 50 + 2)
  const dmg = Math.max(1, Math.round(base * mult * rand * (crit ? 1.5 : 1)))
  return { dmg, mult, crit }
}

/** AI 选招：优先选择克制倍率最高且威力大的招式；偶尔随机 */
export function aiChooseMove(unit, foe) {
  const pool = unit.moves.filter(m => m.power > 0)
  if (!pool.length) return unit.moves[0]
  if (Math.random() < 0.15) return pool[Math.floor(Math.random() * pool.length)]
  let best = pool[0], bestScore = -1
  for (const m of pool) {
    const mult = typeMultiplier(m.type, foe.types)
    const score = m.power * mult * (m.acc / 100)
    if (score > bestScore) { bestScore = score; best = m }
  }
  return best
}

/** 属性克制文字描述 */
export function multText(mult) {
  if (mult === 0) return '没有效果'
  if (mult >= 2) return '效果拔群！'
  if (mult <= 0.5) return '效果不佳…'
  return '命中'
}

/** 一场完整对战的封装（页面用 ref 持有即可） */
export function createBattle(ally, foe) {
  return {
    ally,
    foe,
    turn: 1,
    logs: [],
    over: false,
    win: false,
    /** 我方出招，随后对方自动反击；返回是否结束 */
    act(moveIndex) {
      if (this.over) return true
      const myMove = this.ally.moves[moveIndex]
      this.logs.push(`▶ 第 ${this.turn} 回合`)
      this.doAttack(this.ally, this.foe, myMove, '我方')
      if (this.foe.hp <= 0) { this.finish(true); return true }
      const foeMove = aiChooseMove(this.foe, this.ally)
      this.doAttack(this.foe, this.ally, foeMove, this.foe.name)
      if (this.ally.hp <= 0) { this.finish(false); return true }
      this.turn++
      return false
    },
    doAttack(attacker, defender, move, tag) {
      if (!move) return
      if (!hitCheck(move)) { this.logs.push(`💨 ${tag} 的「${move.name}」没有命中！`); return }
      if (!move.power) {
        const heal = Math.round(attacker.maxHp * 0.3)
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal)
        this.logs.push(`✨ ${tag} 使用「${move.name}」，回复了 ${heal} 点 HP`)
        return
      }
      const { dmg, mult, crit } = calcDamage(attacker, defender, move)
      defender.hp = Math.max(0, defender.hp - dmg)
      const extra = `${multText(mult)}${crit ? ' 会心一击！' : ''}`
      this.logs.push(`⚔ ${tag} 使用「${move.name}」，造成 ${dmg} 点伤害（${extra}）`)
    },
    finish(win) {
      this.over = true
      this.win = win
      this.logs.push(win ? `🏆 ${this.foe.name} 倒下了，你赢了！` : `💤 ${this.ally.name} 失去了战斗能力…`)
    }
  }
}
