<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
:root {
  --primary-green: #2d5016; /* 森林绿 */
  --primary-gold: #d4af37; /* 鹅黄色 */
  --primary-burgundy: #800020;
  --secondary-parchment: #f5f5dc;
  --secondary-purple: #663399;
  --accent-cyan: #00ffff;
  --text-charcoal: #36454f;
}

body {
  background: var(--primary-green); /* 扁平化背景 */
  min-height: 100vh;
  color: var(--text-charcoal);
  margin: 0;
  padding: 0;
  font-family: 'ByteBounce', sans-serif; /* 使用自定义字体 */
  font-size: 20px; /* 设置字体大小 */
}

#app {
  height: 100vh;
}
</style>