<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import OpenAI from 'openai'
import PostcardModal from './PostcardModal.vue'
import { useRouter } from 'vue-router'

const gameStore = useGameStore()
const router = useRouter()

const props = defineProps<{
  storyText: string
  selectedWord: string | null
  isLoading?: boolean // 添加加载状态属性
}>()

const emit = defineEmits<{
  (e: 'wordSelected', word: string): void
  (e: 'aiResponse', response: string): void
  (e: 'loading', loading: boolean): void
  (e: 'showNotification', message: string): void
}>()

const storyContent = ref('')
const dummyContent = ref('') // 用于存储从txt文件加载的例文内容
const introductionContent = ref('') // 用于存储从introduction.txt加载的介绍内容

// WordFeeder相关状态
const feedText = ref<string>('')
const isFeeding = ref<boolean>(false)
const error = ref<string>('')
const alienNameInput = ref('') // 用于存储外星人名称输入
const showNameInput = ref(true) // 控制是否显示输入框

// Review相关状态
const isReviewing = ref(false)

// Postcard相关状态
const showPostcardModal = ref(false)
const selectedPostcard = ref<{
  id: string
  content: string
  createdAt: number
} | null>(null)

// 感谢信相关状态
const congratsContent = ref('')
const isGeneratingCongrats = ref(false) // 添加生成感谢信的加载状态
const haveCongrats = ref(false) // 添加是否已生成感谢信的状态

// 初始化OpenAI客户端
const openai = new OpenAI({
  baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
  dangerouslyAllowBrowser: true, // 注意：在生产环境中应该通过后端代理API密钥
})

// 获取tab按钮的类名
const getTabClass = (tabName: string) => {
  return {
    active: gameStore.activeTab === tabName,
    inactive: gameStore.activeTab !== tabName,
  }
}

// Process text to highlight vocabulary words
const processStoryText = () => {
  // 对于GENERATED标签页，直接使用generatedContent
  if (gameStore.activeTab === 'GENERATED') {
    storyContent.value = gameStore.generatedContent
    return
  }

  // 对于其他标签页，使用传入的storyText
  if (gameStore.activeTab !== 'DUMMY' && gameStore.activeTab !== 'FEEDER') {
    storyContent.value = props.storyText
  }
}

const selectWord = (word: string) => {
  emit('wordSelected', word)
}

// Process story text when it changes
watch(
  () => props.storyText,
  () => {
    // 只有当不是DUMMY和FEEDER标签页时才处理故事文本
    if (
      gameStore.activeTab !== 'DUMMY' &&
      gameStore.activeTab !== 'FEEDER' &&
      gameStore.activeTab !== 'GENERATED'
    ) {
      processStoryText()
    }
  },
)

// 监听generatedContent变化，确保GENERATED标签页能及时更新
watch(
  () => gameStore.generatedContent,
  () => {
    if (gameStore.activeTab === 'GENERATED') {
      storyContent.value = gameStore.generatedContent
    }
  },
)

// 监听activeTab变化，确保切换标签页时正确显示内容
watch(
  () => gameStore.activeTab,
  (newTab) => {
    if (newTab === 'GENERATED') {
      storyContent.value = gameStore.generatedContent
      // 初始化外星人名称输入框的值
      alienNameInput.value = gameStore.character.name
      // 设置输入框显示状态
      showNameInput.value = !gameStore.character.name
      // 如果角色等级达到4级，加载感谢信内容
      if (gameStore.character.level >= 4) {
        loadCongratsContent()
      }
    } else if (newTab === 'DUMMY') {
      storyContent.value = dummyContent.value
    } else if (newTab === 'FEEDER') {
      // FEEDER标签页不需要特殊处理
    }
  },
)

// 监听角色等级变化，如果达到4级则加载感谢信
watch(
  () => gameStore.character.level,
  (newLevel, oldLevel) => {
    if (newLevel >= 4 && gameStore.activeTab === 'GENERATED') {
      loadCongratsContent()
    }
  },
)

