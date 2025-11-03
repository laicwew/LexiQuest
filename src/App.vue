<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
@font-face {
  font-family: 'ByteBounce';
  src: url('/fonts/ByteBounce.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

:root {
  --primary-green: #c19c4d;
  --primary-gold: #ffc300;
  --primary-burgundy: #800020;
  --secondary-parchment: #2b4695;
  --secondary-purple: #663399;
  --accent-cyan: #00ffff;
  --text-charcoal: #dbdbdb;

  --rich-black: #000814ff;
  --oxford-blue: #001d3dff;
  --yale-blue: #003566ff;
  --mikado-yellow: #ffc300ff;
  --gold: #ffd60aff;
  --oxford-blue: #0a1128ff;
  --penn-blue: #001f54ff;
  --indigo-dye: #034078ff;
  --cerulean: #1282a2ff;
  --white: #fefcfbff;

  --black: #000000ff;
  --oxford-blue: #14213dff;
  --orange-web: #fca311ff;
  --platinum: #e5e5e5ff;
  --white: #ffffffff;
}

body {
  font-family: 'ByteBounce', sans-serif;
  background: url('@/assets/Sprite-0003.png') no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
  color: var(--text-charcoal);
  margin: 0;
  padding: 0;
  /* font-size: 20px !important; */
}

#app {
  height: 100vh;
}

* {
  font-family: 'ByteBounce', sans-serif !important;
}
</style>
