<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

// 获取下一等级要求
const nextLevelRequirements = computed(() => {
  return gameStore.getNextLevelRequirements()
})

// 获取当前等级要求
const currentLevelRequirements = computed(() => {
  return gameStore.getCurrentLevelRequirements()
})

// 计算升级进度
const levelProgress = computed(() => {
  if (!nextLevelRequirements.value) return null
  
  const learnedWords = gameStore.vocabulary.learned.size
  const wordsRequired = nextLevelRequirements.value.words_required
  
  // 计算单词进度百分比
  const wordProgress = Math.min(100, (learnedWords / wordsRequired) * 100)
  
  return {
    wordProgress,
    learnedWords,
    wordsRequired
  }
})
</script>

<template>
  <div class="level-requirements bg-gray-800 p-4 rounded-lg mt-4">
    <h3 class="text-lg font-bold text-white mb-2">升级要求</h3>
    
    <div v-if="nextLevelRequirements && levelProgress">
      <p class="text-sm text-gray-300 mb-3">
        下一等级 ({{ nextLevelRequirements.level }}级) 需要:
      </p>
      
      <div class="space-y-2">
        <div>
          <div class="flex justify-between text-sm text-white mb-1">
            <span>单词掌握: {{ levelProgress.learnedWords }} / {{ levelProgress.wordsRequired }}</span>
            <span>{{ Math.round(levelProgress.wordProgress) }}%</span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full" 
              :style="{ width: levelProgress.wordProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>
      
      <div v-if="gameStore.canLevelUp()" class="mt-3 p-2 bg-yellow-600 rounded text-center text-white text-sm">
        恭喜！您已满足升级条件！
      </div>
    </div>
    
    <div v-else class="text-gray-400 text-sm">
      已达到最高等级
    </div>
  </div>
</template>

<style scoped>
.level-requirements {
  font-family: 'Courier New', monospace;
  background: #2d5016; /* 森林绿背景 */
  border: 1px solid #d4af37; /* 鹅黄色边框 */
  border-radius: 0; /* 移除圆角 */
  box-shadow: none; /* 移除阴影 */
}
</style>