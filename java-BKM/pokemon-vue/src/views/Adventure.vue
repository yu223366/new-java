<template>
  <div class="page">
    <NavBar />
    <div class="wrap">
      <div class="page-head">
        <h1>🌿 野外冒险捕捉</h1>
        <span class="sub">10 种场景 · 遇怪率 50% · 打残可提升捕捉率 · 神兽与闪光极稀有</span>
      </div>

      <!-- 场景选择 -->
      <div class="zone-grid">
        <div v-for="z in WILD_ZONES" :key="z.id"
          :class="['zone-card', { active: zone && zone.id === z.id, locked: !regionOk(z.region) }]"
          @click="pickZone(z)">
          <span class="z-ico">{{ z.icon }}</span>
          <b>{{ z.name }}</b>
          <span class="z-kind">{{ z.kind }} · {{ z.region }}</span>
          <small>{{ z.desc }}</small>
          <span v-if="!regionOk(z.region)" class="z-lock">🔒 需集齐关都 8 徽章</span>
          <span v-else-if="zone && zone.id === z.id" class="z-badge">探索中</span>
        </div>
      </div>

      <div v-if="zone" class="scene-hint">💡 {{ zone.hint }}</div>

      <!-- ============ 探索 / 战斗区 ============ -->
      <div class="panel explore" :class="zone ? 'zone-bg-' + zone.id : ''">
        <div class="explore-head">
          <h3>{{ zone ? zone.icon + ' ' + zone.name : '🌍 请选择一个场景' }}</h3>
          <div class="ball-bag">
            <span class="bag-count">💰 {{ game.coins }} 币</span>
            <span class="bag-count">🎒 精灵 {{ game.bag.length }}/{{ BAG_MAX }}</span>
            <button class="btn btn-ghost btn-sm" @click="goMarket">🛒 去市集</button>
          </div>
        </div>

        <!-- 待探索 -->
        <div v-if="state === 'idle'" class="explore-body">
          <p class="empty-tip"><span class="big">{{ zone ? '🔎' : '🗺️' }}</span>
            {{ zone ? '点击下方按钮搜索野生宝可梦（50% 遇怪概率）' : '先在上方选择一个探索场景' }}
          </p>
          <button v-if="zone" class="btn btn-primary" @click="explore">🔎 探索一次</button>
        </div>

        <!-- 火箭队彩蛋 -->
        <div v-else-if="state === 'rocket'" class="explore-body">
          <div class="rocket-panel">
            <div class="rocket-crew">
              <span class="rk-logo" title="火箭队 Team Rocket">R</span>
              <span class="rk-member">武藏</span>
              <span class="rk-member">小次郎</span>
              <span class="rk-member rk-cat">喵喵</span>
            </div>
            <div class="rocket-lines">
              <p>「既然你诚心诚意地发问了！」</p>
              <p>「那我们就大发慈悲地告诉你！」</p>
              <p>「为了防止世界被破坏，为了守护世界的和平！」</p>
              <p>「贯彻爱与真实的邪恶，可爱又迷人的反派角色——」</p>
              <p class="rk-roll">武藏！小次郎！我们是穿梭在银河的火箭队！</p>
              <p>「白洞，白色的明天在等着我们！」</p>
              <p class="rk-cat">就是这样，喵～</p>
            </div>
            <p class="rocket-result">可他们还没动手，就被皮卡丘一发十万伏特打飞了——「好讨厌的感觉啊！」</p>
            <p class="rocket-drop">🎁 他们掉落了：{{ rocketDrop }}</p>
          </div>
          <div style="margin-top: 14px">
            <button class="btn btn-yellow btn-sm" @click="state = 'idle'">继续冒险</button>
          </div>
        </div>

        <!-- 战斗 -->
        <template v-else-if="state === 'battle' && b">
          <div class="arena">
            <div class="side">
              <span class="side-name">{{ myUnit.name }} <small>Lv.{{ myUnit.level }} · 我方</small></span>
              <div class="hp-bar"><i :style="{ width: hpPct(myUnit.hp, myUnit.maxHp) + '%', background: hpColor(myUnit.hp, myUnit.maxHp) }"></i></div>
              <span class="hp-text">{{ myUnit.hp }} / {{ myUnit.maxHp }}</span>
              <span class="hp-text">第 {{ b.turn }} 回合</span>
              <PokeImg :src="myUnit.image" :alt="myUnit.name" :img-class="'side-img' + (hitMine ? ' hit-anim hit-flash' : '')" />
            </div>
            <div class="side" style="align-items: flex-end">
              <span class="side-name">{{ b.foe.name }} <small>Lv.{{ b.foe.level }} · 野生</small></span>
              <div class="hp-bar"><i :style="{ width: hpPct(b.foe.hp, b.foe.maxHp) + '%', background: hpColor(b.foe.hp, b.foe.maxHp) }"></i></div>
              <span class="hp-text">{{ b.foe.hp }} / {{ b.foe.maxHp }}</span>
              <div class="status-line">
                <span v-if="b.foe.shiny" class="st shiny">✨闪光</span>
                <span v-if="b.foeStatus" class="st">{{ b.foeStatus }}</span>
                <span class="st tier">{{ tierLabel }}</span>
              </div>
              <PokeImg :src="b.foe.image" :alt="b.foe.name" :img-class="'side-img flip' + (hitFoe ? ' hit-anim hit-flash' : '')" />
            </div>
          </div>

          <!-- 结算 -->
          <div v-if="b.over" class="battle-result" :class="b.result === 'win' || b.result === 'caught' ? 'win' : 'lose'">
            <h3>{{ resultText }}</h3>
            <p class="hint-line">{{ resultTip }}</p>
            <div style="margin-top: 12px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap">
              <button class="btn btn-primary btn-sm" @click="state = 'idle'">返回</button>
              <router-link to="/trainer" class="btn btn-ghost btn-sm">查看背包</router-link>
              <router-link to="/market" class="btn btn-ghost btn-sm">去市集补给</router-link>
            </div>
          </div>

          <div v-else class="action-area">
            <div v-if="turnBusy" class="turn-wait">⏳ 我方已出招，正在等待对方出招…</div>
            <div class="act-tabs">
              <button v-for="t in actTabs" :key="t.key" :class="['act-tab', { active: act === t.key }]" @click="act = t.key">{{ t.label }}</button>
            </div>

            <!-- 招式 -->
            <div v-if="act === 'move'" class="move-grid">
              <button v-for="(m, i) in b.moves" :key="i" class="move-btn" :disabled="b.pp[i] <= 0 || turnBusy" @click="useSkill(i)">
                <span class="mv-name">{{ m.name }}</span>
                <span class="mv-meta">
                  <span :class="['type', 'type-' + m.type]">{{ m.type }}</span>
                  <span>{{ m.cat }}</span>
                  <span v-if="m.power">威力 {{ m.power }}</span>
                  <span>PP {{ b.pp[i] }}</span>
                </span>
              </button>
            </div>

            <!-- 背包（球 / 药） -->
            <div v-else-if="act === 'bag'" class="bag-act">
              <p class="turn-tip">投掷精灵球（当前捕获率 {{ catchRatePct }}%）</p>
              <div class="ball-row">
                <button v-for="bl in BALLS" :key="bl.name" class="ball-opt" :disabled="itemCount(bl.name) <= 0 || turnBusy" @click="throwBall(bl.name)">
                  <GameIcon kind="ball" :name="bl.name" :size="30" />
                  <b>{{ bl.name }}</b>
                  <small>×{{ itemCount(bl.name) }}</small>
                </button>
              </div>
              <p class="turn-tip" style="margin-top: 12px">使用药品</p>
              <div class="ball-row">
                <button v-for="md in healMeds" :key="md.name" class="ball-opt" :disabled="itemCount(md.name) <= 0 || turnBusy" @click="useMed(md)">
                  <GameIcon kind="medicine" :name="md.name" :size="30" />
                  <b>{{ md.name }}</b>
                  <small>×{{ itemCount(md.name) }}</small>
                </button>
              </div>
            </div>

            <!-- 换精灵 -->
            <div v-else-if="act === 'switch'" class="switch-grid">
              <div v-for="f in game.bag" :key="f.uid" :class="['switch-card', { dead: f.hp <= 0, cur: f.uid === b.myUid, busy: turnBusy }]" @click="switchTo(f)">
                <PokeImg :src="f.image" :alt="f.name" img-class="sw-img" />
                <b>{{ f.name }}</b>
                <small v-if="f.hp > 0">HP {{ f.hp }}/{{ f.maxHp }}</small>
                <small v-else class="dead-text">已倒下</small>
              </div>
            </div>

            <!-- 逃跑 -->
            <div v-else class="flee-box">
              <p class="turn-tip">确定要逃跑吗？有 50% 成功率</p>
              <button class="btn btn-ghost btn-sm" :disabled="turnBusy" @click="tryFlee">🏃 尝试逃跑</button>
            </div>
          </div>

          <div class="battle-log">
            <p v-for="(l, i) in logs" :key="i">{{ l }}</p>
          </div>
        </template>
      </div>

      <!-- 捕捉历史 -->
      <div class="panel">
        <h3>📜 捕捉历史记录（最近 10 条）</h3>
        <ul v-if="game.captureLog.length" class="record-list">
          <li v-for="(r, i) in game.captureLog.slice(0, 10)" :key="i">
            <span class="time">{{ r.time }}</span>
            <span>{{ r.zone }} · {{ r.name }}</span>
            <span v-if="r.shiny" class="tagline" style="background:#fff3cd;color:#b8860b">✨闪光</span>
            <span class="tagline" :style="r.result.includes('成功') ? 'background:#e6f7e6;color:#2e9e4f;margin-left:auto' : 'background:#fdecec;color:#c0392b;margin-left:auto'">{{ r.result }}</span>
          </li>
        </ul>
        <p v-else class="empty-tip" style="padding: 26px 0">还没有捕捉记录，快去野外碰碰运气吧 🌱</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import PokeImg from '../components/PokeImg.vue'
