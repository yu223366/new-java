/**
 * 玩家存档（纯前端 · localStorage 持久化）
 * 与双模式 API 完全解耦：不管在线/离线，玩法数据都存在本地，刷新页面不丢失。
 * 所有页面通过 game / 下面导出的函数读写，保持状态一致。
 */
import { reactive, computed, watch } from 'vue'
import { BUILTIN_POKEMON } from './pokemon.js'
import { POKEDEX_EXTRA, MOVES, movesFor, learnableMoves } from './gameData.js'
import { BALLS, findShopItem } from './shop.js'
import { saveState, loadState, currentUser } from '../api/game.js'

/** 生成全 0 的精灵球计数表 */
function zeroBalls() {
  const o = {}
  BALLS.forEach(b => { o[b.name] = 0 })
  return o
}

/** 每种道具持有上限（防数据膨胀卡死） */
export const ITEM_MAX = 99
/** 物品种类上限 */
export const ITEM_KIND_MAX = 30

/** 存档键：按登录账号隔离（未登录用 guest），实现账号间数据独立 */
function stateKey() {
  const u = currentUser()
  return u ? 'pokemon_game_state_v2_' + u : 'pokemon_game_state_v2_guest'
}

/** 背包容量上限：防止数据无限增长导致页面卡顿 */
export const BAG_MAX = 60

function emptyState() {
  return {
    bag: [],            // 我的精灵背包
    badges: [],         // 已获得的道馆徽章（gym id）
    eggs: [],           // 孵化中的蛋
    potions: 0,         // 通用药水（兼容旧字段）
    coins: 0,           // 金币（开局选完初始精灵后发放 1000）
    balls: zeroBalls(), // 精灵球数量
    bagItems: {},       // 药品 / 技能道具数量
    starterChosen: false,   // 是否已完成开局选择
    announcements: [],  // 全服公告（本地缓存，用于轮播）
    captureLog: [],     // 捕捉记录
    battleLog: [],      // 对战记录（道馆 / 玩家 / 联盟）
    champion: { kanto: false, johto: false },   // 各地区联盟冠军标识
    leagueCleared: { kanto: 0, johto: 0 },      // 各地区联盟已击败对手数（0~5）
    favorites: [],      // 我的收藏（图鉴编号）
    lastAdventure: null,
    lastBattle: null,
    lastEggAt: 0        // 上次领取宝可梦蛋的时间戳（用于 1 小时领取冷却）
  }
}

function load() {
  try {
    const raw = localStorage.getItem(stateKey())
    if (!raw) return emptyState()
    const saved = JSON.parse(raw)
    const state = {
      ...emptyState(),
      ...saved,
      balls: { ...emptyState().balls, ...(saved.balls || {}) },
      bagItems: { ...(saved.bagItems || {}) },
      announcements: Array.isArray(saved.announcements) ? saved.announcements : []
    };
    // 老存档迁移：已有精灵的玩家视为已完成开局，补一笔起始金币
    if (!('starterChosen' in saved) && (saved.bag || []).length > 0) {
      state.starterChosen = true
      if (!saved.coins) state.coins = 500
    }
    // 旧存档迁移：火岩鼠曾误记为 157（157 实为火暴兽编号），统一修正为 156
    (state.bag || []).forEach(f => {
      if (String(f.number) === '157' && f.name === '火岩鼠') {
        f.number = '156'
        f.image = '/pokemon/156.png'
      }
    });
    // 旧存档迁移：老精灵没有持久化技能，按属性补一套初始招式
    (state.bag || []).forEach(f => {
      if (!Array.isArray(f.moves)) {
        f.moves = movesFor({ category: f.category, category2: f.category2 }).slice(0, 2).map(m => m.name)
      }
    })
    // 旧存档迁移：联盟进度由标量改为按地区记录
    if (typeof state.champion === 'boolean') state.champion = { kanto: state.champion, johto: false }
    if (typeof state.leagueCleared === 'number') state.leagueCleared = { kanto: state.leagueCleared, johto: 0 }
    if (!state.champion || typeof state.champion !== 'object') state.champion = { kanto: false, johto: false }
    if (!state.leagueCleared || typeof state.leagueCleared !== 'object') state.leagueCleared = { kanto: 0, johto: 0 }
    // 背包容量保护：超出上限的历史数据截断，避免渲染过多节点卡死
    if (Array.isArray(state.bag) && state.bag.length > BAG_MAX) state.bag = state.bag.slice(0, BAG_MAX)
    return state
  } catch { return emptyState() }
}

