import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 定义等级要求的接口
interface LevelRequirement {
  level: number
  words_required: number
}

// 定义游戏历史记录的接口
interface GameHistoryEntry {
  gm_narrative: string
  player_action: string
}

export const useGameStore = defineStore('game', () => {
  // State
  const character = ref({
    name: 'Adventurer',
    level: 1,
    hp: 100,
    maxHp: 100,
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

  // 当前选中的标签页
  const activeTab = ref('GENERATED')

  // 存储AI生成的内容
  const generatedContent = ref('')

  // 存储原始的AI生成内容（未处理的）
  const rawGeneratedContent = ref('')

  // 等级要求数据
  const levelRequirements = ref<LevelRequirement[]>([])

  // Getters
  const hpPercent = computed(() => (character.value.hp / character.value.maxHp) * 100)
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

    // 保存游戏历史记录
    const historyEntry: GameHistoryEntry = {
      gm_narrative: rawGeneratedContent.value || story.value.text, // 使用原始AI生成内容
      player_action: `${action} ${selectedWord}`,
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
    return gameHistory
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
    // Load username from localStorage regardless of saved state
    const username = localStorage.getItem('lexiquest-username')
    if (username) {
      character.value.name = username
    }

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        character.value = parsed.character
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
          story.value.text = generatedContent.value || ''
        } else if (activeTab.value === 'DUMMY') {
          story.value.text = ''
        }

        // Restore Map objects
        if (parsed.vocabulary && parsed.vocabulary.learned) {
          vocabulary.value.learned = new Map(parsed.vocabulary.learned)
        }

        // Ensure the character name is updated from localStorage even with saved state
        if (username) {
          character.value.name = username
        }
      } catch (e) {
        console.error('Failed to load game state', e)
      }
    } else {
      // 默认情况下，设置为GENERATED标签页并显示空文本
      activeTab.value = 'GENERATED'
      story.value.text = ''
    }
  }

  function updateCharacterStatsByAction(action: string) {
    // 检查是否可以升级（基于单词数）
    const learnedWords = vocabulary.value.learned.size
    const nextRequirement = levelRequirements.value.find(
      (req) => req.level === character.value.level + 1,
    )
    if (nextRequirement && learnedWords >= nextRequirement.words_required) {
      levelUp()
    }
  }

  function levelUp() {
    character.value.level++
    character.value.maxHp += 20
    character.value.hp = character.value.maxHp

    // 保存游戏状态以确保等级更新被持久化
    saveGame()
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

      // 检查是否达到升级要求
      checkLevelUp()
    }
  }

  // 检查是否达到升级要求
  function checkLevelUp() {
    if (canLevelUp()) {
      levelUp()
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

  // 从CSV文件加载等级要求
  async function loadLevelRequirements() {
    try {
      const response = await fetch('/src/assets/level-requirements.csv')
      const csvText = await response.text()

      // 解析CSV数据
      const lines = csvText.split('\n').filter((line) => line.trim() !== '')
      if (lines.length === 0 || !lines[0]) {
        throw new Error('CSV file is empty')
      }

      const headers = lines[0].split(',').map((header) => header.trim())

      const requirements: LevelRequirement[] = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        if (!line) continue
        const values = line.split(',').map((value) => value.trim())
        if (values.length === headers.length && values[0]) {
          const requirement: LevelRequirement = {
            level: parseInt(values[0] || '0'),
            words_required: parseInt(values[1] || '0'),
          }
          requirements.push(requirement)
        }
      }

      levelRequirements.value = requirements
      console.log('Level requirements loaded:', requirements)
    } catch (error) {
      console.error('Failed to load level requirements:', error)
      // 如果加载失败，使用默认值
      levelRequirements.value = [
        { level: 1, words_required: 0 },
        { level: 2, words_required: 5 },
        { level: 3, words_required: 10 },
        { level: 4, words_required: 15 },
        { level: 5, words_required: 20 },
      ]
    }
  }

  // 检查是否可以升级
  function canLevelUp() {
    const currentLevel = character.value.level
    const learnedWords = vocabulary.value.learned.size

    // 查找当前等级的要求
    const currentRequirement = levelRequirements.value.find((req) => req.level === currentLevel)
    if (!currentRequirement) return false

    // 查找下一等级的要求
    const nextRequirement = levelRequirements.value.find((req) => req.level === currentLevel + 1)
    if (!nextRequirement) return false

    // 检查是否满足单词数量要求
    return learnedWords >= nextRequirement.words_required
  }

  // 获取下一等级的要求
  function getNextLevelRequirements() {
    const currentLevel = character.value.level
    const nextRequirement = levelRequirements.value.find((req) => req.level === currentLevel + 1)
    return nextRequirement || null
  }

  // 获取当前等级的要求
  function getCurrentLevelRequirements() {
    const currentLevel = character.value.level
    const currentRequirement = levelRequirements.value.find((req) => req.level === currentLevel)
    return currentRequirement || null
  }

  // 切换标签页
  function switchTab(tab: string) {
    activeTab.value = tab
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
    story,
    vocabulary,
    progress,
    settings,
    activeTab,
    generatedContent,
    rawGeneratedContent,
    gameHistory, // 导出游戏历史

    // Getters
    hpPercent,
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
    loadLevelRequirements, // 导出加载等级要求函数
    canLevelUp, // 导出检查升级函数
    checkLevelUp, // 导出检查升级函数
    getNextLevelRequirements, // 导出获取下一等级要求函数
    getCurrentLevelRequirements, // 导出获取当前等级要求函数
    switchTab,
    updateGeneratedContent,
    updateRawGeneratedContent, // 导出更新原始内容的函数
    startProgressTracking,
    getContextForContinuation,
  }
})