import GameIcon from '../components/GameIcon.vue'
import { ALL_DEX } from '../data/dex'
import { WILD_ZONES, movesFor as movesForPoke, movesForFighter } from '../data/gameData'
import { BALLS, MEDICINES, calcCatchRate, catchTier } from '../data/shop'
import {
  game, catchPokemon, canCatch, itemCount, useItem, addItem, addCoins,
  gainExp, tryEvolve, pushAnnouncement, BAG_MAX
} from '../data/gameStore'
import { createBattleUnit, calcDamage, hitCheck, aiChooseMove, multText } from '../data/battleEngine'
import { toastOk, toastWarn, toastErr } from '../utils/toast'
import { useTurnFlow } from '../utils/turnFlow'

const router = useRouter()
const route = useRoute()
// 全站统一回合锁：我方出招后，必须等敌方出招完成才解锁
const { turnBusy, runTurn, clearTurn } = useTurnFlow()

const state = ref('idle')   // idle | rocket | battle
const zone = ref(null)
const act = ref('move')
const logs = ref([])
const b = ref(null)
const hitFoe = ref(false)
const hitMine = ref(false)
const rocketDrop = ref('')
let hitT1 = null, hitT2 = null

const actTabs = [
  { key: 'move', label: '⚔ 招式' },
  { key: 'bag', label: '🎒 背包' },
  { key: 'switch', label: '🔄 换精灵' },
  { key: 'flee', label: '🏃 逃跑' }
]