export const game = reactive(load())

/** 云端同步定时器（debounce） */
let serverTimer = null
/** 登录切换账号时暂停云端同步，避免用空存档覆盖云端进度 */
let cloudSyncPaused = false

/** 暂停云端同步（仍在本地 localStorage 存档） */
export function pauseCloudSync() { cloudSyncPaused = true }
/** 恢复云端同步，并立即用当前状态写一次云端（此时应已加载完目标账号存档） */
export function resumeCloudSync() {
  cloudSyncPaused = false
  clearTimeout(serverTimer)
  const u = currentUser()
  if (u) saveState(u, game, game.coins, game.starterChosen).catch(() => {})
}

watch(game, state => {
  try { localStorage.setItem(stateKey(), JSON.stringify(state)) } catch (e) { /* 容量满时静默 */ }
  if (cloudSyncPaused) return
  // 自动同步到服务端（后端不可用时静默失败，不影响本地游玩）
  clearTimeout(serverTimer)
  serverTimer = setTimeout(() => {
    const u = currentUser()
    if (!u) return
    saveState(u, state, state.coins, state.starterChosen).catch(() => {})
  }, 1500)
}, { deep: true })

/**
 * 登录 / 切换账号后，重新加载该账号的本地存档到 game
 * 实现账号间数据隔离：每个账号有独立的 localStorage 存档键
 */
export function reloadForUser() {
  const saved = load()
  Object.keys(emptyState()).forEach(k => { game[k] = saved[k] })
  return saved
}

/**
 * 登录后从云端拉取存档（换设备恢复）
 * 仅当本地尚未完成开局时用云端覆盖，避免覆盖本机进度
 */
export async function loadFromServer() {
  const u = currentUser()
  if (!u) return false
  const data = await loadState(u)
  if (!data || !data.state) return false
  if (game.starterChosen) return false
  try {
    const remote = typeof data.state === 'string' ? JSON.parse(data.state) : data.state
    if (!remote || typeof remote !== 'object') return false
    Object.keys(emptyState()).forEach(k => { if (remote[k] !== undefined) game[k] = remote[k] })
    if (typeof data.coins === 'number') game.coins = data.coins
    if (data.starterChosen) game.starterChosen = true
    return true
  } catch { return false }
}

/**
 * 强制从云端拉取存档覆盖本地（交换宝可梦等后端直接改存档的操作后同步用）
 */
export async function forceLoadFromServer() {
  const u = currentUser()
  if (!u) return false
  const data = await loadState(u)
  if (!data || !data.state) return false
  try {
    const remote = typeof data.state === 'string' ? JSON.parse(data.state) : data.state
    if (!remote || typeof remote !== 'object') return false
    Object.keys(emptyState()).forEach(k => { if (remote[k] !== undefined) game[k] = remote[k] })
    if (typeof data.coins === 'number') game.coins = data.coins
    if (data.starterChosen) game.starterChosen = true
    return true
  } catch { return false }
}

/** 图鉴总数（以项目内置的官方立绘为准） */
export const TOTAL_DEX = BUILTIN_POKEMON.length

/** 已收服的不同编号集合 */
export const caughtSet = computed(() => new Set(game.bag.map(p => String(p.number))))

/** 图鉴收集进度系统 */
export const progress = computed(() => {
  const caught = caughtSet.value.size
  return {
    caught,
    total: TOTAL_DEX,
    percent: TOTAL_DEX ? Math.round(caught / TOTAL_DEX * 100) : 0,
    missing: BUILTIN_POKEMON.filter(p => !caughtSet.value.has(String(p.number))).map(p => p.name)
  }
})

/**
 * 捕捉 / 孵化前校验
 * - 背包容量上限（防卡顿）
 * - 同一编号不可重复收服（图鉴唯一）
 */
export function canCatch(number) {
  if (game.bag.length >= BAG_MAX) {
    return { ok: false, reason: 'full', msg: `背包已满（上限 ${BAG_MAX} 只），请先到个人中心整理背包` }
  }
  if (game.bag.some(p => String(p.number) === String(number))) {
    return { ok: false, reason: 'dup', msg: '你已经有这只宝可梦了，图鉴不可重复收服' }
  }
  return { ok: true }
}

