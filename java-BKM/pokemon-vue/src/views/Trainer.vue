<template>
  <div class="page">
    <NavBar />
    <div class="wrap">
      <div class="page-head">
        <h1>👤 个人训练家中心</h1>
        <span class="sub">背包 · 徽章墙 · 孵化 · 联盟大赛 · 收集进度 · 全部记录</span>
      </div>

      <!-- 训练家名片 -->
      <div class="panel trainer-card">
        <div class="tc-left">
          <div class="avatar">{{ userName.slice(0, 1) }}</div>
          <div>
            <h2 class="tc-name">
              {{ userName }}
              <span v-if="championBadges.length" class="champ-badge">👑 {{ championBadges.join(' / ') }}冠军</span>
            </h2>
            <p class="hint-line">
              训练家等级 <b>Lv.{{ trainerLevel }}</b> · 徽章 <b>{{ game.badges.length }}/16</b> · 药水 <b>{{ game.potions }}</b> 瓶
              · 精灵 <b>{{ game.bag.length }}/{{ BAG_MAX }}</b>
            </p>
          </div>
        </div>
        <div class="tc-right">
          <div class="prog-box">
            <span>📖 图鉴收集 {{ progress.percent }}%</span>
            <div class="bar"><i :style="{ width: progress.percent + '%' }"></i></div>
            <small>{{ progress.caught }} / {{ progress.total }} 只</small>
          </div>
        </div>
      </div>

      <!-- 图鉴收集进度（御三家 / 神兽 / 全国） -->
      <div class="panel">
        <h3>📊 图鉴收集进度</h3>
        <div class="collect-row">
          <div class="collect-item">
            <div class="collect-head"><span>🌱 御三家（全世代）</span><b>{{ starterStat.caught }}/{{ starterStat.total }}</b></div>
            <div class="bar"><i :style="{ width: starterStat.pct + '%', background: 'linear-gradient(90deg,#43c48b,#8fd14f)' }"></i></div>
          </div>
          <div class="collect-item">
            <div class="collect-head"><span>🌟 神兽 / 幻兽</span><b>{{ legendStat.caught }}/{{ legendStat.total }}</b></div>
            <div class="bar"><i :style="{ width: legendStat.pct + '%', background: 'linear-gradient(90deg,#ffd76b,#e8a33d)' }"></i></div>
          </div>
          <div class="collect-item">
            <div class="collect-head"><span>📖 全国图鉴</span><b>{{ allStat.caught }}/{{ allStat.total }}</b></div>
            <div class="bar"><i :style="{ width: allStat.pct + '%' }"></i></div>
          </div>
        </div>
      </div>

      <div class="tabs">
        <button v-for="t in tabs" :key="t" :class="['tab-btn', { active: tab === t }]" @click="tab = t">{{ t }}</button>
      </div>

      <!-- ============ 精灵背包 ============ -->
      <template v-if="tab === '🎒 精灵背包'">
        <div class="panel">
          <div class="head-row">
            <h3>🎒 我的精灵背包（{{ game.bag.length }} / {{ BAG_MAX }}）</h3>
          </div>
          <p class="hint-line" style="margin-bottom: 10px">背包上限 {{ BAG_MAX }} 只，满后将无法继续捕捉。等级靠对战经验自动提升（每 100 经验升 1 级）。</p>
          <div v-if="!game.bag.length" class="lock-tip">
            <span class="ico">🎒</span>背包空空如也
            <div style="margin-top: 10px">
              <router-link to="/adventure" class="btn btn-primary btn-sm">去野外捕捉</router-link>
              <a class="btn btn-ghost btn-sm" style="margin-left: 8px" @click.prevent="tab = '🥚 孵化所'">去孵蛋</a>
            </div>
          </div>
          <div v-else class="bag-grid">
            <div v-for="f in game.bag" :key="f.uid" class="bag-card">
              <span class="badge lv-普通">Lv.{{ f.level }}</span>
              <PokeImg :src="f.image" :alt="f.name" img-class="bag-img" />
              <b>{{ f.name }}</b>
              <small class="hint-line">战力 {{ f.power }}</small>
              <div class="bar" style="height: 8px; margin: 5px 0 3px"><i :style="{ width: (f.hp / f.maxHp * 100) + '%' }"></i></div>
              <small class="hint-line">HP {{ f.hp }} / {{ f.maxHp }}</small>
              <div class="bar exp-bar" style="height: 6px; margin: 5px 0 3px"><i :style="{ width: Math.min(100, ((f.exp || 0) / 100) * 100) + '%' }"></i></div>
              <small class="hint-line exp-text">EXP {{ f.exp || 0 }} / 100</small>
              <div class="bag-actions">
                <button class="mini-btn" @click="heal(f)">💊 用药</button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ============ 物品背包 ============ -->
      <template v-else-if="tab === '🧰 物品背包'">
        <div class="panel">
          <h3>🧰 物品背包</h3>
          <p class="hint-line" style="margin-bottom:14px">存放精灵球、药品与技能道具，可在野外冒险和对战中使用。</p>

          <h4 style="font-size:14px;color:var(--poke-blue);margin-bottom:8px">⚪ 精灵球</h4>
          <div class="item-grid">
            <div v-for="(qty, name) in game.balls" :key="name" v-show="qty > 0" class="item-cell">
              <GameIcon kind="ball" :name="name" :size="34" />
              <b>{{ name }}</b>
              <small class="hint-line">×{{ qty }}</small>
            </div>
          </div>

          <h4 style="font-size:14px;color:var(--poke-blue);margin:18px 0 8px">💊 药品 / 技能道具</h4>
          <div class="item-grid">
            <div v-for="(qty, name) in game.bagItems" :key="name" v-show="qty > 0" class="item-cell">
              <GameIcon :kind="itemIconKind(name)" :name="name" :size="34" />
              <b>{{ name }}</b>
              <small class="hint-line">×{{ qty }}</small>
            </div>
          </div>

          <div v-if="!hasAnyItem" class="lock-tip" style="margin-top:14px">
            <span class="ico">🧰</span>背包空空如也，去<router-link to="/market">市集</router-link>购买或到野外对战获取
          </div>
        </div>
      </template>

      <!-- ============ 徽章墙 ============ -->
      <template v-else-if="tab === '🏅 徽章墙'">
        <div v-for="grp in regionBadgeGroups" :key="grp.region" class="panel">
          <h3>{{ grp.region }}徽章墙（{{ grp.got }}/8）</h3>
          <div class="badge-wall">
            <div v-for="g in grp.list" :key="g.id" :class="['badge-slot', { got: hasBadge(g.id) }]">
              <span class="bs-ico">
                <GameIcon v-if="hasBadge(g.id)" kind="badge" :name="g.badge" :type="g.type" :size="32" />
                <span v-else class="bs-lock">🔒</span>
              </span>
              <small>{{ hasBadge(g.id) ? g.badge : '未获得' }}</small>
              <small class="hint-line">{{ g.leader }}</small>
            </div>
          </div>
        </div>
        <div class="panel" style="text-align: center">
          <router-link to="/gyms" class="btn btn-primary btn-sm">前往道馆挑战</router-link>
        </div>
      </template>

      <!-- ============ 孵化所 ============ -->
      <template v-else-if="tab === '🥚 孵化所'">
        <div class="panel">
          <div class="head-row">
            <h3>🥚 精灵孵化系统</h3>
            <button class="btn btn-yellow btn-sm" :disabled="eggCd > 0" @click="getEgg">
              {{ eggCd > 0 ? '冷却中 ' + fmtDur(eggCd) : '领取一颗宝可梦蛋' }}
            </button>
          </div>
          <p class="hint-line" style="margin-bottom: 14px">
            每小时仅可领取 1 颗宝可梦蛋，蛋会在 5 分钟后孵化（演示加速）。
            孵化时有概率孵出史诗 / 传说宝可梦，并有 8% 概率孵出闪光宝可梦。
            若孵出的宝可梦已拥有或背包已满，将自动补偿 3 瓶药水。
          </p>
          <p v-if="eggCd > 0" class="hint-line egg-cd">
            ⏳ 下一次领取将在 <b>{{ fmtDur(eggCd) }}</b> 后解锁
          </p>
          <div v-if="!game.eggs.length" class="lock-tip">
            <span class="ico">🥚</span>还没有宝可梦蛋，点右上角「领取一颗宝可梦蛋」
          </div>
          <div v-else class="egg-grid">
            <div v-for="e in game.eggs" :key="e.id" :class="['egg-card', { ready: isReady(e) }]">
              <div class="egg-ico">{{ isReady(e) ? '🐣' : '🥚' }}</div>
              <b>{{ e.name }}</b>
              <p v-if="!isReady(e)" class="countdown">{{ fmt(remain(e)) }}</p>
              <p v-else class="ready-text">✨ 可以孵化了！</p>
              <button v-if="isReady(e)" class="btn btn-primary btn-sm" @click="hatch(e)">立即孵化</button>
            </div>
          </div>
        </div>
      </template>

      <!-- ============ 联盟大赛 ============ -->
      <template v-else-if="tab === '👑 联盟大赛'">
        <div class="league-pick">
          <div v-for="lg in leagueList" :key="lg.id" :class="['league-card', { unlocked: lg.unlocked }]" @click="lg.unlocked && selectLeague(lg.id)">
            <h3>{{ lg.region }}联盟大赛</h3>
            <p class="hint-line">{{ lg.desc }}</p>
            <div class="bar" style="height: 10px; margin: 10px 0 6px"><i :style="{ width: lg.badgeCount / 8 * 100 + '%' }"></i></div>
            <small class="hint-line">徽章 {{ lg.badgeCount }}/8</small>
            <p v-if="!lg.unlocked" class="lock-text">🔒 还差 {{ 8 - lg.badgeCount }} 枚徽章解锁</p>
            <p v-else-if="lg.champion" class="champ-text">👑 已夺冠</p>
            <p v-else class="open-text">点击进入 →</p>
          </div>
        </div>

        <template v-if="leagueSelected">
          <div v-if="curLeagueChampion" class="panel champ-panel">
            <h3 style="justify-content: center">👑 你已成为{{ curLeague.region }}联盟冠军！</h3>
            <p class="hint-line">四大天王与冠军全部败于你手，专属冠军标识已点亮。</p>
          </div>

          <div class="panel">
            <div class="beat-head">
              <h3>👑 {{ curLeague.name }}</h3>
              <button class="btn btn-ghost btn-sm" @click="leagueSelected = null">切换联盟</button>
            </div>

            <div class="league-steps">
              <div v-for="(o, i) in leagueOpponents" :key="i"
                :class="['step', { done: leagueProgress(leagueRegion) > i, cur: leagueProgress(leagueRegion) === i }]">
                <span class="step-idx">{{ i + 1 }}</span>
                <span>{{ o.name }}</span>
                <small>{{ o.title }}</small>
              </div>
            </div>

            <div v-if="leagueStage === 'idle'" style="text-align: center; padding: 20px 0">
              <p class="hint-line" style="margin-bottom: 8px">
                下一位对手：<b>{{ curOpponent.title }} · {{ curOpponent.name }}</b>（{{ curOpponent.type }}属性）
              </p>
              <p class="hint-line" style="margin-bottom: 12px">
                出战宝可梦：{{ bestFighter ? bestFighter.name + ' Lv.' + bestFighter.level : '背包中暂无宝可梦' }}
              </p>
              <button class="btn btn-primary" :disabled="!bestFighter" @click="startLeague">⚔ 挑战 {{ curOpponent.name }}</button>
            </div>

            <template v-else>
              <div class="arena">
                <div class="side">
                  <span class="side-name">{{ lu.name }} <small>Lv.{{ lu.level }} · 我方</small></span>
                  <div class="hp-bar"><i :style="{ width: hpPct(lu) + '%', background: hpCol(lu) }"></i></div>
                  <span class="hp-text">{{ lu.hp }} / {{ lu.maxHp }}</span>
                  <PokeImg :src="lu.image" :alt="lu.name" img-class="side-img" />
                </div>
                <div class="side" style="align-items: flex-end">
                  <span class="side-name">{{ luFoe.name }} <small>Lv.{{ luFoe.level }} · {{ curOpponent.name }}</small></span>
                  <div class="hp-bar"><i :style="{ width: hpPct(luFoe) + '%', background: hpCol(luFoe) }"></i></div>
                  <span class="hp-text">{{ luFoe.hp }} / {{ luFoe.maxHp }}</span>
                  <PokeImg :src="luFoe.image" :alt="luFoe.name" img-class="side-img flip" />
                </div>
              </div>

              <div v-if="!luOver" class="move-box">
                <div v-if="turnBusy" class="turn-wait">⏳ 我方已出招，正在等待对方出招…</div>
                <p class="turn-tip">第 {{ luRound }} 回合 · 选择招式</p>
                <div class="move-grid">
                  <button v-for="(m, i) in lu.moves" :key="i" class="move-btn" :disabled="turnBusy" @click="leagueAct(m)">
                    <span class="mv-name">{{ m.name }}</span>
                    <span class="mv-meta">
                      <span :class="['type', 'type-' + m.type]">{{ m.type }}</span>
                      <span v-if="m.power">威力 {{ m.power }}</span>
                      <span>命中 {{ m.acc }}%</span>
                    </span>
                  </button>
                </div>
              </div>
              <div v-else class="battle-result" :class="luWin ? 'win' : 'lose'">
                <h3>{{ luWin ? '🏆 击败 ' + curOpponent.name + '！' : '💤 惜败于 ' + curOpponent.name }}</h3>
                <p class="hint-line">{{ luWin ? (curLeagueChampion ? '你已登顶该地区联盟！' : '向下一关进发') : '培养更强的宝可梦再来挑战吧' }}</p>
                <div style="margin-top: 12px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap">
                  <button v-if="!luWin" class="btn btn-primary btn-sm" @click="startLeague">再挑战一次</button>
                  <button class="btn btn-ghost btn-sm" @click="leagueStage = 'idle'">返回</button>
                </div>
              </div>

              <div class="battle-log">
                <p v-for="(l, i) in luLogs" :key="i">{{ l }}</p>
              </div>
            </template>
          </div>
        </template>
      </template>

      <!-- ============ 收藏与记录 ============ -->
      <template v-else>
        <div class="panel">
          <h3>⭐ 我的收藏（{{ game.favorites.length }}）</h3>
          <div v-if="!game.favorites.length" class="lock-tip" style="padding: 24px 0">
            还没有收藏，在<router-link to="/pokedex">图鉴</router-link>里点 ☆ 收藏喜欢的宝可梦
          </div>
          <div v-else class="mini-grid">
            <div v-for="n in game.favorites" :key="n" class="mini-card" @click="goDex(n)">
              <PokeImg v-if="dexOf(n)" :src="dexOf(n).image" :alt="dexOf(n).name" img-class="mini-img" />
              <span>{{ dexOf(n) ? dexOf(n).name : '#' + n }}</span>
            </div>
          </div>
        </div>

        <div class="panel">
          <h3>⚔️ 全部对战记录（{{ game.battleLog.length }}）</h3>
          <ul v-if="game.battleLog.length" class="record-list">
            <li v-for="(r, i) in game.battleLog" :key="i">
              <span class="time">{{ r.time }}</span>
              <span class="tagline">{{ r.type }}</span>
              <span>vs {{ r.opponent }}</span>
              <span :style="r.result.includes('胜') ? 'color:#2e9e4f;font-weight:800;margin-left:auto' : 'color:#c0392b;font-weight:800;margin-left:auto'">{{ r.result }}</span>
            </li>
          </ul>
          <p v-else class="empty-tip" style="padding: 24px 0">暂无对战记录</p>
        </div>

        <div class="panel">
          <h3>🌿 全部捕捉记录（{{ game.captureLog.length }}）</h3>
          <ul v-if="game.captureLog.length" class="record-list">
            <li v-for="(r, i) in game.captureLog" :key="i">
              <span class="time">{{ r.time }}</span>
              <span>{{ r.zone }} · {{ r.name }}</span>
              <span v-if="r.shiny" class="tagline" style="background:#fff3cd;color:#b8860b">✨闪光</span>
              <span class="tagline" style="margin-left:auto">{{ r.result }}</span>
            </li>
          </ul>
          <p v-else class="empty-tip" style="padding: 24px 0">暂无捕捉记录</p>
        </div>

        <div class="panel" style="text-align: center">
          <h3 style="justify-content: center">🔄 重置玩法存档</h3>
          <p class="hint-line" style="margin-bottom: 12px">清空背包、徽章、蛋与所有记录（不影响登录账号）</p>
          <button class="btn btn-ghost btn-sm" @click="showReset = true">重置存档</button>
        </div>
      </template>
    </div>

    <!-- 重置二次确认 -->
    <div v-if="showReset" class="modal-mask" @click.self="showReset = false">
      <div class="confirm-box">
        <h3>⚠️ 确认重置存档？</h3>
        <p class="hint-line">
          将清空：精灵背包（{{ game.bag.length }} 只）、徽章（{{ game.badges.length }} 枚）、
          孵化中的蛋、所有对战与捕捉记录。<br />
          登录账号不受影响，此操作不可撤销。
        </p>
        <div class="confirm-actions">
          <button class="btn btn-ghost btn-sm" @click="showReset = false">取消</button>
          <button class="btn btn-primary btn-sm" @click="doReset">确认重置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import PokeImg from '../components/PokeImg.vue'