// Update selected word styling when selection changes
watch(
  () => props.selectedWord,
  () => {
    updateSelectedWordStyling()
  },
)

// Handle word clicks in the processed HTML
const handleStoryClick = (event: Event) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('interactive-word')) {
    const word = target.getAttribute('data-word')
    if (word) {
      // 如果点击的是已经选中的单词，则取消选中
      if (props.selectedWord === word) {
        gameStore.clearSelectedWord()
      } else {
        // 否则选择新的单词
        selectWord(word)
      }
    }
  }
}

// Update styling for selected word
const updateSelectedWordStyling = () => {
  nextTick(() => {
    // Remove selected class from all words
    const allWords = document.querySelectorAll('.interactive-word')
    allWords.forEach((word) => {
      word.classList.remove('selected')
    })

    // Add selected class to the currently selected word
    if (props.selectedWord) {
      const selectedWords = document.querySelectorAll(`[data-word="${props.selectedWord}"]`)
      selectedWords.forEach((word) => {
        word.classList.add('selected')
      })
    }
  })
}

// 切换标签页
const switchTab = (tab: string) => {
  gameStore.switchTab(tab)

  // 当切换到DUMMY标签页时，加载例文内容
  if (tab === 'DUMMY') {
    loadDummyContent()
  }

  // 当切换到GENERATED标签页时，加载介绍文本
  if (tab === 'GENERATED') {
    loadIntroductionContent()
  }
}

// 文本变量替换函数
const txtArgumentReplace = (text: string): string => {
  // 定义变量映射关系
  const variables: Record<string, string> = {
    username: gameStore.userName,
    alienName: gameStore.character.name,
    languageLevel: gameStore.character.languageLevel,
    country: gameStore.character.country,
    // 可以根据需要添加更多变量
  }

  // 使用正则表达式替换所有{}中的变量
  let result = text
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g')
    result = result.replace(regex, value)
  }

  return result
}

// 获取复习次数最高的10个单词
const getTopReviewWords = (): string => {
  try {
    // 获取所有单词并按复习次数排序（从高到低）
    const sortedWords = Array.from(gameStore.vocabulary.learned.entries())
      .map(([word, data]) => ({
        word,
        reviewCount: data.reviewCount || 0,
      }))
      .sort((a, b) => b.reviewCount - a.reviewCount) // 从高到低排序
      .slice(0, 10) // 取前10个

    // 将单词用英文逗号连接
    return sortedWords.map((item) => item.word).join(', ')
  } catch (error) {
    console.error('获取复习单词时出错:', error)
    return ''
  }
}

// 从txt文件加载例文内容
const loadDummyContent = async () => {
  try {
    const response = await fetch('/assets/sample-text.txt')
    const text = await response.text()
    dummyContent.value = text
    if (gameStore.activeTab === 'DUMMY') {
      storyContent.value = text
    }
  } catch (error) {
    console.error('Failed to load dummy content:', error)
    dummyContent.value = 'Failed to load example text.'
    if (gameStore.activeTab === 'DUMMY') {
      storyContent.value = 'Failed to load example text.'
    }
  }
}

// 从introduction.txt文件加载介绍内容
const loadIntroductionContent = async () => {
  try {
    const response = await fetch('/assets/introduction.txt')
    const text = await response.text()
    // 应用变量替换
    const processedText = txtArgumentReplace(text)
    introductionContent.value = processedText
  } catch (error) {
    console.error('Failed to load introduction content:', error)
    introductionContent.value =
      'Hello Friend {username}! I from Planet Erid: high gravity, thick ammonia air, no sunlight. We hear and talk with musical sounds. My mind stores all I see. Your Earth words strange but shiny. I travel far to learn. Please give me reading material. I want know humans, human words, huamn ways. A name for me, question?'
  }
}