const now = () => new Date().toLocaleString('zh-CN', { hour12: false })
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

/** 由基础宝可梦数据生成一只可培养/可对战的实体 */
export function makeFighter(p, level = 5, shiny = false) {
  const ex = POKEDEX_EXTRA[String(p.number)] || {}
  const st = ex.stats || { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 }
  const maxHp = st.hp + level * 4
  const atk = st.atk + level * 2
  const def = st.def + level * 2
  const power = Math.round((st.hp + st.atk + st.def + st.spa + st.spd + st.spe) / 6 + level * 2)
  return {
    uid: uid(),
    number: String(p.number),
    name: p.name,
    nameEn: p.nameEn || '',
    image: p.image,
    category: p.category,
    category2: p.category2 || null,
    rarity: ex.rarity || p.level || '普通',
    level,
    hp: maxHp,
    maxHp,
    atk,
    def,
    power,
    shiny,
    exp: 0,
    moves: movesFor(p).slice(0, 2).map(m => m.name),
    caughtAt: now()
  }
}

/** 捕捉成功：入背包 + 写记录 + 更新图鉴进度（带容量/重复保护） */
export function catchPokemon(p, zoneName, ballName, shiny = false) {
  const check = canCatch(p.number)
  if (!check.ok) return null
  const fighter = makeFighter(p, 5 + Math.floor(Math.random() * 4), shiny)
  game.bag.unshift(fighter)
  game.captureLog.unshift({
    time: now(), zone: zoneName, number: fighter.number,
    name: fighter.name, ball: ballName, shiny,
    result: shiny ? '闪光✨ 捕捉成功' : '捕捉成功'
  })
  game.lastAdventure = { time: now(), zone: zoneName, name: fighter.name, image: fighter.image }
  if (game.captureLog.length > 60) game.captureLog.length = 60
  return fighter
}

/** 捕捉失败也留痕 */
export function logEscape(p, zoneName, ballName) {
  game.captureLog.unshift({
    time: now(), zone: zoneName, number: String(p.number),
    name: p.name, ball: ballName, shiny: false, result: '逃走了…再试一次'
  })
  if (game.captureLog.length > 60) game.captureLog.length = 60
}

/** 消耗精灵球 */
export function consumeBall(name) {
  if (!game.balls[name]) return false
  game.balls[name]--
  return true
}
export function grantBalls(name, n = 1) { game.balls[name] = (game.balls[name] || 0) + n }

// ============ 道馆徽章 ============
export function hasBadge(id) { return game.badges.includes(id) }
export function addBadge(id) {
  if (!hasBadge(id)) game.badges.push(id)
}

// ============ 精灵孵化系统 ============
/** 孵化时长：5 分钟 */
export const EGG_DURATION_MIN = 5
/** 领取冷却：1 小时只能领取 1 颗蛋 */
export const EGG_COOLDOWN_MS = 60 * 60 * 1000
const EGG_FROM = [
  '001', '004', '007', '025', '133', '012', '018', '089', '131',
  '153', '156', '214', '277', '398', '448', '560', '658', '663',
  '715', '815', '865', '882', '906', '909', '912'
]
/** 距离下次可领取蛋的剩余毫秒数（0 表示可领取） */
export function eggCooldownRemain() {
  return Math.max(0, (game.lastEggAt || 0) + EGG_COOLDOWN_MS - Date.now())
}
export function addEgg(minutes = EGG_DURATION_MIN) {
  if (eggCooldownRemain() > 0) return null   // 冷却中，无法领取
  game.lastEggAt = Date.now()
  const num = EGG_FROM[Math.floor(Math.random() * EGG_FROM.length)]
  const egg = {
    id: uid(),
    number: num,
    name: (BUILTIN_POKEMON.find(p => String(p.number) === num) || {}).name || '神秘宝可梦',
    startAt: Date.now(),
    duration: minutes * 60 * 1000,
    shinyRate: 0.08
  }
  game.eggs.push(egg)
  return egg
}
export function eggRemain(egg) { return Math.max(0, egg.startAt + egg.duration - Date.now()) }
export function eggReady(egg) { return eggRemain(egg) <= 0 }