const healMeds = MEDICINES.filter(m => m.heal)
const myUnit = ref({ name: '—', level: 1, hp: 0, maxHp: 1, image: '', moves: [] })

// 所有地区野外均无限制（不再按徽章解锁）
function regionOk() { return true }
function hpPct(hp, max) { return Math.max(0, (hp / max) * 100) }
function hpColor(hp, max) {
  const r = hp / max
  return r > 0.5 ? '#2ecc71' : r > 0.2 ? '#f1c40f' : '#e74c3c'
}

const tierLabel = computed(() => {
  if (!b.value) return ''
  const t = catchTier(b.value.foe.rarity, b.value.foe.shiny)
  return t === '神兽' ? '传说级' : t
})
const resultText = computed(() => {
  if (!b.value) return ''
  if (b.value.result === 'win') return '🏆 野生宝可梦倒下了'
  if (b.value.result === 'caught') return '🎉 捕捉成功！'
  if (b.value.result === 'flee') return '🏃 成功逃走了'
  return '💤 你的宝可梦失去了战斗能力'
})
const resultTip = computed(() => {
  if (!b.value) return ''
  if (b.value.result === 'win') return `获得 ${b.value.gainExp} 经验、${b.value.gainCoin} 币（昏厥的宝可梦无法捕捉）`
  if (b.value.result === 'caught') return `已存入背包 · 获得 ${b.value.gainExp} 经验、${b.value.gainCoin} 币`
  if (b.value.result === 'flee') return '安全脱离战斗'
  return '请到宝可梦中心治疗或通过对战提升等级再来'
})

const catchRatePct = computed(() => {
  if (!b.value) return 0
  const ball = BALLS.find(x => x.name === '精灵球')
  const tier = catchTier(b.value.foe.rarity, b.value.foe.shiny)
  const { rate } = calcCatchRate({
    tier,
    hpRatio: b.value.foe.hp / b.value.foe.maxHp,
    hasStatus: !!b.value.foeStatus,
    ball,
    turn: b.value.turn,
    zoneKind: zone.value ? zone.value.kind : ''
  })
  return Math.round(rate * 100)
})

const pick = arr => arr[Math.floor(Math.random() * arr.length)]

