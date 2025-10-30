<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import OpenAI from 'openai'

const gameStore = useGameStore()

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

// 初始化OpenAI客户端
const openai = new OpenAI({
  baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
  dangerouslyAllowBrowser: true, // 注意：在生产环境中应该通过后端代理API密钥
})

// Process text to highlight vocabulary words
const processStoryText = () => {
  let processedText = props.storyText

  storyContent.value = processedText
}

const selectWord = (word: string) => {
  emit('wordSelected', word)
}

// Process story text when it changes
watch(
  () => props.storyText,
  () => {
    // 只有当不是DUMMY和FEEDER标签页时才处理故事文本
    if (gameStore.activeTab !== 'DUMMY' && gameStore.activeTab !== 'FEEDER') {
      processStoryText()
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
      selectWord(word)
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
    // 初始化外星人名称输入框的值
    alienNameInput.value = gameStore.character.name
    // 重置输入框显示状态
    showNameInput.value = !gameStore.character.name
    // 更新storyContent为generatedContent
    processStoryText()
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

// 从txt文件加载例文内容
const loadDummyContent = async () => {
  try {
    const response = await fetch('/src/assets/sample-text.txt')
    const text = await response.text()
    dummyContent.value = text
    storyContent.value = text
  } catch (error) {
    console.error('Failed to load dummy content:', error)
    dummyContent.value = 'Failed to load example text.'
    storyContent.value = 'Failed to load example text.'
  }
}

// 从introduction.txt文件加载介绍内容
const loadIntroductionContent = async () => {
  try {
    const response = await fetch('/src/assets/introduction.txt')
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
    // 根据角色等级加载相应的系统提示文件
    const systemPromptFile = `/src/assets/system-prompt-level-${gameStore.character.level}.txt`
    const responseSystem = await fetch(systemPromptFile)
    const systemPromptText = await responseSystem.text()
    // 应用变量替换
    const systemPrompt = txtArgumentReplace(systemPromptText)

    // 使用用户输入的文本作为reading prompt
    const readingPrompt = feedText.value.trim()

    console.log('开始调用DeepSeek API with reading prompt...')
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: readingPrompt },
      ],
      model: 'deepseek-chat',
    })

    console.log('API调用完成:', completion)
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
    country: 'America'
  }

  // 清空词典，这样vocabCount计算属性会自动更新为0
  gameStore.clearDictionary()

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

onMounted(() => {
  processStoryText()

  // 如果初始标签页是DUMMY，则加载例文内容
  if (gameStore.activeTab === 'DUMMY') {
    loadDummyContent()
  }

  // 如果初始标签页是GENERATED，则加载介绍内容
  if (gameStore.activeTab === 'GENERATED') {
    loadIntroductionContent()
    // 初始化外星人名称输入框的值
    alienNameInput.value = gameStore.character.name
    // 设置输入框显示状态
    showNameInput.value = !gameStore.character.name
  }
})
</script>

