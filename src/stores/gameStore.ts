import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 定义等级要求的接口
interface LevelRequirement {
  level: number
  words_required: number
}

export const useGameStore = defineStore('game', () => {
  // State
  const character = ref({
    name: '',
    level: 1,
    hp: 100,
    maxHp: 100,
    languageLevel: 'CET-6',
    country: 'America',
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

  // 当前选中的标签页
  const activeTab = ref('GENERATED')

  // 存储AI生成的内容
  const generatedContent = ref('')

  // 等级要求数据
  const levelRequirements = ref<LevelRequirement[]>([])

  // 用户名
  const userName = ref('')

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
  }

  // 修改updateGeneratedContent函数
  function updateGeneratedContent(content: string) {
    generatedContent.value = content
    // 如果当前是GENERATED标签，则更新显示文本
    if (activeTab.value === 'GENERATED') {
      story.value.text = content
    }
    // 保存到localStorage
    saveGame()
  }

  // 修改saveGame函数以保存游戏
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
      userName: userName.value, // 保存用户名
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
      userName.value = username
    }

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        // 确保character对象包含languageLevel属性，如果不存在则设置默认值
        character.value = {
          ...parsed.character,
          languageLevel: parsed.character?.languageLevel || 'CET-6',
        }
        story.value = parsed.story
        vocabulary.value = parsed.vocabulary
        progress.value = parsed.progress
        settings.value = parsed.settings || settings.value
        activeTab.value = parsed.activeTab || 'GENERATED'
        generatedContent.value = parsed.generatedContent || ''
        userName.value = parsed.userName || '' // 加载用户名

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
          userName.value = username
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

  // 更新外星人名称
  function updateAlienName(name: string) {
    character.value.name = name
    // 保存到localStorage
    saveGame()
  }

  // 更新语言级别
  function updateLanguageLevel(level: string) {
    character.value.languageLevel = level
    // 保存到localStorage
    saveGame()
  }

  // Review功能：获取需要复习的单词
  function getReviewWords() {
    // 将Map转换为数组并按reviewCount排序（从低到高）
    const sortedWords = Array.from(vocabulary.value.learned.entries())
      .map(([word, data]) => ({
        word,
        reviewCount: data.reviewCount || 0,
      }))
      .sort((a, b) => a.reviewCount - b.reviewCount)
      .slice(0, 10) // 取前10个

    return sortedWords
  }

  // Review功能：增加单词的复习计数
  function incrementReviewCount(words: string[]) {
    words.forEach((word) => {
      const lowerCaseWord = word.toLowerCase()
      if (vocabulary.value.learned.has(lowerCaseWord)) {
        const wordData = vocabulary.value.learned.get(lowerCaseWord)
        if (wordData) {
          wordData.reviewCount = (wordData.reviewCount || 0) + 1
          vocabulary.value.learned.set(lowerCaseWord, wordData)
        }
      }
    })
    saveGame()
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
    userName, // 导出用户名

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
    updateAlienName, // 导出更新外星人名称的函数
    updateLanguageLevel, // 导出更新语言级别的函数
    getReviewWords, // 导出获取复习单词的函数
    incrementReviewCount, // 导出增加复习计数的函数
    startProgressTracking,
  }
})
