<script setup lang="ts">
import { ref, onMounted } from 'vue'
import OpenAI from 'openai'

const emit = defineEmits<{
  (e: 'aiResponse', response: string): void
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

// 测试函数
async function testOpenAI() {
  isLoading.value = true
  error.value = ''
  aiResponse.value = ''

  try {
    // 从txt文件中读取系统提示内容
    const responseSystem = await fetch('/src/assets/system-prompt.txt')
    const systemPrompt = await responseSystem.text()
    const responseStart = await fetch('/src/assets/start-prompt.txt')
    const startPrompt = await responseStart.text()

    console.log('开始调用DeepSeek API...')
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content:  startPrompt },
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

    <button
      @click="testOpenAI"
      :disabled="isLoading"
      class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded transition-colors mr-2"
    >
      {{ isLoading ? '测试中...' : '运行测试' }}
    </button>

    <div v-if="isLoading" class="mt-3 text-yellow-300">正在请求AI服务...</div>

    <div v-if="error" class="mt-3 p-3 bg-red-900 text-red-100 rounded">
      <strong>错误:</strong> {{ error }}
    </div>

    <div v-if="aiResponse" class="mt-3 p-3 bg-green-900 text-green-100 rounded">
      <strong>AI响应:</strong>
      <pre class="whitespace-pre-wrap mt-2">{{ aiResponse }}</pre>
    </div>
  </div>
</template>

<style scoped>
.ai-console-tester {
  font-family: 'Courier New', monospace;
}

code {
  font-family: 'Courier New', monospace;
  color: #fbbf24;
}
</style>
