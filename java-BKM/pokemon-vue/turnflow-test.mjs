/**
 * 回合锁单元测试：验证「我方出招 → 等待 → 敌方出招 → 等待 → 解锁」严格串行
 */
import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
const { useTurnFlow } = await vite.ssrLoadModule('/src/utils/turnFlow.js')

// SSR 下没有组件实例，onUnmounted 会告警，临时屏蔽
const origWarn = console.warn
console.warn = () => {}
const flow = useTurnFlow()
console.warn = origWarn
const { turnBusy, runTurn, clearTurn } = flow

let pass = 0, fail = 0
const ck = (n, c, d = '') => { if (c) { pass++; console.log('  PASS', n) } else { fail++; console.log('  FAIL', n, d) } }

console.log('===== 1. 完整回合顺序 =====')
let seq = []
await runTurn(
  () => { seq.push('my'); return false },
  () => { seq.push('foe'); return false },
  { myDelay: 30, foeDelay: 30 }
)
ck('顺序为 my→foe', seq.join(',') === 'my,foe', seq.join(','))
ck('回合结束后解锁', turnBusy.value === false, String(turnBusy.value))

console.log('===== 2. 我方出招后锁定，不能连续出招 =====')
seq = []
let lockedWhenFoe = false
const p = runTurn(
  () => { seq.push('my'); return false },
  () => { seq.push('foe'); lockedWhenFoe = turnBusy.value; return false },
  { myDelay: 90, foeDelay: 90 }
)
await new Promise(r => setTimeout(r, 20))
ck('我方出招后立即锁定', turnBusy.value === true, String(turnBusy.value))
await runTurn(
  () => { seq.push('SHOULD_NOT_RUN'); return false },
  () => { seq.push('x'); return false },
  { myDelay: 0, foeDelay: 0 }
)
await p
ck('锁定期间重复出招被忽略', !seq.includes('SHOULD_NOT_RUN'), seq.join(','))
ck('敌方行动时仍处于锁定', lockedWhenFoe === true, String(lockedWhenFoe))
ck('敌方出招完成后解锁', turnBusy.value === false, String(turnBusy.value))

console.log('===== 3. 我方获胜后不再让敌方出招 =====')
seq = []
await runTurn(
  () => { seq.push('my'); return true },
  () => { seq.push('foe'); return false },
  { myDelay: 20, foeDelay: 20 }
)
ck('获胜后跳过敌方回合', seq.join(',') === 'my', seq.join(','))
ck('获胜后解锁', turnBusy.value === false, String(turnBusy.value))

console.log('===== 4. 换场景清理定时器 =====')
seq = []
runTurn(
  () => { seq.push('my'); return false },
  () => { seq.push('foe'); return false },
  { myDelay: 400, foeDelay: 400 }
)
await new Promise(r => setTimeout(r, 20))
clearTurn()
ck('clearTurn 立即解锁', turnBusy.value === false, String(turnBusy.value))
await new Promise(r => setTimeout(r, 500))
ck('clearTurn 取消后续敌方行动', seq.join(',') === 'my', seq.join(','))

console.log('\n===== 结果 =====')
console.log('PASS =', pass, ' FAIL =', fail)
await vite.close()
process.exit(fail > 0 ? 1 : 0)
