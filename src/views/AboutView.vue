<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('INSTRUCTION')

const goBack = () => {
  router.push('/game')
}

const switchTab = (tab: string) => {
  activeTab.value = tab
}

const getTabClass = (tabName: string) => {
  return {
    active: activeTab.value === tabName,
    inactive: activeTab.value !== tabName,
  }
}
</script>

<template>
  <div class="game-container">
    <!-- Navigation Bar -->
    <nav class="bg-gray-900 border-b border-yellow-600 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <h1 class="fantasy-title text-5xl font-bold">LexiQuest</h1>
            <h1 class="text-white text-2xl font-bold">About</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="action-button">Back to Game</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="content-wrapper">
      <div class="parchment-bg p-8 magical-glow">
        <h1 class="fantasy-title text-4xl font-bold mb-6 text-center">About LexiQuest</h1>

        <!-- Tabs -->
        <div class="flex mb-0">
          <button
            class="px-4 py-2 font-medium text-3xl rounded-t-lg transition-colors tab-button"
            :class="getTabClass('INSTRUCTION')"
            @click="switchTab('INSTRUCTION')"
          >
            INSTRUCTION
          </button>
          <button
            class="px-4 py-2 font-medium text-3xl rounded-t-lg transition-colors tab-button"
            :class="getTabClass('AUTHOR')"
            @click="switchTab('AUTHOR')"
          >
            AUTHOR
          </button>
        </div>

        <!-- Tab Content -->
        <div class="story-text-container mt-0">
          <!-- Instruction Tab Content -->
          <div v-if="activeTab === 'INSTRUCTION'" class="story-text">

            <h3 class="text-3xl font-bold mt-4 mb-2">1. Getting Started</h3>
            <p class="mb-3">When you first start the game, you'll need to give your alien friend a name. This name will be used throughout your learning journey.
            </p>

            <h3 class="text-3xl font-bold mt-4 mb-2">2. Feeding Text to Your Alien</h3>
            <p class="mb-3">Switch to the FEEDER tab to provide reading material for your alien friend. Enter any English text you'd like your alien to learn from, then click the "Feed" button. The alien will process the text and extract vocabulary words at your target level.
            </p>

            <h3 class="text-3xl font-bold mt-4 mb-2">3. Learning Vocabulary</h3>
            <p class="mb-3">After feeding text, switch to the STUDY tab to see the vocabulary your alien has extracted. Words will be highlighted in blue. Click on any word to select it, then click the "Memorize" button to add it to your personal dictionary.
            </p>

            <h3 class="text-3xl font-bold mt-4 mb-2">4. Reviewing Words</h3>
            <p class="mb-3">Use the "Review" button to have your alien friend help you review words you've already learned. The alien will create exercises and examples to help reinforce your memory of these words.
            </p>

            <h3 class="text-3xl font-bold mt-4 mb-2">5. Collecting Postcards</h3>
            <p class="mb-3">As you progress, your alien friend will send you postcards with interesting facts about the country you've chosen to visit. Check the POSTCARDS tab to view your collection.
            </p>

            <h3 class="text-3xl font-bold mt-4 mb-2">6. Tracking Progress</h3>
            <p class="mb-3">The panel on the left shows your learning progress, including words learned, play time, and the number of reviews and feeds you've completed.
            </p>

            <h3 class="text-3xl font-bold mt-4 mb-2">7. Managing Your Dictionary</h3>
            <p class="mb-3">Click the "📚 Dictionary" button to view all the words you've learned. You can search and sort your memorized vocabulary from here.
            </p>
          </div>

          <!-- Author Tab Content -->
          <div v-else-if="activeTab === 'AUTHOR'" class="story-text mt-2">
            <p class="mb-3">LexiQuest was created by <a href="https://github.com/laicwew" class="text-blue-500 hover:underline" target="_blank">laicwew</a>.
            </p>

            <h3 class="text-3xl font-bold mt-4 mb-2">Technology</h3>
            <p class="mb-3">Vue.js, TypeScript, and Vite. Integrated with DeepSeek API.
            </p>

            <h3 class="text-3xl font-bold mt-4 mb-2">Contact</h3>
            <p class="mb-3">Email: laicwew@gmail.com
            </p>
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
  --yale-blue: #0f4c81;
  --cerulean: #007ba7;
}

.game-container {
  min-height: 100vh;
  color: var(--text-charcoal);
  font-family: 'ByteBounce', sans-serif;
}

.content-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 4rem);
  padding: 20px;
}

.fantasy-title {
  font-family: 'Cinzel', serif;
  color: var(--primary-gold);
  text-shadow: none;
}

.parchment-bg {
  background: var(--secondary-parchment);
  border: 4px solid var(--primary-gold) !important;
  box-shadow: none;
  max-width: 720px;
  width: 100%;
}

.magical-glow {
  box-shadow: none;
  border: 1px solid var(--primary-gold);
}

.story-text-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border: 3px solid var(--primary-gold);
  background: #14101e;
  min-height: 200px;
  max-height: 400px;
}

.story-text {
  font-size: 2rem;
  line-height: 1;
  color: var(--text-charcoal);
  white-space: pre-wrap;
}

.story-text h2,
.story-text h3 {
  color: var(--primary-gold);
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

.action-button {
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 2rem;
  transition: colors 0.2s ease;
  border: none;
  cursor: pointer;
}

.action-button:hover {
  transform: none;
  box-shadow: none;
}

.action-button:active {
  transform: none;
}

.action-button:disabled {
  background-color: #6b7280;
}

/* 添加统一的 tab 按钮样式 */
.tab-button {
  font-size: 1.25rem; /* xl */
}

.tab-button.active {
  background-color: var(--primary-gold);
  color: var(--secondary-parchment);
  border-bottom-color: var(--primary-gold);
  font-size: 1.875rem; /* 3xl */
}

.tab-button:not(.active) {
  color: var(--primary-gold); /* gray-600 */
}

.tab-button:not(.active):hover {
  color: var(--primary-green); /* gray-900 */
  background-color: var(--yale-blue); /* amber-100 */
}
</style>
