import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 定义游戏历史记录的接口
interface GameHistoryEntry {
  gm_narrative: string
  player_action: string
  action_result: string
}

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

  // 添加游戏历史记录数组
  const gameHistory = ref<GameHistoryEntry[]>([])

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
            '欢迎来到魔法集市!',
            '请随机浏览我们的产品。',
            '你想尝试一些我们的新品苹果吗？',
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

  // 存储原始的AI生成内容（未处理的）
  const rawGeneratedContent = ref('')

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

  // 修改performAction函数以保存历史记录
  function performAction(action: string) {
    const selectedWord = vocabulary.value.selectedWord
    if (!selectedWord) return

    progress.value.actionsTaken++

    // Get appropriate response
    const responses = actionResponses.value[action as keyof typeof actionResponses.value]
    let response = responses[selectedWord as keyof typeof responses] || responses.default

    // 保存游戏历史记录
    const historyEntry: GameHistoryEntry = {
      gm_narrative: rawGeneratedContent.value || story.value.text, // 使用原始AI生成内容
      player_action: `${action} ${selectedWord}`,
      action_result: response,
    }
    gameHistory.value.push(historyEntry)

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

  // 添加一个函数来更新原始AI生成内容
  function updateRawGeneratedContent(content: string) {
    rawGeneratedContent.value = content
  }

  // 修改updateGeneratedContent函数
  function updateGeneratedContent(content: string) {
    generatedContent.value = content
    // 如果当前是GENERATED标签，则更新显示文本
    if (activeTab.value === 'GENERATED') {
      story.value.text = content
    }
  }

  // 添加获取续写上下文的函数
  function getContextForContinuation(): string {
    if (gameHistory.value.length === 0) {
      return 'START_JOURNEY\n\nGenerate the opening scene for a new adventurer in Middle-earth.\nBegin the story in a suitable location and provide the first interactive elements.'
    }

    // 获取最后几条历史记录作为上下文
    const recentHistory = gameHistory.value.slice(-3) // 获取最近3条记录

    // 构建上下文提示
    let context = 'Continue the story based on the following history:\n\n'

    recentHistory.forEach((entry, index) => {
      context += `Turn ${index + 1}:\n`
      context += `GM Narrative: ${entry.gm_narrative}\n`
      context += `Player Action: ${entry.player_action}\n`
      context += `Action Result: ${entry.action_result}\n\n`
    })

    context +=
      'Based on this history, continue the adventure in Middle-earth. Follow the same format as before:\n'
    context += '1. Describe the new scene (3-4 sentences)\n'
    context += '2. Include 2-4 new interactable objects wrapped in **double asterisks**\n'
    context += "3. Maintain Tolkien's tone and lore\n"
    context += '4. All output must be in English only'

    return context
  }

  // 修改saveGame函数以保存游戏历史
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
      rawGeneratedContent: rawGeneratedContent.value, // 保存原始内容
      gameHistory: gameHistory.value, // 保存游戏历史
    }

    localStorage.setItem('lexiquest-save', JSON.stringify(gameState))
    console.log('Game saved!')
  }

  // 修改loadGame函数以加载游戏历史
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
        rawGeneratedContent.value = parsed.rawGeneratedContent || '' // 加载原始内容

        // 加载游戏历史
        gameHistory.value = parsed.gameHistory || []

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
    // 将单词转换为小写
    const lowerCaseWord = word.toLowerCase()

    // 检查单词是否已经存在于词典中
    if (!vocabulary.value.learned.has(lowerCaseWord)) {
      // 创建一个简单的单词对象，只包含必要的字段
      const wordData = {
        word: lowerCaseWord,
        learnedAt: Date.now(),
        reviewCount: 0,
      }

      vocabulary.value.learned.set(lowerCaseWord, wordData)
      progress.value.wordsLearnedToday++

      // 保存游戏状态以确保词典更新被持久化
      saveGame()
    }
  }

  // 清空词典
  function clearDictionary() {
    vocabulary.value.learned.clear()
    progress.value.wordsLearnedToday = 0
    saveGame()
  }

  // 获取词典数据（用于控制台输出）
  function getDictionaryData() {
    return Array.from(vocabulary.value.learned.values())
  }

  // 切换标签页
  function switchTab(tab: string) {
    activeTab.value = tab
    // 根据标签页更新显示的文本
    if (tab === 'GENERATED') {
      // 显示AI生成的内容或空模块的文本
      story.value.text = generatedContent.value || modules.value.empty_market.scenes.entrance.text
    } else if (tab === 'DUMMY') {
      // 对于DUMMY标签页，不设置特定文本，让组件自己处理
      story.value.text = ''
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
    rawGeneratedContent,
    gameHistory, // 导出游戏历史

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
    clearDictionary, // 导出清空词典函数
    getDictionaryData, // 导出获取词典数据函数
    switchTab,
    updateGeneratedContent,
    updateRawGeneratedContent, // 导出更新原始内容的函数
    startProgressTracking,
    getContextForContinuation,
  }
})
