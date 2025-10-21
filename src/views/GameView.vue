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
  // 解析response中被**包裹的词汇，将其转换为可点击的交互式词汇
  const processedResponse = response.replace(
    /\*\*(.*?)\*\*/g,
    '<span class="interactive-word" data-word="$1">$1</span>',
  )

  // 更新AI生成的内容
  gameStore.updateGeneratedContent(processedResponse)
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
    <nav
      class="bg-black bg-opacity-30 backdrop-blur-md border-b border-yellow-600 border-opacity-30 sticky top-0 z-50"
    >
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
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              📚 词典
            </button>
            <button
              @click="saveGame"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              💾 保存
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
            @word-selected="selectWord"
          />

          <!-- Action Response -->
          <div
            v-if="actionResponse"
            class="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg action-response"
          >
            <p class="italic text-blue-800">{{ actionResponse }}</p>
          </div>

          <!-- Action Prompt -->
          <div v-if="showActionPrompt" class="mt-6 p-4 bg-blue-100 rounded-lg">
            <p class="font-medium text-blue-800 mb-3">{{ actionPromptText }}</p>
            <div class="flex space-x-3">
              <button
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                @click="handleActionPrompt('yes')"
              >
                Yes
              </button>
              <button
                class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                @click="handleActionPrompt('retry')"
              >
                Try Another
              </button>
              <button
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
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

          <!-- AI Console Tester -->
          <AIConsoleTester @ai-response="handleAIResponse" />
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
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-purple) 100%);
  min-height: 100vh;
  color: var(--text-charcoal);
}

.fantasy-title {
  font-family: 'Cinzel', serif;
  background: linear-gradient(45deg, var(--primary-gold), #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}

.parchment-bg {
  background: linear-gradient(135deg, var(--secondary-parchment) 0%, #f0e68c 100%);
  border: 2px solid var(--primary-gold);
  box-shadow: inset 0 0 20px rgba(139, 69, 19, 0.1);
}

.magical-glow {
  box-shadow:
    0 0 20px rgba(212, 175, 55, 0.4),
    inset 0 0 20px rgba(212, 175, 55, 0.1);
  border: 1px solid var(--primary-gold);
}

.action-button {
  background: linear-gradient(135deg, var(--primary-burgundy), #b22222);
  border: 2px solid var(--primary-gold);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(128, 0, 32, 0.4);
}

.action-button:active {
  transform: translateY(0);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.stat-bar {
  background: linear-gradient(90deg, var(--primary-green), #32cd32);
  height: 8px;
  border-radius: 4px;
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
  backdrop-filter: blur(5px);
}

.dictionary-card {
  background: var(--secondary-parchment);
  border: 1px solid var(--primary-gold);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.dictionary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.2);
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
