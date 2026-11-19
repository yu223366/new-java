<template>
  <img :src="current" :alt="alt" :class="imgClass" loading="lazy" @error="fail" />
</template>

<script setup>
/**
 * 带加载失败兜底的图片组件
 * 任何 src 失效时自动切换为内置的精灵球占位 SVG，避免出现破图。
 */
import { ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '宝可梦' },
  imgClass: { type: String, default: '' }
})

const FALLBACK = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">' +
  '<rect width="96" height="96" rx="16" fill="#F3F5FA"/>' +
  '<circle cx="48" cy="44" r="21" fill="#FFFFFF" stroke="#C9CFDC" stroke-width="4"/>' +
  '<path d="M27 44h42" stroke="#C9CFDC" stroke-width="4"/>' +
  '<circle cx="48" cy="44" r="6.5" fill="#FFFFFF" stroke="#C9CFDC" stroke-width="4"/>' +
  '<text x="48" y="56" font-size="20" fill="#9AA3B2" text-anchor="middle" font-family="sans-serif" font-weight="bold">?</text>' +
  '</svg>'
)

const current = ref(props.src || FALLBACK)

watch(() => props.src, v => { current.value = v || FALLBACK })

function fail() {
  if (current.value !== FALLBACK) current.value = FALLBACK
}
</script>