// 保存外星人名称
const saveAlienName = () => {
  if (alienNameInput.value.trim()) {
    // 保存到store和localStorage
    gameStore.updateAlienName(alienNameInput.value.trim())
    // 隐藏输入框并显示指定文本
    showNameInput.value = false
    // 显示通知
    emit('showNotification', `Alien name saved as ${alienNameInput.value.trim()}!`)
  }
}

// 发送文本到AI的函数
async function feedToAI() {
  if (!feedText.value.trim()) {
    error.value = 'Please enter some text to feed to the alien.'
    return
  }

  isFeeding.value = true
  error.value = ''

  // 发射加载状态事件
  emit('loading', true)

  try {
    // 增加Feed操作计数
    gameStore.updateProgress({ feedTaken: gameStore.progress.feedTaken + 1 })

    // 根据角色等级加载相应的系统提示文件
    const systemPromptFile = `/assets/system-prompt-level-${gameStore.character.level}.txt`
    const responseSystem = await fetch(systemPromptFile)
    const systemPromptText = await responseSystem.text()
    // 应用变量替换
    const systemPrompt = txtArgumentReplace(systemPromptText)

    // 使用用户输入的文本作为reading prompt
    const readingPrompt = feedText.value.trim()

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: readingPrompt },
      ],
      model: 'deepseek-chat',
    })

    // 检查completion是否存在以及是否有choices
    if (completion && completion.choices && completion.choices.length > 0) {
      const choice = completion.choices[0]
      if (choice && choice.message && choice.message.content) {
        // 发射事件，将AI响应传递给父组件
        emit('aiResponse', choice.message.content)
      } else {
        error.value = 'No response content'
      }
    } else {
      error.value = 'No response received'
    }
  } catch (err) {
    console.error('API调用错误:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
  } finally {
    isFeeding.value = false
    // 发射加载完成事件
    emit('loading', false)
  }
}

// 模仿功能 - 直接添加单词到词典
const imitateWord = () => {
  const selectedWord = gameStore.vocabulary.selectedWord
  if (!selectedWord) return

  // 调用游戏存储中的learnWord函数将单词添加到词典
  gameStore.learnWord(selectedWord)

  // 显示通知
  emit('showNotification', `You have add ${selectedWord} to the dictionary.`)

  // 清除选中的单词
  gameStore.clearSelectedWord()
}

// 清除游戏历史的函数
const clearGameHistory = () => {
  // 清除生成内容
  gameStore.updateGeneratedContent('')

  // 重置故事文本
  gameStore.story.text = ''

  gameStore.character = {
    name: '',
    level: 1,
    hp: 100,
    maxHp: 100,
    languageLevel: 'CET-6',
    country: 'America',
  }

  // 清空词典，这样vocabCount计算属性会自动更新为0
  gameStore.clearDictionary()

  // 清除选中的单词
  gameStore.clearSelectedWord()

  // 重置progress计数器
  gameStore.updateProgress({
    wordsLearnedToday: 0,
    timeSpent: 0,
    reviewTaken: 0,
    feedTaken: 0,
  })

  // 保存到localStorage
  gameStore.saveGame()

  alert('Game history cleared')
}

// 复制DUMMY内容的函数
const copyDummyContent = () => {
  navigator.clipboard
    .writeText(dummyContent.value)
    .then(() => {
      // 显示通知
      emit('showNotification', 'Content copied to clipboard!')
    })
    .catch((err) => {
      console.error('Failed to copy content: ', err)
      emit('showNotification', 'Failed to copy content.')
    })
}

