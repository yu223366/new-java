<template>
  <div class="page">
    <NavBar />
    <div class="wrap">
      <div class="page-head">
        <h1>🏥 宝可梦中心</h1>
        <span class="sub">乔伊小姐 · 治疗 · 训练家交换（原著：训练家们在此交换宝可梦）</span>
      </div>

      <!-- ============ 治疗 ============ -->
      <div class="panel pc-panel">
        <h3>💖 治疗</h3>
        <div class="pc-body">
          <div class="pc-nurse">
            <div class="pc-avatar"><PokeImg src="/nurse-joy.png" alt="乔伊小姐" img-class="nurse-joy-img" /></div>
            <b>乔伊小姐</b>
            <small class="hint-line">宝可梦中心的护士</small>
          </div>
          <div class="pc-chansey">
            <div class="pc-avatar"><PokeImg src="/pokemon/113.png" alt="吉利蛋" img-class="chansey-img" /></div>
            <b>吉利蛋</b>
            <small class="hint-line">乔伊小姐的助手</small>
          </div>
        </div>
        <div class="pc-tip">「欢迎光临宝可梦中心！请稍等，马上让您的宝可梦恢复健康～」</div>
        <div style="text-align:center;margin-top:14px">
          <button class="btn btn-primary" @click="doHeal">💖 治疗全队</button>
        </div>
        <p v-if="healMsg" class="heal-msg">{{ healMsg }}</p>
      </div>

      <!-- ============ 技能学习（招式学习器） ============ -->
      <div class="panel skill-panel">
        <h3>📖 技能学习（招式学习器）</h3>
        <p class="hint-line" style="margin-bottom:14px">
          「宝可梦中心的招式学习室，能让宝可梦记住新的招式哦～」—— 按<b>属性</b>学习招式，
          每次学习或替换花费 <b>{{ SKILL_LEARN_COST }} 币</b>，每只宝可梦最多记住 {{ MOVE_LIMIT }} 个招式。
        </p>

        <div class="skill-init">
          <div class="skill-col">
            <h4>1️⃣ 选择宝可梦</h4>
            <div class="poke-list">
              <div v-for="f in game.bag" :key="f.uid" :class="['poke-item', { sel: skillUid === f.uid }]" @click="skillUid = f.uid">
                <PokeImg :src="f.image" :alt="f.name" img-class="pk-img" />
                <b>{{ f.name }}</b>
                <small class="hint-line">Lv.{{ f.level }}</small>
                <div class="bar exp-bar" style="height:5px;width:100%;margin-top:4px">
                  <i :style="{ width: Math.min(100, ((f.exp || 0) / 100) * 100) + '%' }"></i>
                </div>
              </div>
              <div v-if="!game.bag.length" class="hint-line" style="padding:8px 4px">背包空空如也</div>
            </div>
          </div>
          <div class="skill-col">
            <h4>2️⃣ 当前招式（{{ myMoves.length }}/{{ MOVE_LIMIT }}）</h4>
            <div class="cur-moves">
              <div v-for="(m, i) in myMoves" :key="i" class="cur-move">
                <b>{{ m.name }}</b>
                <span class="type-tag" :style="{ background: typeColor(m.type) }">{{ m.type }}</span>
                <small class="hint-line">威力 {{ m.power || '—' }} · {{ m.cat }}</small>
              </div>
              <div v-for="i in Math.max(0, MOVE_LIMIT - myMoves.length)" :key="'empty-'+i" class="cur-move empty">空槽位</div>
            </div>
            <div class="coins-line">💰 当前持有：{{ game.coins || 0 }} 币</div>
          </div>
        </div>

        <template v-if="skillPoke">
          <h4 class="skill-sub">3️⃣ 选择要学习的招式（按属性）</h4>
          <div class="skill-tabs">
            <button v-for="t in skillTabs" :key="t" :class="['skill-tab', { on: skillType === t }]" @click="skillType = t">{{ t }}</button>
          </div>
          <div class="skill-list">
            <div v-for="m in filteredSkillOptions" :key="m.name"
              :class="['skill-card', { sel: selMove === m.name, learned: m.learned, disabled: m.learned }]"
              @click="!m.learned && (selMove = m.name)">
              <div class="skill-card-top">
                <b>{{ m.name }}</b>
                <span class="type-tag" :style="{ background: typeColor(m.type) }">{{ m.type }}</span>
                <span v-if="m.learned" class="learned-tag">已学会</span>
              </div>
              <small class="hint-line">威力 {{ m.power || '—' }} · 命中 {{ m.acc }} · {{ m.cat }}</small>
              <div class="skill-effect">{{ m.effect }}</div>
            </div>
            <div v-if="!filteredSkillOptions.length" class="hint-line" style="padding:8px 4px">该属性暂无可学招式</div>
          </div>

          <div v-if="needReplace" class="replace-box">
            ⚠️ 招式已满，请选择要<strong>替换</strong>掉的招式：
            <select v-model="replaceMove" class="trade-select">
              <option value="">选择要替换的招式…</option>
              <option v-for="m in myMoves" :key="m.name" :value="m.name">{{ m.name }}（{{ m.type }}）</option>
            </select>
          </div>

          <div style="text-align:center;margin-top:14px">
            <button class="btn btn-primary" :disabled="!canSubmit" @click="doLearn">
              💰 花 {{ SKILL_LEARN_COST }} 币{{ needReplace ? '替换' : '学习' }}「{{ selMove || '…' }}」
            </button>
          </div>
          <p v-if="skillMsg" class="heal-msg">{{ skillMsg }}</p>
        </template>
        <p v-else class="hint-line" style="margin-top:14px">👆 请先在左侧选择一只宝可梦</p>
      </div>

      <!-- ============ 训练家交换 ============ -->
      <div class="panel trade-panel">
        <h3>🔄 训练家交换</h3>
        <p class="hint-line" style="margin-bottom:14px">
          「要和我交换宝可梦吗？」——宝可梦中心是训练家聚集的地方，
          和其他<b>在线训练家</b>交换彼此的宝可梦，也许能换到稀有的伙伴！
        </p>

        <!-- 发起交换 -->
        <div class="trade-init">
          <div class="trade-col">
            <h4>1️⃣ 选择在线训练家</h4>
            <div class="online-list">
              <div v-for="u in online" :key="u.username" :class="['online-item', { sel: tradeTo === u.username }]" @click="tradeTo = u.username">
                👤 {{ u.username }}
              </div>
              <div v-if="!online.length" class="hint-line" style="padding:8px 4px">暂无其他在线训练家，换个时间再来吧</div>
            </div>
          </div>
          <div class="trade-col">
            <h4>2️⃣ 选择你要交换的宝可梦</h4>
            <div class="poke-list">
              <div v-for="f in game.bag" :key="f.uid" :class="['poke-item', { sel: myPick === f.uid }]" @click="myPick = f.uid">
                <PokeImg :src="f.image" :alt="f.name" img-class="pk-img" />
                <b>{{ f.name }}</b>
                <small class="hint-line">Lv.{{ f.level }}</small>
                <div class="bar exp-bar" style="height:5px;width:100%;margin-top:4px">
                  <i :style="{ width: Math.min(100, ((f.exp || 0) / 100) * 100) + '%' }"></i>
                </div>
              </div>
              <div v-if="!game.bag.length" class="hint-line" style="padding:8px 4px">背包空空如也</div>
            </div>
          </div>
        </div>
        <div style="text-align:center;margin-top:14px">
          <button class="btn btn-primary" :disabled="!tradeTo || !myPickPoke" @click="initTrade">
            📤 向 {{ tradeTo || '…' }} 发出交换邀请
          </button>
        </div>

        <!-- 收到的邀请 -->
        <div class="trade-inbox">
          <h4>📨 收到的交换邀请</h4>
          <div v-for="t in received" :key="t.id" class="trade-card">
            <div class="trade-info">
              <b>{{ t.from }}</b> 想用「<b>{{ t.fromPokemon && t.fromPokemon.name }}</b>」（Lv.{{ t.fromPokemon && t.fromPokemon.level }}）
              和你交换宝可梦！
            </div>
            <div class="trade-actions">
              <select v-model="replyPick[t.id]" class="trade-select">
                <option value="">选择你的宝可梦…</option>
                <option v-for="f in game.bag" :key="f.uid" :value="f.uid">{{ f.name }} Lv.{{ f.level }}</option>
              </select>
              <button class="btn btn-primary btn-sm" :disabled="!replyPick[t.id]" @click="accept(t)">✅ 接受交换</button>
              <button class="btn btn-ghost btn-sm" @click="reject(t)">❌ 拒绝</button>
            </div>
          </div>
          <div v-if="!received.length" class="hint-line" style="padding:6px 4px">暂无收到的交换邀请</div>
        </div>

        <!-- 我发出的邀请状态 -->
        <div v-if="sent.length" class="trade-inbox">
          <h4>📤 我发出的邀请</h4>
          <div v-for="t in sent" :key="t.id" class="trade-card sent">
            <div class="trade-info">
              邀请 <b>{{ t.to }}</b> 用「{{ t.fromPokemon && t.fromPokemon.name }}」交换 ——
              <span :class="['st', t.status]">{{ statusText(t.status) }}</span>
            </div>
          </div>
        </div>

        <!-- 交换成功弹窗 -->
        <div v-if="tradeResult" class="modal-mask" @click.self="tradeResult = null">
          <div class="trade-done">
            <div class="done-ico">🎉</div>
            <h3>交换成功！</h3>
            <p class="hint-line">{{ tradeResult }}</p>
            <p class="hint-line">（双方已同步到最新存档，如未显示请刷新页面）</p>
            <button class="btn btn-primary btn-sm" @click="tradeResult = null">好的</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import PokeImg from '../components/PokeImg.vue'
