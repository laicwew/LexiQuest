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
    maxExperience: 100,
  })

  const currentModule = ref({
    id: 'supermarket_v1',
    title: 'Magical Market',
    description: 'Learn shopping vocabulary',
    progress: 25,
  })

  const story = ref({
    currentScene: 'entrance',
    text: '',
    history: [] as string[],
  })

  const vocabulary = ref({
    selectedWord: null as string | null,
    dictionary: [] as any[],
    learned: new Map<string, any>(),
  })

  const progress = ref({
    wordsLearnedToday: 0,
    timeSpent: 0, // seconds
    actionsTaken: 0,
  })

  const settings = ref({
    nativeLanguage: 'zh',
    targetLanguage: 'en',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
  })

  // Modules data
  const modules = ref({
    supermarket_v1: {
      title: 'Magical Market',
      description: 'Learn shopping vocabulary in a mystical supermarket',
      scenes: {
        entrance: {
          text: '你走进魔法超市，看到一个红色的apple放在shelf上。一个友好的clerk正在cleaning地面。明亮的灯光照亮了各种fruits和vegetables，它们被整齐地排列在架子上。',
          vocabulary: [
            { word: 'apple', translation: '苹果', pos: 'noun', difficulty: 1 },
            { word: 'shelf', translation: '架子', pos: 'noun', difficulty: 2 },
            { word: 'clerk', translation: '店员', pos: 'noun', difficulty: 2 },
            { word: 'cleaning', translation: '打扫', pos: 'verb', difficulty: 2 },
            { word: 'bright', translation: '明亮的', pos: 'adjective', difficulty: 2 },
            { word: 'fruits', translation: '水果', pos: 'noun', difficulty: 1 },
            { word: 'vegetables', translation: '蔬菜', pos: 'noun', difficulty: 1 },
          ],
          interactions: ['talk_to_clerk', 'examine_shelf', 'explore_aisle'],
        },
      },
      npcs: {
        clerk: {
          name: 'Shopkeeper',
          dialogue: [
            'Welcome to our magical market!',
            'Feel free to browse our fresh produce.',
            'Would you like to try our special apples?',
          ],
        },
      },
    },
    // 新增的空模块
    empty_market: {
      title: 'Empty Market',
      description: 'An empty magical market for testing',
      scenes: {
        entrance: {
          text: '', // 空文本
          vocabulary: [],
          interactions: [],
        },
      },
      npcs: {},
    },
  })

  const actionResponses = ref({
    eat: {
      apple: '你咬了一口脆甜的apple。味道很棒！你的能量增加了5点。',
      bread: '你吃着新鲜的bread。它让你感到温暖，恢复了10点生命值。',
      default: '你吃掉了这个物品。味道不错，恢复了一些能量。',
    },
    attack: {
      apple: '你攻击了apple！它无害地滚开了。clerk奇怪地看着你。',
      clerk: '你试图攻击友好的clerk。他们后退了一步，对你的攻击感到困惑。',
      default: '你攻击了目标。没发生什么特别的事情，但你感到有点傻。',
    },
    talk: {
      clerk: 'clerk微笑着说："欢迎！我们的apple都是从魔法果园新鲜采摘的。"',
      apple: '你试图和apple说话。它没有回应，但你感到与大自然有一种奇怪的联系。',
      default: '你对目标说话。他们似乎理解了你的意图。',
    },
    imitate: {
      apple: '你小心地发音"apple"。这个词在你舌头上感觉很自然。你学到了一个新词！',
      cleaning: '你练习说"cleaning"。复杂的音节完美地从你舌尖滚落。',
      default: '你模仿了这个词。你的发音随着每次尝试都在进步。',
    },
  })

  // 当前选中的标签页
  const activeTab = ref('GENERATED')

  // 存储AI生成的内容
  const generatedContent = ref('')

  // Getters
  const hpPercent = computed(() => (character.value.hp / character.value.maxHp) * 100)
  const energyPercent = computed(() => (character.value.energy / character.value.maxEnergy) * 100)
  const xpPercent = computed(
    () => (character.value.experience / character.value.maxExperience) * 100,
  )
  const vocabCount = computed(() => vocabulary.value.learned.size)

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
        learned: Array.from(vocabulary.value.learned.entries()),
      },
      progress: progress.value,
      settings: settings.value,
      activeTab: activeTab.value,
      generatedContent: generatedContent.value,
    }

    localStorage.setItem('lexiquest-save', JSON.stringify(gameState))
    console.log('Game saved!')
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
        settings.value = parsed.settings || settings.value
        activeTab.value = parsed.activeTab || 'GENERATED'
        generatedContent.value = parsed.generatedContent || ''

        // 根据保存的标签页状态设置正确的文本
        if (activeTab.value === 'GENERATED') {
          story.value.text =
            generatedContent.value || modules.value.empty_market.scenes.entrance.text
        } else if (activeTab.value === 'DUMMY') {
          story.value.text = modules.value.supermarket_v1.scenes.entrance.text
        }

        // Restore Map objects
        if (parsed.vocabulary && parsed.vocabulary.learned) {
          vocabulary.value.learned = new Map(parsed.vocabulary.learned)
        }
      } catch (e) {
        console.error('Failed to load game state', e)
      }
    } else {
      // Load username from localStorage
      const username = localStorage.getItem('lexiquest-username')
      if (username) {
        character.value.name = username
      }

      // 默认情况下，设置为GENERATED标签页并显示空文本
      activeTab.value = 'GENERATED'
      story.value.text = modules.value.empty_market.scenes.entrance.text
    }
  }

  function performAction(action: string) {
    const selectedWord = vocabulary.value.selectedWord
    if (!selectedWord) return

    progress.value.actionsTaken++

    // Get appropriate response
    const responses = actionResponses.value[action as keyof typeof actionResponses.value]
    let response = responses[selectedWord as keyof typeof responses] || responses.default

    // Handle special cases
    if (action === 'imitate') {
      learnWord(selectedWord)
    }

    // Update character stats based on action
    updateCharacterStatsByAction(action)

    // Clear word selection
    clearSelectedWord()

    // Save game state
    saveGame()

    return response
  }

  function updateCharacterStatsByAction(action: string) {
    switch (action) {
      case 'eat':
        character.value.energy = Math.min(100, character.value.energy + 5)
        character.value.experience += 2
        break
      case 'attack':
        character.value.energy = Math.max(0, character.value.energy - 2)
        character.value.experience += 1
        break
      case 'talk':
        character.value.experience += 3
        break
      case 'imitate':
        character.value.experience += 5
        break
    }

    // Check for level up
    if (character.value.experience >= character.value.maxExperience) {
      levelUp()
    }
  }

  function levelUp() {
    character.value.level++
    character.value.experience = 0
    character.value.maxExperience += 50
    character.value.maxHp += 20
    character.value.hp = character.value.maxHp
    character.value.maxEnergy += 10
    character.value.energy = character.value.maxEnergy
  }

  function learnWord(word: string) {
    const currentModuleData = modules.value[currentModule.value.id as keyof typeof modules.value]
    const currentScene =
      currentModuleData.scenes[story.value.currentScene as keyof typeof currentModuleData.scenes]
    const vocabularyData = currentScene.vocabulary.find((v: any) => v.word === word)

    if (vocabularyData && !vocabulary.value.learned.has(word)) {
      vocabulary.value.learned.set(word, {
        ...vocabularyData,
        learnedAt: Date.now(),
        reviewCount: 0,
        mastery: 0,
      })

      progress.value.wordsLearnedToday++
    }
  }

  // 切换标签页
  function switchTab(tab: string) {
    activeTab.value = tab
    // 根据标签页更新显示的文本
    if (tab === 'GENERATED') {
      // 显示AI生成的内容或空模块的文本
      story.value.text = generatedContent.value || modules.value.empty_market.scenes.entrance.text
    } else if (tab === 'DUMMY') {
      // 显示当前模块的文本
      story.value.text = modules.value.supermarket_v1.scenes.entrance.text
    }
  }

  // 更新AI生成的内容
  function updateGeneratedContent(content: string) {
    generatedContent.value = content
    // 如果当前是GENERATED标签，则更新显示文本
    if (activeTab.value === 'GENERATED') {
      story.value.text = content
    }
  }

  function startProgressTracking() {
    // Track time spent in game
    setInterval(() => {
      progress.value.timeSpent++
    }, 1000)
  }

  return {
    // State
    character,
    currentModule,
    story,
    vocabulary,
    progress,
    settings,
    modules,
    actionResponses,
    activeTab,
    generatedContent,

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
    loadGame,
    performAction,
    updateCharacterStatsByAction,
    levelUp,
    learnWord,
    switchTab,
    updateGeneratedContent,
    startProgressTracking,
  }
})
