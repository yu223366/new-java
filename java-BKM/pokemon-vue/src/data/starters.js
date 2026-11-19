/**
 * 全世代御三家 + 地区解锁链
 */

// 9 个世代的御三家（编号对应全国图鉴）
export const GENERATIONS = [
  { gen: 1, region: '关都', ids: [1, 4, 7, 25] },
  { gen: 2, region: '城都', ids: [152, 155, 158] },
  { gen: 3, region: '丰缘', ids: [252, 255, 258] },
  { gen: 4, region: '神奥', ids: [387, 390, 393] },
  { gen: 5, region: '合众', ids: [495, 498, 501] },
  { gen: 6, region: '卡洛斯', ids: [650, 653, 656] },
  { gen: 7, region: '阿罗拉', ids: [722, 725, 728] },
  { gen: 8, region: '伽勒尔', ids: [810, 813, 816] },
  { gen: 9, region: '帕底亚', ids: [906, 909, 912] }
]

export const STARTER_IDS = GENERATIONS.flatMap(g => g.ids)
export const STARTER_TOTAL = STARTER_IDS.length // 28（27 御三家 + 皮卡丘）

/** 判断某编号是否御三家 */
export function isStarter(id) {
  return STARTER_IDS.includes(Number(id))
}

/**
 * 野外地区解锁链
 * 初始仅关都；集齐该地区 8 枚道馆徽章 → 解锁下一地区
 */
export const REGION_UNLOCK = [
  { region: '关都', requires: [] },
  { region: '城都', requires: [1, 2, 3, 4, 5, 6, 7, 8] }
]

/** 按本地已获得徽章判断某地区是否解锁 */
export function isRegionUnlocked(region, badges) {
  const rule = REGION_UNLOCK.find(r => r.region === region)
  if (!rule) return true
  return rule.requires.every(id => badges.includes(id))
}

/** 进化等级：按进化链长度估算（3 段 16/32，2 段 20） */
export function evolveLevel(evoLen) {
  if (evoLen >= 3) return [16, 32]
  if (evoLen === 2) return [20]
  return []
}

/**
 * 取下一阶段进化目标（不依赖 dex 数据，需传入图鉴数组）
 * @param {Array} dex ALL_DEX
 * @param {object} fighter 背包中的精灵
 * @returns {{number:string,name:string,level:number}|null}
 */
export function nextEvolution(dex, fighter) {
  const p = dex.find(x => String(x.number) === String(fighter.number))
  if (!p || !Array.isArray(p.evo) || p.evo.length < 2) return null
  const idx = p.evo.indexOf(p.name)
  if (idx < 0 || idx >= p.evo.length - 1) return null
  const raw = String(p.evo[idx + 1])
  const nextName = raw.split(' / ')[0].replace(/（.*?）/g, '').trim()
  const target = dex.find(x => x.name === nextName)
  if (!target) return null
  const levels = evolveLevel(p.evo.length)
  const level = levels[idx] != null ? levels[idx] : (idx === 0 ? 16 : 32)
  return { number: String(target.number), name: target.name, level, target }
}
