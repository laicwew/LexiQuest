<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const nativeLanguage = ref('zh')
const targetLanguage = ref('en')
const selectedDifficulty = ref('normal')
const errorMessage = ref('')
const successMessage = ref('')

const difficulties = [
  { id: 'easy', name: 'Easy', label: 'Guided learning', color: 'green' },
  { id: 'normal', name: 'Normal', label: 'Balanced challenge', color: 'yellow' },
  { id: 'hard', name: 'Hard', label: 'Advanced learning', color: 'red' }
]

const languages = [
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'ko', name: '한국어 (Korean)' }
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
  
  if (nativeLanguage.value === targetLanguage.value) {
    errorMessage.value = 'Native and target languages must be different'
    return false
  }
  
  return true
}

const selectDifficulty = (difficulty: string) => {
  selectedDifficulty.value = difficulty
}

const startNewGame = () => {
  if (!validateForm()) {
    return
  }
  
  // Save user preferences to localStorage
  const preferences = {
    username: username.value,
    nativeLanguage: nativeLanguage.value,
    targetLanguage: targetLanguage.value,
    difficulty: selectedDifficulty.value,
    timestamp: Date.now()
  }
  
  localStorage.setItem('lexiquest-preferences', JSON.stringify(preferences))
  localStorage.setItem('lexiquest-username', username.value)
  
  successMessage.value = 'Starting your adventure! Redirecting to character creation...'
  errorMessage.value = ''
  
  // Redirect to game view after a short delay
  setTimeout(() => {
    router.push('/game')
  }, 1500)
}

onMounted(() => {
  // Load saved preferences if they exist
  const savedPreferences = localStorage.getItem('lexiquest-preferences')
  if (savedPreferences) {
    try {
      const prefs = JSON.parse(savedPreferences)
      username.value = prefs.username || ''
      nativeLanguage.value = prefs.nativeLanguage || 'zh'
      targetLanguage.value = prefs.targetLanguage || 'en'
      selectedDifficulty.value = prefs.difficulty || 'normal'
    } catch (e) {
      console.error('Failed to parse saved preferences', e)
    }
  }
})
</script>

