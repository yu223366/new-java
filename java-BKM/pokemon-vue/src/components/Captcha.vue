<template>
  <div class="captcha-wrap">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value.toUpperCase())"
      type="text"
      class="captcha-input"
      placeholder="请输入验证码"
      maxlength="4"
      @keyup.enter="$emit('enter')"
    />
    <canvas
      ref="canvasRef"
      class="captcha-canvas"
      width="120"
      height="44"
      title="点击刷新验证码"
      @click="refresh"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'enter'])

const canvasRef = ref(null)
let code = '' // 当前正确答案

// 字符集：去掉易混淆的 0/O/1/l/I
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

/** 生成验证码并绘制到 canvas */
function refresh() {
  code = ''
  for (let i = 0; i < 4; i++) code += randomChar()

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  // 背景
  ctx.fillStyle = '#fffdf5'
  ctx.fillRect(0, 0, w, h)

  // 干扰线
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(${60 + Math.random() * 120}, ${60 + Math.random() * 120}, ${60 + Math.random() * 120}, .5)`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(Math.random() * w, Math.random() * h)
    ctx.lineTo(Math.random() * w, Math.random() * h)
    ctx.stroke()
  }

  // 噪点
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * .25})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5)
  }

  // 字符（逐个绘制，带旋转和颜色）
  const colors = ['#EE1515', '#3B4CCA', '#F0B400', '#2b2b2b', '#8a2be2']
  for (let i = 0; i < code.length; i++) {
    ctx.save()
    ctx.font = `bold ${24 + Math.floor(Math.random() * 5)}px Arial`
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
    const x = 16 + i * 26
    const y = h / 2 + 8
    ctx.translate(x, y)
    ctx.rotate((Math.random() - .5) * 0.5)
    ctx.fillText(code[i], -8, 0)
    ctx.restore()
  }

  emit('update:modelValue', '') // 刷新后清空输入
}

/** 校验用户输入（不区分大小写） */
function validate(input) {
  return !!code && String(input || '').trim().toUpperCase() === code.toUpperCase()
}

onMounted(refresh)

defineExpose({ refresh, validate })
</script>

<style scoped>
.captcha-wrap { display: flex; align-items: center; gap: 10px; }
.captcha-input {
  flex: 1; min-width: 0; border: 2px solid var(--line); border-radius: 12px;
  padding: 12px; font-size: 15px; outline: none; background: #fffdf7;
}
.captcha-input:focus { border-color: var(--poke-yellow); }
.captcha-canvas {
  width: 120px; height: 44px; border: 2px solid var(--line); border-radius: 10px;
  cursor: pointer; background: #fffdf5; flex-shrink: 0;
}
.captcha-canvas:hover { border-color: var(--poke-yellow); }
</style>
