import { ref, onUnmounted } from 'vue'

/**
 * 全站统一的回合制出招流（野外 / 道馆 / 对战中心 / 联盟共用）
 *
 * 规则：我方出招 → 锁定输入 → 等待我方动画 → 敌方出招 → 等待敌方动画 → 解锁。
 * 玩家在「我方出招后、敌方出招完成前」无法再次出招（turnBusy 为 true）。
 *
 * @returns {{turnBusy: import('vue').Ref<boolean>, runTurn: Function, clearTurn: Function}}
 */
export function useTurnFlow() {
  const turnBusy = ref(false)
  const timers = []

  function sleep(ms) {
    return new Promise(resolve => {
      const t = setTimeout(resolve, ms)
      timers.push(t)
    })
  }

  /** 清理所有等待定时器并解锁（换场景/重开/卸载时调用） */
  function clearTurn() {
    timers.splice(0).forEach(t => clearTimeout(t))
    turnBusy.value = false
  }

  /**
   * 执行一个完整回合（严格串行）
   * @param {Function} myAction   我方行动；返回 true 表示战斗已结束（不再让敌方行动）
   * @param {Function} foeAction  敌方行动；返回 true 表示战斗已结束
   * @param {{myDelay?:number, foeDelay?:number}} opts 两段等待时长（毫秒）
   */
  async function runTurn(myAction, foeAction, opts = {}) {
    if (turnBusy.value) return
    turnBusy.value = true
    try {
      if (await myAction()) return
      await sleep(opts.myDelay ?? 420)
      if (await foeAction()) return
      await sleep(opts.foeDelay ?? 460)
    } finally {
      turnBusy.value = false
    }
  }

  onUnmounted(clearTurn)

  return { turnBusy, runTurn, clearTurn }
}