/** 孵化：随机稀有 / 闪光概率，自动入背包（重复或背包满则转为药水补偿） */
export function hatchEgg(egg) {
  if (!eggReady(egg)) return null
  const p = BUILTIN_POKEMON.find(x => String(x.number) === egg.number) || BUILTIN_POKEMON[0]
  const shiny = Math.random() < egg.shinyRate
  // 孵化有概率升级为更高稀有度的宝可梦
  let target = p
  if (Math.random() < 0.18) {
    const rare = BUILTIN_POKEMON.filter(x => ['史诗', '传说'].includes(x.level))
    if (rare.length) target = rare[Math.floor(Math.random() * rare.length)]
  }
  game.eggs = game.eggs.filter(e => e.id !== egg.id)
  const check = canCatch(target.number)
  if (!check.ok) {
    grantPotion(3)
    return { blocked: true, name: target.name, msg: check.msg, shiny }
  }
  const fighter = catchPokemon(target, '精灵孵化', '孵化装置', shiny)
  return fighter ? { ...fighter, hatched: true, shiny } : { blocked: true, name: target.name, msg: '孵化失败，已补偿药水', shiny }
}

// ============ 精灵培养系统 ============
export function usePotion(targetUid, amount = 30) {
  if (game.potions <= 0) return { ok: false, msg: '药水不足，去野外冒险或联盟大赛可获得' }
  const f = game.bag.find(p => p.uid === targetUid)
  if (!f) return { ok: false, msg: '未找到该宝可梦' }
  if (f.hp >= f.maxHp) return { ok: false, msg: `${f.name} 的 HP 已满，无需回复` }
  game.potions--
  f.hp = Math.min(f.maxHp, f.hp + amount)
  return { ok: true, msg: `${f.name} 回复了 ${amount} 点 HP` }
}

export function grantPotion(n = 1) { game.potions += n }

// ============ 对战记录 ============
export function logBattle(entry) {
  game.battleLog.unshift({ time: now(), ...entry })
  game.lastBattle = { time: now(), ...entry }
  if (game.battleLog.length > 60) game.battleLog.length = 60
}

// ============ 联盟大赛（按地区）============
/** 某地区联盟已通关到第几关（0~5） */
export function leagueProgress(leagueId) {
  return (game.leagueCleared && game.leagueCleared[leagueId]) || 0
}
/** 是否集齐该地区全部徽章 */
export function isLeagueUnlocked(requireGymIds) {
  return (requireGymIds || []).every(id => game.badges.includes(id))
}
export function clearLeagueStage(leagueId) {
  const cur = leagueProgress(leagueId)
  game.leagueCleared[leagueId] = Math.min(5, cur + 1)
}
/** 夺冠：奖励只发一次，防止重复领取 */
export function becomeChampion(leagueId) {
  const first = !game.champion[leagueId]
  game.champion[leagueId] = true
  game.leagueCleared[leagueId] = 5
  if (first) {
    grantPotion(5)
    grantBalls('大师球', 1)
  }
  return first
}

// ============ 收藏 ============
export function toggleFavorite(number) {
  const n = String(number)
  const i = game.favorites.indexOf(n)
  if (i >= 0) game.favorites.splice(i, 1)
  else game.favorites.push(n)
}

// ============ 重置（保留账号） ============
export function resetGame() {
  const fresh = emptyState()
  Object.keys(fresh).forEach(k => { game[k] = fresh[k] })
}

// ============ 金币 ============
export function addCoins(n) { game.coins = Math.max(0, (game.coins || 0) + n) }
export function spendCoins(n) {
  if ((game.coins || 0) < n) return false
  game.coins -= n
  return true
}

// ============ 物品背包 ============
export function itemCount(name) {
  return game.balls[name] !== undefined ? (game.balls[name] || 0) : (game.bagItems[name] || 0)
}

export function addItem(name, qty = 1) {
  if (game.balls[name] !== undefined) {
    game.balls[name] = Math.min(ITEM_MAX, (game.balls[name] || 0) + qty)
    return true
  }
  const cur = game.bagItems[name] || 0
  if (cur === 0 && Object.keys(game.bagItems).length >= ITEM_KIND_MAX) return false
  game.bagItems[name] = Math.min(ITEM_MAX, cur + qty)
  return true
}

export function useItem(name, qty = 1) {
  if (game.balls[name] !== undefined) {
    if ((game.balls[name] || 0) < qty) return false
    game.balls[name] -= qty
    return true
  }
  if ((game.bagItems[name] || 0) < qty) return false
  game.bagItems[name] -= qty
  return true
}

