<template>
  <div class="page">
    <NavBar />
    <div class="wrap">
      <div class="page-head">
        <h1>⚔️ 玩家对战中心</h1>
        <span class="sub">回合制 6v6 队伍战 · 可释放招式或更换宝可梦 · 完整记录对战结果</span>
        <button class="btn btn-primary btn-sm pvp-btn" @click="openPvp">🌐 联机对战</button>
      </div>

      <!-- ============ 选队 ============ -->
      <template v-if="stage === 'pick'">
        <div class="panel">
          <div class="head-row">
            <h3>🎒 选择出战队伍（最多 6 只）</h3>
            <span class="sel-count">已选 {{ selected.length }} / 6</span>
          </div>
          <p class="hint-line" style="margin-bottom: 14px">
            系统会为你匹配一位训练家进行 6v6 回合制对战，战斗中可随时更换宝可梦。
          </p>
          <div v-if="game.bag.length === 0" class="lock-tip">
            <span class="ico">🎒</span>背包里还没有宝可梦
            <div style="margin-top: 10px"><router-link to="/adventure" class="btn btn-primary btn-sm">去野外捕捉</router-link></div>
          </div>
          <div v-else class="pick-grid">
            <div v-for="f in game.bag" :key="f.uid" :class="['pick-card', { picked: selected.includes(f.uid) }]" @click="togglePick(f.uid)">
              <span v-if="selected.includes(f.uid)" class="pick-ok">✓</span>
              <PokeImg :src="f.image" :alt="f.name" img-class="pick-img" />
              <b>{{ f.name }}</b>
              <small>Lv.{{ f.level }} · 战力 {{ f.power }}</small>
            </div>
          </div>
          <div class="pick-actions">
            <button class="btn btn-ghost btn-sm" @click="selected = []">清空</button>
            <button class="btn btn-primary" :disabled="!selected.length" @click="confirmTeam">⚔ 开始匹配对战</button>
          </div>
        </div>
      </template>

      <!-- ============ 匹配中 ============ -->
      <div v-else-if="stage === 'searching'" class="panel" style="text-align: center; padding: 60px 20px">
        <div class="searching">🔍</div>
        <h3 style="justify-content: center">正在匹配训练家…</h3>
        <p class="hint-line">正在为你寻找实力相近的对手</p>
      </div>

      <!-- ============ 对战 ============ -->
      <template v-else-if="stage === 'battle'">
        <div class="panel">
          <div class="battle-top">
            <button class="btn btn-ghost btn-sm" @click="reset">← 放弃对战</button>
            <span class="battle-title">🌐 对手：{{ opponentName }}</span>
            <span class="round-badge">第 {{ round }} 回合</span>
          </div>

          <!-- 队伍状态 -->
          <div class="team-bar">
            <span class="tb-label">我方</span>
            <span v-for="(u, i) in myTeam" :key="'m' + i" :class="['tb-dot', { alive: u.hp > 0, cur: i === myIdx }]"></span>
            <span class="tb-gap"></span>
            <span class="tb-label">对手</span>
            <span v-for="(u, i) in foeTeam" :key="'f' + i" :class="['tb-dot foe', { alive: u.hp > 0, cur: i === foeIdx }]"></span>
          </div>

          <div class="arena">
            <div class="side">
              <span class="side-name">{{ curMine.name }} <small>Lv.{{ curMine.level }} · 我方</small></span>
              <div class="hp-bar"><i :style="{ width: hpPct(curMine) + '%', background: hpColor(curMine) }"></i></div>
              <span class="hp-text">{{ curMine.hp }} / {{ curMine.maxHp }}</span>
              <PokeImg :src="curMine.image" :alt="curMine.name" :img-class="'side-img' + (hitMine ? ' hit-anim hit-flash' : '')" />
            </div>
            <div class="side" style="align-items: flex-end">
              <span class="side-name">{{ curFoe.name }} <small>Lv.{{ curFoe.level }} · 对手</small></span>
              <div class="hp-bar"><i :style="{ width: hpPct(curFoe) + '%', background: hpColor(curFoe) }"></i></div>
              <span class="hp-text">{{ curFoe.hp }} / {{ curFoe.maxHp }}</span>
              <PokeImg :src="curFoe.image" :alt="curFoe.name" :img-class="'side-img flip' + (hitFoe ? ' hit-anim hit-flash' : '')" />
            </div>
          </div>

          <!-- 结算 -->
          <div v-if="over" class="battle-result" :class="winner === 'mine' ? 'win' : 'lose'">
            <h3>{{ winner === 'mine' ? '🏆 你赢下了这场 6v6 对战！' : '💤 你的队伍全部倒下了…' }}</h3>
            <p class="hint-line">对战结果已记入对战记录</p>
            <div style="margin-top: 12px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap">
              <button class="btn btn-yellow btn-sm" @click="reset">再来一局</button>
              <router-link to="/trainer" class="btn btn-ghost btn-sm">查看对战记录</router-link>
            </div>
          </div>

          <!-- 招式 / 换人 -->
          <div v-else>
            <div v-if="turnBusy" class="turn-wait">⏳ 我方已出招，正在等待对方出招…</div>
            <div v-if="switching" class="switch-box">
              <p class="turn-tip">选择要换上场的宝可梦（会消耗本回合）</p>
              <div class="switch-grid">
                <div v-for="(u, i) in myTeam" :key="i"
                  :class="['switch-card', { dead: u.hp <= 0, cur: i === myIdx, busy: turnBusy }]"
                  @click="switchTo(i)">
                  <PokeImg :src="u.image" :alt="u.name" img-class="sw-img" />
                  <b>{{ u.name }}</b>
                  <small v-if="u.hp > 0">HP {{ u.hp }}/{{ u.maxHp }}</small>
                  <small v-else class="dead-text">已倒下</small>
                </div>
              </div>
              <button class="btn btn-ghost btn-sm" style="margin-top: 10px" @click="switching = false">取消</button>
            </div>
            <div v-else class="move-box">
              <p class="turn-tip">请选择行动</p>
              <div class="move-grid">
                <button v-for="(m, i) in curMine.moves" :key="i" class="move-btn" :disabled="turnBusy" @click="useMove(m)">
                  <span class="mv-name">{{ m.name }}</span>
                  <span class="mv-meta">
                    <span :class="['type', 'type-' + m.type]">{{ m.type }}</span>
                    <span v-if="m.power">威力 {{ m.power }}</span>
                    <span>命中 {{ m.acc }}%</span>
                  </span>
                </button>
              </div>
              <button class="switch-btn" :disabled="turnBusy" @click="switching = true">🔄 更换宝可梦（剩 {{ aliveMine }} 只可换）</button>
            </div>
          </div>

          <div class="battle-log">
            <p v-for="(l, i) in logs" :key="i">{{ l }}</p>
          </div>
        </div>
      </template>

      <!-- 对战记录 -->
      <div class="panel" style="margin-top: 18px">
        <h3>📜 完整对战记录（最近 12 条）</h3>
        <ul v-if="game.battleLog.length" class="record-list">
          <li v-for="(r, i) in game.battleLog.slice(0, 12)" :key="i">
            <span class="time">{{ r.time }}</span>
            <span class="tagline">{{ r.type }}</span>
            <span>vs {{ r.opponent }}</span>
            <span :style="r.result.includes('胜') ? 'color:#2e9e4f;font-weight:800;margin-left:auto' : 'color:#c0392b;font-weight:800;margin-left:auto'">{{ r.result }}</span>
          </li>
        </ul>
        <p v-else class="empty-tip" style="padding: 26px 0">还没有对战记录，组好队伍开战吧 ⚔️</p>
      </div>
    </div>

    <!-- 联机对战面板 -->
    <div v-if="pvpOpen" class="modal-mask" @click.self="pvpOpen = false">
      <div class="pvp-modal">
        <button class="close" @click="pvpOpen = false">✕</button>
        <h3>🌐 联机对战</h3>
        <p class="hint-line">与在线训练家约战：选择对手发起邀请，对方接受后立即开战</p>

        <div v-if="waiting" class="waiting-box">
          <span>⏳ 已邀请 <b>{{ waiting.to }}</b>，等待对方接受…</span>
          <button class="btn-sm-ghost" @click="cancelWait">取消</button>
        </div>

        <div v-if="received.length" class="invite-block">
          <h4>📨 收到的邀请（{{ received.length }}）</h4>
          <div v-for="inv in received" :key="inv.id" class="invite-item">
            <span>⚔ <b>{{ inv.from }}</b> 邀请你对战</span>
            <div class="invite-actions">
              <button class="btn btn-primary btn-sm" @click="accept(inv)">接受</button>
              <button class="btn btn-ghost btn-sm" @click="reject(inv)">拒绝</button>
            </div>
          </div>
        </div>

        <h4>🟢 在线训练家（{{ onlinePlayers.length }}）</h4>
        <div v-if="!onlinePlayers.length" class="lock-tip" style="padding: 16px 0">
          暂无其他在线玩家。让同学登录本站后即可互相邀请对战。
        </div>
        <div v-else class="online-list">
          <div v-for="p in onlinePlayers" :key="p.username" class="online-item">
            <span class="on-dot"></span>
            <b>{{ p.username }}</b>
            <button class="btn btn-primary btn-sm" @click="invite(p)">邀请对战</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import PokeImg from '../components/PokeImg.vue'