import { game, healAll, forceLoadFromServer, skillOptionsFor, learnSkill, SKILL_LEARN_COST, MOVE_LIMIT } from '../data/gameStore'
import { TYPES, MOVES } from '../data/gameData'
import { heartbeat, sendTrade, fetchTrades, respondTrade, currentUser } from '../api/game'
import { toastOk, toastWarn } from '../utils/toast'

const me = currentUser()
const online = ref([])
const tradeTo = ref('')
const myPick = ref('')
const trades = ref([])
const replyPick = ref({})
const tradeResult = ref('')
const healMsg = ref('')
const seenDone = new Set()
let heartTimer = null
let pollTimer = null

// ===== 技能学习（招式学习器 · 按属性）=====
const TYPE_COLORS = {
  '一般': '#A8A878', '格斗': '#C03028', '飞行': '#A890F0', '毒': '#A040A0', '地面': '#E0C068',
  '岩石': '#B8A038', '虫': '#A8B820', '幽灵': '#705898', '钢': '#B8B8D0', '火': '#F08030',
  '水': '#6890F0', '草': '#78C850', '电': '#F8D030', '超能力': '#F85888', '冰': '#98D8D8',
  '龙': '#7038F8', '恶': '#705848', '妖精': '#EE99AC'
}
function typeColor(t) { return TYPE_COLORS[t] || '#9AA3B2' }

