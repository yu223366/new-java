import axios from 'axios'

/**
 * 纯在线 API 层 —— 所有数据走后端 SpringBoot + MySQL（无离线数据）
 * 后端不可用时请求静默失败（返回 {code:500}），页面用各自的内置静态数据兜底（如图鉴 ALL_DEX）
 */

// 后端地址：开发环境走 vite 代理(/api)，生产环境可用 VITE_API_BASE_URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const request = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' }
})

request.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err)
)

/** 统一执行：失败返回 {code:500}，调用方据此判断，页面自行兜底 */
async function call(onlineFn) {
  try {
    return await onlineFn()
  } catch (e) {
    console.warn('[API] 后端请求失败:', e)
    return { code: 500, msg: '后端不可用', data: null }
  }
}

// ============ 用户 ============
export const register = (username, password) =>
  call(() => request.post('/api/user/register', { username, password }))

export const login = (username, password) =>
  call(() => request.post('/api/user/login', { username, password }))

// ============ 后台管理登录（仅管理员 role=0）============
export const adminLogin = (username, password) =>
  call(() => request.post('/api/admin/login', { username, password }))

// ============ 宝可梦图鉴 ============
export const pokemonList = () =>
  call(() => request.get('/api/pokemon/list'))

export const pokemonSearch = (params) =>
  call(() => request.get('/api/pokemon/search', { params }))

export const pokemonAdd = (data) =>
  call(() => request.post('/api/pokemon', data))

export const pokemonUpdate = (data) =>
  call(() => request.put('/api/pokemon', data))

export const pokemonDelete = (id) =>
  call(() => request.delete(`/api/pokemon/${id}`))

export default request
