# AI功能测试指南

## 概述

本文档说明了如何在LexiQuest游戏中测试AI功能，特别是与DeepSeek API的集成。

## 测试方法

### 1. 在游戏页面中测试

1. 启动游戏应用（`npm run dev`）
2. 访问游戏页面
3. 打开浏览器的开发者工具（F12）
4. 在控制台中运行 `testOpenAI()` 函数
5. 观察控制台输出和页面上的响应

### 2. 直接在代码中测试

你也可以直接查看 `src/components/game/AIConsoleTester.vue` 组件：

- 组件提供了一个测试按钮
- 点击按钮会执行相同的测试逻辑
- 结果会显示在组件界面上

## 环境变量配置

确保你的 `.env` 文件包含以下配置：

```env
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
VITE_DEEPSEEK_API_KEY=your_actual_api_key_here
```

## 安全注意事项

在生产环境中，不应该在前端代码中直接使用API密钥。应该通过后端服务代理API请求。

## 故障排除

如果遇到问题，请检查：

1. API密钥是否正确配置
2. 网络连接是否正常
3. 控制台是否有错误信息
4. 是否遵守了API的使用限制
