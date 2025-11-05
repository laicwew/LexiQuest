<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import CharacterStats from '@/components/game/CharacterStats.vue'
import StoryDisplay from '@/components/game/StoryDisplay.vue'
import ProgressPanel from '@/components/game/ProgressPanel.vue'
import DictionaryModal from '@/components/game/DictionaryModal.vue'
import Notification from '@/components/game/Notification.vue'
import SeeYouAgainButton from '@/components/game/SeeYouAgainButton.vue'
import { useRouter } from 'vue-router'

// Game store
const gameStore = useGameStore()
const router = useRouter()

// UI state
const showDictionary = ref(false)
const showActionPrompt = ref(false)
const actionPromptText = ref('')
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error' | 'info' | 'achievement'>('info')
const isLoading = ref(false) // 添加加载状态

// Timer for progress tracking
let progressTimer: number | null = null

// Methods
const toggleDictionary = () => {
  showDictionary.value = !showDictionary.value
}

const saveGame = () => {
  gameStore.saveGame()
  showGameNotification('Game saved successfully!', 'success')
}

const selectWord = (word: string) => {
  gameStore.selectWord(word)
}

const showGameNotification = (
  message: string,
  type: 'success' | 'error' | 'info' | 'achievement' = 'info',
) => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
}

const closeNotification = () => {
  showNotification.value = false
}

// 处理AI响应
const handleAIResponse = (response: string) => {
  // 解析response中被**包裹的词汇，将其转换为可点击的交互式词汇
  const processedResponse = response.replace(
    /\*\*(.*?)\*\*/g,
    '<span class="interactive-word" data-word="$1">$1</span>',
  )

  gameStore.updateGeneratedContent(processedResponse)
}

// 处理词典通知
const handleDictionaryNotification = (message: string) => {
  notificationMessage.value = message
  notificationType.value = 'success'
  showNotification.value = true

  // 3秒后自动隐藏通知
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// 监听AI控制台的加载状态变化
const handleAILoading = (loading: boolean) => {
  isLoading.value = loading
}

// 返回首页
const goToHome = () => {
  router.push('/')
}

// 跳转到关于页面
const goToAbout = () => {
  router.push('/about')
}

// Initialize game
onMounted(() => {
  gameStore.loadGame()
  gameStore.loadLevelRequirements() // 加载等级要求
  gameStore.startProgressTracking()

  // Set up progress tracking
  progressTimer = window.setInterval(() => {
    gameStore.updateProgress({ timeSpent: gameStore.progress.timeSpent + 1 })
  }, 1000) as unknown as number
})

// Clean up
onUnmounted(() => {
  if (progressTimer) {
    clearInterval(progressTimer)
  }
})
</script>

<template>
  <div class="game-container">
    <!-- Navigation Bar -->
    <nav class="bg-gray-900 border-b border-yellow-600 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <!-- <img src="@/assets/logo.svg" alt="HelloMee" class="h-10 w-auto" /> -->
            <h1 class="fantasy-title text-5xl font-bold cursor-pointer" @click="goToHome">
              HelloMee
            </h1>
            <h1 class="text-white text-2xl font-bold">PLAYER: {{ gameStore.userName }}</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="toggleDictionary" class="action-button">📚 Dictionary</button>
            <button @click="saveGame" class="action-button">💾 Save</button>
            <button @click="goToAbout" class="action-button">About</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Game Container -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Left Column (Character Stats and Progress Panel) -->
        <div class="lg:col-span-1 flex flex-col">
          <!-- Character Stats Panel -->
          <div class="flex-shrink-0">
            <CharacterStats
              :character="gameStore.character"
              :vocab-count="gameStore.vocabCount"
              :is-loading="isLoading"
            />
          </div>

          <!-- Progress & Achievements Panel -->
          <div class="flex-shrink-0 mt-8">
            <ProgressPanel :progress="gameStore.progress" />
          </div>

          <!-- See you again button for admin1116 -->
          <div v-if="gameStore.userName === 'admin1116'" class="mt-4">
            <SeeYouAgainButton />
          </div>

          <!-- Spacer to push content to top -->
          <div class="flex-grow"></div>
        </div>

        <!-- Story Display Area -->
        <div class="lg:col-span-3 flex flex-col">
          <div class="flex-grow flex flex-col">
            <StoryDisplay
              class="flex-grow"
              :story-text="gameStore.story.text"
              :selected-word="gameStore.vocabulary.selectedWord"
              :is-loading="isLoading"
              @word-selected="selectWord"
              @ai-response="handleAIResponse"
              @loading="handleAILoading"
              @show-notification="handleDictionaryNotification"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Dictionary Modal -->
    <DictionaryModal :show="showDictionary" @close="toggleDictionary" />

    <!-- General Notification -->
    <Notification
      :message="notificationMessage"
      :type="notificationType"
      :show="showNotification"
      @close="closeNotification"
    />
  </div>
</template>

<style scoped>
:root {
  --primary-green: #2d5016;
  --primary-gold: #d4af37;
  --primary-burgundy: #800020;
  --secondary-parchment: #f5f5dc;
  --secondary-purple: #663399;
  --accent-cyan: #00ffff;
  --text-charcoal: #36454f;
}

body {
  font-family: 'Inter', sans-serif;
  background: var(--primary-green); /* 扁平化背景 */
  min-height: 100vh;
  color: var(--text-charcoal);
}

.fantasy-title {
  font-family: 'Cinzel', serif;
  color: var(--primary-gold);
  text-shadow: none; /* 移除渐变和阴影 */
  cursor: pointer;
}

.parchment-bg {
  background: var(--secondary-parchment); /* 扁平化背景 */
  border: 2px solid var(--primary-gold);
  box-shadow: none; /* 移除阴影 */
}

.magical-glow {
  box-shadow: none; /* 移除发光效果 */
  border: 1px solid var(--primary-gold);
}

.action-button {
  color: white;
  padding: 0.1rem 1rem;
  /* border: 2px solid var(--orange-web); */
  border-radius: 0.5rem;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 1.5rem; /* 2xl */
  transition: colors 0.2s ease;
}

.action-button:hover {
  transform: none; /* 移除变换效果 */
  box-shadow: none; /* 移除阴影 */
  background: var(--secondary-parchment); /* 稍微亮一点的 burgundy */
}

.action-button:active {
  transform: none; /* 移除变换效果 */
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.stat-bar {
  background: var(--primary-green); /* 扁平化背景 */
  height: 8px;
  border-radius: 0; /* 移除圆角 */
  transition: width 0.5s ease;
}

.story-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-charcoal);
}

.chinese-text {
  font-family: 'Noto Sans SC', sans-serif;
}

.modal-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: none; /* 移除模糊效果 */
}

.dictionary-card {
  background: var(--secondary-parchment);
  border: 1px solid var(--primary-gold);
  border-radius: 0; /* 移除圆角 */
  padding: 1rem;
  margin-bottom: 0.5rem;
  transition: none; /* 移除过渡效果 */
  box-shadow: none; /* 移除阴影 */
}

.dictionary-card:hover {
  transform: none; /* 移除变换效果 */
  box-shadow: none; /* 移除阴影 */
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
