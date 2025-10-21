<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  module: {
    id: string
    title: string
    description: string
    progress: number
  }
  progress: {
    wordsLearnedToday: number
    timeSpent: number
    actionsTaken: number
  }
}>()

const moduleProgressPercent = props.module.progress
const completionPercent = `${moduleProgressPercent}%`
</script>

<template>
  <div class="space-y-6">
    <!-- Current Module -->
    <div class="parchment-bg rounded-lg p-6 magical-glow">
      <h3 class="fantasy-title text-lg font-bold mb-3">当前冒险</h3>
      <div class="text-center">
        <div
          class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg mx-auto mb-3 flex items-center justify-center text-2xl"
        >
          🏪
        </div>
        <h4 class="font-bold">{{ module.title }}</h4>
        <p class="text-sm text-gray-600 mb-3">{{ module.description }}</p>
        <div class="bg-gray-300 rounded-full h-2 mb-2">
          <div class="stat-bar h-2 rounded-full" :style="{ width: completionPercent }"></div>
        </div>
        <p class="text-xs text-gray-600">{{ completionPercent }} 完成</p>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="parchment-bg rounded-lg p-6 magical-glow">
      <h3 class="fantasy-title text-lg font-bold mb-3">今日进度</h3>
      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="text-sm">已学词汇</span>
          <span class="font-bold text-yellow-600">{{ progress.wordsLearnedToday }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-sm">游戏时间</span>
          <span class="font-bold text-blue-600">{{ Math.floor(progress.timeSpent / 60) }}分钟</span>
        </div>
        <div class="flex justify-between">
          <span class="text-sm">动作次数</span>
          <span class="font-bold text-green-600">{{ progress.actionsTaken }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.parchment-bg {
  background: var(--secondary-parchment); /* 扁平化背景 */
  border: 2px solid var(--primary-gold);
  box-shadow: none; /* 移除阴影 */
}

.fantasy-title {
  font-family: 'Cinzel', serif;
  color: var(--primary-gold);
  text-shadow: none; /* 移除阴影 */
}

.stat-bar {
  background: var(--primary-green); /* 扁平化背景 */
  height: 8px;
  border-radius: 0; /* 移除圆角 */
  transition: width 0.5s ease;
}
</style>