const skillUid = ref('')
const skillOptions = ref([])
const skillType = ref('')
const selMove = ref('')
const replaceMove = ref('')
const skillMsg = ref('')
const skillPoke = computed(() => game.bag.find(f => f.uid === skillUid.value) || null)
const myMoves = computed(() => ((skillPoke.value && skillPoke.value.moves) || [])
  .map(n => MOVES.find(m => m.name === n)).filter(Boolean))
const needReplace = computed(() => myMoves.value.length >= MOVE_LIMIT && !!selMove.value
  && !myMoves.value.some(m => m.name === selMove.value))
const skillTabs = computed(() => {
  const set = new Set(skillOptions.value.map(m => m.type))
  return ['全部', ...TYPES.filter(t => set.has(t))]
})
const filteredSkillOptions = computed(() => (!skillType.value || skillType.value === '全部')
  ? skillOptions.value
  : skillOptions.value.filter(m => m.type === skillType.value))
const canSubmit = computed(() => !!skillPoke.value && !!selMove.value && (!needReplace.value || !!replaceMove.value))

watch(skillUid, uid => {
  const f = game.bag.find(x => x.uid === uid)
  skillOptions.value = skillOptionsFor(f)
  skillType.value = ''
  selMove.value = ''
  replaceMove.value = ''
  skillMsg.value = ''
})

function doLearn() {
  if (!canSubmit.value) return
  const r = learnSkill(skillUid.value, selMove.value, replaceMove.value)
  skillMsg.value = r.msg
  if (r.ok) {
    skillOptions.value = skillOptionsFor(skillPoke.value)
    selMove.value = ''
    replaceMove.value = ''
    toastOk(r.msg)
  } else {
    toastWarn(r.msg)
  }
}

// ===== 治疗 =====
function doHeal() {
  const healed = healAll()
  if (healed > 0) {
    healMsg.value = `乔伊小姐已为 ${healed} 只宝可梦恢复了健康！`
    toastOk('治疗完成，全队已恢复满血')
  } else {
    healMsg.value = '大家的体力都很充沛，无需治疗～'
    toastWarn('当前没有需要治疗的宝可梦')
  }
}

