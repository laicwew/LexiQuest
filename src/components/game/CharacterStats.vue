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
  }
  vocabCount: number
  isLoading?: boolean // 添加加载状态属性
}>()

const hpPercent = computed(() => (props.character.hp / props.character.maxHp) * 100)

// Calculate vocabulary progress
const vocabProgress = computed(() => {
  const nextRequirement = gameStore.getNextLevelRequirements()
  if (!nextRequirement) return 100

  const progress = Math.min(100, (props.vocabCount / nextRequirement.words_required) * 100)
  return progress
})

const nextLevelRequirement = computed(() => {
  return gameStore.getNextLevelRequirements()
})

// 根据加载状态选择头像
const avatarUrl = computed(() => {
  if (props.isLoading) {
    return `/src/assets/avatar-happy.gif`
  }
  return `/src/assets/avatar-${props.character.level}.gif?t=${Date.now()}`
})
</script>

<template>
  <div class="parchment-bg p-6 magical-glow">
    <h2 class="fantasy-title text-xl font-bold mb-4">Your Alien Friend</h2>
    <div class="text-center mb-6">
      <div class="mx-auto mb-3 flex items-center justify-center">
        <img :src="avatarUrl" :alt="`avatar ${character.level}`" class="w-40 h-40 object-contain" />
      </div>
      <h3 class="font-bold text-lg">{{ character.name }}</h3>
      <p class="text-sm text-yellow-600">Level {{ character.level }}</p>
    </div>

    <!-- Stats -->
    <div class="space-y-4">
      <div>
        <div class="flex justify-between text-sm mb-1">
          <span>HAPPY</span>
          <span>{{ character.hp }}/{{ character.maxHp }}</span>
        </div>
        <div class="bg-gray-300 h-2">
          <div class="stat-bar h-2" :style="{ width: hpPercent + '%' }"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-sm mb-1">
          <span>VOCAB</span>
          <span v-if="nextLevelRequirement"
            >{{ vocabCount }}/{{ nextLevelRequirement.words_required }}</span
          >
          <span v-else>{{ vocabCount }}/∞</span>
        </div>
        <div class="bg-gray-300 h-2">
          <div class="stat-bar h-2" :style="{ width: vocabProgress + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.parchment-bg {
  background: var(--secondary-parchment); /* Flat background */
  border: 4px solid var(--primary-gold) !important; /* Changed from 2px to 4px to match StoryDisplay */
  box-shadow: none; /* Remove shadow */
}

.fantasy-title {
  font-family: 'Cinzel', serif;
  color: var(--primary-gold);
  text-shadow: none; /* Remove shadow */
}

.stat-bar {
  background: var(--primary-green); /* Flat background */
  height: 8px;
  border-radius: 0; /* Remove rounded corners */
  transition: width 0.5s ease;
}
</style>