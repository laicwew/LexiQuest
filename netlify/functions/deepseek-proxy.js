import fetch from 'node-fetch'

export async function handler(event, context) {
  try {
    // 检查请求方法
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      }
    }

    // 解析请求体
    const { system, prompt } = JSON.parse(event.body)

    // 构建DeepSeek API请求
    const deepseekUrl =
      process.env.VITE_DEEPSEEK_BASE_URL ||
      process.env.DEEPSEEK_BASE_URL ||
      'https://api.deepseek.com/v1/chat/completions'

    // 确保 API 密钥存在（支持两种环境变量名称）
    const apiKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      console.error('API key not configured in environment variables')
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured on server' }),
      }
    }

    const response = await fetch(deepseekUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
    })

    const data = await response.json()

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  } catch (error) {
    console.error('Error in deepseek-proxy:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