function pickZone(z) {
  if (!regionOk(z.region)) { toastWarn('你还没有集齐前置徽章，暂时无法前往该地区！'); return }
  zone.value = z
  state.value = 'idle'
  b.value = null
}

function goMarket() { router.push('/market') }

/** 探索：8% 火箭队彩蛋；50% 遇怪 */
function explore() {
  if (!zone.value) return
  if (Math.random() < 0.08) {
    if (Math.random() < 0.55) { addItem('精灵球', 2); rocketDrop.value = '精灵球 ×2' }
    else { addItem('伤药', 1); rocketDrop.value = '伤药 ×1' }
    state.value = 'rocket'
    return
  }
  if (Math.random() >= 0.5) { toastWarn('这次什么都没有遇到…再试一次吧'); return }
  if (game.bag.length >= BAG_MAX) { toastErr(`背包已满（${BAG_MAX} 只），请先整理背包`); return }

  const z = zone.value
  const legendOk = (z.legend || []).filter(n => canCatch(n).ok)
  const rareOk = (z.rare || []).filter(n => canCatch(n).ok)
  const normalOk = (z.pool || []).filter(n => canCatch(n).ok)
  if (!legendOk.length && !rareOk.length && !normalOk.length) {
    toastWarn('这个场景的宝可梦你都已收服啦，换个场景试试')
    return
  }

  // 权重（总 91）：神兽 1 / 稀有 14 / 闪光 1 / 普通 75
  const r = Math.random() * 91
  let tierKey = 'normal'
  let num = null
  let shiny = false
  if (r < 1 && legendOk.length) { tierKey = 'legend'; num = pick(legendOk) }
  else if (r < 15 && rareOk.length) { tierKey = 'rare'; num = pick(rareOk) }
  else if (r < 16) { tierKey = 'shiny'; shiny = true; num = pick(normalOk.length ? normalOk : (rareOk.length ? rareOk : legendOk)) }
  else { num = pick(normalOk.length ? normalOk : (rareOk.length ? rareOk : legendOk)) }

  if (num == null) return
  const dexItem = ALL_DEX.find(p => p.id === Number(num))
  if (!dexItem) return
  startBattle(dexItem, tierKey, shiny)
}

function startBattle(dexItem, tierKey, shiny) {
  clearTurn()
  const mine = game.bag.find(f => f.hp > 0)
  if (!mine) { toastErr('没有可以出战的宝可梦，先去个人中心用药或补充队伍'); return }

  const myDex = ALL_DEX.find(p => String(p.number) === String(mine.number))
  const unit = createBattleUnit(myDex || { number: mine.number, name: mine.name, image: mine.image, category: mine.category, category2: mine.category2 }, mine.level, mine.shiny)
  unit.maxHp = mine.maxHp
  unit.hp = Math.min(mine.hp, mine.maxHp)
  unit.moves = movesForFighter(mine, myDex)
  myUnit.value = unit

  // 神兽固定 75 级；我方 50 级前野生宝可梦等级在自己等级左右，50 级后 1~100 随机
  let level
  if (tierKey === 'legend') {
    level = 75
  } else if (mine.level < 50) {
    level = Math.max(1, Math.min(100, mine.level + Math.floor(Math.random() * 7) - 3))
  } else {
    level = Math.floor(Math.random() * 100) + 1
  }
  const foe = createBattleUnit(dexItem, level, shiny)
  // 我方招式列表（用我方宝可梦的技能，而非野生宝可梦）
  const moves = unit.moves.slice(0, 4)

  b.value = {
    foe,
    foeStatus: '',
    foeTier: tierKey,
    myUid: mine.uid,
    moves,
    pp: moves.map(() => 10),
    turn: 1,
    over: false,
    result: '',
    gainExp: 0,
    gainCoin: 0
  }
  logs.value = [`野生的${foe.name}${shiny ? '（✨闪光）' : ''}出现了！`]
  act.value = 'move'
  state.value = 'battle'
}

function triggerHit(side) {
  if (side === 'foe') { hitFoe.value = true; clearTimeout(hitT1); hitT1 = setTimeout(() => { hitFoe.value = false }, 420) }
  else { hitMine.value = true; clearTimeout(hitT2); hitT2 = setTimeout(() => { hitMine.value = false }, 420) }
}

function attack(a, d, move, tag) {
  if (!move) return
  if (!hitCheck(move)) { logs.value.push(`【未命中】${tag}的「${move.name}」没有命中！`); return }
  if (!move.power) { logs.value.push(`${tag}使用了「${move.name}」`); return }
  const { dmg, mult, crit } = calcDamage(a, d, move)
  d.hp = Math.max(0, d.hp - dmg)
  triggerHit(d === b.value.foe ? 'foe' : 'mine')
  logs.value.push(`【命中】${tag}使用了「${move.name}」！造成 ${dmg} 伤害（${multText(mult)}${crit ? ' 会心一击' : ''}）`)
}

