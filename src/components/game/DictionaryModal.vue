<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const searchTerm = ref('')

// Mock dictionary data
const dictionaryData = ref([
  { word: 'apple', translation: '苹果', pos: 'noun', mastery: 80 },
  { word: 'shelf', translation: '架子', pos: 'noun', mastery: 60 },
  { word: 'clerk', translation: '店员', pos: 'noun', mastery: 70 },
  { word: 'cleaning', translation: '打扫', pos: 'verb', mastery: 50 },
  { word: 'bright', translation: '明亮的', pos: 'adjective', mastery: 40 },
  { word: 'fruits', translation: '水果', pos: 'noun', mastery: 90 },
  { word: 'vegetables', translation: '蔬菜', pos: 'noun', mastery: 85 },
])

const filteredDictionary = computed(() => {
  if (!searchTerm.value) {
    return dictionaryData.value
  }

  const term = searchTerm.value.toLowerCase()
  return dictionaryData.value.filter(
    (entry) =>
      entry.word.toLowerCase().includes(term) || entry.translation.toLowerCase().includes(term),
  )
})

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
          <button @click="close" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        <div class="mt-4">
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Search vocabulary..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>
      <div class="p-6">
        <div v-if="filteredDictionary.length === 0" class="text-gray-500 text-center">
          No words found matching your search.
        </div>
        <div v-else>
          <div v-for="entry in filteredDictionary" :key="entry.word" class="dictionary-card">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-bold text-lg">{{ entry.word }}</h4>
                <p class="text-gray-600 chinese-text">{{ entry.translation }}</p>
                <p class="text-sm text-gray-500 capitalize">{{ entry.pos }}</p>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-400">Mastery</div>
                <div class="w-16 bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    class="bg-yellow-500 h-2 rounded-full"
                    :style="{ width: entry.mastery + '%' }"
                  ></div>
                </div>
              </div>
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
