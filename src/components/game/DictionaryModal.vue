<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()
console.log('Game store object:', gameStore)
console.log('Game store clearDictionary function:', gameStore.clearDictionary)
console.log('Game store getDictionaryData function:', gameStore.getDictionaryData)

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const searchTerm = ref('')

// 从游戏存储中获取已学习的单词
const learnedWords = computed(() => {
  return Array.from(gameStore.vocabulary.learned.values())
})

const filteredDictionary = computed(() => {
  if (!searchTerm.value) {
    return learnedWords.value
  }

  const term = searchTerm.value.toLowerCase()
  return learnedWords.value.filter((entry) => entry.word.toLowerCase().includes(term))
})

// 清空词典
const clearDictionary = () => {
  if (confirm('确定要清空词典吗？此操作无法撤销。')) {
    gameStore.clearDictionary()
  }
}

// 输出词典数据到控制台
const outputDictionaryData = () => {
  const data = gameStore.getDictionaryData()
  console.log('Dictionary Data:', data)
  alert(`词典数据已输出到控制台，共 ${data.length} 个单词`)
}

const close = () => {
  emit('close')
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="fantasy-title text-2xl font-bold">Personal Dictionary</h2>
          <button @click="close" class="text-gray-500 hover:text-gray200 text-2xl">×</button>
        </div>
        <div class="mt-4 flex space-x-2">
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Search vocabulary..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          <button
            @click="clearDictionary"
            class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
          >
            清空词典
          </button>
          <button
            @click="outputDictionaryData"
            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
          >
            输出数据
          </button>
        </div>
      </div>
      <div class="p-6">
        <div v-if="filteredDictionary.length === 0" class="text-gray-500 text-center">
          No words found matching your search.
        </div>
        <div v-else>
          <!-- 以小砖块形式显示单词，每行3个 -->
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="entry in filteredDictionary"
              :key="entry.word"
              class="dictionary-card bg-yellow-100 border border-yellow-300 p-3 text-center rounded"
            >
              <div class="font-bold text-lg">{{ entry.word }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: none;
}

.fantasy-title {
  font-family: 'Cinzel', serif;
  color: var(--primary-gold);
  text-shadow: none;
}

.dictionary-card {
  background: var(--secondary-parchment);
  border: 1px solid var(--primary-gold);
  border-radius: 0;
  padding: 1rem;
  margin-bottom: 0.5rem;
  transition: none;
  box-shadow: none;
}

.dictionary-card:hover {
  transform: none;
  box-shadow: none;
}

.chinese-text {
  font-family: 'Noto Sans SC', sans-serif;
}
</style>