// Review功能 - 发送复习请求到AI
const reviewWords = async () => {
  // 检查词典中是否有单词
  if (gameStore.vocabCount === 0) {
    emit('showNotification', 'No words in dictionary to review!')
    return
  }

  isReviewing.value = true
  emit('loading', true)

  try {
    // 增加Review操作计数
    gameStore.updateProgress({ reviewTaken: gameStore.progress.reviewTaken + 1 })

    // 获取需要复习的单词
    const reviewWords = gameStore.getReviewWords()
    const wordsList = reviewWords.map((item) => item.word).join(', ')

    // 加载review系统提示文件
    const systemPromptFile = '/assets/system-prompt-review.txt'
    const responseSystem = await fetch(systemPromptFile)
    const systemPromptTemplate = await responseSystem.text()

    // 替换模板中的单词占位符
    const systemPrompt = systemPromptTemplate.replace('{words}', wordsList)

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Review these words: ${wordsList}` },
      ],
      model: 'deepseek-chat',
    })

    if (completion && completion.choices && completion.choices.length > 0) {
      const choice = completion.choices[0]
      if (choice && choice.message && choice.message.content) {
        // 对AI生成的内容进行变量替换处理
        let processedContent = txtArgumentReplace(choice.message.content)

        // 解析processedContent中被**包裹的词汇，将其转换为可点击的交互式词汇
        processedContent = processedContent.replace(
          /\*\*(.*?)\*\*/g,
          '<span class="interactive-word" data-word="$1">$1</span>',
        )

        // 直接更新生成内容，而不是追加
        gameStore.updateGeneratedContent(processedContent)

        // 增加这些单词的复习计数
        gameStore.incrementReviewCount(reviewWords.map((item) => item.word))

        // 显示通知
        emit('showNotification', `Reviewed ${reviewWords.length} words successfully!`)
      } else {
        emit('showNotification', 'No response content from review')
      }
    } else {
      emit('showNotification', 'No response received from review')
    }
  } catch (err) {
    console.error('Review API调用错误:', err)
    emit(
      'showNotification',
      err instanceof Error ? err.message : 'Unknown error occurred during review',
    )
  } finally {
    isReviewing.value = false
    emit('loading', false)
  }
}

// Postcard功能
const openPostcard = (postcard: { id: string; content: string; createdAt: number }) => {
  selectedPostcard.value = postcard
  showPostcardModal.value = true
}

const closePostcardModal = () => {
  showPostcardModal.value = false
  selectedPostcard.value = null
}

const deletePostcard = (id: string, event: Event) => {
  // 阻止事件冒泡，避免触发打开明信片的操作
  event.stopPropagation()
  // 调用gameStore中的删除函数
  gameStore.deletePostcard(id)
}

const getFirstLineExcerpt = (content: string): string => {
  const lines = content.split('\n')
  return lines && lines.length > 0 && lines[0] ? lines[0].trim() : ''
}

const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}

// 新增状态用于存储感谢信内容
// 加载感谢信内容 - 通过AI生成
const loadCongratsContent = async () => {
  try {
    // 获取最高等级要求
    const maxLevelRequirement = gameStore.levelRequirements.reduce(
      (max: any, req: any) => (req.level > max.level ? req : max),
      { level: 0, words_required: 0 },
    )

    // 只有当角色等级达到最高等级且尚未生成感谢信时才发送请求
    if (gameStore.character.level >= maxLevelRequirement.level && !haveCongrats.value) {
      isGeneratingCongrats.value = true // 设置加载状态为true

      // 获取复习次数最高的10个单词
      const topWords = getTopReviewWords()

      // 如果没有复习过的单词，使用默认值
      const userPrompt =
        topWords ||
        'hello, world, friend, learn, language, culture, explore, discover, understand, connect'

      // 加载系统提示词
      const systemResponse = await fetch('/assets/system-prompt-congrats.txt')
      let systemPrompt = await systemResponse.text()

      // 替换系统提示词中的变量
      systemPrompt = txtArgumentReplace(systemPrompt)

      // 初始化OpenAI客户端
      const openai = new OpenAI({
        baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
        apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
        dangerouslyAllowBrowser: true,
      })

      // 调用AI生成感谢信
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: 'deepseek-chat',
      })

      // 检查响应是否存在以及是否有choices
      if (completion && completion.choices && completion.choices.length > 0) {
        const choice = completion.choices[0]
        if (choice && choice.message && choice.message.content) {
          let processedContent = choice.message.content
          // 对AI生成的内容进行处理，将**包裹的词汇转换为可点击的交互式词汇
          processedContent = processedContent.replace(
            /\*\*(.*?)\*\*/g,
            '<span class="interactive-word" data-word="$1">$1</span>',
          )
          congratsContent.value = processedContent
          haveCongrats.value = true // 设置已生成感谢信标志
          // 将状态保存到localStorage
          localStorage.setItem('lexiquest-have-congrats', JSON.stringify(true))
          localStorage.setItem('lexiquest-congrats-content', processedContent)
        } else {
          throw new Error('No response content from AI')
        }
      } else {
        throw new Error('No response received from AI')
      }
    }
  } catch (error) {
    console.error('通过AI生成感谢信内容失败:', error)
    // 如果AI生成失败，使用默认的感谢信内容
    let defaultContent = `Dear ${gameStore.userName || 'Friend'},

I, ${gameStore.character.name || 'Your Alien Friend'}, want to express my heartfelt gratitude for all the help you've given me during these days. Thanks to your patience and guidance, I have now fully understood ${gameStore.character.country || 'Earth'} and its language.

The words you taught me: ${getTopReviewWords() || 'hello, world, friend, learn, language, culture, explore, discover, understand, connect'}

have become the bridge between our worlds. Through them, I've learned not just vocabulary, but also the beauty of human culture and kindness.

If I ever have the chance to meet other beings from my planet, I hope you would be as generous in helping them as you have been with me.

Your friendship means the universe to me.

With warm regards,
${gameStore.character.name || 'Alien Friend'}`

    // 对默认内容也进行相同的处理
    defaultContent = defaultContent.replace(
      /\*\*(.*?)\*\*/g,
      '<span class="interactive-word" data-word="$1">$1</span>',
    )

    congratsContent.value = defaultContent
    // 保存默认内容到localStorage
    localStorage.setItem('lexiquest-congrats-content', defaultContent)
  } finally {
    // 无论成功还是失败，都要将加载状态设置为false
    isGeneratingCongrats.value = false
  }
}

// See you again 按钮的处理函数
const seeYouAgain = () => {
  // 清除localStorage
  localStorage.clear()
  // 特别移除haveCongrats状态
  localStorage.removeItem('lexiquest-have-congrats')
  // 移除congratsContent状态
  localStorage.removeItem('lexiquest-congrats-content')

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

  gameStore.settings = {
    nativeLanguage: 'zh',
    targetLanguage: 'en',
    difficulty: 'normal',
    soundEnabled: true,
    animationsEnabled: true,
  }

  gameStore.postcards = []
  gameStore.activeTab = 'GENERATED'
  gameStore.generatedContent = ''
  gameStore.userName = ''

  // 重置感谢信相关状态
  congratsContent.value = ''
  haveCongrats.value = false
  isGeneratingCongrats.value = false

  // 保存重置后的状态
  gameStore.saveGame()

  // 跳转到StartView页面
  router.push('/')
}

// 初始化时从localStorage恢复状态
onMounted(() => {
  // 恢复haveCongrats状态
  const savedHaveCongrats = localStorage.getItem('lexiquest-have-congrats')
  if (savedHaveCongrats) {
    haveCongrats.value = JSON.parse(savedHaveCongrats)
  }

  // 恢复congratsContent状态
  const savedCongratsContent = localStorage.getItem('lexiquest-congrats-content')
  if (savedCongratsContent) {
    congratsContent.value = savedCongratsContent
  }

  // 初始化各标签页的内容
  if (gameStore.activeTab === 'DUMMY') {
    loadDummyContent()
  } else if (gameStore.activeTab === 'GENERATED') {
    loadIntroductionContent()
    storyContent.value = gameStore.generatedContent
    // 初始化外星人名称输入框的值
    alienNameInput.value = gameStore.character.name
    // 设置输入框显示状态
    showNameInput.value = !gameStore.character.name
    // 如果角色等级达到4级，加载感谢信内容
    if (gameStore.character.level >= 4) {
      loadCongratsContent()
    }
  } else {
    processStoryText()
  }
})
</script>

<template>
  <div class="parchment-bg p-8 magical-glow min-h-96" :class="$attrs.class">
    <!-- Tabs -->
    <div class="flex mb-0">
      <button
        class="px-4 py-2 font-medium text-3xl rounded-t-lg transition-colors tab-button"
        :class="getTabClass('GENERATED')"
        @click="switchTab('GENERATED')"
      >
        STUDY
      </button>
      <button
        v-if="gameStore.character.name && gameStore.character.level < 4"
        class="px-4 py-2 font-medium text-bg rounded-t-lg transition-colors tab-button"
        :class="getTabClass('FEEDER')"
        @click="switchTab('FEEDER')"
      >
        FEEDER
      </button>
      <button
        v-if="gameStore.character.name && gameStore.character.level < 4"
        class="px-4 py-2 font-medium text-bg rounded-t-lg transition-colors tab-button"
        :class="getTabClass('DUMMY')"
        @click="switchTab('DUMMY')"
      >
        DUMMY
      </button>
      <button
        v-if="gameStore.character.level >= 2"
        class="px-4 py-2 font-medium text-bg rounded-t-lg transition-colors tab-button"
        :class="getTabClass('POSTCARDS')"
        @click="switchTab('POSTCARDS')"
      >
        POSTCARDS ({{ gameStore.postcardCount }})
      </button>
    </div>

    <!-- Story Content -->
    <div class="story-text-container mt-0">
      <!-- GENERATED Tab Content -->
      <div v-if="gameStore.activeTab === 'GENERATED'">
        <!-- 如果角色等级达到4级，显示感谢信 -->
        <div
          v-if="gameStore.character.level >= 4"
          class="flex flex-col items-center justify-center h-full px-20"
        >
          <div
            class="story-text text-center"
            v-html="congratsContent"
            @click="handleStoryClick"
          ></div>
          <div v-if="isGeneratingCongrats" class="mt-4 flex items-center">
            <div class="loading-spinner mr-3"></div>
            <p class="text-yellow-600 text-2xl">
              {{ gameStore.character.name }} is writing you a thanks letter...
            </p>
          </div>
          <div v-else class="mt-4">
            <button
              @click="seeYouAgain"
              class="action-button bg-[#1282a2ff] hover:bg-[#2b6589] active:bg-[#0f3d5a]"
            >
              See you again
            </button>
          </div>
        </div>
        <!-- 如果有生成内容，显示生成的内容 -->
        <div
          v-else-if="gameStore.generatedContent"
          class="story-text"
          v-html="storyContent"
          @click="handleStoryClick"
        ></div>
        <!-- 如果没有生成内容，显示介绍内容和输入框 -->
        <div v-else>
          <div class="story-text">{{ introductionContent }}</div>
          <!-- 条件渲染：根据showNameInput决定显示输入框还是文本 -->
          <div v-if="showNameInput || !gameStore.character.name" class="p-2">
            <label class="block text-sm font-medium text-gray-700 mb-2 story-text">
              Give the alien a name:
            </label>
            <div class="flex gap-2">
              <input
                v-model="alienNameInput"
                type="text"
                placeholder=""
                class="w-30 px-3 border border-gray-300 focus:outline-none text-[#14101e] text-2xl"
                @keyup.enter="saveAlienName"
              />
              <button
                v-if="alienNameInput.trim()"
                @click="saveAlienName"
                class="inline-flex items-center px-4 border border-transparent text-2xl font-medium rounded-md text-[#000814] bg-[var(--primary-gold)] hover:bg-[#b48a00] active:bg-[#715700]"
              >
                CONFIRM
              </button>
            </div>
          </div>
          <!-- 确认后显示指定文本 -->
          <div v-else class="rounded">
            <div class="story-text">
              {{ gameStore.character.name }} my name. You choice,
              {{ gameStore.character.name }} happy!
            </div>
          </div>
        </div>
      </div>

      <!-- FEEDER Tab Content -->
      <div v-else-if="gameStore.activeTab === 'FEEDER' && gameStore.character.level < 4">
        <h3 class="text-3xl font-bold text-[var(--text-charcoal)] mb-2">
          Talk to {{ gameStore.character.name }}
        </h3>
        <p class="text-2xl text-[var(--text-charcoal)] mb-3">
          You can give {{ gameStore.character.name }} text to read so that
          {{ gameStore.character.name }} can have a chance to <span class="text-[#1282a2ff]">MEMORIZE</span> new vocabulary. Or, you can just talk to {{ gameStore.character.name }} about whatever you like.
        </p>

        <div class="mb-3">
          <textarea
            v-model="feedText"
            placeholder=""
            class="w-full p-2 border border-gray-600 bg-[#5c2c20] text-white rounded text-2xl"
            rows="4"
            :disabled="isFeeding"
          ></textarea>
        </div>

        <div v-if="isFeeding" class="mt-3 text-yellow-600 text-2xl flex items-center">
          <div class="loading-spinner mr-3"></div>
          {{ gameStore.character.name }} is reading...
        </div>

        <div v-if="error" class="mt-3 p-3 bg-red-800 text-red-100 border border-red-500">
          <strong>Error:</strong> {{ error }}
        </div>
      </div>

      <!-- DUMMY Tab Content -->
      <div v-else-if="gameStore.activeTab === 'DUMMY' && gameStore.character.level < 4">
        <div class="story-text" v-html="storyContent"></div>
      </div>

      <!-- POSTCARDS Tab Content -->
      <div
        v-else-if="gameStore.activeTab === 'POSTCARDS' && gameStore.character.level < 4"
        class="postcards-container"
      >
        <div v-if="gameStore.postcards.length === 0" class="text-center py-8">
          <p class="text-2xl text-yellow-500">
            No postcards from {{ gameStore.character.name }} yet. Try to talk to {{ gameStore.character.name }} more and come back later.
          </p>
        </div>
        <div
          v-else
          v-for="postcard in gameStore.postcards"
          :key="postcard.id"
          class="postcard-item parchment-bg border border-[var(--primary-gold)] p-4 cursor-pointer flex justify-between items-center transition-colors duration-200"
          @click="openPostcard(postcard)"
        >
          <div class="postcard-date text-2xl text-yellow-400">
            <span class="text-white">{{ postcard.id }}</span>
            {{ formatDateTime(postcard.createdAt) }}
          </div>
          <button
            class="delete-button text-red-500 hover:text-red-700 text-2xl font-bold"
            @click="deletePostcard(postcard.id, $event)"
          >
            ×
          </button>
        </div>
      </div>

      <!-- Loading States -->
      <div
        v-if="isLoading && gameStore.activeTab !== 'FEEDER' && gameStore.character.level < 4"
        class="loading-container flex items-center py-4"
      >
        <div class="loading-spinner mr-3"></div>
        <p class="text-yellow-600 text-2xl">{{ gameStore.character.name }} is learning...</p>
      </div>
    </div>

    <!-- Buttons - Outside of scrollable area -->
    <div
      v-if="gameStore.activeTab === 'GENERATED' && gameStore.character.level < 4"
      class="mt-4 flex gap-2 relative"
    >
      <button
        v-if="gameStore.vocabulary.selectedWord"
        @click="imitateWord"
        class="action-button bg-[#1282a2ff] hover:bg-[#2b6589] active:bg-[#0f3d5a]"
      >
        Memorize
      </button>
      <button
        v-if="false"
        @click="clearGameHistory"
        class="bg-[#a54244] hover:bg-[#761b1c] active:bg-[#4b0e0e] action-button"
      >
        Clear
      </button>
      <button
        v-if="gameStore.vocabCount > 0"
        @click="reviewWords"
        :disabled="isReviewing"
        class="action-button absolute bottom-0 right-0 bg-[#8446a9] hover:bg-[#501373] active:bg-[#2f0646]"
      >
        {{ isReviewing ? 'Reviewing...' : 'Review' }}
      </button>
    </div>

    <div v-else-if="gameStore.activeTab === 'FEEDER' && gameStore.character.level < 4" class="mt-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-if="feedText.trim()"
          @click="feedToAI"
          :disabled="isFeeding"
          class="action-button bg-[#0e7b4a] hover:bg-[#026538] active:bg-[#004224]"
        >
          {{ isFeeding ? 'Feeding...' : 'Feed' }}
        </button>
      </div>
    </div>

    <div v-else-if="gameStore.activeTab === 'DUMMY' && gameStore.character.level < 4" class="mt-4">
      
      <span class="text-yellow-500 text-2xl mt-2">
        You can </span><button
        @click="copyDummyContent"
        class="action-button bg-[#b28000] hover:bg-[#8c6400] active:bg-[#4a3500]"
      >
        Copy
      </button><span class="text-yellow-500 text-2xl mt-2"> this page content and paste it into the FEEDER to <span class="text-[#0e7b4a]">FEED</span>
        {{ gameStore.character.name }}, then return to the STUDY page to see the learning results.
      </span>
    </div>
  </div>

  <!-- Postcard Modal -->
  <PostcardModal
    :show="showPostcardModal"
    :postcard="selectedPostcard"
    @close="closePostcardModal"
  />
</template>

<style scoped>
/* 统一的操作按钮样式 */
.action-button {
  color: white;
  padding: 0.1rem 1rem;
  /* border: 2px solid var(--orange-web); */
  border-radius: 0.5rem;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 1.5rem; /* 2xl */
  transition: colors 0.2s ease;
}

.action-button:disabled {
  background-color: #6b7280; /* gray-500 */
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

.parchment-bg {
  background: var(--secondary-parchment); /* 扁平化背景 */
  border: 4px solid var(--primary-gold) !important;
  box-shadow: none; /* 移除阴影 */
}

.story-text-container {
  flex: 1;
  overflow-y: auto; /* 启用垂直滚动条 */
  padding: 10px; /* 添加内边距 */
  border: 3px solid var(--primary-gold); /* 添加边框 */
  background: #14101e; /* 背景色 */
  min-height: 200px; /* 设置最小高度 */
  max-height: 400px; /* 设置最大高度，超过时显示滚动条 */
}

.story-text {
  font-size: 1.8rem;
  line-height: 1;
  color: var(--text-charcoal);
  white-space: pre-wrap; /* 添加这行来保持换行符 */
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

/* 使用深度选择器来确保样式能应用到动态插入的元素 */
:deep(.interactive-word) {
  color: var(--cerulean); /* 使用森林绿 */
  cursor: pointer;
  transition: none; /* 移除过渡效果 */
  position: relative;
  font-weight: 600;
  text-decoration: underline;
  text-shadow: none; /* 移除阴影 */
}

:deep(.interactive-word:hover) {
  color: var(--primary-gold); /* 悬停时使用鹅黄色 */
  transform: none; /* 移除变换效果 */
}

:deep(.interactive-word.selected) {
  color: var(--primary-gold) !important; /* 选中时使用鹅黄色 */
  text-shadow: none !important; /* 移除阴影 */
}

/* 加载动画样式 */
.loading-container {
  display: flex;
  align-items: center;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--primary-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Postcard item hover effect */
.postcard-item:hover {
  background-color: var(--yale-blue);
}
</style>