<template>
  <div class="start-container">
    <!-- Floating Particles Background -->
    <div class="floating-particles">
      <div class="particle" style="left: 10%; animation-delay: 0s;">✦</div>
      <div class="particle" style="left: 20%; animation-delay: 1s;">✧</div>
      <div class="particle" style="left: 30%; animation-delay: 2s;">✨</div>
      <div class="particle" style="left: 40%; animation-delay: 3s;">✦</div>
      <div class="particle" style="left: 50%; animation-delay: 4s;">✧</div>
      <div class="particle" style="left: 60%; animation-delay: 5s;">✨</div>
      <div class="particle" style="left: 70%; animation-delay: 0.5s;">✦</div>
      <div class="particle" style="left: 80%; animation-delay: 1.5s;">✧</div>
      <div class="particle" style="left: 90%; animation-delay: 2.5s;">✨</div>
    </div>

    <!-- Main Container -->
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="max-w-4xl w-full">
        
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <img alt="LexiQuest" class="h-24 w-auto mx-auto mb-4" src="@/assets/logo.svg" />
          <h1 class="fantasy-title text-5xl font-bold mb-2">LexiQuest</h1>
          <div class="typewriter-container">
            <p class="text-white text-xl">Where Learning Becomes an Adventure</p>
          </div>
        </div>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Welcome Section -->
          <div class="parchment-bg rounded-lg p-8 magical-glow">
            <h2 class="fantasy-title text-2xl font-bold mb-4">Welcome, Adventurer!</h2>
            <p class="text-gray-700 mb-6 leading-relaxed">
              Embark on an epic journey where learning vocabulary becomes an adventure. 
              Explore magical realms, interact with fascinating characters, and master 
              new languages through immersive storytelling.
            </p>
            
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <span>Create your character and choose your learning path</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <span>Select from various story modules and adventures</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <span>Learn vocabulary through interactive gameplay</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                <span>Track your progress and unlock achievements</span>
              </div>
            </div>
          </div>

          <!-- Setup Section -->
          <div class="parchment-bg rounded-lg p-8 magical-glow">
            <h2 class="fantasy-title text-2xl font-bold mb-6">Begin Your Adventure</h2>
            
            <!-- Username Input -->
            <div class="mb-6">
              <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                Choose Your Adventurer Name
              </label>
              <input 
                id="username"
                v-model="username"
                type="text" 
                placeholder="Enter your name..."
                class="w-full px-4 py-3 border-2 border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg"
                maxlength="20"
                autocomplete="off"
              />
              <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
              <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
            </div>

            <!-- Language Selection -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label for="native-language" class="block text-sm font-medium text-gray-700 mb-2">
                  Native Language
                </label>
                <select 
                  id="native-language"
                  v-model="nativeLanguage"
                  class="w-full px-4 py-3 border-2 border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                    {{ lang.name }}
                  </option>
                </select>
              </div>
              <div>
                <label for="target-language" class="block text-sm font-medium text-gray-700 mb-2">
                  Target Language
                </label>
                <select 
                  id="target-language"
                  v-model="targetLanguage"
                  class="w-full px-4 py-3 border-2 border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                    {{ lang.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Difficulty Selection -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Learning Difficulty
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button 
                  v-for="diff in difficulties"
                  :key="diff.id"
                  class="difficulty-btn p-3 border-2 rounded-lg text-center transition-all"
                  :class="[
                    selectedDifficulty === diff.id 
                      ? `border-${diff.color}-600 bg-${diff.color}-50` 
                      : 'border-gray-300 hover:border-yellow-600'
                  ]"
                  @click="selectDifficulty(diff.id)"
                >
                  <div class="font-bold" :class="`text-${diff.color}-600`">{{ diff.name }}</div>
                  <div class="text-xs text-gray-500">{{ diff.label }}</div>
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button 
                class="start-button w-full py-4 px-6 rounded-lg text-lg font-bold"
                @click="startNewGame"
              >
                🚀 Start New Adventure
              </button>
            </div>
          </div>
        </div>

        <!-- Features Section -->
        <div class="mt-8 parchment-bg rounded-lg p-8 magical-glow">
          <h2 class="fantasy-title text-2xl font-bold mb-6 text-center">Game Features</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                📚
              </div>
              <h3 class="font-bold text-lg mb-2">Interactive Learning</h3>
              <p class="text-gray-600 text-sm">Learn vocabulary through context and interaction with story elements</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                🎮
              </div>
              <h3 class="font-bold text-lg mb-2">RPG Adventure</h3>
              <p class="text-gray-600 text-sm">Immersive storytelling with character progression and achievements</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                📊
              </div>
              <h3 class="font-bold text-lg mb-2">Progress Tracking</h3>
              <p class="text-gray-600 text-sm">Monitor your learning progress with detailed analytics and insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-green: #2D5016;
  --primary-gold: #D4AF37;
  --primary-burgundy: #800020;
  --secondary-parchment: #F5F5DC;
  --secondary-purple: #663399;
  --accent-cyan: #00FFFF;
  --text-charcoal: #36454F;
}

body {
  font-family: 'ByteBounce', sans-serif; /* 使用自定义字体 */
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-purple) 100%);
  min-height: 100vh;
  color: var(--text-charcoal);
  font-size: 20px; /* 设置字体大小 */
}

.fantasy-title {
  font-family: 'Cinzel', serif;
  background: linear-gradient(45deg, var(--primary-gold), #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}

.parchment-bg {
  background: linear-gradient(135deg, var(--secondary-parchment) 0%, #F0E68C 100%);
  border: 2px solid var(--primary-gold);
  box-shadow: inset 0 0 20px rgba(139, 69, 19, 0.1);
}

.magical-glow {
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.4), inset 0 0 20px rgba(212, 175, 55, 0.1);
  border: 1px solid var(--primary-gold);
}

.start-button {
  background: linear-gradient(135deg, var(--primary-burgundy), #B22222);
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
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.typewriter-container {
  min-height: 60px;
}

.error-message {
  color: #DC2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.success-message {
  color: #059669;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style>