<template>
  <!-- 精灵球背景装饰 + 路由视图 -->
  <div class="poke-bg"></div>
  <router-view />

  <!-- 首次进入：强制选择初始御三家 -->
  <StarterSelect />

  <!-- 首次进入的新手引导 -->
  <GuideModal />

  <!-- 全局轻提示（替代 alert，避免页面报错/空白） -->
  <div class="toast-wrap">
    <transition-group name="toast-pop">
      <div v-for="t in toasts" :key="t.id" :class="['toast', 'toast-' + t.type]">{{ t.msg }}</div>
    </transition-group>
  </div>
</template>

<script setup>
// 根组件：全局背景 + 路由出口 + 开局选择 + 新手引导 + 全局 Toast
import { onMounted } from 'vue'
import StarterSelect from './components/StarterSelect.vue'
import GuideModal from './components/GuideModal.vue'
import { toasts } from './utils/toast'
import { loadFromServer } from './data/gameStore'

// 登录后从云端恢复存档（换设备不掉档）
onMounted(() => { loadFromServer() })
</script>