import GameIcon from '../components/GameIcon.vue'
import { pokemonList } from '../api'
import { ALL_GYMS, LEAGUES, movesForFighter } from '../data/gameData'
import { ALL_DEX } from '../data/dex'
import { STARTER_IDS } from '../data/starters'
import { BALLS } from '../data/shop'
import {
  game, progress, hasBadge, addEgg, hatchEgg, usePotion,
  leagueProgress, isLeagueUnlocked, clearLeagueStage,
  becomeChampion, resetGame, logBattle, BAG_MAX, eggCooldownRemain
} from '../data/gameStore'
import { createBattleUnit, calcDamage, hitCheck, aiChooseMove, multText } from '../data/battleEngine'
import { useTurnFlow } from '../utils/turnFlow'
import { toastOk, toastWarn } from '../utils/toast'

const router = useRouter()
const user = JSON.parse(sessionStorage.getItem('pokemon_user') || '{}')
const userName = user.username || '训练家'

const tabs = ['🎒 精灵背包', '🧰 物品背包', '🏅 徽章墙', '🥚 孵化所', '👑 联盟大赛', '⭐ 收藏与记录']
const tab = ref('🎒 精灵背包')

const all = ref([])
const nowTick = ref(Date.now())
let timer = null
const showReset = ref(false)

