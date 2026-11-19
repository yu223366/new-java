/**
 * 全局轻提示（Toast）
 * 用于替代 alert，权限拦截 / 容量不足 / 重复操作等都以提示形式呈现，
 * 保证页面不报错、不空白。
 */
import { reactive } from 'vue'

export const toasts = reactive([])
let seq = 0

/**
 * @param {string} msg 文案
 * @param {'info'|'success'|'warn'|'error'} type 类型
 * @param {number} duration 毫秒
 */
export function toast(msg, type = 'info', duration = 2600) {
  const item = { id: ++seq, msg, type }
  toasts.push(item)
  setTimeout(() => {
    const i = toasts.findIndex(t => t.id === item.id)
    if (i >= 0) toasts.splice(i, 1)
  }, duration)
  // 最多同时显示 4 条，防止刷屏
  if (toasts.length > 4) toasts.splice(0, toasts.length - 4)
}

export const toastOk = (m) => toast(m, 'success')
export const toastWarn = (m) => toast(m, 'warn')
export const toastErr = (m) => toast(m, 'error')
