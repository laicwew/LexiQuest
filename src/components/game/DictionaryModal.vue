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
const sortOption = ref('added') // 添加排序选项，默认为按添加顺序

// 从游戏存储中获取已学习的单词
const learnedWords = computed(() => {
  return Array.from(gameStore.vocabulary.learned.values())
})

const filteredDictionary = computed(() => {
  let result = learnedWords.value

  // 应用搜索过滤
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter((entry) => entry.word.toLowerCase().includes(term))
  }

  // 应用排序
  switch (sortOption.value) {
    case 'alphabetical':
      // 按首字母从a到z排序
      result = [...result].sort((a, b) => a.word.localeCompare(b.word))
      break
    case 'review':
      // 按复习次数从低到高排序
      result = [...result].sort((a, b) => (a.reviewCount || 0) - (b.reviewCount || 0))
      break
    case 'added':
    default:
      // 按添加顺序从早到晚排序（根据learnedAt字段）
      result = [...result].sort((a, b) => (a.learnedAt || 0) - (b.learnedAt || 0))
      break
  }

  return result
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

// 排序选项的标签
const sortOptions = [
  { value: 'added', label: 'By Date Added' },
  { value: 'alphabetical', label: 'By Alphabetical' },
  { value: 'review', label: 'By Reviews' },
]
</script>

<template>
  <div v-if="show" class="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4">
    <div
      class="bg-[var(--secondary-parchment)] rounded-lg border-[var(--primary-gold)] border-2 max-w-3xl w-full max-h-96 overflow-y-auto"
    >
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-4xl font-bold text-[var(--primary-gold)]">Personal Dictionary</h2>
          <button @click="close" class="text-gray-500 hover:text-gray200 text-2xl">×</button>
        </div>
        <div class="mt-2 flex space-x-2 text-2xl">
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Search vocabulary..."
            class="text-black flex-1 px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          <select
            v-model="sortOption"
            class="bg-[var(--primary-gold)] text-black px-2 border rounded-lg"
          >
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <!-- <button
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
          </button> -->
        </div>
      </div>
      <div class="p-6 bg-[var(--oxford-blue)]">
        <div v-if="filteredDictionary.length === 0" class="text-2xl text-gray-500 text-center">
          No words found matching your search.
        </div>
        <div v-else>
          <!-- 以小砖块形式显示单词，每行3个 -->
          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="entry in filteredDictionary"
              :key="entry.word"
              class="dictionary-card text-center"
            >
              <div class="font-bold text-2xl">{{ entry.word }} <span class="text-[#35157f]">{{ entry.reviewCount || 0 }}</span></div>
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
  border-radius: 0.5em;
  padding: 0.3rem;
}

.chinese-text {
  font-family: 'Noto Sans SC', sans-serif;
}
</style>
