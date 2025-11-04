// 使用 CommonJS 方式导入 node-fetch
const fetch = require('node-fetch')

exports.handler = async function (event, context) {
  // 启用跨域资源共享
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    // 检查请求方法
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      }
    }

    // 解析请求体
    const { system, prompt } = JSON.parse(event.body)

    // 构建DeepSeek API请求
    const deepseekUrl =
      process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1/chat/completions'

    // 确保 API 密钥存在
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      console.error('API key not configured in environment variables')
      return {
        statusCode: 500,
        headers,
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
      headers,
      body: JSON.stringify(data),
    }
  } catch (error) {
    console.error('Error in deepseek-proxy:', error)

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        errorType: error.constructor.name,
      }),
    }
  }
}
