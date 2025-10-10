import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  // State
  const character = ref({
    name: 'Adventurer',
    level: 1,
    hp: 100,
    maxHp: 100,
    energy: 50,
    maxEnergy: 50,
    experience: 0,
    maxExperience: 100
  })

  const currentModule = ref({
    id: 'supermarket_v1',
    title: 'Magical Market',
    description: 'Learn shopping vocabulary',
    progress: 25
  })

  const story = ref({
    currentScene: 'entrance',
    text: '',
    history: [] as string[]
  })

  const vocabulary = ref({
    selectedWord: null as string | null,
    dictionary: [] as any[],
    learned: new Map<string, any>()
  })

  const progress = ref({
    wordsLearnedToday: 5,
    timeSpent: 900, // 15 minutes in seconds
    actionsTaken: 12,
    achievements: [] as string[]
  })

  // Getters
  const hpPercent = computed(() => (character.value.hp / character.value.maxHp) * 100)
  const energyPercent = computed(() => (character.value.energy / character.value.maxEnergy) * 100)
  const xpPercent = computed(() => (character.value.experience / character.value.maxExperience) * 100)
  const vocabCount = computed(() => progress.value.wordsLearnedToday)

  // Actions
  function selectWord(word: string) {
    vocabulary.value.selectedWord = word
  }

  function clearSelectedWord() {
    vocabulary.value.selectedWord = null
  }

  function updateCharacterStats(stats: Partial<typeof character.value>) {
    Object.assign(character.value, character.value, stats)
  }

  function updateProgress(progressUpdate: Partial<typeof progress.value>) {
    Object.assign(progress.value, progress.value, progressUpdate)
  }

  function saveGame() {
    const gameState = {
      character: character.value,
      currentModule: currentModule.value,
      story: story.value,
      vocabulary: {
        ...vocabulary.value,
        learned: Array.from(vocabulary.value.learned.entries())
      },
      progress: progress.value
    }
    
    localStorage.setItem('lexiquest-save', JSON.stringify(gameState))
  }

  function loadGame() {
    const savedState = localStorage.getItem('lexiquest-save')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        character.value = parsed.character
        currentModule.value = parsed.currentModule
        story.value = parsed.story
        vocabulary.value = parsed.vocabulary
        progress.value = parsed.progress
        
        // Restore Map objects
        if (parsed.vocabulary && parsed.vocabulary.learned) {
          vocabulary.value.learned = new Map(parsed.vocabulary.learned)
        }
      } catch (e) {
        console.error('Failed to load game state', e)
      }
    }
  }

  return {
    // State
    character,
    currentModule,
    story,
    vocabulary,
    progress,
    
    // Getters
    hpPercent,
    energyPercent,
    xpPercent,
    vocabCount,
    
    // Actions
    selectWord,
    clearSelectedWord,
    updateCharacterStats,
    updateProgress,
    saveGame,
    loadGame
  }
})