/**
 * 端到端全功能测试：两个账号跑一遍所有后端接口
 * 账号：qaA_1795110873 / qaB_1795110873
 */
const BASE = 'http://localhost:8081'
const UA = 'qaA_1795110873'
const UB = 'qaB_1795110873'
let pass = 0, fail = 0

async function api(path, opts = {}) {
  try {
    const res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts
    })
    const json = await res.json()
    return { http: res.status, ...json }
  } catch (e) {
    return { http: 0, code: -1, msg: e.message }
  }
}
function ck(name, cond, detail = '') {
  if (cond) { pass++; console.log('  PASS', name) }
  else { fail++; console.log('  FAIL', name, detail) }
}

async function main() {
  console.log('===== 1. 用户与权限 =====')
  let r = await api('/api/user/login', { method: 'POST', body: JSON.stringify({ username: UA, password: '123456' }) })
  ck('A 登录 role=1', r.code === 200 && r.data.role === 1, JSON.stringify(r))
  r = await api('/api/user/login', { method: 'POST', body: JSON.stringify({ username: UB, password: '123456' }) })
  ck('B 登录 role=1', r.code === 200 && r.data.role === 1, JSON.stringify(r))
  r = await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ username: UA, password: '123456' }) })
  ck('普通用户无法登录后台', r.code === 401, JSON.stringify(r))
  r = await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ username: 'admin', password: '123456' }) })
  ck('管理员登录 role=0', r.code === 200 && r.data.role === 0, JSON.stringify(r))

  console.log('===== 2. 存档隔离 =====')
  // 用不同的 marker 再存一次，确保覆盖
  await api('/api/game/save', { method: 'POST', body: JSON.stringify({ username: UA, coins: 1000, starterChosen: true, state: { bag: [{ uid: 'A1', name: '皮卡丘', level: 5 }], marker: 'AAA' } }) })
  await api('/api/game/save', { method: 'POST', body: JSON.stringify({ username: UB, coins: 500, starterChosen: true, state: { bag: [{ uid: 'B1', name: '妙蛙种子', level: 5 }], marker: 'BBB' } }) })
  r = await api('/api/game/load', { method: 'POST', body: JSON.stringify({ username: UA }) })
  ck('A 存档 marker=AAA', r.code === 200 && JSON.parse(r.data.state).marker === 'AAA', r.data.state)
  ck('A 金币=1000', r.data.coins === 1000, String(r.data.coins))
  r = await api('/api/game/load', { method: 'POST', body: JSON.stringify({ username: UB }) })
  ck('B 存档 marker=BBB', r.code === 200 && JSON.parse(r.data.state).marker === 'BBB', r.data.state)
  ck('B 金币=500', r.data.coins === 500, String(r.data.coins))

  console.log('===== 3. 图鉴/技能/道馆/资料库 =====')
  r = await api('/api/pokemon/list')
  ck('图鉴 1025 条', r.code === 200 && r.data.length === 1025, String(r.data && r.data.length))
  const p1 = r.data.find(p => String(p.number) === '001')
  ck('图鉴 detailJson 可解析', !!p1 && !!p1.detailJson && (() => { try { JSON.parse(p1.detailJson); return true } catch { return false } })(), p1 && String(p1.detailJson).slice(0, 60))
  r = await api('/api/pokemon/search?keyword=皮卡丘')
  ck('图鉴搜索皮卡丘', r.code === 200 && r.data.length > 0, JSON.stringify(r.data && r.data.length))
  r = await api('/api/game/skills')
  ck('技能库非空', r.code === 200 && r.data.length > 0, String(r.data && r.data.length))
  r = await api('/api/game/gyms')
  ck('道馆 72 座', r.code === 200 && r.data.length === 72, String(r.data && r.data.length))
  r = await api('/api/game/chapters')
  ck('资料库 9 篇', r.code === 200 && r.data.length === 9, String(r.data && r.data.length))
  r = await api('/api/game/shop')
  ck('市集 28 件', r.code === 200 && r.data.length === 28, String(r.data && r.data.length))

  console.log('===== 4. 公告 =====')
  r = await api('/api/admin/game/announcement', { method: 'POST', body: JSON.stringify({ content: '【QA测试公告】端到端测试', type: 'system' }) })
  ck('发布公告', r.code === 200, JSON.stringify(r))
  r = await api('/api/game/announcements')
  const hasQA = (r.data || []).some(a => a.content && a.content.includes('QA测试公告'))
  ck('前台可见公告', hasQA, JSON.stringify((r.data || []).slice(0, 2)))

  console.log('===== 5. 市集购买（服务端扣币） =====')
  // 给 A 加币
  r = await api('/api/admin/game/players')
  const pa = (r.data || []).find(p => p.username === UA)
  ck('A 在玩家列表', !!pa, JSON.stringify(pa))
  if (pa) {
    await api('/api/admin/game/player/coins', { method: 'POST', body: JSON.stringify({ id: pa.id, coins: 5000 }) })
    r = await api('/api/game/buy', { method: 'POST', body: JSON.stringify({ username: UA, itemName: '精灵球', qty: 2 }) })
    ck('购买精灵球×2 成功', r.code === 200 && r.data.coins === 4940, JSON.stringify(r))
    r = await api('/api/game/load', { method: 'POST', body: JSON.stringify({ username: UA }) })
    ck('购买后金币落库=4940', r.data.coins === 4940, String(r.data.coins))
  }

  console.log('===== 6. 后台 CRUD =====')
  r = await api('/api/admin/game/stats')
  ck('后台统计', r.code === 200 && r.data.players >= 2, JSON.stringify(r.data))
  r = await api('/api/admin/game/players')
  ck('后台玩家列表', r.code === 200 && r.data.length >= 2, String(r.data && r.data.length))
  const pb = (r.data || []).find(p => p.username === UB)
  if (pb) {
    r = await api('/api/admin/game/player/' + pb.id + '/detail')
    ck('玩家详情', r.code === 200 && r.data.username === UB, JSON.stringify(r.data).slice(0, 120))
    // 发放金币
    await api('/api/admin/game/player/grant', { method: 'POST', body: JSON.stringify({ id: pb.id, kind: 'coins', qty: 100 }) })
    r = await api('/api/game/load', { method: 'POST', body: JSON.stringify({ username: UB }) })
    ck('后台发放金币+100', r.data.coins === 600, String(r.data.coins))
    // 封禁
    await api('/api/admin/game/player/ban', { method: 'POST', body: JSON.stringify({ id: pb.id, banned: 1 }) })
    r = await api('/api/game/load', { method: 'POST', body: JSON.stringify({ username: UB }) })
    ck('封禁后 load 返回 403', r.code === 403, JSON.stringify(r))
    // 解封
    await api('/api/admin/game/player/ban', { method: 'POST', body: JSON.stringify({ id: pb.id, banned: 0 }) })
    r = await api('/api/game/load', { method: 'POST', body: JSON.stringify({ username: UB }) })
    ck('解封后恢复', r.code === 200, JSON.stringify(r).slice(0, 80))
    // 发放物品
    await api('/api/admin/game/player/grant', { method: 'POST', body: JSON.stringify({ id: pb.id, kind: 'ball', itemName: '大师球', qty: 1 }) })
    r = await api('/api/game/load', { method: 'POST', body: JSON.stringify({ username: UB }) })
    ck('发放精灵球落库', JSON.parse(r.data.state).balls['大师球'] >= 1, r.data.state)
  }
  // 道具 CRUD
  const orig = await api('/api/admin/game/items')
  const testItem = { name: 'QA测试道具', category: '药品', price: 1, mult: 1, effect: 'test', enabled: 0, sort: 999 }
  r = await api('/api/admin/game/item', { method: 'POST', body: JSON.stringify(testItem) })
  ck('新增道具', r.code === 200, JSON.stringify(r))
  let added = (await api('/api/admin/game/items')).data.find(i => i.name === 'QA测试道具')
  ck('新增道具可查', !!added, JSON.stringify(added))
  if (added) {
    r = await api('/api/admin/game/item/update', { method: 'POST', body: JSON.stringify({ id: added.id, price: 999 }) })
    ck('修改道具价格', r.code === 200, JSON.stringify(r))
    const up = (await api('/api/admin/game/items')).data.find(i => i.id === added.id)
    ck('价格落库=999', up && up.price === 999, JSON.stringify(up))
    await api('/api/admin/game/item/' + added.id, { method: 'DELETE' })
    const del = (await api('/api/admin/game/items')).data.find(i => i.id === added.id)
    ck('删除道具', !del, JSON.stringify(del))
  }
  // 技能 CRUD
  r = await api('/api/admin/game/skill', { method: 'POST', body: JSON.stringify({ name: 'QA测试技能', type: '普通', category: '物理', power: 10, accuracy: 100, pp: 10, effect: 'test' }) })
  ck('新增技能', r.code === 200, JSON.stringify(r))
  const sk = (await api('/api/game/skills')).data.find(s => s.name === 'QA测试技能')
  ck('新增技能可查', !!sk, JSON.stringify(sk))
  if (sk) { await api('/api/admin/game/skill/' + sk.id, { method: 'DELETE' }); ck('删除技能', !(await api('/api/game/skills')).data.find(s => s.id === sk.id), '') }
  // 道馆 CRUD
  r = await api('/api/admin/game/gym', { method: 'POST', body: JSON.stringify({ name: 'QA测试道馆', leader: '测试', badge: '测试徽章', region: '测试', type: '普通', localId: 9, reqLevel: 1 }) })
  ck('新增道馆', r.code === 200, JSON.stringify(r))
  const gy = (await api('/api/game/gyms')).data.find(g => g.name === 'QA测试道馆')
  ck('新增道馆可查', !!gy, JSON.stringify(gy))
  if (gy) { await api('/api/admin/game/gym/' + gy.id, { method: 'DELETE' }); ck('删除道馆', !(await api('/api/game/gyms')).data.find(g => g.id === gy.id), '') }
  // 资料库 CRUD
  r = await api('/api/admin/game/chapter', { method: 'POST', body: JSON.stringify({ name: 'QA测试篇章', region: '测试', sort: 999, contentJson: '[]' }) })
  ck('新增篇章', r.code === 200, JSON.stringify(r))
  const ch = (await api('/api/game/chapters')).data.find(c => c.name === 'QA测试篇章')
  ck('新增篇章可查', !!ch, JSON.stringify(ch))
  if (ch) { await api('/api/admin/game/chapter/' + ch.id, { method: 'DELETE' }); ck('删除篇章', !(await api('/api/game/chapters')).data.find(c => c.id === ch.id), '') }
  // 日志
  r = await api('/api/admin/game/logs')
  ck('后台日志', r.code === 200 && Array.isArray(r.data), JSON.stringify(r).slice(0, 80))

  console.log('===== 7. 联机对战 & 交换 =====')
  await api('/api/game/heartbeat', { method: 'POST', body: JSON.stringify({ username: UA }) })
  await api('/api/game/heartbeat', { method: 'POST', body: JSON.stringify({ username: UB }) })
  r = await api('/api/game/online?username=' + UA)
  ck('A 看到 B 在线', (r.data || []).some(o => o.username === UB), JSON.stringify(r.data))
  r = await api('/api/game/challenge', { method: 'POST', body: JSON.stringify({ from: UA, to: UB }) })
  ck('发起对战邀请', r.code === 200 && r.data.status === 'pending', JSON.stringify(r))
  const cid = r.data.id
  r = await api('/api/game/challenges?username=' + UB)
  ck('B 收到邀请', (r.data || []).some(c => c.id === cid), JSON.stringify(r.data))
  r = await api('/api/game/challenge/respond', { method: 'POST', body: JSON.stringify({ id: cid, action: 'accept', username: UB }) })
  ck('B 接受邀请', r.code === 200 && r.data.status === 'accepted', JSON.stringify(r))
  // 交换（A 用 A1，B 用 B1）
  r = await api('/api/game/trade', { method: 'POST', body: JSON.stringify({ from: UA, to: UB, pokemon: { uid: 'A1', name: '皮卡丘', level: 5 } }) })
  ck('发起交换邀请', r.code === 200 && r.data.status === 'pending', JSON.stringify(r))
  const tid = r.data.id
  r = await api('/api/game/trade/respond', { method: 'POST', body: JSON.stringify({ id: tid, action: 'accept', pokemon: { uid: 'B1', name: '妙蛙种子', level: 5 } }) })
  ck('B 接受交换', r.code === 200 && r.data.status === 'completed', JSON.stringify(r))
  r = await api('/api/game/load', { method: 'POST', body: JSON.stringify({ username: UA }) })
  const sa = JSON.parse(r.data.state)
  ck('A 得到妙蛙种子', sa.bag.some(p => p.uid === 'B1'), JSON.stringify(sa.bag))
  ck('A 失去皮卡丘', !sa.bag.some(p => p.uid === 'A1'), JSON.stringify(sa.bag))
  r = await api('/api/game/load', { method: 'POST', body: JSON.stringify({ username: UB }) })
  const sb = JSON.parse(r.data.state)
  ck('B 得到皮卡丘', sb.bag.some(p => p.uid === 'A1'), JSON.stringify(sb.bag))
  ck('B 失去妙蛙种子', !sb.bag.some(p => p.uid === 'B1'), JSON.stringify(sb.bag))

  console.log('\n===== 结果 =====')
  console.log('PASS =', pass, ' FAIL =', fail)
  process.exit(fail > 0 ? 1 : 0)
}
main()