function useSkill(i) {
  const bt = b.value
  if (!bt || bt.over || turnBusy.value) return
  if (bt.pp[i] <= 0) { toastWarn('这个招式PP已经用完了，无法使用！'); return }
  bt.pp[i]--
  runTurn(
    () => {
      logs.value.push(`—— 第 ${bt.turn} 回合 ——`)
      attack(myUnit.value, bt.foe, bt.moves[i], `我方·${myUnit.value.name}`)
      syncMyHp()
      if (bt.foe.hp <= 0) { foeDown(); return true }
      return false
    },
    () => {
      aiTurn()
      if (!bt.over) bt.turn++
      return bt.over
    }
  )
}

function aiTurn() {
  const bt = b.value
  if (!bt || bt.foe.hp <= 0) return
  if (bt.foeStatus === '麻痹' && Math.random() < 0.25) {
    logs.value.push(`${bt.foe.name} 因麻痹无法行动！`)
    return
  }
  const fm = aiChooseMove(bt.foe, myUnit.value)
  attack(bt.foe, myUnit.value, fm, bt.foe.name)
  if (myUnit.value.hp <= 0) myDown()
}

function syncMyHp() {
  const f = game.bag.find(x => x.uid === b.value.myUid)
  if (f) f.hp = Math.max(0, myUnit.value.hp)
}

// 野外对战胜利掉落：按权重随机掉落精灵球 / 药品 / 技能道具
const DROP_POOL = [
  { name: '精灵球', qty: 1, weight: 30 },
  { name: '伤药', qty: 1, weight: 25 },
  { name: '好伤药', qty: 1, weight: 15 },
  { name: '超级球', qty: 1, weight: 10 },
  { name: 'PP小补剂', qty: 1, weight: 8 },
  { name: '技能光盘TM', qty: 1, weight: 5 },
  { name: '大师球', qty: 1, weight: 1 }
]
function rollDrops() {
  if (Math.random() > 0.65) return []
  const total = DROP_POOL.reduce((n, d) => n + d.weight, 0)
  let r = Math.random() * total
  for (const d of DROP_POOL) {
    r -= d.weight
    if (r <= 0) return [d]
  }
  return []
}

function foeDown() {
  const bt = b.value
  bt.over = true
  bt.result = 'win'
  const exp = 20 + bt.foe.level * 2
  const coin = 10 + bt.foe.level
  bt.gainExp = exp
  bt.gainCoin = coin
  addCoins(coin)
  logs.value.push(`野生${bt.foe.name}倒下了，无法再捕捉，获得经验！`)
  // 掉落奖励
  const drops = rollDrops()
  drops.forEach(d => {
    addItem(d.name, d.qty)
    logs.value.push(`🎁 ${bt.foe.name} 掉落了「${d.name}」×${d.qty}！`)
  })
  const f = game.bag.find(x => x.uid === bt.myUid)
  if (f) {
    const ups = gainExp(f, exp)
    const evo = tryEvolve(f, ALL_DEX)
    if (ups.length) logs.value.push(`恭喜！${f.name} 升到了 Lv.${f.level}！`)
    if (ups.learned && ups.learned.length) {
      ups.learned.forEach(l => logs.value.push(`📖 ${f.name} 学会了「${l.name}」！`))
    }
    if (evo.evolved) {
      logs.value.push(`✨ 恭喜！${evo.from} 进化成了 ${evo.to}！`)
      toastOk(`${evo.from} 进化成了 ${evo.to}！`)
    }
  }
}

function myDown() {
  const bt = b.value
  syncMyHp()
  logs.value.push(`💤 ${myUnit.value.name} 失去了战斗能力`)
  const alive = game.bag.filter(f => f.hp > 0)
  if (!alive.length) {
    bt.over = true
    bt.result = 'lose'
    logs.value.push('全部宝可梦失去战斗能力，对战失败')
    return
  }
  toastWarn('你的宝可梦倒下了，请换一只继续战斗')
  act.value = 'switch'
}

