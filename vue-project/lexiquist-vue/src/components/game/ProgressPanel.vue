<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'

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
    achievements: string[]
  }
}>()

const gameStore = useGameStore()

const moduleProgressPercent = props.module.progress
const completionPercent = `${moduleProgressPercent}%`

// Get unlocked achievements
const unlockedAchievements = computed(() => {
  return gameStore.achievements.filter(achievement => achievement.unlocked)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Current Module -->
    <div class="parchment-bg rounded-lg p-6 magical-glow">
      <h3 class="fantasy-title text-lg font-bold mb-3">当前冒险</h3>
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg mx-auto mb-3 flex items-center justify-center text-2xl">
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
    
    <!-- Recent Achievements -->
    <div class="parchment-bg rounded-lg p-6 magical-glow">
      <h3 class="fantasy-title text-lg font-bold mb-3">成就</h3>
      <div class="space-y-2" id="achievements-list">
        <div 
          v-for="achievement in unlockedAchievements" 
          :key="achievement.id"
          class="flex items-center space-x-2 text-sm"
        >
          <span class="text-yellow-500">🏆</span>
          <span class="font-medium">{{ achievement.name }}</span>
        </div>
        <div v-if="unlockedAchievements.length === 0" class="text-sm text-gray-500 text-center">
          还没有解锁任何成就
        </div>
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
  background: linear-gradient(135deg, var(--secondary-parchment) 0%, #F0E68C 100%);
  border: 2px solid var(--primary-gold);
  box-shadow: inset 0 0 20px rgba(139, 69, 19, 0.1);
}

.fantasy-title {
  font-family: 'Cinzel', serif;
  background: linear-gradient(45deg, var(--primary-gold), #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}

.stat-bar {
  background: linear-gradient(90deg, var(--primary-green), #32CD32);
  height: 8px;
  border-radius: 4px;
  transition: width 0.5s ease;
}
</style>