// ============ 宝可梦中心治疗（乔伊小姐） ============
/** 全队治疗：复活并回满所有宝可梦 HP，返回治疗数量 */
export function healAll() {
  let healed = 0
  game.bag.forEach(f => {
    if (f.hp < f.maxHp) {
      f.hp = f.maxHp
      healed++
    }
  })
  return healed
}

/** 购买商品：校验余额与容量 */
/**
 * 购买商品：校验余额与容量
 * @param {string} name 商品名
 * @param {number} qty 数量
 * @param {number|null} priceOverride 服务端价格（后台改价后，以展示价为准扣除，避免前后端价格不一致）
 */
export function buyItem(name, qty = 1, priceOverride = null) {
  const item = findShopItem(name)
  const unitPrice = (typeof priceOverride === 'number' && priceOverride >= 0)
    ? priceOverride
    : (item ? item.price : null)
  if (unitPrice == null) return { ok: false, msg: '商品不存在' }
  const cost = unitPrice * qty
  if ((game.coins || 0) < cost) {
    return { ok: false, msg: `币不足，无法购买（需要 ${cost} 币，当前 ${game.coins || 0} 币）` }
  }
  if (!addItem(name, qty)) {
    return { ok: false, msg: '背包道具种类已达上限，无法继续购买' }
  }
  game.coins -= cost
  return { ok: true, msg: `购买成功：${name} ×${qty}，花费 ${cost} 币` }
}

// ============ 全服公告 ============
const ANN_MAX = 20
/** 推送公告（相同文案不重复，防止刷屏） */
export function pushAnnouncement(text) {
  if (!text) return false
  if (!Array.isArray(game.announcements)) game.announcements = []
  if (game.announcements.some(a => a.text === text)) return false
  game.announcements.unshift({ text, time: now() })
  if (game.announcements.length > ANN_MAX) game.announcements.length = ANN_MAX
  return true
}

// ============ 开局选择初始精灵 ============
/** 首次进入：选一只全世代御三家 → 发放 1000 币 + 精灵球12 + 伤药5 */
export function chooseStarter(dexItem, level = 5) {
  if (game.starterChosen) return { ok: false, msg: '已经选择过初始精灵' }
  if (game.bag.length >= BAG_MAX) return { ok: false, msg: '背包已满' }
  const fighter = makeFighter(dexItem, level)
  game.bag.unshift(fighter)
  game.starterChosen = true
  game.coins = (game.coins || 0) + 1000
  addItem('精灵球', 12)
  addItem('伤药', 5)
  pushAnnouncement(`【新训练家】${fighter.name} 加入了训练家的队伍！`)
  return { ok: true, fighter }
}

// ============ 经验、等级进化与技能学习 ============
/** 每只宝可梦最多携带 4 个招式（原著设定） */
export const MOVE_LIMIT = 4
/** 宝可梦中心学习 / 替换一个招式的费用 */
export const SKILL_LEARN_COST = 200
/** 升级时学会新招的概率 */
const LEARN_CHANCE = 0.32

/**
 * 升级时按原著概率学会新招（按属性学招，最多 4 个）
 * @returns 学到的招式对象，未学会返回 null
 */
function tryLearnOnLevelUp(fighter) {
  if (!fighter) return null
  if (!Array.isArray(fighter.moves)) fighter.moves = []
  if (Math.random() >= LEARN_CHANCE) return null
  if (fighter.moves.length >= MOVE_LIMIT) return null
  const pool = learnableMoves({ category: fighter.category, category2: fighter.category2 })
    .filter(m => !fighter.moves.includes(m.name))
  if (!pool.length) return null
  const move = pool[Math.floor(Math.random() * pool.length)]
  fighter.moves.push(move.name)
  return move
}

/**
 * 加经验并自动升级（每 100 经验 1 级）
 * 返回升级到的等级列表（兼容旧调用）；升级时学到的招式挂在返回值 .learned 上：
 * [{ name, type, level }]
 */