import { pokemonList } from '../api'
import { game, logBattle } from '../data/gameStore'
import { ALL_DEX } from '../data/dex'
import { createBattleUnit, calcDamage, hitCheck, aiChooseMove, multText } from '../data/battleEngine'
import { movesForFighter } from '../data/gameData'
import { toastWarn, toastOk } from '../utils/toast'
import { useTurnFlow } from '../utils/turnFlow'
import { heartbeat, fetchChallenges, sendChallenge, respondChallenge, challengeStatus, currentUser } from '../api/game'

const TRAINERS = ['小茂', '真司', '翔太', '艾岚', '卡露妮', '大吾', '竹兰', '丹帝', '奇巴纳', '妮莫', '派帕', '青绿']
const MAX_TEAM = 6

const all = ref([])
const stage = ref('pick') // pick | searching | battle
const selected = ref([])
const myTeam = ref([])
const foeTeam = ref([])
const myIdx = ref(0)
const foeIdx = ref(0)
const round = ref(1)
const logs = ref([])
const over = ref(false)
const winner = ref('')
const opponentName = ref('')
const switching = ref(false)

// 全站统一回合锁：我方出招后，必须等敌方出招完成才解锁
const { turnBusy, runTurn, clearTurn } = useTurnFlow()

// 命中特效
const hitFoe = ref(false)
const hitMine = ref(false)
let hitT1 = null
let hitT2 = null
function triggerHit(side) {
  if (side === 'foe') {
    hitFoe.value = true
    clearTimeout(hitT1)
    hitT1 = setTimeout(() => { hitFoe.value = false }, 420)
  } else {
    hitMine.value = true
    clearTimeout(hitT2)
    hitT2 = setTimeout(() => { hitMine.value = false }, 420)
  }
}

