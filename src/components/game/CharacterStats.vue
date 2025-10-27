<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

const props = defineProps<{
  character: {
    name: string
    level: number
    hp: number
    maxHp: number
    energy: number
    maxEnergy: number
  }
  vocabCount: number
}>()

const hpPercent = computed(() => (props.character.hp / props.character.maxHp) * 100)
const energyPercent = computed(() => (props.character.energy / props.character.maxEnergy) * 100)

// 计算单词掌握进度
const vocabProgress = computed(() => {
  const nextRequirement = gameStore.getNextLevelRequirements()
  if (!nextRequirement) return 100

  const progress = Math.min(100, (props.vocabCount / nextRequirement.words_required) * 100)
  return progress
})

const nextLevelRequirement = computed(() => {
  return gameStore.getNextLevelRequirements()
})
</script>

<template>
  <div class="parchment-bg rounded-lg p-6 magical-glow">
    <h2 class="fantasy-title text-xl font-bold mb-4">角色</h2>
    <div class="text-center mb-6">
      <div
        class="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
      >
        👽
      </div>
      <h3 class="font-bold text-lg">{{ character.name }}</h3>
      <p class="text-sm text-gray-600">Level {{ character.level }} Scholar</p>
    </div>

    <!-- Stats -->
    <div class="space-y-4">
      <div>
        <div class="flex justify-between text-sm mb-1">
          <span>生命值</span>
          <span>{{ character.hp }}/{{ character.maxHp }}</span>
        </div>
        <div class="bg-gray-300 rounded-full h-2">
          <div class="stat-bar h-2 rounded-full" :style="{ width: hpPercent + '%' }"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-sm mb-1">
          <span>能量</span>
          <span>{{ character.energy }}/{{ character.maxEnergy }}</span>
        </div>
        <div class="bg-gray-300 rounded-full h-2">
          <div class="stat-bar h-2 rounded-full" :style="{ width: energyPercent + '%' }"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-sm mb-1">
          <span>单词掌握进度</span>
          <span v-if="nextLevelRequirement"
            >{{ vocabCount }}/{{ nextLevelRequirement.words_required }}</span
          >
          <span v-else>{{ vocabCount }}/∞</span>
        </div>
        <div class="bg-gray-300 rounded-full h-2">
          <div class="stat-bar h-2 rounded-full" :style="{ width: vocabProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Vocabulary Count -->
    <div class="mt-6 p-3 bg-yellow-100 rounded-lg">
      <div class="text-center">
        <div class="text-2xl font-bold text-yellow-700">{{ vocabCount }}</div>
        <div class="text-sm text-yellow-600">已学词汇</div>
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
