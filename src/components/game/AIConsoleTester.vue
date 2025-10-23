<script setup lang="ts">
import { ref, onMounted } from 'vue'
import OpenAI from 'openai'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

const emit = defineEmits<{
  (e: 'aiResponse', response: string): void
  (e: 'loading', loading: boolean): void // 添加加载状态事件
}>()

// 定义响应数据
const aiResponse = ref<string>('')
const isLoading = ref<boolean>(false)
const error = ref<string>('')

// 初始化OpenAI客户端
const openai = new OpenAI({
  baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
  dangerouslyAllowBrowser: true, // 注意：在生产环境中应该通过后端代理API密钥
})

// 清除游戏历史的函数
function clearGameHistory() {
  // 清除游戏历史
  gameStore.gameHistory = []

  // 清除原始生成内容
  gameStore.updateRawGeneratedContent('')

  // 清除生成内容
  gameStore.updateGeneratedContent('')

  // 重置故事文本
  gameStore.story.text = ''

  // 保存到localStorage
  gameStore.saveGame()

  console.log('游戏历史已清除')
  alert('游戏历史已清除')
}

// 测试函数
async function testOpenAI() {
  isLoading.value = true
  error.value = ''
  aiResponse.value = ''
  
  // 发射加载状态事件
  emit('loading', true)

  try {
    // 从txt文件中读取系统提示内容
    const responseSystem = await fetch('/src/assets/system-prompt.txt')
    const systemPrompt = await responseSystem.text()

    // 检查是否有游戏历史来决定使用哪种提示
    let userPrompt
    if (gameStore.gameHistory.length === 0) {
      // 没有游戏历史，使用start prompt
      const startResponse = await fetch('/src/assets/start-prompt.txt')
      userPrompt = await startResponse.text()
      console.log('使用start prompt')
    } else {
      // 有游戏历史，使用context prompt
      userPrompt = gameStore.getContextForContinuation()
      console.log('使用context prompt')
    }

    console.log('开始调用DeepSeek API...')
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'deepseek-chat',
    })

    console.log('API调用完成:', completion)
    // 检查completion是否存在以及是否有choices
    if (completion && completion.choices && completion.choices.length > 0) {
      const choice = completion.choices[0]
      if (choice && choice.message && choice.message.content) {
        aiResponse.value = choice.message.content
        // 发射事件，将AI响应传递给父组件
        emit('aiResponse', choice.message.content)

        // 如果是使用start prompt生成的初始故事，需要保存到游戏历史中
        if (gameStore.gameHistory.length === 0) {
          // 保存初始故事到游戏历史
          const initialHistoryEntry = {
            gm_narrative: choice.message.content,
            player_action: 'START_JOURNEY',
            action_result: choice.message.content,
          }
          gameStore.gameHistory.push(initialHistoryEntry)

          // 保存到localStorage
          gameStore.saveGame()
        }
      } else {
        aiResponse.value = 'No response content'
      }
    } else {
      aiResponse.value = 'No response received'
    }
  } catch (err) {
    console.error('API调用错误:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
  } finally {
    isLoading.value = false
    // 发射加载完成事件
    emit('loading', false)
  }
}

// 在控制台中运行的测试函数
function runTestInConsole() {
  console.log('正在执行AI测试...')
  testOpenAI()
}

// 组件挂载时添加到全局window对象，方便在控制台调用
onMounted(() => {
  // 添加到window对象，便于在浏览器控制台直接调用
  ;(window as any).testOpenAI = testOpenAI
  console.log('AI测试器已加载。在控制台中运行 testOpenAI() 来测试AI功能。')
})
</script>

<template>
  <div class="ai-console-tester bg-gray-800 p-4 rounded-lg mt-4">
    <h3 class="text-lg font-bold text-white mb-2">AI Console Tester</h3>
    <p class="text-sm text-gray-300 mb-3">
      打开浏览器开发者工具控制台，运行
      <code class="bg-gray-700 px-1 rounded">testOpenAI()</code> 来测试AI功能。
    </p>

    <div class="flex flex-wrap gap-2 mb-3">
      <button
        @click="testOpenAI"
        :disabled="isLoading"
        class="bg-green-700 hover:bg-green-600 disabled:bg-gray-500 text-white px-4 py-2 transition-colors border border-yellow-500"
      >
        {{ isLoading ? '测试中...' : '运行测试' }}
      </button>

      <button
        @click="clearGameHistory"
        class="bg-red-700 hover:bg-red-600 text-white px-4 py-2 transition-colors border border-yellow-500"
      >
        清除游戏历史
      </button>
    </div>

    <div v-if="isLoading" class="mt-3 text-yellow-300">正在请求AI服务...</div>

    <div v-if="error" class="mt-3 p-3 bg-red-800 text-red-100 border border-red-500">
      <strong>错误:</strong> {{ error }}
    </div>

    <div v-if="aiResponse" class="mt-3 p-3 bg-green-800 text-green-100 border border-green-500">
      <strong>AI响应:</strong>
      <pre class="whitespace-pre-wrap mt-2">{{ aiResponse }}</pre>
    </div>
  </div>
</template>

<style scoped>
.ai-console-tester {
  font-family: 'Courier New', monospace;
  background: #2d5016; /* 森林绿背景 */
  border: 1px solid #d4af37; /* 鹅黄色边框 */
  border-radius: 0; /* 移除圆角 */
  box-shadow: none; /* 移除阴影 */
}

code {
  font-family: 'Courier New', monospace;
  color: #d4af37; /* 鹅黄色 */
  background: #1a2e0d; /* 深森林绿 */
  padding: 2px 4px;
  border-radius: 0; /* 移除圆角 */
}
</style>