export function gainExp(fighter, exp) {
  if (!fighter || exp <= 0) return []
  fighter.exp = (fighter.exp || 0) + exp
  const levels = []
  const learned = []
  let guard = 0
  while (fighter.exp >= 100 && guard++ < 50) {
    fighter.exp -= 100
    fighter.level += 1
    fighter.maxHp += 3
    fighter.hp = fighter.maxHp
    fighter.atk += 1
    fighter.def += 1
    fighter.power += 2
    levels.push(fighter.level)
    const mv = tryLearnOnLevelUp(fighter)
    if (mv) learned.push({ name: mv.name, type: mv.type, level: fighter.level })
  }
  levels.learned = learned
  return levels
}

/** 该宝可梦按属性可学的招式（含是否已学标记），供宝可梦中心展示 */
export function skillOptionsFor(fighter) {
  if (!fighter) return []
  const pool = learnableMoves({ category: fighter.category, category2: fighter.category2, number: fighter.number })
  const owned = Array.isArray(fighter.moves) ? fighter.moves : []
  return pool.map(m => ({ ...m, learned: owned.includes(m.name) }))
}

/**
 * 宝可梦中心：花 200 币学习 / 替换招式
 * @param {string} fighterUid 宝可梦 uid
 * @param {string} moveName 要学的招式名
 * @param {string} replaceName 要替换掉的旧招式名（技能已满时必填）
 */
export function learnSkill(fighterUid, moveName, replaceName = '') {
  const f = game.bag.find(x => x.uid === fighterUid)
  if (!f) return { ok: false, msg: '未找到该宝可梦' }
  if (!Array.isArray(f.moves)) f.moves = []
  const move = MOVES.find(m => m.name === moveName)
  if (!move) return { ok: false, msg: '招式不存在' }
  const canLearn = skillOptionsFor(f).some(m => m.name === moveName)
  if (!canLearn) return { ok: false, msg: `${f.name} 学不会「${moveName}」（属性不匹配）` }
  if (!replaceName && f.moves.includes(moveName)) return { ok: false, msg: `${f.name} 已经会「${moveName}」了` }
  if (f.moves.length >= MOVE_LIMIT && !replaceName) {
    return { ok: false, msg: `技能已满（最多 ${MOVE_LIMIT} 个），请选择要替换的招式` }
  }
  if (replaceName && !f.moves.includes(replaceName)) return { ok: false, msg: '要替换的招式不存在' }
  if ((game.coins || 0) < SKILL_LEARN_COST) {
    return { ok: false, msg: `币不足（需要 ${SKILL_LEARN_COST} 币，当前 ${game.coins || 0} 币）` }
  }
  game.coins -= SKILL_LEARN_COST
  if (replaceName) {
    f.moves[f.moves.indexOf(replaceName)] = moveName
    return { ok: true, msg: `${f.name} 用「${moveName}」替换了「${replaceName}」，花费 ${SKILL_LEARN_COST} 币` }
  }
  f.moves.push(moveName)
  return { ok: true, msg: `${f.name} 学会了「${moveName}」，花费 ${SKILL_LEARN_COST} 币` }
}

/**
 * 等级达标自动进化（同一只只进化一次，保留等级/技能/培养数据）
 * @returns {{evolved:boolean, from?:string, to?:string, level?:number}}
 */
export function tryEvolve(fighter, dex) {
  if (!fighter || !Array.isArray(dex)) return { evolved: false }
  const p = dex.find(x => String(x.number) === String(fighter.number))
  if (!p || !Array.isArray(p.evo) || p.evo.length < 2) return { evolved: false }
  const idx = p.evo.indexOf(p.name)
  if (idx < 0 || idx >= p.evo.length - 1) return { evolved: false }

  const raw = String(p.evo[idx + 1])
  const nextName = raw.split(' / ')[0].replace(/（.*?）/g, '').trim()
  const target = dex.find(x => x.name === nextName)
  if (!target) return { evolved: false }

  const levels = p.evo.length >= 3 ? [16, 32] : [20]
  const need = levels[idx] != null ? levels[idx] : 16
  if (fighter.level < need) return { evolved: false }

  const fromName = fighter.name
  fighter.number = String(target.number)
  fighter.name = target.name
  fighter.nameEn = target.nameEn || fighter.nameEn
  fighter.image = target.image
  fighter.category = target.category
  fighter.category2 = target.category2 || null
  fighter.rarity = target.rarity || fighter.rarity
  fighter.evolvedAt = now()
  return { evolved: true, from: fromName, to: fighter.name, level: fighter.level }
}
