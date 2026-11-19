<template>
  <header class="navbar">
    <div class="nav-inner">
      <router-link to="/home" class="brand">
        <span class="pokeball"></span>
        <span class="brand-text">精灵宝可梦<small>POKéDEX</small></span>
      </router-link>

      <!-- 导航菜单：后续新增项直接往 links 数组里加即可，布局会自动铺开 -->
      <nav class="nav-links">
        <router-link v-for="l in links" :key="l.path" :to="l.path" class="nav-link">
          <span class="ico">{{ l.icon }}</span>{{ l.name }}
        </router-link>
      </nav>

      <div class="nav-user">
        <router-link v-if="isAdmin" to="/admin-login" class="admin-entry" title="进入后台管理系统">
          <span class="ico">🛠️</span>后台管理
        </router-link>
        <span v-if="user" class="username">👤 {{ user.username }}</span>
        <button class="btn btn-ghost btn-sm" @click="logout">退出</button>
      </div>
    </div>

    <!-- 导航下方：全服滚动公告栏 -->
    <AnnouncementBar />
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AnnouncementBar from './AnnouncementBar.vue'

const router = useRouter()
const user = ref(JSON.parse(sessionStorage.getItem('pokemon_user') || 'null'))
// 仅管理员（role=0）可看到后台入口
const isAdmin = computed(() => !!user.value && Number(user.value.role) === 0)

const links = [
  { path: '/home', name: '首页', icon: '🏠' },
  { path: '/pokedex', name: '宝可梦图鉴', icon: '📖' },
  { path: '/categories', name: '分级分类', icon: '🏷️' },
  { path: '/lore', name: '原著资料库', icon: '📚' },
  { path: '/adventure', name: '野外捕捉', icon: '🌿' },
  { path: '/gyms', name: '道馆挑战', icon: '🏛️' },
  { path: '/battle', name: '对战中心', icon: '⚔️' },
  { path: '/market', name: '市集', icon: '🛒' },
  { path: '/tools', name: '工具百科', icon: '🧰' },
  { path: '/pokecenter', name: '宝可梦中心', icon: '🏥' },
  { path: '/trainer', name: '个人中心', icon: '👤' }
]

function logout() {
  sessionStorage.removeItem('pokemon_user')
  router.push('/login')
}
</script>

<style scoped>
.navbar { position: sticky; top: 0; z-index: 40; background: rgba(255, 255, 255, .97); backdrop-filter: blur(10px); border-bottom: 4px solid var(--poke-yellow); box-shadow: 0 2px 14px rgba(0, 0, 0, .05); }
/* 导航栏强制单行并排：品牌 + 导航项 + 用户区始终一行，通过分级收紧保证不溢出、不遮挡 */
.nav-inner { width: 100%; max-width: 1920px; margin: 0 auto; display: flex; align-items: center; flex-wrap: nowrap; padding: 10px 24px; gap: 12px; }
.brand { display: flex; align-items: center; gap: 9px; font-size: 18px; font-weight: 900; color: var(--poke-red); white-space: nowrap; flex-shrink: 0; }
.brand .pokeball { width: 22px; height: 22px; }
.brand-text small { display: block; font-size: 9px; color: var(--poke-blue); letter-spacing: 1.5px; line-height: 1; }

.nav-links { display: flex; align-items: center; gap: 5px; flex: 1 1 auto; min-width: 0; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; padding: 2px 0; }
.nav-links::-webkit-scrollbar { display: none; }
.nav-link { display: inline-flex; align-items: center; gap: 5px; padding: 8px 14px; border-radius: 20px; font-size: 13.5px; font-weight: 700; color: var(--ink); white-space: nowrap; flex-shrink: 0; transition: background .15s, color .15s, transform .15s; }
.nav-link .ico { font-size: 14px; }
.nav-link:hover { background: var(--poke-blue-soft); color: var(--poke-blue); transform: translateY(-1px); }
.nav-link.router-link-active { background: linear-gradient(135deg, var(--poke-blue), var(--poke-blue-dark)); color: #fff; box-shadow: 0 4px 12px rgba(76, 110, 245, .26); }

.nav-user { display: flex; align-items: center; flex-wrap: nowrap; gap: 10px; white-space: nowrap; flex-shrink: 0; margin-left: auto; }
.admin-entry { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 800; color: #fff; background: linear-gradient(135deg, #3b3f52, #23262f); padding: 6px 13px; border-radius: 16px; box-shadow: 0 3px 10px rgba(30, 33, 43, .22); transition: transform .15s, box-shadow .15s; }
.admin-entry:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(30, 33, 43, .32); }
.admin-entry .ico { font-size: 13px; }
.username { font-size: 13px; color: var(--ink-light); }

/* 分级收紧（仍保持单行并排） */
@media (max-width: 1500px) {
  .nav-inner { padding: 9px 14px; gap: 10px; }
  .nav-links { gap: 3px; }
  .nav-link { padding: 7px 9px; font-size: 12.5px; }
  .nav-link .ico { font-size: 12.5px; }
  .username { display: none; }
}

/* 小屏：隐藏导航图标与次要状态，10 个导航项仍单行并排 */
@media (max-width: 1280px) {
  .nav-link { padding: 6px 8px; font-size: 12px; }
  .nav-link .ico { display: none; }
    .admin-entry { padding: 6px 10px; font-size: 12px; }
}

/* 更窄：进一步缩小字号，品牌只留精灵球图标 */
@media (max-width: 1024px) {
  .nav-link { padding: 5px 6px; font-size: 11.5px; }
  .brand-text { display: none; }
  .admin-entry { padding: 5px 8px; font-size: 11.5px; }
}
</style>