function switchTo(f) {
  const bt = b.value
  if (!bt || bt.over || turnBusy.value) return
  if (f.hp <= 0) { toastWarn('这只宝可梦已失去战斗能力'); return }
  if (f.uid === bt.myUid) { toastWarn('它已经在场上了'); return }
  runTurn(
    () => {
      syncMyHp()
      const myDex = ALL_DEX.find(p => String(p.number) === String(f.number))
      const unit = createBattleUnit(myDex || { number: f.number, name: f.name, image: f.image, category: f.category, category2: f.category2 }, f.level, f.shiny)
      unit.maxHp = f.maxHp
      unit.hp = f.hp
      unit.moves = movesForPoke(myDex || { category: f.category })
      myUnit.value = unit
      bt.myUid = f.uid
      bt.moves = unit.moves
      bt.pp = unit.moves.map(() => 10)
      logs.value.push(`🔄 我方换上了 ${f.name}（消耗本回合）`)
      act.value = 'move'
      return false
    },
    () => {
      aiTurn()
      if (!bt.over) bt.turn++
      return bt.over
    }
  )
}

function useMed(md) {
  const bt = b.value
  if (!bt || bt.over || turnBusy.value) return
  if (itemCount(md.name) <= 0) { toastWarn('没有这个药品了'); return }
  if (myUnit.value.hp >= myUnit.value.maxHp) { toastWarn('HP 已满，无需使用'); return }
  runTurn(
    () => {
      useItem(md.name, 1)
      const heal = md.heal >= 9999 ? myUnit.value.maxHp : md.heal
      myUnit.value.hp = Math.min(myUnit.value.maxHp, myUnit.value.hp + heal)
      syncMyHp()
      logs.value.push(`使用「${md.name}」，${myUnit.value.name} 回复了 ${heal} HP`)
      return false
    },
    () => {
      aiTurn()
      if (!bt.over) bt.turn++
      return bt.over
    }
  )
}

function throwBall(ballName) {
  const bt = b.value
  if (!bt || bt.over || turnBusy.value) return
  if (itemCount(ballName) <= 0) { toastWarn('没有这个精灵球了'); return }
  const ball = BALLS.find(x => x.name === ballName)
  const tier = catchTier(bt.foe.rarity, bt.foe.shiny)
  const { rate, parts } = calcCatchRate({
    tier,
    hpRatio: bt.foe.hp / bt.foe.maxHp,
    hasStatus: !!bt.foeStatus,
    ball,
    turn: bt.turn,
    zoneKind: zone.value ? zone.value.kind : ''
  })
  useItem(ballName, 1)
  logs.value.push(`投出了${ballName}！（成功率 ${Math.round(rate * 100)}%${parts.capped ? '，已封顶 90%' : ''}）`)

  runTurn(
    () => {
      if (Math.random() < rate) {
        const dexItem = ALL_DEX.find(p => String(p.number) === String(bt.foe.number))
        const fighter = catchPokemon(
          dexItem || { number: bt.foe.number, name: bt.foe.name, image: bt.foe.image, category: bt.foe.category, category2: bt.foe.category2 },
          zone.value.name, ballName, bt.foe.shiny
        )
        if (!fighter) {
          bt.over = true
          bt.result = 'lose'
          logs.value.push('捕捉未生效：背包已满或已拥有该宝可梦')
          return true
        }
        bt.over = true
        bt.result = 'caught'
        const exp = 30 + bt.foe.level * 2
        const coin = 15 + bt.foe.level * 2
        bt.gainExp = exp
        bt.gainCoin = coin
        addCoins(coin)
        logs.value.push(`太棒了！成功收服${fighter.name}！`)
        toastOk(`捕捉成功：${fighter.name}${bt.foe.shiny ? '（✨闪光）' : ''}`)
        if (tier === '神兽') {
          const uname = (JSON.parse(sessionStorage.getItem('pokemon_user') || '{}').username) || '训练家'
          pushAnnouncement(`【全服公告】玩家${uname}成功捕获神兽${fighter.name}！`)
        }
        const f = game.bag.find(x => x.uid === bt.myUid)
        if (f) {
          const ups = gainExp(f, exp)
          if (ups.length) logs.value.push(`我方 ${f.name} 升到了 Lv.${f.level}`)
          if (ups.learned && ups.learned.length) {
            ups.learned.forEach(l => logs.value.push(`📖 ${f.name} 学会了「${l.name}」！`))
          }
        }
        return true
      }
      logs.value.push(`只差一点！${bt.foe.name} 挣脱了精灵球！`)
      return false
    },
    () => {
      aiTurn()
      if (!bt.over) bt.turn++
      return bt.over
    }
  )
}

function tryFlee() {
  const bt = b.value
  if (!bt || bt.over || turnBusy.value) return
  runTurn(
    () => {
      if (Math.random() < 0.5) {
        bt.over = true
        bt.result = 'flee'
        logs.value.push('成功逃离了战斗')
        return true
      }
      logs.value.push('逃跑失败！')
      return false
    },
    () => {
      aiTurn()
      if (!bt.over) bt.turn++
      return bt.over
    }
  )
}