const curMine = computed(() => myTeam.value[myIdx.value] || { name: '—', hp: 0, maxHp: 1, level: 1, moves: [], image: '' })
const curFoe = computed(() => foeTeam.value[foeIdx.value] || { name: '—', hp: 0, maxHp: 1, level: 1, moves: [], image: '' })
const aliveMine = computed(() => myTeam.value.filter(u => u.hp > 0 && u !== curMine.value).length)

function hpPct(u) { return Math.max(0, (u.hp / u.maxHp) * 100) }
function hpColor(u) {
  const r = u.hp / u.maxHp
  return r > 0.5 ? '#2ecc71' : r > 0.2 ? '#f1c40f' : '#e74c3c'
}

function togglePick(uid) {
  const i = selected.value.indexOf(uid)
  if (i >= 0) { selected.value.splice(i, 1); return }
  if (selected.value.length >= MAX_TEAM) { toastWarn(`最多携带 ${MAX_TEAM} 只宝可梦`); return }
  selected.value.push(uid)
}

function toUnit(f) {
  const src = all.value.find(p => String(p.number) === String(f.number))
  const u = createBattleUnit(src || { number: f.number, name: f.name, image: f.image, category: f.category, category2: f.category2 }, f.level, f.shiny)
  u.maxHp = f.maxHp
  u.hp = f.maxHp
  u.moves = movesForFighter(f, src)
  return u
}

