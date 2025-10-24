<script setup lang="ts">
import { ref } from 'vue'
import OpenAI from 'openai'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

const emit = defineEmits<{
  (e: 'aiResponse', response: string): void
  (e: 'loading', loading: boolean): void
  (e: 'imitate-word', action: string): void
}>()

// 定义响应数据
const feedText = ref<string>('')
const isLoading = ref<boolean>(false)
const error = ref<string>('')

// 初始化OpenAI客户端
const openai = new OpenAI({
  baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
  dangerouslyAllowBrowser: true, // 注意：在生产环境中应该通过后端代理API密钥
})

// 发送文本到AI的函数
async function feedToAI() {
  if (!feedText.value.trim()) {
    error.value = 'Please enter some text to feed to the alien.'
    return
  }

  isLoading.value = true
  error.value = ''

  // 发射加载状态事件
  emit('loading', true)

  try {
    // 从txt文件中读取系统提示内容
    const responseSystem = await fetch('/src/assets/system-prompt.txt')
    const systemPrompt = await responseSystem.text()

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
    isLoading.value = false
    // 发射加载完成事件
    emit('loading', false)
  }
}

// 模仿功能 - 发出事件让父组件处理
const imitateWord = () => {
  // 发出事件让GameView处理模仿操作
  // 这样可以复用原有的performAction逻辑
  emit('imitate-word', 'imitate')
}
</script>

<template>
  <div class="word-feeder bg-gray-800 p-4 rounded-lg mt-4">
    <h3 class="text-lg font-bold text-white mb-2">Feed Word-Food to Alien</h3>
    <p class="text-sm text-gray-300 mb-3">
      Paste English text (under 200 words) for the alien to learn new vocabulary.
    </p>

    <div class="mb-3">
      <textarea
        v-model="feedText"
        placeholder="Paste English text here (max 200 words)..."
        class="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded"
        rows="4"
        :disabled="isLoading"
      ></textarea>
    </div>

    <div class="flex flex-wrap gap-2 mb-3">
      <button
        @click="feedToAI"
        :disabled="isLoading || !feedText.trim()"
        class="bg-purple-700 hover:bg-purple-600 disabled:bg-gray-500 text-white px-4 py-2 transition-colors border border-yellow-500"
      >
        {{ isLoading ? 'Feeding...' : 'Feed Alien' }}
      </button>
      
      <button
        @click="imitateWord"
        :disabled="isLoading || !gameStore.vocabulary.selectedWord"
        class="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 text-white px-4 py-2 transition-colors border border-blue-300"
      >
        Imitate
      </button>
    </div>

    <div v-if="isLoading" class="mt-3 text-yellow-300">Alien is learning new words...</div>

    <div v-if="error" class="mt-3 p-3 bg-red-800 text-red-100 border border-red-500">
      <strong>Error:</strong> {{ error }}
    </div>
  </div>
</template>

<style scoped>
.word-feeder {
  font-family: 'Courier New', monospace;
  background: #2d5016; /* 森林绿背景 */
  border: 1px solid #d4af37; /* 鹅黄色边框 */
  border-radius: 0; /* 移除圆角 */
  box-shadow: none; /* 移除阴影 */
}
</style>