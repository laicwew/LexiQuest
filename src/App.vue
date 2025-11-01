<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
:root {
  --primary-green: #c19c4d;
  --primary-gold: #b6b6b6;
  --primary-burgundy: #800020;
  --secondary-parchment: #2b4695;
  --secondary-purple: #663399;
  --accent-cyan: #00ffff;
  --text-charcoal: #dbdbdb;
}

body {
  font-family: 'Inter', sans-serif;
  background: url('@/assets/Sprite-0003.png') no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
  color: var(--text-charcoal);
  margin: 0;
  padding: 0;
}

#app {
  height: 100vh;
}
</style>
