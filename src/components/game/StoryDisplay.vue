<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

const props = defineProps<{
  storyText: string
  selectedWord: string | null
}>()

const emit = defineEmits<{
  (e: 'wordSelected', word: string): void
}>()

const storyContent = ref('')

// Vocabulary for the current scene
const currentVocabulary = ref([
  { word: 'apple', translation: '苹果', pos: 'noun', difficulty: 1 },
  { word: 'shelf', translation: '架子', pos: 'noun', difficulty: 2 },
  { word: 'clerk', translation: '店员', pos: 'noun', difficulty: 2 },
  { word: 'cleaning', translation: '打扫', pos: 'verb', difficulty: 2 },
  { word: 'bright', translation: '明亮的', pos: 'adjective', difficulty: 2 },
  { word: 'fruits', translation: '水果', pos: 'noun', difficulty: 1 },
  { word: 'vegetables', translation: '蔬菜', pos: 'noun', difficulty: 1 },
])

// Process text to highlight vocabulary words
const processStoryText = () => {
  let processedText = props.storyText

  // Process each vocabulary word
  currentVocabulary.value.forEach((wordData) => {
    const regex = new RegExp(`\\b${wordData.word}\\b`, 'gi')
    processedText = processedText.replace(
      regex,
      `<span class="interactive-word" data-word="${wordData.word}">${wordData.word}</span>`,
    )
  })

  storyContent.value = processedText
}

const selectWord = (word: string) => {
  emit('wordSelected', word)
}

// Process story text when it changes
watch(
  () => props.storyText,
  () => {
    processStoryText()
  },
)

// Update selected word styling when selection changes
watch(
  () => props.selectedWord,
  () => {
    updateSelectedWordStyling()
  },
)

// Handle word clicks in the processed HTML
const handleStoryClick = (event: Event) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('interactive-word')) {
    const word = target.getAttribute('data-word')
    if (word) {
      selectWord(word)
    }
  }
}

// Update styling for selected word
const updateSelectedWordStyling = () => {
  nextTick(() => {
    // Remove selected class from all words
    const allWords = document.querySelectorAll('.interactive-word')
    allWords.forEach((word) => {
      word.classList.remove('selected')
    })

    // Add selected class to the currently selected word
    if (props.selectedWord) {
      const selectedWords = document.querySelectorAll(`[data-word="${props.selectedWord}"]`)
      selectedWords.forEach((word) => {
        word.classList.add('selected')
      })
    }
  })
}

// 切换标签页
const switchTab = (tab: string) => {
  gameStore.switchTab(tab)
}

onMounted(() => {
  processStoryText()
})
</script>

<template>
  <div class="parchment-bg rounded-lg p-8 magical-glow min-h-96">
    <!-- Tabs -->
    <div class="flex mb-4 border-b border-gray-300">
      <button
        class="px-4 py-2 font-medium text-sm rounded-t-lg transition-colors"
        :class="[
          'GENERATED' === gameStore.activeTab
            ? 'bg-yellow-100 text-yellow-700 border-b-2 border-yellow-500'
            : 'text-gray-600 hover:text-gray-900',
        ]"
        @click="switchTab('GENERATED')"
      >
        GENERATED
      </button>
      <button
        class="px-4 py-2 font-medium text-sm rounded-t-lg transition-colors"
        :class="[
          'DUMMY' === gameStore.activeTab
            ? 'bg-yellow-100 text-yellow-700 border-b-2 border-yellow-500'
            : 'text-gray-600 hover:text-gray-900',
        ]"
        @click="switchTab('DUMMY')"
      >
        DUMMY
      </button>
    </div>

    <!-- Story Content -->
    <div class="story-text" v-html="storyContent" @click="handleStoryClick"></div>
  </div>
</template>

<style scoped>
.parchment-bg {
  background: linear-gradient(135deg, var(--secondary-parchment) 0%, #f0e68c 100%);
  border: 2px solid var(--primary-gold);
  box-shadow: inset 0 0 20px rgba(139, 69, 19, 0.1);
}

.story-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-charcoal);
}

/* 使用深度选择器来确保样式能应用到动态插入的元素 */
:deep(.interactive-word) {
  color: #1e90ff; /* 蓝色 */
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-weight: 600;
  text-decoration: underline;
}

:deep(.interactive-word:hover) {
  color: #00bfff; /* 浅蓝色 */
  transform: scale(1.05);
}

:deep(.interactive-word.selected) {
  color: #ffa500 !important; /* 橙色 */
  text-shadow: 0 0 10px rgba(255, 165, 0, 0.5) !important;
}
</style>