function confirmTeam() {
  clearTurn()
  const fs = game.bag.filter(f => selected.value.includes(f.uid)).slice(0, MAX_TEAM)
  if (!fs.length) { toastWarn('请至少选择 1 只宝可梦'); return }
  myTeam.value = fs.map(toUnit)
  stage.value = 'searching'
  opponentName.value = TRAINERS[Math.floor(Math.random() * TRAINERS.length)]
  setTimeout(() => {
    const pool = [...all.value].sort(() => Math.random() - 0.5).slice(0, MAX_TEAM)
    const avg = Math.round(myTeam.value.reduce((s, u) => s + u.level, 0) / myTeam.value.length)
    foeTeam.value = pool.map(p => createBattleUnit(p, Math.max(15, avg + 3)))
    myIdx.value = 0
    foeIdx.value = 0
    round.value = 1
    over.value = false
    switching.value = false
    logs.value = [`🌐 已匹配到训练家「${opponentName.value}」！双方派出 6 只宝可梦，对战开始。`]
    stage.value = 'battle'
  }, 1500)
}

const aliveIdx = t => t.map((u, i) => i).filter(i => t[i].hp > 0)

function doAttack(a, d, move, tag) {
  if (!move) return
  if (!hitCheck(move)) { logs.value.push(`💨 ${tag} 的「${move.name}」没有命中！`); return }
  if (!move.power) {
    const heal = Math.round(a.maxHp * 0.3)
    a.hp = Math.min(a.maxHp, a.hp + heal)
    logs.value.push(`✨ ${tag} 使用「${move.name}」，回复 ${heal} 点 HP`)
    return
  }
  const { dmg, mult, crit } = calcDamage(a, d, move)
  d.hp = Math.max(0, d.hp - dmg)
  triggerHit(d === curFoe.value ? 'foe' : 'mine')
  logs.value.push(`⚔ ${tag} 使用「${move.name}」，造成 ${dmg} 伤害（${multText(mult)}${crit ? ' 会心！' : ''}）`)
}

/** 处理倒下：自动换下一只；全灭则结束。返回 true 表示整场结束 */
function handleFaint(side) {
  const team = side === 'mine' ? myTeam.value : foeTeam.value
  const idxRef = side === 'mine' ? myIdx : foeIdx
  if (team[idxRef.value].hp > 0) return false
  logs.value.push(`💤 ${team[idxRef.value].name} 失去了战斗能力`)
  const alive = aliveIdx(team)
  if (!alive.length) { finish(side === 'mine' ? 'foe' : 'mine'); return true }
  idxRef.value = alive[0]
  logs.value.push(`🔄 ${side === 'mine' ? '我方' : opponentName.value} 派出了 ${team[idxRef.value].name}`)
  return false
}

function aiAct() {
  if (over.value) return
  const f = curFoe.value
  const m = curMine.value
  if (f.hp <= 0) return
  const others = aliveIdx(foeTeam.value).filter(i => i !== foeIdx.value)
  if (others.length && f.hp / f.maxHp < 0.25 && Math.random() < 0.35) {
    foeIdx.value = others[Math.floor(Math.random() * others.length)]
    logs.value.push(`🔄 ${opponentName.value} 换上了 ${curFoe.value.name}`)
    return
  }
  doAttack(f, m, aiChooseMove(f, m), opponentName.value + '·' + f.name)
  handleFaint('mine')
}

function useMove(move) {
  if (over.value || switching.value || turnBusy.value) return
  runTurn(
    () => {
      logs.value.push(`—— 第 ${round.value} 回合 ——`)
      doAttack(curMine.value, curFoe.value, move, '我方·' + curMine.value.name)
      if (handleFaint('foe')) return true
      return false
    },
    () => {
      aiAct()
      if (over.value) return true
      round.value++
      return false
    }
  )
}

