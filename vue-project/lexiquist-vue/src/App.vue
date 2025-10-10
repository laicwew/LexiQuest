<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
:root {
  --primary-green: #2D5016;
  --primary-gold: #D4AF37;
  --primary-burgundy: #800020;
  --secondary-parchment: #F5F5DC;
  --secondary-purple: #663399;
  --accent-cyan: #00FFFF;
  --text-charcoal: #36454F;
}

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-purple) 100%);
  min-height: 100vh;
  color: var(--text-charcoal);
  margin: 0;
  padding: 0;
}

#app {
  height: 100vh;
}
</style>
