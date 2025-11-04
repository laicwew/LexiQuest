<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const targetLevel = ref('CET-6') // 默认为CET-6
const targetCountry = ref('America') // 默认为美国
const errorMessage = ref('')
const successMessage = ref('')

// 目标等级选项（移除custom选项）
const levelOptions = [
  { value: 'IELTS', label: 'IELTS' },
  { value: 'TOEFL', label: 'TOEFL' },
  { value: 'CET-4', label: 'CET-4' },
  { value: 'CET-6', label: 'CET-6' },
]

// 目标国家选项
const countryOptions = [
  { value: 'America', label: 'America' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Sweden', label: 'Sweden' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Canada', label: 'Canada' },
  { value: 'China', label: 'China' },
  { value: 'Japan', label: 'Japan' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
]

const validateForm = () => {
  if (!username.value.trim()) {
    errorMessage.value = 'Please enter a username'
    return false
  }

  if (username.value.length < 3) {
    errorMessage.value = 'Username must be at least 3 characters long'
    return false
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username.value)) {
    errorMessage.value = 'Username can only contain letters, numbers, and underscores'
    return false
  }

  return true
}

const startNewGame = () => {
  if (!validateForm()) {
    return
  }

  // Save username to localStorage
  localStorage.setItem('lexiquest-username', username.value)

  // Load existing game state or create new one
  let gameState = {
    character: {
      name: '',
      level: 1,
      hp: 100,
      maxHp: 100,
      languageLevel: targetLevel.value, // 使用当前选择的值
      country: targetCountry.value, // 使用当前选择的值
    },
    story: {
      currentScene: 'entrance',
      text: '',
      history: [],
    },
    vocabulary: {
      selectedWord: null,
      dictionary: [],
      learned: [],
    },
    progress: {
      wordsLearnedToday: 0,
      timeSpent: 0,
      reviewTaken: 0, // 新增：记录Review操作次数
      feedTaken: 0, // 新增：记录Feed操作次数
    },
    settings: {
      nativeLanguage: 'zh',
      targetLanguage: 'en',
      difficulty: 'normal',
      soundEnabled: true,
      animationsEnabled: true,
    },
    activeTab: 'GENERATED',
    generatedContent: '',
    userName: username.value,
    postcards: [],
    postcardCounter: 0,
  }

  // Try to load existing game state
  const savedState = localStorage.getItem('lexiquest-save')
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState)
      gameState = {
        ...gameState,
        ...parsed,
        character: {
          ...gameState.character,
          ...parsed.character,
          // 确保使用当前选择的值覆盖保存的值
          languageLevel: targetLevel.value,
          country: targetCountry.value,
        },
      }
    } catch (e) {
      console.error('Failed to parse saved game state', e)
    }
  }

  // Save updated game state
  localStorage.setItem('lexiquest-save', JSON.stringify(gameState))

  successMessage.value = 'Redirecting to character creation...'
  errorMessage.value = ''

  // Redirect to game view after a short delay
  setTimeout(() => {
    router.push('/game')
  }, 1500)
}

onMounted(() => {
  // Load saved game state if it exists
  const savedState = localStorage.getItem('lexiquest-save')
  if (savedState) {
    try {
      const gameState = JSON.parse(savedState)
      username.value = gameState.userName || ''
      targetLevel.value = gameState.character?.languageLevel || 'CET-6'
      targetCountry.value = gameState.character?.country || 'America'
    } catch (e) {
      console.error('Failed to parse saved game state', e)
    }
  }

  // Also load username if exists but no game state
  if (!username.value) {
    const savedUsername = localStorage.getItem('lexiquest-username')
    if (savedUsername) {
      username.value = savedUsername
    }
  }
})
</script>

<template>
  <div class="start-container">
    <!-- Main Container -->
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <h1 class="fantasy-title text-6xl font-bold mb-2">LexiQuest</h1>
          <div class="typewriter-container">
            <p class="text-white text-3xl">Meet your alien friend here</p>
          </div>
        </div>

        <!-- Setup Section -->
        <div class="parchment-bg rounded-lg p-8">
          <div class="mb-6">
            <label for="username" class="block text-3xl text-yellow-600 font-medium mb-2">
              Player Name
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter your name..."
              class="w-full px-4 py-1 border-2 border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-2xl text-black"
              maxlength="20"
              autocomplete="off"
            />
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
            <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
          </div>

          <!-- Target Level and Target Country Selection (on the same line) -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label for="target-level" class="block text-3xl text-yellow-600 font-medium mb-2">
                Target Level
              </label>
              <select
                id="target-level"
                v-model="targetLevel"
                class="text-black text-2xl w-full px-4 py-3 border-2 border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option v-for="level in levelOptions" :key="level.value" :value="level.value">
                  {{ level.label }}
                </option>
              </select>
            </div>

            <div>
              <label for="target-country" class="block text-3xl text-yellow-600 font-medium mb-2">
                Target Country
              </label>
              <select
                id="target-country"
                v-model="targetCountry"
                class="text-black text-2xl w-full px-4 py-3 border-2 border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option
                  v-for="country in countryOptions"
                  :key="country.value"
                  :value="country.value"
                >
                  {{ country.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button
              class="start-button w-full py-4 px-6 rounded-lg text-3xl font-bold"
              @click="startNewGame"
            >
              🚀 START GAME
            </button>
          </div>
        </div>
      </div>
    </div>
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
  background: rgba(20, 30, 72, 0.8);
  border: 3px solid var(--primary-gold);
}

.start-button {
  background: #790303;
  border: 2px solid var(--primary-gold);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(128, 0, 32, 0.4);
}

.start-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.difficulty-btn {
  cursor: pointer;
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  color: var(--primary-gold);
  animation: float 6s ease-in-out infinite;
  opacity: 0.6;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.typewriter-container {
  min-height: 60px;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.success-message {
  color: #0285ff;
  font-size: 1.25rem;
  margin-top: 0.5rem;
}
</style>