function switchTo(i) {
  if (over.value || turnBusy.value) return
  if (i === myIdx.value) { toastWarn('它已经在场上了'); return }
  if (myTeam.value[i].hp <= 0) { toastWarn('这只宝可梦已失去战斗能力'); return }
  runTurn(
    () => {
      logs.value.push(`🔄 我方换上了 ${myTeam.value[i].name}（消耗本回合）`)
      myIdx.value = i
      switching.value = false
      return false
    },
    () => {
      aiAct()
      if (over.value) return true
      round.value++
      return false
    }
  )
}

function finish(w) {
  over.value = true
  winner.value = w
  logs.value.push(w === 'mine' ? '🏆 对手的宝可梦全部倒下，你赢了！' : '💤 你的宝可梦全部倒下…')
  logBattle({ type: '玩家对战', opponent: opponentName.value, result: w === 'mine' ? '我方胜利' : '我方失败' })
  if (w === 'mine') toastOk('6v6 对战胜利！结果已记录')
}

function reset() {
  clearTurn()
  stage.value = 'pick'
  selected.value = []
  myTeam.value = []
  foeTeam.value = []
  myIdx.value = 0
  foeIdx.value = 0
  round.value = 1
  logs.value = []
  over.value = false
  winner.value = ''
  switching.value = false
}

onMounted(async () => {
  const res = await pokemonList()
  all.value = res.code === 200 ? res.data : []
})
// ==================== 联机对战（玩家 vs 玩家） ====================
const me = currentUser() || ''
const pvpOpen = ref(false)
const onlinePlayers = ref([])
const invites = ref([])
const waiting = ref(null)
let hbTimer = null
let pollTimer = null
let statusTimer = null

const received = computed(() => invites.value.filter(i => i && i.to === me && i.status === 'pending'))

async function openPvp() {
  pvpOpen.value = true
  await refreshOnline()
  await refreshInvites()
}

async function refreshOnline() {
  if (!me) return
  const list = await heartbeat(me)
  if (Array.isArray(list)) onlinePlayers.value = list
}

async function refreshInvites() {
  if (!me) return
  const list = await fetchChallenges(me)
  if (Array.isArray(list)) {
    invites.value = list
    // 收到新的对战邀请时，自动弹出联机面板，优先展示邀请
    if (list.some(i => i && i.to === me && i.status === 'pending')) {
      pvpOpen.value = true
      refreshOnline()
    }
  }
}

async function invite(p) {
  const r = await sendChallenge(me, p.username)
  if (r && r.id) {
    waiting.value = r
    toastOk(`已邀请 ${p.username}，等待对方接受…`)
    startStatusPoll(r)
  } else {
    toastWarn('邀请失败，对方可能已离线')
  }
}

function cancelWait() {
  waiting.value = null
  clearInterval(statusTimer)
}

function startStatusPoll(ch) {
  clearInterval(statusTimer)
  statusTimer = setInterval(async () => {
    const c = await challengeStatus(ch.id)
    if (!c) return
    if (c.status === 'accepted') {
      clearInterval(statusTimer)
      waiting.value = null
      pvpOpen.value = false
      const team = await fetchTeam(c.to)
      startPvp(team, c.to)
    } else if (c.status === 'rejected') {
      clearInterval(statusTimer)
      waiting.value = null
      toastWarn(`${c.to} 拒绝了你的对战邀请`)
    }
  }, 2000)
}

async function fetchTeam(name) {
  try {
    const res = await fetch('/api/game/team?username=' + encodeURIComponent(name))
    const j = await res.json()
    return j.code === 200 ? j.data : []
  } catch { return [] }
}

async function accept(inv) {
  const r = await respondChallenge(inv.id, 'accept', me)
  if (!r) { toastWarn('接受失败'); return }
  pvpOpen.value = false
  startPvp(r.opponentTeam || [], r.opponent || inv.from)
}

async function reject(inv) {
  await respondChallenge(inv.id, 'reject', me)
  await refreshInvites()
}

