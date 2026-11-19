/**
 * 图鉴数据源：全国图鉴全量（1 – 1025）
 * - FULL_DEX：自动抓取的全国图鉴数据（官方图源立绘 + 中文名/属性/种族值/特性/进化链）
 * - 已收录本地立绘的 46 只（BUILTIN_POKEMON）会覆盖为本地图片 + 动画原著描述
 */
import { FULL_DEX } from './fullDex.js'
import { BUILTIN_POKEMON } from './pokemon.js'

const localMap = new Map(BUILTIN_POKEMON.map(p => [String(p.number), p]))

export const ALL_DEX = FULL_DEX.map(p => {
  const local = localMap.get(String(p.number))
  if (!local) return p
  return {
    ...p,
    name: local.name || p.name,
    nameEn: local.nameEn || p.nameEn,
    category: local.category || p.category,
    category2: local.category2 !== undefined ? local.category2 : p.category2,
    level: local.level || p.level,
    classification: local.classification || p.classification,
    height: local.height || p.height,
    weight: local.weight || p.weight,
    description: local.description || p.description,
    image: local.image || p.image
  }
})

/** 全国图鉴总数（1025） */
export const TOTAL_DEX = ALL_DEX.length
/** 已开放野外捕捉的数量（46） */
export const CATCHABLE_COUNT = BUILTIN_POKEMON.length

/** 按编号查一只 */
export function dexByNumber(n) {
  return ALL_DEX.find(p => String(p.number) === String(n))
}