const trainerLevel = computed(() => 1 + game.bag.length + game.badges.length * 2 + championBadges.value.length * 10)

// ===== 图鉴收集（御三家 / 神兽 / 全国）=====
const starterStat = computed(() => {
  const total = STARTER_IDS.length
  const caught = game.bag.filter(f => STARTER_IDS.includes(Number(f.number))).length
  return { caught, total, pct: total ? Math.round(caught / total * 100) : 0 }
})
const legendStat = computed(() => {
  const legends = ALL_DEX.filter(p => ['神兽', '幻兽'].includes(p.rarity))
  const caught = game.bag.filter(f => legends.some(l => String(l.number) === String(f.number))).length
  return { caught, total: legends.length, pct: legends.length ? Math.round(caught / legends.length * 100) : 0 }
})
const allStat = computed(() => {
  const total = ALL_DEX.length
  const caught = new Set(game.bag.map(f => String(f.number))).size
  return { caught, total, pct: total ? Math.round(caught / total * 100) : 0 }
})
const kantoCount = computed(() => ALL_GYMS.filter(g => g.region === '关都' && hasBadge(g.id)).length)
const johtoCount = computed(() => ALL_GYMS.filter(g => g.region === '城都' && hasBadge(g.id)).length)

// 9 个地区的徽章分组（每区 8 枚）
const REGIONS9 = ['关都', '城都', '丰缘', '神奥', '合众', '卡洛斯', '阿罗拉', '伽勒尔', '帕底亚']
const regionBadgeGroups = computed(() => REGIONS9.map(r => {
  const list = ALL_GYMS.filter(g => g.region === r)
  return { region: r, list, got: list.filter(g => hasBadge(g.id)).length }
}))
const championBadges = computed(() => {
  const arr = []
  if (game.champion && game.champion.kanto) arr.push('关都')
  if (game.champion && game.champion.johto) arr.push('城都')
  return arr
})