/** 用对方真实队伍开战（我方取背包前 6 只） */
function startPvp(team, oppName) {
  clearTurn()
  const mine = game.bag.slice(0, 6)
  if (!mine.length) { toastWarn('背包里还没有宝可梦'); return }
  if (!Array.isArray(team) || !team.length) { toastWarn('对方队伍为空，无法开战'); return }
  myTeam.value = mine.map(toUnit)
  foeTeam.value = team.map(f => {
    const src = ALL_DEX.find(p => String(p.number) === String(f.number))
    const u = createBattleUnit(src || { number: f.number, name: f.name, image: f.image, category: f.category, category2: f.category2 }, f.level || 50, f.shiny)
    u.moves = movesForFighter(f, src)
    u.maxHp = f.maxHp || u.maxHp
    u.hp = u.maxHp
    return u
  })
  opponentName.value = oppName || '对手'
  myIdx.value = 0
  foeIdx.value = 0
  round.value = 1
  over.value = false
  switching.value = false
  logs.value = [`🌐 与「${oppName}」的联机对战开始！`]
  stage.value = 'battle'
}

onMounted(() => {
  if (me) {
    heartbeat(me)
    hbTimer = setInterval(() => heartbeat(me), 25000)
    pollTimer = setInterval(() => refreshInvites(), 5000)
  }
})

onUnmounted(() => {
  clearInterval(hbTimer)
  clearInterval(pollTimer)
  clearInterval(statusTimer)
})

</script>