// ===== 交换 =====
const myPickPoke = computed(() => game.bag.find(f => f.uid === myPick.value) || null)
const received = computed(() => trades.value.filter(t => t.to === me && t.status === 'pending'))
const sent = computed(() => trades.value.filter(t => t.from === me))

function statusText(s) {
  return s === 'pending' ? '⏳ 等待对方' : s === 'completed' ? '✅ 已完成' : '❌ 已拒绝'
}

async function beat() {
  const list = await heartbeat(me)
  if (list) online.value = list
}

async function pollTrades() {
  const list = await fetchTrades(me)
  if (!list) return
  for (const t of list) {
    // 我发出的邀请完成 → 同步存档 + 提示
    if (t.from === me && t.status === 'completed' && !seenDone.has(t.id)) {
      seenDone.add(t.id)
      await forceLoadFromServer()
      const fp = t.fromPokemon || {}
      const tp = t.toPokemon || {}
      tradeResult.value = `你的「${fp.name}」和 ${t.to} 的「${tp.name}」交换了！`
      toastOk('交换成功！')
    }
  }
  trades.value = list
}

async function initTrade() {
  const poke = myPickPoke.value
  if (!tradeTo.value || !poke) return toastWarn('请先选择训练家和宝可梦')
  const r = await sendTrade(me, tradeTo.value, poke)
  if (r) { toastOk('交换邀请已发出，等待对方接受…'); pollTrades() }
  else toastWarn('发送失败，对方可能不在线')
}

async function accept(t) {
  const uid = replyPick.value[t.id]
  const poke = game.bag.find(f => f.uid === uid)
  if (!poke) return toastWarn('请先选择要交换的宝可梦')
  const r = await respondTrade(t.id, 'accept', poke)
  if (r) {
    await forceLoadFromServer()
    const fp = (r.fromPokemon) || {}
    const tp = (r.toPokemon) || {}
    tradeResult.value = `你用「${tp.name}」换到了 ${t.from} 的「${fp.name}」！`
    toastOk('交换成功！')
    pollTrades()
  } else toastWarn('交换失败，请稍后再试')
}

async function reject(t) {
  await respondTrade(t.id, 'reject')
  pollTrades()
  toastOk('已拒绝交换')
}

onMounted(() => {
  beat()
  pollTrades()
  heartTimer = setInterval(beat, 30000)
  pollTimer = setInterval(pollTrades, 5000)
})
onUnmounted(() => { clearInterval(heartTimer); clearInterval(pollTimer) })
</script>

