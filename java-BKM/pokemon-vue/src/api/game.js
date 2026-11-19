/**
 * 游戏服务端接口（多人联机 / MySQL 持久化）
 * 后端可用时：公告走服务端、存档自动同步（换设备可恢复）
 * 后端不可用时：全部静默失败，前端继续用 localStorage（本地模式）
 */

const TIMEOUT = 4000

async function req(path, options = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT)
  try {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      ...options
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const json = await res.json()
    return json && json.code === 200 ? json.data : null
  } catch {
    clearTimeout(timer)
    return null
  }
}

/** 全服公告（服务端） */
export async function fetchAnnouncements() {
  return req('/api/game/announcements')
}

/** 加载云端存档 */
export async function loadState(username) {
  return req('/api/game/load', { method: 'POST', body: JSON.stringify({ username }) })
}

/** 保存存档到云端 */
export async function saveState(username, state, coins, starterChosen) {
  return req('/api/game/save', {
    method: 'POST',
    body: JSON.stringify({ username, state, coins, starterChosen })
  })
}

/** 市集商品（服务端价格/上下架） */
export async function fetchShop() {
  return req('/api/game/shop')
}

/** 服务端购买（校验金币） */
export async function buyOnServer(username, itemName, qty = 1) {
  return req('/api/game/buy', {
    method: 'POST',
    body: JSON.stringify({ username, itemName, qty })
  })
}

/** 后台：统计 / 玩家 / 公告 / 道具 / 技能 / 道馆 / 地区 / 资料库 */
export const adminGame = {
  stats: () => req('/api/admin/game/stats'),
  players: () => req('/api/admin/game/players'),
  setCoins: (id, coins) => req('/api/admin/game/player/coins', { method: 'POST', body: JSON.stringify({ id, coins }) }),
  setBan: (id, banned) => req('/api/admin/game/player/ban', { method: 'POST', body: JSON.stringify({ id, banned }) }),
  deletePlayer: (id) => req('/api/admin/game/player/' + id, { method: 'DELETE' }),
  playerDetail: (id) => req('/api/admin/game/player/' + id + '/detail'),
  grantItem: (id, kind, itemName, qty) => req('/api/admin/game/player/grant', { method: 'POST', body: JSON.stringify({ id, kind, itemName, qty }) }),
  announcements: () => req('/api/admin/game/announcements'),
  publish: (content, type = 'system') => req('/api/admin/game/announcement', { method: 'POST', body: JSON.stringify({ content, type }) }),
  setVisible: (id, visible) => req('/api/admin/game/announcement/' + id + '/visible', { method: 'POST', body: JSON.stringify({ visible }) }),
  deleteAnn: (id) => req('/api/admin/game/announcement/' + id, { method: 'DELETE' }),
  items: () => req('/api/admin/game/items'),
  addItem: (item) => req('/api/admin/game/item', { method: 'POST', body: JSON.stringify(item) }),
  updateItem: (id, patch) => req('/api/admin/game/item/update', { method: 'POST', body: JSON.stringify({ id, ...patch }) }),
  deleteItem: (id) => req('/api/admin/game/item/' + id, { method: 'DELETE' }),
  skills: () => req('/api/admin/game/skills'),
  addSkill: (s) => req('/api/admin/game/skill', { method: 'POST', body: JSON.stringify(s) }),
  updateSkill: (s) => req('/api/admin/game/skill', { method: 'PUT', body: JSON.stringify(s) }),
  deleteSkill: (id) => req('/api/admin/game/skill/' + id, { method: 'DELETE' }),
  gyms: () => req('/api/admin/game/gyms'),
  addGym: (g) => req('/api/admin/game/gym', { method: 'POST', body: JSON.stringify(g) }),
  updateGym: (g) => req('/api/admin/game/gym', { method: 'PUT', body: JSON.stringify(g) }),
  deleteGym: (id) => req('/api/admin/game/gym/' + id, { method: 'DELETE' }),
  regions: () => req('/api/admin/game/regions'),
  updateRegion: (id, patch) => req('/api/admin/game/region/update', { method: 'POST', body: JSON.stringify({ id, ...patch }) }),
  chapters: () => req('/api/admin/game/chapters'),
  addChapter: (c) => req('/api/admin/game/chapter', { method: 'POST', body: JSON.stringify(c) }),
  updateChapter: (c) => req('/api/admin/game/chapter', { method: 'PUT', body: JSON.stringify(c) }),
  deleteChapter: (id) => req('/api/admin/game/chapter/' + id, { method: 'DELETE' }),
  logs: () => req('/api/admin/game/logs')
}

// ==================== 前台数据同步（在线模式拉取，离线用静态兜底） ====================

/** 技能库（工具百科） */
export async function fetchSkills() {
  return req('/api/game/skills')
}

/** 道馆列表（道馆挑战） */
export async function fetchGyms() {
  return req('/api/game/gyms')
}

/** 原著资料库篇章（资料库） */
export async function fetchChapters() {
  return req('/api/game/chapters')
}

// ==================== 宝可梦交换（宝可梦中心） ====================

/** 发起交换邀请（from 选好宝可梦，邀请 to） */
export async function sendTrade(from, to, pokemon) {
  return req('/api/game/trade', { method: 'POST', body: JSON.stringify({ from, to, pokemon }) })
}

/** 我的交换邀请（收到 + 发出） */
export async function fetchTrades(username) {
  return req('/api/game/trades?username=' + encodeURIComponent(username))
}

/** 响应交换：accept（带自己的宝可梦）执行交换 / reject */
export async function respondTrade(id, action, pokemon) {
  return req('/api/game/trade/respond', {
    method: 'POST',
    body: JSON.stringify({ id, action, pokemon })
  })
}

/** 取当前登录用户名 */
export function currentUser() {
  try {
    const u = JSON.parse(sessionStorage.getItem('pokemon_user') || 'null')
    return u && u.username ? u.username : null
  } catch { return null }
}

// ==================== 联机对战 ====================

/** 心跳（同时返回在线玩家列表，排除自己） */
export async function heartbeat(username) {
  return req('/api/game/heartbeat', { method: 'POST', body: JSON.stringify({ username }) })
}

/** 在线玩家列表 */
export async function fetchOnline(username) {
  return req('/api/game/online?username=' + encodeURIComponent(username || ''))
}

/** 发起对战邀请 */
export async function sendChallenge(from, to) {
  return req('/api/game/challenge', { method: 'POST', body: JSON.stringify({ from, to }) })
}

/** 我收到 / 发出的邀请 */
export async function fetchChallenges(username) {
  return req('/api/game/challenges?username=' + encodeURIComponent(username))
}

/** 接受 / 拒绝邀请（接受返回对方队伍） */
export async function respondChallenge(id, action, username) {
  return req('/api/game/challenge/respond', {
    method: 'POST',
    body: JSON.stringify({ id, action, username })
  })
}

/** 查询邀请状态（发起方轮询） */
export async function challengeStatus(id) {
  return req('/api/game/challenge/status?id=' + encodeURIComponent(id))
}