<template>
  <div class="parchment-bg rounded-lg p-8 magical-glow min-h-96">
    <!-- Tabs -->
    <div class="flex mb-4 border-b border-gray-300">
      <button
        class="px-4 py-2 font-medium text-sm rounded-t-lg transition-colors"
        :class="[
          'GENERATED' === gameStore.activeTab
            ? 'bg-yellow-100 text-yellow-700 border-b-2 border-yellow-500'
            : 'text-gray-600 hover:text-gray-900',
        ]"
        @click="switchTab('GENERATED')"
      >
        GENERATED
      </button>
      <button
        class="px-4 py-2 font-medium text-sm rounded-t-lg transition-colors"
        :class="[
          'FEEDER' === gameStore.activeTab
            ? 'bg-yellow-100 text-yellow-700 border-b-2 border-yellow-500'
            : 'text-gray-600 hover:text-gray-900',
        ]"
        @click="switchTab('FEEDER')"
      >
        FEEDER
      </button>
      <button
        class="px-4 py-2 font-medium text-sm rounded-t-lg transition-colors"
        :class="[
          'DUMMY' === gameStore.activeTab
            ? 'bg-yellow-100 text-yellow-700 border-b-2 border-yellow-500'
            : 'text-gray-600 hover:text-gray-900',
        ]"
        @click="switchTab('DUMMY')"
      >
        DUMMY
      </button>
    </div>

    <!-- Story Content -->
    <div class="story-text-container">
      <!-- GENERATED Tab Content -->
      <div v-if="gameStore.activeTab === 'GENERATED'">
        <!-- 如果有生成内容，显示生成的内容 -->
        <div
          v-if="gameStore.generatedContent"
          class="story-text"
          v-html="storyContent"
          @click="handleStoryClick"
        ></div>
        <!-- 如果没有生成内容，显示介绍内容和输入框 -->
        <div v-else>
          <div class="story-text">{{ introductionContent }}</div>
          <!-- 条件渲染：根据showNameInput决定显示输入框还是文本 -->
          <div
            v-if="showNameInput && !gameStore.character.name"
            class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded"
          >
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Give the alien a name:
            </label>
            <div class="flex gap-2">
              <input
                v-model="alienNameInput"
                type="text"
                placeholder="Enter alien name..."
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                @keyup.enter="saveAlienName"
              />
              <button
                @click="saveAlienName"
                :disabled="!alienNameInput.trim()"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
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
      <div v-else-if="gameStore.activeTab === 'FEEDER'">
        <h3 class="text-lg font-bold text-gray-800 mb-2">Feed Word-Food to Alien</h3>
        <p class="text-sm text-gray-600 mb-3">
          Paste English text (under 200 words) for the alien to learn new vocabulary.
        </p>

        <div class="mb-3">
          <textarea
            v-model="feedText"
            placeholder="Paste English text here (max 200 words)..."
            class="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded"
            rows="4"
            :disabled="isFeeding"
          ></textarea>
        </div>

        <div v-if="isFeeding" class="mt-3 text-yellow-600">
          {{ gameStore.character.name }} is learning new words...
        </div>

        <div v-if="error" class="mt-3 p-3 bg-red-800 text-red-100 border border-red-500">
          <strong>Error:</strong> {{ error }}
        </div>
      </div>

      <!-- DUMMY Tab Content -->
      <div v-else-if="gameStore.activeTab === 'DUMMY'">
        <div class="story-text" v-html="storyContent"></div>
      </div>

      <!-- Loading States -->
      <div
        v-if="isLoading && storyContent && gameStore.activeTab !== 'FEEDER'"
        class="loading-container flex items-center py-4"
      >
        <div class="loading-spinner mr-3"></div>
        <p class="text-gray-600">{{ gameStore.character.name }} is reading...</p>
      </div>
    </div>

    <!-- Buttons - Outside of scrollable area -->
    <div v-if="gameStore.activeTab === 'GENERATED'" class="mt-4 flex gap-2">
      <button
        @click="imitateWord"
        :disabled="!gameStore.vocabulary.selectedWord"
        class="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 text-white px-4 py-2 transition-colors border border-blue-300"
      >
        Imitate
      </button>
      <button
        @click="clearGameHistory"
        class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 transition-colors border border-red-300"
      >
        Clear
      </button>
    </div>

    <div v-else-if="gameStore.activeTab === 'FEEDER'" class="mt-4">
      <div class="flex flex-wrap gap-2">
        <button
          @click="feedToAI"
          :disabled="isFeeding || !feedText.trim()"
          class="bg-purple-700 hover:bg-purple-600 disabled:bg-gray-500 text-white px-4 py-2 transition-colors border border-yellow-500"
        >
          {{ isFeeding ? 'Feeding...' : 'Feed Alien' }}
        </button>
      </div>
    </div>

    <div v-else-if="gameStore.activeTab === 'DUMMY'" class="mt-4">
      <button
        @click="copyDummyContent"
        class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 transition-colors border border-green-300"
      >
        Copy
      </button>
    </div>
  </div>
</template>

<style scoped>
.parchment-bg {
  background: var(--secondary-parchment); /* 扁平化背景 */
  border: 2px solid var(--primary-gold);
  box-shadow: none; /* 移除阴影 */
}

.story-text-container {
  flex: 1;
  overflow-y: auto; /* 启用垂直滚动条 */
  padding: 10px; /* 添加内边距 */
  border: 1px solid var(--primary-gold); /* 添加边框 */
  background: var(--secondary-parchment); /* 背景色 */
  min-height: 200px; /* 设置最小高度 */
}

.story-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-charcoal);
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
  color: var(--primary-green); /* 使用森林绿 */
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
</style>