<style scoped>
/* 治疗区（沿用宝可梦中心风格） */
.pc-panel { text-align: center; }
.pc-body { display: flex; justify-content: center; gap: 40px; margin: 6px 0 14px; flex-wrap: wrap; }
.pc-nurse, .pc-chansey { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.pc-avatar { width: 74px; height: 74px; border-radius: 50%; background: linear-gradient(135deg, #ffe3ec, #f8c1d4); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 3px solid #f39bb8; box-shadow: 0 6px 16px rgba(243, 155, 184, .25); }
.nurse-joy-img { width: 100%; height: 100%; object-fit: cover; }
.chansey-img { width: 100%; height: 100%; object-fit: contain; }
.pc-nurse b, .pc-chansey b { font-size: 15px; color: var(--ink); }
.pc-tip { background: #fff7f0; border: 2px dashed #ffd9b8; border-radius: 12px; padding: 12px 16px; color: #8a5a1a; font-size: 13px; max-width: 480px; margin: 0 auto; }
.heal-msg { margin-top: 12px; font-size: 13px; font-weight: 700; color: #2e9e4f; }

/* 交换区 */
.trade-init { display: flex; gap: 16px; flex-wrap: wrap; }
.trade-col { flex: 1; min-width: 260px; }
.trade-col h4 { font-size: 14px; color: var(--poke-blue); margin-bottom: 8px; }
.online-list, .poke-list { display: flex; flex-wrap: wrap; gap: 8px; max-height: 200px; overflow-y: auto; background: #f9fafd; border: 2px solid var(--line); border-radius: 12px; padding: 10px; }
.online-item { padding: 7px 14px; border-radius: 14px; background: #fff; border: 2px solid var(--line); font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; }
.online-item:hover { border-color: var(--poke-blue); }
.online-item.sel { background: var(--poke-blue-soft); border-color: var(--poke-blue); color: var(--poke-blue); }
.poke-item { width: 86px; background: #fff; border: 2px solid var(--line); border-radius: 12px; padding: 8px 4px; text-align: center; cursor: pointer; transition: all .15s; }
.poke-item:hover { border-color: var(--poke-orange); transform: translateY(-2px); }
.poke-item.sel { border-color: var(--poke-red); background: #fff5f5; box-shadow: 0 4px 12px rgba(232, 93, 74, .16); }
.pk-img { width: 56px; height: 56px; object-fit: contain; }
.poke-item b { display: block; font-size: 12.5px; color: var(--ink); }

.trade-inbox { margin-top: 20px; }
.trade-inbox h4 { font-size: 14px; color: var(--poke-blue); margin-bottom: 8px; }
.trade-card { background: #f9fafd; border: 2px solid var(--line); border-radius: 12px; padding: 12px 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.trade-info { font-size: 13px; color: var(--ink); flex: 1; min-width: 200px; }
.trade-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.trade-select { border: 2px solid var(--line); border-radius: 10px; padding: 7px 10px; font-size: 13px; outline: none; background: #fff; }
.st { font-weight: 800; font-size: 12px; padding: 3px 10px; border-radius: 10px; }
.st.pending { background: #fff3cd; color: #8a6d1a; }
.st.completed { background: #e6f7e6; color: #2e9e4f; }
.st.rejected { background: #fdecec; color: #c0392b; }

/* 成功弹窗 */
.modal-mask { position: fixed; inset: 0; background: rgba(33, 33, 33, .55); display: flex; align-items: center; justify-content: center; z-index: 70; padding: 20px; }
.trade-done { width: 100%; max-width: 420px; background: #fff; border: 4px solid var(--poke-yellow); border-radius: 20px; padding: 26px; text-align: center; }
.done-ico { font-size: 48px; margin-bottom: 8px; }
.trade-done h3 { color: var(--poke-red); margin-bottom: 8px; }
.trade-done .btn { margin-top: 12px; }

/* 技能学习区（招式学习器） */
.skill-init { display: flex; gap: 16px; flex-wrap: wrap; }
.skill-col { flex: 1; min-width: 260px; }
.skill-col h4, .skill-sub { font-size: 14px; color: var(--poke-blue); margin-bottom: 8px; }
.skill-sub { margin-top: 18px; }
.cur-moves { display: flex; flex-wrap: wrap; gap: 8px; background: #f9fafd; border: 2px solid var(--line); border-radius: 12px; padding: 10px; min-height: 76px; }
.cur-move { background: #fff; border: 2px solid var(--line); border-radius: 10px; padding: 6px 10px; display: flex; flex-direction: column; gap: 3px; min-width: 112px; }
.cur-move b { font-size: 13px; color: var(--ink); }
.cur-move.empty { color: #b7bec9; font-size: 12px; justify-content: center; align-items: center; border-style: dashed; }
.type-tag { font-size: 11px; color: #fff; padding: 1px 7px; border-radius: 8px; font-weight: 700; align-self: flex-start; }
.coins-line { margin-top: 8px; font-size: 13px; font-weight: 700; color: #b8860b; }
.skill-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.skill-tab { padding: 6px 14px; border-radius: 14px; border: 2px solid var(--line); background: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; }
.skill-tab:hover { border-color: var(--poke-blue); }
.skill-tab.on { background: var(--poke-blue); border-color: var(--poke-blue); color: #fff; }
.skill-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; max-height: 320px; overflow-y: auto; padding-right: 4px; }
.skill-card { background: #fff; border: 2px solid var(--line); border-radius: 12px; padding: 10px 12px; cursor: pointer; transition: all .15s; }
.skill-card:hover { border-color: var(--poke-orange); transform: translateY(-2px); }
.skill-card.sel { border-color: var(--poke-blue); background: var(--poke-blue-soft); box-shadow: 0 4px 12px rgba(76, 110, 245, .16); }
.skill-card.learned { opacity: .72; }
.skill-card.disabled { cursor: not-allowed; opacity: .55; }
.skill-card.disabled:hover { border-color: var(--line); transform: none; }
.skill-card-top { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
.skill-card-top b { font-size: 13.5px; color: var(--ink); }
.learned-tag { font-size: 11px; color: #2e9e4f; background: #e6f7e6; padding: 1px 7px; border-radius: 8px; }
.skill-effect { font-size: 11.5px; color: var(--ink-light); margin-top: 4px; line-height: 1.4; }
.replace-box { margin-top: 14px; background: #fff8e6; border: 2px dashed #f2c94c; border-radius: 12px; padding: 10px 14px; font-size: 13px; color: #8a6d1a; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.exp-bar > i { background: linear-gradient(90deg, #74c0fc, #4c6ef5); }
</style>