<style scoped>
.head-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
.head-row h3 { margin-bottom: 0; }
.sel-count { font-size: 12px; font-weight: 800; color: var(--poke-blue); background: #eef2ff; padding: 4px 11px; border-radius: 11px; }

.pick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
.pick-card { position: relative; background: #f9fafd; border: 2px solid var(--line); border-radius: 12px; padding: 11px; text-align: center; cursor: pointer; transition: all .15s; }
.pick-card:hover { border-color: var(--poke-yellow); transform: translateY(-3px); }
.pick-card.picked { border-color: var(--poke-red); background: #fff5f5; box-shadow: 0 4px 14px rgba(238, 21, 21, .15); }
.pick-ok { position: absolute; top: 6px; right: 8px; width: 20px; height: 20px; border-radius: 50%; background: var(--poke-red); color: #fff; font-size: 12px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
.pick-img { width: 70px; height: 70px; object-fit: contain; }
.pick-card b { display: block; font-size: 14px; }
.pick-card small { font-size: 11px; color: var(--ink-light); }
.pick-actions { display: flex; justify-content: center; gap: 12px; margin-top: 18px; }

.searching { font-size: 52px; animation: spin 1.2s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg) } }

.battle-top { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.battle-title { font-weight: 800; color: var(--ink); }
.round-badge { font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 12px; background: #eef2ff; color: var(--poke-blue); }

.team-bar { display: flex; align-items: center; gap: 5px; margin-bottom: 14px; flex-wrap: wrap; }
.tb-label { font-size: 11px; font-weight: 800; color: var(--ink-light); }
.tb-gap { width: 14px; }
.tb-dot { width: 11px; height: 11px; border-radius: 50%; background: #d7dbe6; display: inline-block; }
.tb-dot.alive { background: #2ecc71; }
.tb-dot.foe.alive { background: #e74c3c; }
.tb-dot.cur { box-shadow: 0 0 0 3px rgba(255, 203, 5, .6); }

.arena { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; background: linear-gradient(135deg, #fff8e1, #eef2ff); border-radius: 16px; padding: 18px; }
.side { display: flex; flex-direction: column; gap: 6px; }
.side-name { font-weight: 800; font-size: 15px; }
.side-name small { color: var(--ink-light); font-weight: 400; }
.hp-bar { width: 100%; max-width: 240px; height: 10px; background: #e8ebf2; border-radius: 6px; overflow: hidden; }
.hp-bar i { display: block; height: 100%; transition: width .35s; border-radius: 6px; }
.hp-text { font-size: 11px; color: var(--ink-light); }
.side-img { width: 120px; height: 120px; object-fit: contain; }
.flip { transform: scaleX(-1); }

.move-box { margin-top: 16px; }
.turn-tip { font-size: 13px; font-weight: 700; color: var(--ink-light); margin-bottom: 10px; }
.move-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.move-btn { background: #fff; border: 2px solid var(--line); border-radius: 12px; padding: 10px 14px; text-align: left; transition: all .15s; }
.move-btn:hover { border-color: var(--poke-red); background: #fff7f7; transform: translateY(-2px); }
.mv-name { display: block; font-weight: 800; font-size: 14px; margin-bottom: 4px; }
.mv-meta { display: flex; gap: 8px; align-items: center; font-size: 11px; color: var(--ink-light); flex-wrap: wrap; }
.switch-btn { margin-top: 12px; width: 100%; padding: 11px; border-radius: 12px; background: #eef2ff; color: var(--poke-blue); font-weight: 800; font-size: 13px; border: 2px dashed #c3ccf0; }
.switch-btn:hover { background: #e2e9ff; }

.switch-box { margin-top: 16px; }
.switch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
.turn-wait { background: #fff7e6; border: 2px dashed var(--poke-orange); color: #8a5a1a; border-radius: 10px; padding: 8px 12px; margin-bottom: 12px; font-size: 12.5px; font-weight: 800; text-align: center; animation: battleTurnPulse 1s ease-in-out infinite; }
@keyframes battleTurnPulse { 0%,100%{opacity:1} 50%{opacity:.6} }
.switch-card { background: #f9fafd; border: 2px solid var(--line); border-radius: 12px; padding: 9px 6px; text-align: center; cursor: pointer; transition: all .15s; }
.switch-card:hover { border-color: var(--poke-yellow); }
.switch-card.dead { opacity: .42; cursor: not-allowed; }
.switch-card.cur { border-color: var(--poke-red); background: #fff5f5; }
.switch-card.busy, .switch-card.busy:hover { opacity: .42; cursor: not-allowed; border-color: var(--line); transform: none; }
.sw-img { width: 54px; height: 54px; object-fit: contain; }
.switch-card b { display: block; font-size: 12.5px; }
.switch-card small { font-size: 10px; color: var(--ink-light); }
.dead-text { color: #c0392b; }

.battle-log { margin-top: 16px; background: #f8f9fc; border: 2px solid var(--line); border-radius: 12px; padding: 12px 14px; max-height: 190px; overflow-y: auto; font-size: 12.5px; line-height: 1.9; }
.battle-result { text-align: center; padding: 26px 10px; border-radius: 14px; margin-top: 16px; }
.battle-result.win { background: #eafaf0; border: 2px solid #a8e6bd; }
.battle-result.lose { background: #fdf0f0; border: 2px solid #f5c6c6; }
.battle-result h3 { font-size: 20px; margin-bottom: 6px; }
/* ===== 联机对战 ===== */
.pvp-btn { margin-left: auto; }
.modal-mask { position: fixed; inset: 0; background: rgba(33, 33, 33, .55); display: flex; align-items: center; justify-content: center; z-index: 70; padding: 18px; }
.pvp-modal { width: 100%; max-width: 520px; background: #fff; border: 4px solid var(--poke-orange); border-radius: 20px; padding: 24px; position: relative; max-height: 86vh; overflow-y: auto; }
.pvp-modal .close { position: absolute; top: 12px; right: 14px; width: 30px; height: 30px; border-radius: 50%; background: var(--line); font-size: 14px; }
.pvp-modal h3 { font-size: 19px; margin-bottom: 4px; }
.pvp-modal h4 { font-size: 13.5px; margin: 16px 0 8px; color: var(--poke-blue); }
.waiting-box { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: var(--poke-orange-soft); border: 1px dashed #ffd0a0; border-radius: 12px; padding: 10px 14px; font-size: 12.5px; margin-top: 10px; }
.invite-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #fff8f0; border: 1px solid #ffe0b8; border-radius: 12px; padding: 10px 14px; font-size: 12.5px; margin-bottom: 8px; flex-wrap: wrap; }
.invite-actions { display: flex; gap: 8px; }
.online-list { display: flex; flex-direction: column; gap: 8px; }
.online-item { display: flex; align-items: center; gap: 10px; background: #f9fafd; border: 1px solid var(--line); border-radius: 12px; padding: 10px 14px; }
.online-item b { flex: 1; font-size: 13.5px; }
.on-dot { width: 8px; height: 8px; border-radius: 50%; background: #2ecc71; box-shadow: 0 0 0 3px rgba(46, 204, 113, .18); }
</style>
