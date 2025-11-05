<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { useRouter } from 'vue-router'

const gameStore = useGameStore()
const router = useRouter()

const seeYouAgain = () => {
  // 清除localStorage
  localStorage.clear()

  // 将gameStore中所有数值恢复到默认值
  gameStore.character = {
    name: '',
    level: 1,
    hp: 100,
    maxHp: 100,
    languageLevel: 'CET-6',
    country: 'America',
  }

  gameStore.story = {
    currentScene: 'entrance',
    text: '',
    history: [],
  }

  gameStore.vocabulary = {
    selectedWord: null,
    dictionary: [],
    learned: new Map(),
  }

  gameStore.progress = {
    wordsLearnedToday: 0,
    timeSpent: 0,
    reviewTaken: 0,
    feedTaken: 0,
  }

  gameStore.postcards = []
  gameStore.activeTab = 'GENERATED'
  gameStore.generatedContent = ''
  gameStore.userName = ''
  gameStore.targetLanguage = 'English' // 重置目标语言为默认值

  // 保存重置后的状态
  gameStore.saveGame()

  // 跳转到StartView页面
  router.push('/')
}
</script>

<template>
  <button
    @click="seeYouAgain"
    class="w-full action-button bg-[#1282a2ff] hover:bg-[#2b6589] active:bg-[#0f3d5a]"
  >
    See you again
  </button>
</template>

<style scoped>
.action-button {
  color: white;
  padding: 0.1rem 1rem;
  border-radius: 0.5rem;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 1.5rem;
  transition: colors 0.2s ease;
}
</style>