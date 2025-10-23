<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

const props = defineProps<{
  storyText: string
  selectedWord: string | null
  isLoading?: boolean // 添加加载状态属性
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
    <div class="story-text-container">
      <!-- 故事内容 -->
      <div class="story-text" v-html="storyContent" @click="handleStoryClick"></div>
      
      <!-- 续写时的加载动画 -->
      <div v-if="isLoading && storyContent" class="loading-container flex items-center py-4">
        <div class="loading-spinner mr-3"></div>
        <p class="text-gray-600">正在续写故事...</p>
      </div>
      
      <!-- 初始加载动画 -->
      <div v-else-if="isLoading" class="loading-container flex flex-col items-center justify-center py-8">
        <div class="loading-spinner"></div>
        <p class="mt-4 text-gray-600">正在生成故事...</p>
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

.story-text-container {
  max-height: 400px; /* 设置最大高度 */
  overflow-y: auto; /* 启用垂直滚动条 */
  padding: 10px; /* 添加内边距 */
  border: 1px solid var(--primary-gold); /* 添加边框 */
  background: var(--secondary-parchment); /* 背景色 */
  min-height: 200px; /* 确保容器有最小高度 */
  font-size: 20px; /* 设置字体大小 */
}

.story-text {
  font-size: 1.5em;
  line-height: 1;
  color: var(--text-charcoal);
}

/* 滚动条样式 */
.story-text-container::-webkit-scrollbar {
  width: 12px;
}

.story-text-container::-webkit-scrollbar-track {
  background: var(--secondary-parchment);
  border-left: 1px solid var(--primary-gold);
}

.story-text-container::-webkit-scrollbar-thumb {
  background: var(--primary-green);
  border: 1px solid var(--primary-gold);
}

.story-text-container::-webkit-scrollbar-thumb:hover {
  background: #1a2e0d;
}

/* 使用深度选择器来确保样式能应用到动态插入的元素 */
:deep(.interactive-word) {
  color: var(--primary-green); /* 使用森林绿 */
  cursor: pointer;
  transition: none; /* 移除过渡效果 */
  position: relative;
  font-weight: 600;
  text-decoration: underline;
  text-shadow: none; /* 移除阴影 */
}

:deep(.interactive-word:hover) {
  color: var(--primary-gold); /* 悬停时使用鹅黄色 */
  transform: none; /* 移除变换效果 */
}

:deep(.interactive-word.selected) {
  color: var(--primary-gold) !important; /* 选中时使用鹅黄色 */
  text-shadow: none !important; /* 移除阴影 */
}

/* 加载动画样式 */
.loading-container {
  display: flex;
  align-items: center;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--primary-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>