onMounted(() => {
  zone.value = WILD_ZONES.find(z => regionOk(z.region)) || WILD_ZONES[0]
  if (route.query.rocket === '1') {
    rocketDrop.value = '精灵球 ×2'
    state.value = 'rocket'
  }
})
onUnmounted(() => { clearTimeout(hitT1); clearTimeout(hitT2) })
</script>

<style scoped>
.zone-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(228px, 1fr)); gap: 14px; margin-bottom: 16px; }
.zone-card { position: relative; background: #fff; border: 3px solid var(--line); border-radius: 16px; padding: 16px; cursor: pointer; transition: all .18s; display: flex; flex-direction: column; gap: 4px; }
.zone-card:hover { border-color: var(--poke-orange); transform: translateY(-3px); }
.zone-card.active { border-color: var(--poke-red); background: #fffdf5; box-shadow: 0 8px 22px rgba(232, 93, 74, .12); }
.zone-card.locked { opacity: .62; filter: grayscale(.55); }
.z-ico { font-size: 28px; }
.zone-card b { font-size: 16px; color: var(--ink); }
.z-kind { font-size: 11px; font-weight: 800; color: var(--poke-blue); background: var(--poke-blue-soft); padding: 2px 9px; border-radius: 9px; align-self: flex-start; }
.zone-card small { font-size: 12px; color: var(--ink-light); line-height: 1.6; }
.z-badge { position: absolute; top: 10px; right: 12px; font-size: 10px; font-weight: 800; background: var(--poke-red); color: #fff; padding: 2px 8px; border-radius: 10px; }
.z-lock { position: absolute; top: 10px; right: 12px; font-size: 10px; font-weight: 800; background: #f0f2f6; color: #7a8291; padding: 2px 8px; border-radius: 10px; }

.scene-hint { background: #f0f7ff; border-left: 4px solid var(--poke-blue); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #2c3e70; margin-bottom: 16px; }

.explore-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
.ball-bag { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.bag-count { font-size: 11px; font-weight: 800; color: var(--poke-blue); background: var(--poke-blue-soft); padding: 4px 10px; border-radius: 10px; }
.explore-body { text-align: center; padding: 18px 0 6px; }
.explore { transition: background .55s ease; }
.zone-bg-grass, .zone-bg-forest { background: linear-gradient(180deg, #F5FBF3 0%, #EAF7E6 100%); border-color: #CFE9C6; }
.zone-bg-cave, .zone-bg-mine { background: linear-gradient(180deg, #F4F3F8 0%, #E7E4F0 100%); border-color: #D9D5E6; }
.zone-bg-water, .zone-bg-beach { background: linear-gradient(180deg, #F2F9FF 0%, #E3F0FC 100%); border-color: #C9E2F7; }
.zone-bg-desert, .zone-bg-canyon { background: linear-gradient(180deg, #FDF8EC 0%, #F7EDD3 100%); border-color: #EBDCB5; }
.zone-bg-snow { background: linear-gradient(180deg, #F7FBFF 0%, #E8F2FA 100%); border-color: #CFE2F0; }
.zone-bg-volcano { background: linear-gradient(180deg, #FFF5F0 0%, #FBE3D8 100%); border-color: #F2C9B4; }

.arena { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; background: linear-gradient(135deg, #fff8e1, #eef2ff); border-radius: 16px; padding: 16px; margin-top: 8px; }
.side { display: flex; flex-direction: column; gap: 5px; }
.side-name { font-weight: 800; font-size: 15px; }
.side-name small { color: var(--ink-light); font-weight: 400; }
.hp-bar { width: 100%; max-width: 240px; height: 10px; background: #e8ebf2; border-radius: 6px; overflow: hidden; }
.hp-bar i { display: block; height: 100%; transition: width .35s; border-radius: 6px; }
.hp-text { font-size: 11px; color: var(--ink-light); }
.status-line { display: flex; gap: 6px; flex-wrap: wrap; }
.st { font-size: 10.5px; font-weight: 800; padding: 2px 8px; border-radius: 8px; background: #f0f2f6; color: #7a8291; }
.st.shiny { background: #fff3cd; color: #b8860b; }
.st.tier { background: #eef2ff; color: var(--poke-blue); }
.side-img { width: 110px; height: 110px; object-fit: contain; }
.flip { transform: scaleX(-1); }

.action-area { margin-top: 14px; }
.act-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.act-tab { padding: 7px 16px; border-radius: 18px; background: #fff; border: 2px solid var(--line); font-size: 12.5px; font-weight: 700; color: var(--ink); }
.act-tab.active { background: var(--poke-blue); border-color: var(--poke-blue); color: #fff; }
.move-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; }
.move-btn { background: #fff; border: 2px solid var(--line); border-radius: 12px; padding: 10px 13px; text-align: left; transition: all .15s; }
.move-btn:hover:not(:disabled) { border-color: var(--poke-red); background: #fff7f7; transform: translateY(-2px); }
.move-btn:disabled { opacity: .45; cursor: not-allowed; }
.turn-wait { background: #fff7e6; border: 2px dashed var(--poke-orange); color: #8a5a1a; border-radius: 10px; padding: 8px 12px; margin-bottom: 12px; font-size: 12.5px; font-weight: 800; text-align: center; animation: turnPulse 1s ease-in-out infinite; }
@keyframes turnPulse { 0%,100%{opacity:1} 50%{opacity:.6} }
.mv-name { display: block; font-weight: 800; font-size: 13.5px; margin-bottom: 4px; }
.mv-meta { display: flex; gap: 7px; align-items: center; font-size: 11px; color: var(--ink-light); flex-wrap: wrap; }
.ball-row { display: flex; gap: 10px; flex-wrap: wrap; }
.ball-opt { display: flex; flex-direction: column; align-items: center; gap: 1px; background: #fff; border: 2px solid var(--line); border-radius: 12px; padding: 9px 14px; min-width: 84px; }
.ball-opt:hover:not(:disabled) { border-color: var(--poke-orange); }
.ball-opt:disabled { opacity: .4; cursor: not-allowed; }
.ball-opt small { font-size: 10px; color: #aaa; }
.bo-ico { font-size: 19px; }
.switch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 10px; }
.switch-card { background: #f9fafd; border: 2px solid var(--line); border-radius: 12px; padding: 8px 6px; text-align: center; cursor: pointer; }
.switch-card:hover { border-color: var(--poke-orange); }
.switch-card.dead { opacity: .45; cursor: not-allowed; }
.switch-card.cur { border-color: var(--poke-red); background: #fff5f5; }
.switch-card.busy, .switch-card.busy:hover { opacity: .45; cursor: not-allowed; border-color: var(--line); transform: none; }
.sw-img { width: 52px; height: 52px; object-fit: contain; }
.switch-card b { display: block; font-size: 12px; }
.switch-card small { font-size: 10px; color: var(--ink-light); }
.dead-text { color: #c0392b; }
.flee-box { text-align: center; padding: 16px 0; }
.turn-tip { font-size: 12.5px; color: var(--ink-light); font-weight: 700; margin-bottom: 8px; }
.battle-log { margin-top: 14px; background: #f8f9fc; border: 2px solid var(--line); border-radius: 12px; padding: 12px 14px; max-height: 180px; overflow-y: auto; font-size: 12.5px; line-height: 1.9; }
.battle-result { text-align: center; padding: 22px 10px; border-radius: 14px; margin-top: 14px; }
.battle-result.win { background: #eafaf0; border: 2px solid #a8e6bd; }
.battle-result.lose { background: #fdf0f0; border: 2px solid #f5c6c6; }
.battle-result h3 { font-size: 19px; margin-bottom: 6px; }

.rocket-panel { background: linear-gradient(135deg, #fff5f5, #fffaf0); border: 2px dashed #e9b3b3; border-radius: 16px; padding: 20px 22px; display: inline-block; max-width: 560px; }
.rocket-crew { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.rk-logo { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #c0392b, #8e2b20); color: #fff; font-weight: 900; font-size: 20px; line-height: 1; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(192, 57, 43, .3); font-family: Georgia, serif; }
.rk-member { font-size: 13px; font-weight: 800; color: #c0392b; background: #fff; border: 2px solid #f3c6c6; padding: 5px 14px; border-radius: 12px; }
.rk-member.rk-cat { color: #b8860b; border-color: #f0dda0; background: #fffdf2; }
.rocket-lines { text-align: center; line-height: 2; font-size: 13.5px; color: #5a3a3a; }
.rocket-lines p { margin: 0; }
.rocket-lines .rk-roll { font-weight: 900; color: #c0392b; margin: 4px 0; }
.rocket-lines .rk-cat { color: #b8860b; font-weight: 700; }
.rocket-result { margin-top: 14px; padding-top: 12px; border-top: 1px dashed #f0c6c6; font-size: 13px; color: var(--ink); line-height: 1.8; }
.rocket-drop { font-size: 13px; font-weight: 800; color: #b8860b; margin-top: 6px; }
</style>