// ===== 用药 =====
function heal(f) {
  const r = usePotion(f.uid, 50)
  if (r.ok) { toastOk(r.msg) } else toastWarn(r.msg)
}

// ===== 物品背包 =====
function itemIconKind(name) {
  if (BALLS.some(b => b.name === name)) return 'ball'
  if (name === '技能光盘TM' || name === '秘传学习器HM') return 'tm'
  if (name === 'PP小补剂' || name === 'PP全补剂' || name === 'PP提升剂') return 'pp'
  if (name === '心之鳞片' || name === '神奇糖果') return 'gem'
  return 'medicine'
}
const hasAnyItem = computed(() => {
  const hasBall = Object.values(game.balls).some(v => v > 0)
  const hasItem = Object.values(game.bagItems).some(v => v > 0)
  return hasBall || hasItem
})

// ===== 孵化 =====
const eggCd = computed(() => { void nowTick.value; return eggCooldownRemain() })
function fmtDur(ms) {
  const s = Math.ceil(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h} 小时 ${m} 分`
  if (m > 0) return `${m} 分 ${sec} 秒`
  return `${sec} 秒`
}
function getEgg() {
  if (eggCooldownRemain() > 0) { toastWarn('孵化装置冷却中，请稍后再来'); return }
  const e = addEgg(5)
  if (!e) { toastWarn('领取失败，请稍后再试'); return }
  toastOk(`获得一颗「${e.name}」的宝可梦蛋，5 分钟后可孵化`)
}
function remain(e) { return Math.max(0, e.startAt + e.duration - nowTick.value) }
function isReady(e) { return remain(e) <= 0 }
function fmt(ms) {
  const s = Math.ceil(ms / 1000)
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
}
function hatch(e) {
  const r = hatchEgg(e)
  if (!r) return
  if (r.blocked) {
    toastWarn(`${r.name} 无法入包（${r.msg}），已补偿 3 瓶药水`)
    return
  }
  toastOk(`孵化成功：${r.name}${r.shiny ? '（✨闪光）' : ''}`)
}

// ===== 收藏 =====
function dexOf(n) { return all.value.find(p => String(p.number) === String(n)) }
function goDex(n) { const p = dexOf(n); router.push({ path: '/pokedex', query: { keyword: p ? p.name : n } }) }

// ===== 联盟大赛 =====
const leagueRegion = ref('kanto')
const leagueSelected = ref(null)
const leagueStage = ref('idle')
const lu = ref(null)
const luFoe = ref(null)
const luLogs = ref([])
const luRound = ref(1)
const luOver = ref(false)
const luWin = ref(false)

// 全站统一回合锁：我方出招后，必须等敌方出招完成才解锁
const { turnBusy, runTurn, clearTurn } = useTurnFlow()

const leagueList = computed(() => ['kanto', 'johto'].map(id => {
  const l = LEAGUES[id]
  const count = id === 'kanto' ? kantoCount.value : johtoCount.value
  return {
    id, region: l.region, desc: l.desc, badgeCount: count,
    unlocked: isLeagueUnlocked(l.requireGymIds),
    champion: !!(game.champion && game.champion[id])
  }
}))
const curLeague = computed(() => LEAGUES[leagueRegion.value])
const curLeagueChampion = computed(() => !!(game.champion && game.champion[leagueRegion.value]))
const leagueOpponents = computed(() => [...curLeague.value.elite, curLeague.value.champion])
const curOpponent = computed(() => leagueOpponents.value[Math.max(0, Math.min(leagueProgress(leagueRegion.value), 4))])
const bestFighter = computed(() => {
  if (!game.bag.length) return null
  return [...game.bag].sort((a, b) => b.power - a.power)[0]
})

function selectLeague(id) {
  leagueRegion.value = id
  leagueSelected.value = id
  leagueStage.value = 'idle'
}

function hpPct(u) { return u ? Math.max(0, (u.hp / u.maxHp) * 100) : 0 }
function hpCol(u) { const r = u.hp / u.maxHp; return r > 0.5 ? '#2ecc71' : r > 0.2 ? '#f1c40f' : '#e74c3c' }

function startLeague() {
  clearTurn()
  if (!bestFighter.value) { toastWarn('背包中还没有可出战的宝可梦'); return }
  const f = bestFighter.value
  const src = all.value.find(p => String(p.number) === String(f.number))
  const ally = createBattleUnit(src || { number: f.number, name: f.name, image: f.image, category: f.category, category2: f.category2 }, f.level, f.shiny)
  ally.maxHp = f.maxHp
  ally.hp = f.maxHp
  ally.moves = movesForFighter(f, src)
  lu.value = ally

  const o = curOpponent.value
  const imgPool = all.value.filter(p => p.category === o.type)
  const foe = createBattleUnit({ number: '000', name: o.name, image: imgPool.length ? imgPool[0].image : '', category: o.type, category2: null }, 50 + leagueProgress(leagueRegion.value) * 8)
  foe.maxHp = o.hp
  foe.hp = o.hp
  luFoe.value = foe

  luLogs.value = [`👑 ${curLeague.value.name}：挑战 ${o.title} ${o.name}！`]
  luRound.value = 1
  luOver.value = false
  luWin.value = false
  leagueStage.value = 'battle'
}

function luExchange(attacker, defender, move, tag) {
  if (!move) return
  if (!hitCheck(move)) { luLogs.value.push(`💨 ${tag} 的「${move.name}」未命中！`); return }
  if (!move.power) {
    const heal = Math.round(attacker.maxHp * 0.3)
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal)
    luLogs.value.push(`✨ ${tag} 使用「${move.name}」，回复 ${heal} HP`)
    return
  }
  const { dmg, mult, crit } = calcDamage(attacker, defender, move)
  defender.hp = Math.max(0, defender.hp - dmg)
  luLogs.value.push(`⚔ ${tag} 使用「${move.name}」，造成 ${dmg} 伤害（${multText(mult)}${crit ? ' 会心！' : ''}）`)
}

function leagueAct(move) {
  if (luOver.value || turnBusy.value) return
  runTurn(
    () => {
      luLogs.value.push(`—— 第 ${luRound.value} 回合 ——`)
      luExchange(lu.value, luFoe.value, move, '我方·' + lu.value.name)
      if (luFoe.value.hp <= 0) { luFinish(true); return true }
      return false
    },
    () => {
      const fm = aiChooseMove(luFoe.value, lu.value)
      luExchange(luFoe.value, lu.value, fm, curOpponent.value.name + '·' + luFoe.value.name)
      if (lu.value.hp <= 0) { luFinish(false); return true }
      luRound.value++
      return false
    }
  )
}

function luFinish(win) {
  luOver.value = true
  luWin.value = win
  const o = curOpponent.value
  const region = leagueRegion.value
  if (win) {
    luLogs.value.push(`🏆 ${o.name} 倒下了！`)
    clearLeagueStage(region)
    logBattle({ type: '联盟大赛', opponent: o.title + ' ' + o.name, result: '胜利' })
    if (leagueProgress(region) >= 5) {
      const first = becomeChampion(region)
      luLogs.value.push('👑 恭喜！你已成为该地区联盟冠军！')
      if (first) toastOk(`👑 夺冠！奖励：药水 +5、大师球 ×1`)
      else toastWarn('该地区冠军奖励已领取过，不重复发放')
    }
  } else {
    luLogs.value.push(`💤 ${lu.value.name} 失去了战斗能力…`)
    logBattle({ type: '联盟大赛', opponent: o.title + ' ' + o.name, result: '失败' })
  }
}

// ===== 重置 =====
function doReset() {
  resetGame()
  showReset.value = false
  toastOk('存档已重置')
}

onMounted(async () => {
  const res = await pokemonList()
  all.value = res.code === 200 ? res.data : []
  timer = setInterval(() => { nowTick.value = Date.now() }, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.trainer-card { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
.tc-left { display: flex; align-items: center; gap: 16px; }
.avatar { width: 62px; height: 62px; border-radius: 50%; background: linear-gradient(135deg, var(--poke-red), var(--poke-yellow)); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 900; flex-shrink: 0; box-shadow: 0 6px 16px rgba(238, 21, 21, .22); }
.tc-name { font-size: 22px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.champ-badge { font-size: 12px; background: linear-gradient(135deg, #ffd700, #ffb300); color: #5a3d00; font-weight: 900; padding: 4px 12px; border-radius: 12px; }
.tc-right { min-width: 240px; flex: 1; max-width: 340px; }
.prog-box { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--ink-light); }
.prog-box .bar { height: 12px; }

.head-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.head-row h3 { margin-bottom: 0; }

/* 图鉴收集进度 */
.collect-row { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
.collect-item { display: flex; flex-direction: column; gap: 5px; }
.collect-head { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--ink); }
.collect-head b { color: var(--poke-blue); }

.bag-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; }
.bag-card { position: relative; background: #f9fafd; border: 2px solid var(--line); border-radius: 14px; padding: 12px; text-align: center; transition: all .15s; }
.bag-card:hover { border-color: var(--poke-yellow); background: #fffdf5; }
.bag-card .badge { position: absolute; top: 8px; left: 8px; }
.bag-img { width: 78px; height: 78px; object-fit: contain; }
.bag-card b { display: block; font-size: 14px; color: var(--ink); }
.bag-card .exp-bar > i { background: linear-gradient(90deg, #74c0fc, #4c6ef5); }
.exp-text { font-size: 11px; color: var(--poke-blue); }
.bag-actions { display: flex; gap: 6px; margin-top: 8px; }
.mini-btn { flex: 1; font-size: 11px; font-weight: 700; padding: 5px 4px; border-radius: 10px; background: #fff; border: 2px solid var(--line); color: var(--ink); }
.mini-btn:hover { border-color: var(--poke-red); color: var(--poke-red); }

.badge-wall { display: grid; grid-template-columns: repeat(8, 1fr); gap: 16px; padding-top: 10px; }
/* 相框陈列样式 */
.badge-slot { position: relative; background: linear-gradient(160deg, #FBFCFE, #F2F4F9); border: 3px solid #DDE2EC; border-radius: 8px; padding: 14px 4px 10px; text-align: center; opacity: .62; box-shadow: inset 0 0 0 2px #fff, 0 4px 10px rgba(0, 0, 0, .05); transition: all .2s; }
.badge-slot::before { content: ""; position: absolute; top: -9px; left: 50%; transform: translateX(-50%); width: 16px; height: 9px; border-radius: 3px; background: #CBD2DE; }
.badge-slot.got { background: linear-gradient(160deg, #FFFDF4, #FFF2CE); border-color: #E3BE55; opacity: 1; box-shadow: inset 0 0 0 2px #fff, 0 6px 16px rgba(227, 190, 85, .30); }
.badge-slot.got::before { background: #D9B54A; }
.badge-slot.got:hover { transform: translateY(-3px); }
.bs-ico { font-size: 24px; display: flex; align-items: center; justify-content: center; height: 36px; }
.bs-lock { font-size: 20px; opacity: .8; }
.badge-slot small { font-size: 10px; color: var(--ink-light); display: block; }

.egg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
.egg-cd { color: var(--poke-red); font-weight: 700; }
.egg-cd b { color: var(--poke-red); }
.egg-card { background: #fdfbf3; border: 2px solid #f0e6c8; border-radius: 16px; padding: 18px 12px; text-align: center; transition: all .2s; }
.egg-card.ready { background: #eafaf0; border-color: #a8e6bd; animation: glow 1.6s ease-in-out infinite; }
@keyframes glow { 0%, 100% { box-shadow: 0 0 0 rgba(46, 204, 113, 0) } 50% { box-shadow: 0 0 18px rgba(46, 204, 113, .35) } }
.egg-ico { font-size: 44px; animation: wobble 2.4s ease-in-out infinite; }
@keyframes wobble { 0%, 100% { transform: rotate(0) } 25% { transform: rotate(-6deg) } 75% { transform: rotate(6deg) } }
.egg-card b { display: block; margin-top: 6px; font-size: 14px; }
.countdown { font-size: 20px; font-weight: 900; color: var(--poke-red); font-variant-numeric: tabular-nums; margin: 6px 0; }
.ready-text { color: #2e9e4f; font-weight: 800; font-size: 13px; margin: 6px 0 10px; }

/* 联盟选择卡 */
.league-pick { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px; }
.league-card { background: #fff; border: 2px solid var(--line); border-radius: 16px; padding: 18px; cursor: not-allowed; opacity: .7; transition: all .18s; }
.league-card.unlocked { cursor: pointer; opacity: 1; }
.league-card.unlocked:hover { border-color: var(--poke-yellow); box-shadow: var(--shadow); transform: translateY(-3px); }
.league-card h3 { margin-bottom: 8px; }
.lock-text { font-size: 12px; font-weight: 800; color: #999; margin-top: 8px; }
.champ-text { font-size: 12px; font-weight: 800; color: #b8860b; margin-top: 8px; }
.open-text { font-size: 12px; font-weight: 800; color: var(--poke-red); margin-top: 8px; }

.beat-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.beat-head h3 { margin-bottom: 0; }
.league-steps { display: flex; gap: 8px; flex-wrap: wrap; margin: 14px 0 18px; }
.step { flex: 1; min-width: 110px; background: #f7f8fc; border: 2px solid var(--line); border-radius: 12px; padding: 10px; text-align: center; display: flex; flex-direction: column; gap: 2px; align-items: center; }
.step.done { background: #eafaf0; border-color: #a8e6bd; }
.step.cur { background: #fff8dc; border-color: var(--poke-yellow); box-shadow: 0 4px 14px rgba(255, 203, 5, .25); }
.step-idx { width: 22px; height: 22px; border-radius: 50%; background: var(--poke-blue); color: #fff; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.step small { font-size: 10px; color: var(--ink-light); }

.arena { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; background: linear-gradient(135deg, #fff8e1, #eef2ff); border-radius: 16px; padding: 18px; }
.side { display: flex; flex-direction: column; gap: 6px; }
.side-name { font-weight: 800; font-size: 15px; }
.side-name small { color: var(--ink-light); font-weight: 400; }
.hp-bar { width: 100%; max-width: 240px; height: 10px; background: #e8ebf2; border-radius: 6px; overflow: hidden; }
.hp-bar i { display: block; height: 100%; transition: width .35s; border-radius: 6px; }
.hp-text { font-size: 11px; color: var(--ink-light); }
.side-img { width: 110px; height: 110px; object-fit: contain; }
.flip { transform: scaleX(-1); }

.move-box { margin-top: 16px; }
.turn-tip { font-size: 13px; font-weight: 700; color: var(--ink-light); margin-bottom: 10px; }
.turn-wait { background: #fff7e6; border: 2px dashed var(--poke-orange); color: #8a5a1a; border-radius: 10px; padding: 8px 12px; margin-bottom: 10px; font-size: 12.5px; font-weight: 800; text-align: center; animation: leagueTurnPulse 1s ease-in-out infinite; }
@keyframes leagueTurnPulse { 0%,100%{opacity:1} 50%{opacity:.6} }
.move-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.move-btn { background: #fff; border: 2px solid var(--line); border-radius: 12px; padding: 10px 14px; text-align: left; transition: all .15s; }
.move-btn:hover { border-color: var(--poke-red); background: #fff7f7; transform: translateY(-2px); }
.move-btn:disabled { opacity: .45; cursor: not-allowed; }
.move-btn:disabled:hover { border-color: var(--line); background: #fff; transform: none; }
.mv-name { display: block; font-weight: 800; font-size: 14px; margin-bottom: 4px; }
.mv-meta { display: flex; gap: 8px; align-items: center; font-size: 11px; color: var(--ink-light); flex-wrap: wrap; }

.battle-result { text-align: center; padding: 22px 10px; border-radius: 14px; margin-top: 14px; }
.battle-result.win { background: #eafaf0; border: 2px solid #a8e6bd; }
.battle-result.lose { background: #fdf0f0; border: 2px solid #f5c6c6; }
.battle-result h3 { font-size: 19px; margin-bottom: 6px; }
.battle-log { margin-top: 14px; background: #f8f9fc; border: 2px solid var(--line); border-radius: 12px; padding: 12px 14px; max-height: 180px; overflow-y: auto; font-size: 12.5px; line-height: 1.85; }

.champ-panel { background: linear-gradient(135deg, #fffbe6, #fff3cd); border-color: var(--poke-yellow); }

.mini-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 10px; }
.mini-card { background: #f9fafd; border: 2px solid var(--line); border-radius: 12px; padding: 8px 4px; text-align: center; cursor: pointer; transition: all .15s; }
.mini-card:hover { border-color: var(--poke-yellow); transform: translateY(-3px); }
.mini-img { width: 62px; height: 62px; object-fit: contain; }
.mini-card span { display: block; font-size: 12px; font-weight: 700; }

/* 物品背包 */
.item-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
.item-cell { background: #f9fafd; border: 2px solid var(--line); border-radius: 12px; padding: 12px 6px; text-align: center; transition: all .15s; }
.item-cell:hover { border-color: var(--poke-blue); transform: translateY(-2px); }
.item-cell b { display: block; font-size: 13px; color: var(--ink); margin-top: 6px; }


/* 重置确认弹窗 */
.modal-mask { position: fixed; inset: 0; background: rgba(33, 33, 33, .58); display: flex; align-items: center; justify-content: center; z-index: 70; padding: 20px; }
.confirm-box { width: 100%; max-width: 440px; background: #fff; border: 4px solid var(--poke-yellow); border-radius: 20px; padding: 24px; }
.confirm-box h3 { font-size: 19px; margin-bottom: 10px; color: #c0392b; }
.confirm-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }

@media (max-width: 700px) {
  .badge-wall { grid-template-columns: repeat(4, 1fr); }
  .league-pick { grid-template-columns: 1fr; }
  .arena { grid-template-columns: 1fr 1fr; }
}
</style>
