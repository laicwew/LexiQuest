<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import CharacterStats from '@/components/game/CharacterStats.vue'
import StoryDisplay from '@/components/game/StoryDisplay.vue'
import ActionButtons from '@/components/game/ActionButtons.vue'
import ProgressPanel from '@/components/game/ProgressPanel.vue'
import DictionaryModal from '@/components/game/DictionaryModal.vue'
import Notification from '@/components/game/Notification.vue'
import AIConsoleTester from '@/components/game/AIConsoleTester.vue'
import WordFeeder from '@/components/game/WordFeeder.vue'

// Game store
const gameStore = useGameStore()

// UI state
const showDictionary = ref(false)
const actionResponse = ref('')
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

// 添加测试getContextForContinuation的函数
const testGetContext = () => {
  const context = gameStore.getContextForContinuation()
  console.log('Generated context for continuation:', context)
  alert('Context has been logged to console. Check the browser console for details.')
}

const selectWord = (word: string) => {
  gameStore.selectWord(word)
}

const performAction = (action: string) => {
  const response = gameStore.performAction(action)
  if (response) {
    actionResponse.value = response
    // Scroll to response
    setTimeout(() => {
      const responseElement = document.querySelector('.action-response')
      if (responseElement) {
        responseElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }
}

const generateActionPrompt = () => {
  const prompts = [
    '你想深入探索市场吗？',
    '店员似乎还有更多话要说。你要不要再和他谈谈？',
    '你注意到远处的架子上有闪闪发光的东西。要调查一下吗？',
    '魔法的氛围让你感到好奇。要多看看周围吗？',
    '你想练习更多词汇。要试试另一个词吗？',
  ]

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
  actionPromptText.value = randomPrompt || ''
  showActionPrompt.value = true
}

const handleActionPrompt = (choice: string) => {
  showActionPrompt.value = false

  if (choice === 'yes') {
    const continuationText = '你决定进一步探索。魔法市场似乎隐藏着许多秘密和学习机会...'
    actionResponse.value = continuationText
  }
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
  // 保存原始的AI生成内容
  gameStore.updateRawGeneratedContent(response)

  // 解析response中被**包裹的词汇，将其转换为可点击的交互式词汇
  const processedResponse = response.replace(
    /\*\*(.*?)\*\*/g,
    '<span class="interactive-word" data-word="$1">$1</span>',
  )

  // 检查是否有游戏历史来决定如何更新内容
  if (gameStore.gameHistory.length > 0) {
    // 有游戏历史，在原有文本下面补充新生成的段落
    const separator = '<br><br>---<br><br>' // 添加分隔符
    const currentContent = gameStore.generatedContent || ''
    const newContent = currentContent
      ? currentContent + separator + processedResponse
      : processedResponse
    gameStore.updateGeneratedContent(newContent)
  } else {
    // 没有游戏历史，直接更新内容
    gameStore.updateGeneratedContent(processedResponse)
  }
}

// 监听AI控制台的加载状态变化
const handleAILoading = (loading: boolean) => {
  isLoading.value = loading
}

// Initialize game
onMounted(() => {
  gameStore.loadGame()
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
            <img src="@/assets/logo.svg" alt="LexiQuest" class="h-10 w-auto" />
            <h1 class="fantasy-title text-2xl font-bold">LexiQuest</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-white font-medium">{{ gameStore.character.name }}</span>
            <button
              @click="toggleDictionary"
              class="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 transition-colors border border-yellow-700"
            >
              📚 词典
            </button>
            <button
              @click="saveGame"
              class="bg-green-700 hover:bg-green-600 text-white px-4 py-2 transition-colors border border-green-800"
            >
              💾 保存
            </button>
            <!-- 添加测试按钮 -->
            <button
              @click="testGetContext"
              class="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 transition-colors border border-blue-800"
            >
              🧪 测试上下文
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Game Container -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Character Stats Panel -->
        <div class="lg:col-span-1">
          <CharacterStats :character="gameStore.character" :vocab-count="gameStore.vocabCount" />
        </div>

        <!-- Story Display Area -->
        <div class="lg:col-span-2">
          <StoryDisplay
            :story-text="gameStore.story.text"
            :selected-word="gameStore.vocabulary.selectedWord"
            :is-loading="isLoading"
            @word-selected="selectWord"
          />

          <!-- Action Response -->
          <div v-if="actionResponse" class="mt-4 p-4 bg-blue-100 border border-blue-300">
            <p class="italic text-blue-800">{{ actionResponse }}</p>
          </div>

          <!-- Action Prompt -->
          <div v-if="showActionPrompt" class="mt-6 p-4 bg-blue-100 border border-blue-300">
            <p class="font-medium text-blue-800 mb-3">{{ actionPromptText }}</p>
            <div class="flex space-x-3">
              <button
                class="bg-green-700 hover:bg-green-600 text-white px-4 py-2 transition-colors border border-green-800"
                @click="handleActionPrompt('yes')"
              >
                Yes
              </button>
              <button
                class="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 transition-colors border border-yellow-700"
                @click="handleActionPrompt('retry')"
              >
                Try Another
              </button>
              <button
                class="bg-red-700 hover:bg-red-600 text-white px-4 py-2 transition-colors border border-red-800"
                @click="handleActionPrompt('no')"
              >
                No
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <ActionButtons
            :selected-word="gameStore.vocabulary.selectedWord"
            @perform-action="performAction"
            @generate-prompt="generateActionPrompt"
          />

          <!-- Word Feeder -->
          <WordFeeder 
            @ai-response="handleAIResponse" 
            @loading="handleAILoading"
            @imitate-word="performAction"
          />

          <!-- AI Console Tester -->
          <AIConsoleTester @ai-response="handleAIResponse" @loading="handleAILoading" />
        </div>

        <!-- Progress & Achievements Panel -->
        <div class="lg:col-span-1">
          <ProgressPanel :module="gameStore.currentModule" :progress="gameStore.progress" />
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
  background: var(--primary-burgundy); /* 扁平化背景 */
  border: 2px solid var(--primary-gold);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: none; /* 移除阴影 */
}

.action-button:hover {
  transform: none; /* 移除变换效果 */
  box-shadow: none; /* 移除阴影 */
  background: #a00028; /* 稍微亮一点的 burgundy */
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
