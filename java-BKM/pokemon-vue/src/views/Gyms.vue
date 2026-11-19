<template>
  <div class="page">
    <NavBar />
    <div class="wrap">
      <div class="page-head">
        <h1>🏛️ 道馆徽章挑战</h1>
        <span class="sub">按动画主线顺序挑战 · 集齐一个地区全部徽章，解锁该地区联盟大赛</span>
      </div>

      <!-- 地区切换 -->
      <div class="tabs">
        <button v-for="r in regionTabs" :key="r.id" :class="['tab-btn', { active: region === r.id }]" @click="switchRegion(r.id)">
          {{ r.flag }} {{ r.name }}（{{ badgeCount(r.id) }}/8）
        </button>
      </div>

      <!-- 徽章墙 -->
      <div class="panel">
        <div class="badge-head">
          <h3>🏅 {{ region }}徽章墙</h3>
          <span class="hint-line">已获得 <b>{{ badgeCount(region) }}</b> / 8 枚</span>
        </div>
        <div class="badge-wall">
          <div v-for="g in curGyms" :key="g.id" :class="['badge-slot', { got: hasBadge(g.id) }]">
            <span class="bs-ico">
              <GameIcon v-if="hasBadge(g.id)" kind="badge" :name="g.badge" :type="g.type" :size="34" />
              <span v-else class="bs-lock">🔒</span>
            </span>
            <small>{{ hasBadge(g.id) ? g.badge : '未获得' }}</small>
          </div>
        </div>
        <template v-if="curLeague">
          <div v-if="leagueUnlocked" class="league-unlocked">
            🎉 已集齐{{ region }}全部 8 枚徽章！
            <router-link to="/trainer">前往「{{ curLeague.name }}」挑战四天王</router-link>
          </div>
          <div v-else class="lock-tip" style="padding: 14px 0">
            还差 {{ 8 - badgeCount(region) }} 枚徽章，即可解锁「{{ curLeague.name }}」
          </div>
        </template>
        <div v-else class="lock-tip" style="padding: 14px 0">
          该地区联盟大赛暂未开放（当前已开放：关都、城都）
        </div>
      </div>

      <!-- ============ 列表视图 ============ -->
      <template v-if="view === 'list'">
        <div class="gym-list">
          <div v-for="g in curGyms" :key="g.id" :class="['gym-card', { cleared: hasBadge(g.id), locked: !unlockedInRegion(g) }]">
            <div class="gym-left">
              <span class="gym-idx">{{ g.localId }}</span>
              <div>
                <h3>{{ g.gym }} <small>馆主：{{ g.leader }} · {{ g.city }}</small></h3>
                <div class="gym-meta">
                  <span :class="['type', 'type-' + g.type]">{{ g.type }}</span>
                  <span class="stars">{{ '★'.repeat(Math.min(5, Math.ceil(g.localId / 2))) }}{{ '☆'.repeat(5 - Math.min(5, Math.ceil(g.localId / 2))) }} 难度 {{ g.localId }}</span>
                  <span class="team">队伍：{{ g.team.join(' / ') }}</span>
                  <span class="badge-name"><GameIcon kind="badge" :name="g.badge" :type="g.type" :size="16" /> {{ g.badge }}</span>
                </div>
                <p class="gym-intro">{{ g.intro }}</p>
              </div>
            </div>
            <div class="gym-right">
              <span v-if="hasBadge(g.id)" class="state-tag got">✓ 已通关</span>
              <button v-else-if="!unlockedInRegion(g)" class="state-tag locked" @click="warnLocked(g)">🔒 需先通过第 {{ g.localId - 1 }} 馆</button>
              <button v-else class="btn btn-primary btn-sm" @click="openAllyPicker(g)">挑战</button>
            </div>
          </div>
        </div>
      </template>

      <!-- ============ 对战视图 ============ -->
      <div v-else class="panel battle-panel">
        <div class="battle-top">
          <button class="btn btn-ghost btn-sm" @click="backToList">← 返回道馆列表</button>
          <span class="battle-title">{{ curGym.gym }} · 馆主 {{ curGym.leader }}</span>
        </div>

        <div class="arena">
          <div class="side ally-side">
            <span class="side-name">{{ ally.name }} <small>Lv.{{ ally.level }} · 我方</small></span>
            <div class="hp-bar"><i :style="{ width: hpPercent(ally) + '%', background: hpColor(ally) }"></i></div>
            <span class="hp-text">{{ ally.hp }} / {{ ally.maxHp }}</span>
            <PokeImg :src="ally.image" :alt="ally.name" :img-class="'side-img ally-img' + (hitAlly ? ' hit-anim hit-flash' : '')" />
          </div>
          <div class="side foe-side">
            <span class="side-name">{{ foe.name }} <small>Lv.{{ foe.level }}</small></span>
            <div class="hp-bar"><i :style="{ width: hpPercent(foe) + '%', background: hpColor(foe) }"></i></div>
            <span class="hp-text">{{ foe.hp }} / {{ foe.maxHp }}</span>
            <PokeImg :src="foe.image" :alt="foe.name" :img-class="'side-img foe-img' + (hitFoe ? ' hit-anim hit-flash' : '')" />
          </div>
        </div>

        <!-- 结算 -->
        <div v-if="over" class="battle-result" :class="win ? 'win' : 'lose'">
          <h3>{{ win ? '🏆 挑战成功！获得 ' + curGym.badge : '💤 挑战失败，宝可梦失去了战斗能力' }}</h3>
          <p v-if="win" class="hint-line">徽章已展示到徽章墙，并获得 2 瓶药水补给</p>
          <p v-else class="hint-line">提升宝可梦等级与战力后再来挑战吧（个人中心 → 培养）</p>
          <div style="margin-top: 12px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap">
            <button v-if="win" class="btn btn-yellow btn-sm" @click="backToList">返回道馆列表</button>
            <button v-else class="btn btn-primary btn-sm" @click="openAllyPicker(curGym)">再挑战一次</button>
            <button class="btn btn-ghost btn-sm" @click="backToList">返回</button>
          </div>
        </div>

        <!-- 招式 -->
        <div v-else class="move-box">
          <div v-if="turnBusy" class="turn-wait">⏳ 我方已出招，正在等待对方出招…</div>
          <p class="turn-tip">第 {{ turn }} 回合 · 选择招式</p>
          <div class="move-grid">
            <button v-for="(m, i) in ally.moves" :key="i" class="move-btn" :disabled="turnBusy" @click="playerAttack(m)">
              <span class="mv-name">{{ m.name }}</span>
              <span class="mv-meta">
                <span :class="['type', 'type-' + m.type]">{{ m.type }}</span>
                <span v-if="m.power">威力 {{ m.power }}</span>
                <span>命中 {{ m.acc }}%</span>
              </span>
            </button>
          </div>
        </div>

        <div class="battle-log">
          <p v-for="(l, i) in logs" :key="i">{{ l }}</p>
        </div>
      </div>
    </div>

    <!-- 选择出战宝可梦 -->
    <div v-if="picking" class="modal-mask" @click.self="picking = false">
      <div class="pick-modal">
        <button class="close" @click="picking = false">✕</button>
        <h3>选择出战宝可梦</h3>
        <p class="hint-line" style="margin-bottom: 12px">
          挑战 {{ pickGym.gym }}（{{ pickGym.leader }} · {{ pickGym.type }}属性 · 第 {{ pickGym.localId }} 馆）
        </p>
        <div v-if="game.bag.length === 0" class="lock-tip">
          <span class="ico">🎒</span>背包里还没有宝可梦
          <div style="margin-top: 10px"><router-link to="/adventure" class="btn btn-primary btn-sm">去野外捕捉</router-link></div>
        </div>
        <div v-else class="pick-grid">
          <div v-for="f in game.bag" :key="f.uid" class="pick-card" @click="startBattle(f)">
            <PokeImg :src="f.image" :alt="f.name" img-class="pick-img" />
            <b>{{ f.name }}</b>
            <small>Lv.{{ f.level }} · 战力 {{ f.power }}</small>
            <div class="mini-hp"><i :style="{ width: (f.hp / f.maxHp * 100) + '%' }"></i></div>
            <small class="hp-sm">HP {{ f.hp }}/{{ f.maxHp }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import PokeImg from '../components/PokeImg.vue'
import GameIcon from '../components/GameIcon.vue'
import { pokemonList } from '../api'
import { fetchGyms } from '../api/game'
import { ALL_GYMS, LEAGUES, movesForFighter } from '../data/gameData'
import { game, hasBadge, addBadge, logBattle, grantPotion, isLeagueUnlocked, addCoins, addItem, pushAnnouncement, gainExp, tryEvolve } from '../data/gameStore'
import { ALL_DEX } from '../data/dex'
import { createBattleUnit, calcDamage, hitCheck, aiChooseMove, multText } from '../data/battleEngine'
import { toastOk, toastWarn } from '../utils/toast'
import { useTurnFlow } from '../utils/turnFlow'

const all = ref([])
const region = ref('关都')

// 道馆数据：优先用后端（在线），离线用前端静态 ALL_GYMS
const gymData = ref(ALL_GYMS)

// 9 个地区（每个地区 8 座道馆）
const REGIONS = ['关都', '城都', '丰缘', '神奥', '合众', '卡洛斯', '阿罗拉', '伽勒尔', '帕底亚']
const REGION_FLAG = { 关都: '🔴', 城都: '🟡', 丰缘: '🟢', 神奥: '🔵', 合众: '⚪', 卡洛斯: '🟣', 阿罗拉: '🌺', 伽勒尔: '⚔️', 帕底亚: '🍇' }
const regionTabs = REGIONS.map(r => ({ id: r, name: r + '地区', flag: REGION_FLAG[r] || '📍' }))
// 目前只有关都/城都开放了地区联盟大赛
const LEAGUE_KEY = { 关都: 'kanto', 城都: 'johto' }

const curGyms = computed(() => gymData.value.filter(g => g.region === region.value))
const curLeague = computed(() => LEAGUES[LEAGUE_KEY[region.value]] || null)
const leagueUnlocked = computed(() => (curLeague.value ? isLeagueUnlocked(curLeague.value.requireGymIds) : false))

function badgeCount(rid) {
  return gymData.value.filter(g => g.region === rid && hasBadge(g.id)).length
}
const view = ref('list')
const picking = ref(false)
const pickGym = ref(null)
const curGym = ref(null)
const ally = ref(null)
const curFighter = ref(null)
const foe = ref(null)
const logs = ref([])
const turn = ref(1)
const over = ref(false)
const win = ref(false)

// 全站统一回合锁：我方出招后，必须等敌方出招完成才解锁
const { turnBusy, runTurn, clearTurn } = useTurnFlow()

// 命中特效
const hitFoe = ref(false)
const hitAlly = ref(false)
let hitT1 = null
let hitT2 = null
function triggerHit(side) {
  if (side === 'foe') {
    hitFoe.value = true
    clearTimeout(hitT1)
    hitT1 = setTimeout(() => { hitFoe.value = false }, 420)
  } else {
    hitAlly.value = true
    clearTimeout(hitT2)
    hitT2 = setTimeout(() => { hitAlly.value = false }, 420)
  }
}

// 地区 tab / 当前地区道馆 / 联盟判定已在上方统一定义
function unlockedInRegion(g) {
  if (g.localId === 1) return true
  const prev = curGyms.value.find(x => x.localId === g.localId - 1)
  return prev ? hasBadge(prev.id) : false
}
function warnLocked(g) {
  toastWarn(`请先通过第 ${g.localId - 1} 馆「${curGyms.value.find(x => x.localId === g.localId - 1)?.gym || ''}」，道馆需按动画顺序挑战`)
}
function switchRegion(id) {
  region.value = id
  view.value = 'list'
  ally.value = null
  foe.value = null
}

function hpPercent(u) { return Math.max(0, u.hp / u.maxHp * 100) }
function hpColor(u) {
  const r = u.hp / u.maxHp
  return r > 0.5 ? '#2ecc71' : r > 0.2 ? '#f1c40f' : '#e74c3c'
}

function openAllyPicker(g) {
  pickGym.value = g
  picking.value = true
}

function foeImage(type) {
  const pool = all.value.filter(p => p.category === type || p.category2 === type)
  return pool.length ? pool[0].image : ''
}
function foeName(g) { return g.team[g.team.length - 1] }

function startBattle(fighter) {
  clearTurn()
  const g = pickGym.value
  curFighter.value = fighter
  picking.value = false
  curGym.value = g
  view.value = 'battle'
  logs.value = []
  turn.value = 1
  over.value = false
  win.value = false

  const src = all.value.find(p => String(p.number) === String(fighter.number))
  const allyUnit = createBattleUnit(
    src || { number: fighter.number, name: fighter.name, image: fighter.image, category: fighter.category, category2: fighter.category2 },
    fighter.level, fighter.shiny
  )
  allyUnit.maxHp = fighter.maxHp
  allyUnit.hp = fighter.maxHp
  allyUnit.moves = movesForFighter(fighter, src)
  ally.value = allyUnit

  const level = 12 + g.difficulty * 4
  const foeUnit = createBattleUnit({ number: '000', name: foeName(g), image: foeImage(g.type), category: g.type, category2: null }, level)
  foeUnit.maxHp = g.hp
  foeUnit.hp = g.hp
  foe.value = foeUnit
}

function doAttack(attacker, defender, move, tag) {
  if (!move || !move.power) { logs.value.push(`${tag} 使出了「${move ? move.name : '—'}」`); return }
  if (!hitCheck(move)) { logs.value.push(`💨 ${tag} 的「${move.name}」没有命中！`); return }
  const { dmg, mult, crit } = calcDamage(attacker, defender, move)
  defender.hp = Math.max(0, defender.hp - dmg)
  triggerHit(defender === foe.value ? 'foe' : 'ally')
  logs.value.push(`⚔ ${tag} 使用「${move.name}」，造成 ${dmg} 伤害（${multText(mult)}${crit ? ' 会心一击！' : ''}）`)
}

function playerAttack(move) {
  if (over.value || turnBusy.value) return
  runTurn(
    () => {
      logs.value.push(`—— 第 ${turn.value} 回合 ——`)
      doAttack(ally.value, foe.value, move, ally.value.name)
      if (foe.value.hp <= 0) { finish(true); return true }
      return false
    },
    () => {
      const foeMove = aiChooseMove(foe.value, ally.value)
      doAttack(foe.value, ally.value, foeMove, foe.value.name)
      if (ally.value.hp <= 0) { finish(false); return true }
      turn.value++
      return false
    }
  )
}

function finish(isWin) {
  over.value = true
  win.value = isWin
  if (isWin) {
    const isNew = !hasBadge(curGym.value.id)
    const early = curGym.value.localId <= 4
    addBadge(curGym.value.id)
    grantPotion(2)
    // 奖励：1-4 馆 200 币 + 超级球×2 + 好伤药×2；5-8 馆 500 币 + 高级球×2 + 厉害伤药×2
    const coin = early ? 200 : 500
    addCoins(coin)
    addItem(early ? '超级球' : '高级球', 2)
    addItem(early ? '好伤药' : '厉害伤药', 2)
    addItem(early ? '伤药' : '全复药', early ? 2 : 1)
    logBattle({ type: '道馆挑战', opponent: curGym.value.leader + '（' + curGym.value.gym + '）', result: '胜利 · 获得' + curGym.value.badge })
    logs.value.push(`🏆 ${curGym.value.leader} 的宝可梦倒下了，你获得了${curGym.value.badge}！`)
    logs.value.push(`🎁 奖励：${coin} 币、${early ? '超级球×2、好伤药×2' : '高级球×2、厉害伤药×2、全复药×1'}`)
    // 全服公告
    const uname = (JSON.parse(sessionStorage.getItem('pokemon_user') || '{}').username) || '训练家'
    pushAnnouncement(`【全服公告】玩家${uname}成功战胜${curGym.value.gym}馆主${curGym.value.leader}，获得${curGym.value.badge}！`)
    if (isNew) toastOk(`获得${curGym.value.badge}！奖励 ${coin} 币已到账`)
    else toastWarn('这枚徽章你已经拥有，不重复发放')

    // 出战宝可梦获得经验并尝试进化
    const f = curFighter.value
    if (f) {
      const exp = early ? 80 : 150
      const ups = gainExp(f, exp)
      const evo = tryEvolve(f, ALL_DEX)
      if (ups.length) logs.value.push(`✨ ${f.name} 升到了 Lv.${f.level}！`)
      if (ups.learned && ups.learned.length) {
        ups.learned.forEach(l => logs.value.push(`📖 ${f.name} 学会了「${l.name}」！`))
      }
      if (evo.evolved) {
        logs.value.push(`✨ 恭喜！${evo.from} 进化成了 ${evo.to}！`)
        toastOk(`${evo.from} 进化成了 ${evo.to}！`)
      }
    }
  } else {
    logBattle({ type: '道馆挑战', opponent: curGym.value.leader + '（' + curGym.value.gym + '）', result: '失败' })
    logs.value.push(`💤 ${ally.value.name} 失去了战斗能力…`)
  }
}

function backToList() {
  clearTurn()
  view.value = 'list'
  ally.value = null
  foe.value = null
}

onMounted(async () => {
  const res = await pokemonList()
  all.value = res.code === 200 ? res.data : []
  // 在线模式：拉取后端道馆数据（字段名映射为前端格式）
  const gs = await fetchGyms()
  if (gs && gs.length) {
    gymData.value = gs.map(g => {
      let team = []
      try { team = JSON.parse(g.teamJson || '[]') } catch (e) { team = [] }
      return { ...g, gym: g.name, team }
    })
  }
})
</script>

<style scoped>
.badge-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.badge-head h3 { margin-bottom: 0; }
.badge-wall { display: grid; grid-template-columns: repeat(8, 1fr); gap: 16px; padding-top: 10px; }
/* 相框陈列样式 */
.badge-slot { position: relative; background: linear-gradient(160deg, #FBFCFE, #F2F4F9); border: 3px solid #DDE2EC; border-radius: 8px; padding: 14px 4px 10px; text-align: center; opacity: .62; box-shadow: inset 0 0 0 2px #fff, 0 4px 10px rgba(0, 0, 0, .05); transition: all .2s; }
.badge-slot::before { content: ""; position: absolute; top: -9px; left: 50%; transform: translateX(-50%); width: 16px; height: 9px; border-radius: 3px; background: #CBD2DE; }
.badge-slot.got { background: linear-gradient(160deg, #FFFDF4, #FFF2CE); border-color: #E3BE55; opacity: 1; box-shadow: inset 0 0 0 2px #fff, 0 6px 16px rgba(227, 190, 85, .30); }
.badge-slot.got::before { background: #D9B54A; }
.badge-slot.got:hover { transform: translateY(-3px); }
.bs-ico { font-size: 24px; display: flex; align-items: center; justify-content: center; height: 38px; }
.bs-lock { font-size: 20px; opacity: .8; }
.badge-slot small { font-size: 10px; color: var(--ink-light); }
.league-unlocked { margin-top: 14px; background: #eafaf0; border: 2px solid #a8e6bd; border-radius: 12px; padding: 12px 14px; font-size: 13px; font-weight: 700; color: #1e8449; text-align: center; }
.league-unlocked a { color: #1e8449; text-decoration: underline; }

.gym-list { display: flex; flex-direction: column; gap: 14px; margin-top: 18px; }
.gym-card { display: flex; justify-content: space-between; align-items: center; gap: 14px; background: #fff; border: 2px solid var(--line); border-radius: 16px; padding: 18px; transition: all .18s; }
.gym-card:hover { border-color: var(--poke-yellow); box-shadow: 0 6px 18px rgba(0, 0, 0, .06); }
.gym-card.cleared { border-left: 6px solid #2ecc71; }
.gym-card.locked { opacity: .62; background: #fafbfd; filter: grayscale(.55); }
.gym-left { display: flex; gap: 14px; align-items: flex-start; flex: 1; }
.gym-idx { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, var(--poke-red), var(--poke-yellow)); color: #fff; font-weight: 900; font-size: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.gym-card h3 { font-size: 18px; display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.gym-card h3 small { font-size: 12px; color: var(--ink-light); font-weight: 400; }
.gym-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 8px 0 6px; }
.stars { font-size: 12px; color: #e67e22; font-weight: 700; }
.team { font-size: 12px; color: var(--ink-light); }
.badge-name { font-size: 11px; color: #b8860b; background: #fff7d6; padding: 3px 9px; border-radius: 10px; display: inline-flex; align-items: center; gap: 4px; }
.gym-intro { font-size: 13px; color: var(--ink-light); line-height: 1.7; }
.gym-right { flex-shrink: 0; }
.state-tag { font-size: 12px; font-weight: 800; padding: 5px 12px; border-radius: 12px; white-space: nowrap; }
.state-tag.got { background: #e6f7e6; color: #2e9e4f; }
.state-tag.locked { background: #f2f4f8; color: #999; cursor: pointer; border: none; }

.battle-panel { margin-top: 18px; }
.battle-top { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.battle-title { font-weight: 800; color: var(--ink); }
.arena { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; background: linear-gradient(135deg, #fff8e1, #eef2ff); border-radius: 16px; padding: 18px; }
.side { display: flex; flex-direction: column; gap: 6px; }
.foe-side { align-items: flex-start; }
.ally-side { align-items: flex-end; }
.side-name { font-weight: 800; font-size: 15px; }
.side-name small { color: var(--ink-light); font-weight: 400; }
.hp-bar { width: 100%; max-width: 240px; height: 10px; background: #e8ebf2; border-radius: 6px; overflow: hidden; }
.hp-bar i { display: block; height: 100%; transition: width .35s; border-radius: 6px; }
.hp-text { font-size: 11px; color: var(--ink-light); font-variant-numeric: tabular-nums; }
.side-img { width: 120px; height: 120px; object-fit: contain; }
.foe-img { transform: scaleX(-1); }

.move-box { margin-top: 18px; }
.turn-tip { font-size: 13px; font-weight: 700; color: var(--ink-light); margin-bottom: 10px; }
.turn-wait { background: #fff7e6; border: 2px dashed var(--poke-orange); color: #8a5a1a; border-radius: 10px; padding: 8px 12px; margin-bottom: 10px; font-size: 12.5px; font-weight: 800; text-align: center; animation: gymTurnPulse 1s ease-in-out infinite; }
@keyframes gymTurnPulse { 0%,100%{opacity:1} 50%{opacity:.6} }
.move-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.move-btn { background: #fff; border: 2px solid var(--line); border-radius: 12px; padding: 10px 14px; text-align: left; transition: all .15s; }
.move-btn:hover { border-color: var(--poke-red); background: #fff7f7; transform: translateY(-2px); }
.move-btn:disabled { opacity: .45; cursor: not-allowed; }
.move-btn:disabled:hover { border-color: var(--line); background: #fff; transform: none; }
.mv-name { display: block; font-weight: 800; font-size: 14px; margin-bottom: 4px; color: var(--ink); }
.mv-meta { display: flex; gap: 8px; align-items: center; font-size: 11px; color: var(--ink-light); flex-wrap: wrap; }

.battle-log { margin-top: 16px; background: #f8f9fc; border: 2px solid var(--line); border-radius: 12px; padding: 12px 14px; max-height: 200px; overflow-y: auto; font-size: 12.5px; line-height: 1.9; color: var(--ink); }
.battle-result { text-align: center; padding: 26px 10px; border-radius: 14px; margin-top: 16px; }
.battle-result.win { background: #eafaf0; border: 2px solid #a8e6bd; }
.battle-result.lose { background: #fdf0f0; border: 2px solid #f5c6c6; }
.battle-result h3 { font-size: 20px; margin-bottom: 6px; }

.modal-mask { position: fixed; inset: 0; background: rgba(33, 33, 33, .58); display: flex; align-items: center; justify-content: center; z-index: 60; padding: 20px; }
.pick-modal { width: 100%; max-width: 640px; background: #fff; border: 4px solid var(--poke-yellow); border-radius: 20px; padding: 24px; position: relative; max-height: 86vh; overflow-y: auto; }
.close { position: absolute; top: 12px; right: 14px; width: 30px; height: 30px; border-radius: 50%; background: var(--line); }
.pick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
.pick-card { background: #f9fafd; border: 2px solid var(--line); border-radius: 12px; padding: 10px; text-align: center; cursor: pointer; transition: all .15s; }
.pick-card:hover { border-color: var(--poke-red); transform: translateY(-3px); }
.pick-img { width: 66px; height: 66px; object-fit: contain; }
.pick-card b { display: block; font-size: 14px; }
.pick-card small { font-size: 11px; color: var(--ink-light); }
.mini-hp { height: 6px; background: #e8ebf2; border-radius: 4px; overflow: hidden; margin: 5px 0 2px; }
.mini-hp i { display: block; height: 100%; background: #2ecc71; }
.hp-sm { font-size: 10px; color: #aaa; }
@media (max-width: 640px) { .badge-wall { grid-template-columns: repeat(4, 1fr); } .gym-card { flex-direction: column; align-items: flex-start; } }
</style>
