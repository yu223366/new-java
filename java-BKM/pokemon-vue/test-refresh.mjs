import { createServer } from 'vite'

const store = {}
globalThis.localStorage = {
  getItem(k){ return store[k] ?? null },
  setItem(k,v){ store[k] = String(v) },
  removeItem(k){ delete store[k] }
}

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const flush = () => new Promise(r => setTimeout(r, 30))
let cacheBust = 0
async function freshLoad() {
  cacheBust++
  return await vite.ssrLoadModule('/src/data/gameStore.js?t=' + cacheBust)
}

// 首次加载（未登录 guest）
let s = await freshLoad()

// 登录 A，选御三家，玩
localStorage.setItem('pokemon_user', JSON.stringify({ username: '账号A', role: 1 }))
s.reloadForUser()
s.game.starterChosen = true; s.game.coins = 111; s.game.bag = [{ number: '025', name: '皮卡丘' }]
await flush()
console.log('① 账号A 存档:', store['pokemon_game_state_v2_账号A'] ? '已写入 ✓' : '未写入 ✗')

// 退出 A
localStorage.removeItem('pokemon_user')
console.log('② 退出后 pokemon_user:', localStorage.getItem('pokemon_user'))

// 登录 B，选御三家，玩
localStorage.setItem('pokemon_user', JSON.stringify({ username: '账号B', role: 1 }))
s.reloadForUser()
s.game.starterChosen = true; s.game.coins = 222; s.game.bag = [{ number: '001', name: '妙蛙种子' }]
await flush()
console.log('③ 账号B 存档:', store['pokemon_game_state_v2_账号B'] ? '已写入 ✓' : '未写入 ✗')

// 模拟刷新：重新加载模块（读 localStorage['pokemon_user'] = 账号B）
s = await freshLoad()
console.log('④ 刷新后当前账号:', localStorage.getItem('pokemon_user'))
console.log('⑤ 刷新后 game.coins =', s.game.coins, 'bag =', s.game.bag.map(f=>f.name).join(','), '(应为 222/妙蛙种子)')

await vite.close()
process.exit(0)
