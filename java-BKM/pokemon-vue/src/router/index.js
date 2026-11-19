import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册' }
  },
  // ===== 9 大功能模块 =====
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页', requiresAuth: true }
  },
  {
    path: '/pokedex',
    name: 'Pokedex',
    component: () => import('../views/Pokedex.vue'),
    meta: { title: '宝可梦图鉴', requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/Categories.vue'),
    meta: { title: '分级分类', requiresAuth: true }
  },
  {
    path: '/lore',
    name: 'Lore',
    component: () => import('../views/Lore.vue'),
    meta: { title: '原著资料库', requiresAuth: true }
  },
  {
    path: '/adventure',
    name: 'Adventure',
    component: () => import('../views/Adventure.vue'),
    meta: { title: '野外冒险捕捉', requiresAuth: true }
  },
  {
    path: '/gyms',
    name: 'Gyms',
    component: () => import('../views/Gyms.vue'),
    meta: { title: '道馆徽章挑战', requiresAuth: true }
  },
  {
    path: '/battle',
    name: 'Battle',
    component: () => import('../views/Battle.vue'),
    meta: { title: '玩家对战中心', requiresAuth: true }
  },
  {
    path: '/market',
    name: 'Market',
    component: () => import('../views/Market.vue'),
    meta: { title: '市集', requiresAuth: true }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: () => import('../views/Tools.vue'),
    meta: { title: '工具百科大全', requiresAuth: true }
  },
  {
    path: '/trainer',
    name: 'Trainer',
    component: () => import('../views/Trainer.vue'),
    meta: { title: '个人训练家中心', requiresAuth: true }
  },
  {
    path: '/pokecenter',
    name: 'PokeCenter',
    component: () => import('../views/PokeCenter.vue'),
    meta: { title: '宝可梦中心', requiresAuth: true }
  },
  // ===== 后台 =====
  {
    path: '/admin-login',
    name: 'AdminLogin',
    component: () => import('../views/AdminLogin.vue'),
    meta: { title: '后台管理登录' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: { title: '后台管理系统', requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：普通页面需登录；后台管理需管理员
router.beforeEach((to, from, next) => {
  const userStr = sessionStorage.getItem('pokemon_user')
  const user = userStr ? JSON.parse(userStr) : null

  if (to.meta.requiresAuth && !user) {
    return next('/login')
  }
  if (to.meta.requiresAdmin) {
    if (!user || user.role !== 0) {
      return next('/admin-login')
    }
  }
  next()
})

export default router
