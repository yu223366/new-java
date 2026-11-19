/**
 * 技能系统专项测试：按属性学招 / 升级概率学招 / 200币学习替换 / 存档持久化
 */
import { createServer } from 'vite'

const ls = {}, ss = {}
function mk(store) {
  return {
    getItem(k) { return store[k] ?? null },
    setItem(k, v) { store[k] = String(v) },
    removeItem(k) { delete store[k] },
    clear() { for (const k in store) delete store[k] }
  }
}
globalThis.localStorage = mk(ls)
globalThis.sessionStorage = mk(ss)
sessionStorage.setItem('pokemon_user', JSON.stringify({ username: 'skill_qa', role: 1 }))

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const gd = await vite.ssrLoadModule('/src/data/gameData.js')
const s = await vite.ssrLoadModule('/src/data/gameStore.js')
const flush = () => new Promise(r => setTimeout(r, 80))

let pass = 0, fail = 0
const ck = (n, c, d = '') => { if (c) { pass++; console.log('  PASS', n) } else { fail++; console.log('  FAIL', n, d) } }
const rand0 = Math.random

console.log('===== 1. 招式数据层（按属性）=====')
ck('招式名解析', gd.movesFromNames(['十万伏特', '喷射火焰']).map(m => m.name).join(',') === '十万伏特,喷射火焰')
const elec = gd.learnableMoves({ category: '电' })
ck('电系可学十万伏特', elec.some(m => m.name === '十万伏特'))
ck('电系含一般通用招', elec.some(m => m.type === '一般'))
const fire = gd.learnableMoves({ category: '火' })
ck('火系可学喷射火焰', fire.some(m => m.name === '喷射火焰'))
ck('属性隔离：火系学不到十万伏特', !fire.some(m => m.name === '十万伏特'))
ck('已学技能优先于属性推荐', gd.movesForFighter({ moves: ['十万伏特'] }, { category: '水' })[0].name === '十万伏特')
ck('无技能时按属性推荐', gd.movesForFighter({ category: '水' }, { category: '水' }).some(m => m.type === '水'))

console.log('===== 2. 初始技能与升级概率学招 =====')
const pika = { number: '025', name: '皮卡丘', category: '电', image: '/pokemon/25.png' }
const f = s.makeFighter(pika, 5)
ck('makeFighter 带 2 个初始招式', Array.isArray(f.moves) && f.moves.length === 2 && f.moves.includes('十万伏特'), JSON.stringify(f.moves))
Math.random = () => 0
const ups = s.gainExp(f, 100)
Math.random = rand0
ck('加 100 经验升 1 级', f.level === 6 && ups.length === 1)
ck('升级有概率学会新招', f.moves.length === 3 && ups.learned.length === 1, JSON.stringify(f.moves))
const full = s.makeFighter(pika, 5)
full.moves = ['十万伏特', '打雷', '伏特攻击', '终极伏特狂雷闪']
Math.random = () => 0
const ups2 = s.gainExp(full, 100)
Math.random = rand0
ck('满 4 招不再自动学', full.moves.length === 4 && ups2.learned.length === 0)
ck('未升级不学招', (() => { const g = s.makeFighter(pika, 5); return s.gainExp(g, 50).learned.length === 0 })())

console.log('===== 3. 宝可梦中心学习 / 替换（200 币）=====')
s.game.bag = [s.makeFighter(pika, 10)]
s.game.coins = 1000
const uid = s.game.bag[0].uid
const r1 = s.learnSkill(uid, '电磁波')
ck('学习新招成功', r1.ok && s.game.bag[0].moves.includes('电磁波'), JSON.stringify(r1))
ck('扣除 200 币', s.game.coins === 800, String(s.game.coins))
const r2 = s.learnSkill(uid, '十万伏特')
ck('重复学习被拒且不扣币', !r2.ok && s.game.coins === 800)
const r3 = s.learnSkill(uid, '喷射火焰')
ck('属性不匹配被拒且不扣币', !r3.ok && /属性不匹配/.test(r3.msg) && s.game.coins === 800)
s.game.bag[0].moves = ['十万伏特', '打雷', '伏特攻击', '电磁波']
s.game.coins = 1000
const r4 = s.learnSkill(uid, '终极伏特狂雷闪')
ck('满 4 招需先替换', !r4.ok && /替换/.test(r4.msg) && s.game.coins === 1000)
const r5 = s.learnSkill(uid, '终极伏特狂雷闪', '电磁波')
ck('替换成功并扣 200 币', r5.ok && s.game.bag[0].moves.includes('终极伏特狂雷闪')
  && !s.game.bag[0].moves.includes('电磁波') && s.game.coins === 800, JSON.stringify(r5))
s.game.bag[0].moves = ['十万伏特', '打雷']
s.game.coins = 100
const r6 = s.learnSkill(uid, '破坏光线')
ck('币不足被拒', !r6.ok && /币不足/.test(r6.msg))
ck('学习列表按属性过滤', (() => {
  const opts = s.skillOptionsFor(s.game.bag[0])
  return opts.some(m => m.type === '电') && opts.every(m => m.type === '电' || m.type === '一般')
})())

console.log('===== 4. 技能随存档落库 =====')
s.game.bag[0].moves = ['十万伏特', '打雷', '伏特攻击', '终极伏特狂雷闪']
s.game.coins = 999
await flush()
const saved = JSON.parse(ls['pokemon_game_state_v2_skill_qa'] || '{}')
ck('moves 写入 localStorage 存档', !!(saved.bag && saved.bag[0] && saved.bag[0].moves.includes('终极伏特狂雷闪')))
ck('金币写入存档', saved.coins === 999)

console.log('===== 5. 相关页面加载 =====')
for (const v of ['PokeCenter', 'Adventure', 'Gyms', 'Battle', 'Trainer']) {
  try { await vite.ssrLoadModule(`/src/views/${v}.vue`); pass++; console.log('  OK  ', v) }
  catch (e) { fail++; console.log('  ERR ', v, (e.message || String(e)).slice(0, 160)) }
}

console.log('\n===== 结果 =====')
console.log('PASS =', pass, ' FAIL =', fail)
Math.random = rand0
await vite.close()
process.exit(fail > 0 ? 1 : 0)
