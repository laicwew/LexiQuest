# AI续写功能测试指南

本文档说明了如何测试和使用LexiQuest中新增的AI续写功能。

## 功能概述

我们新增了以下功能：

1. **游戏历史记录** - 自动保存玩家的每个操作到localStorage
2. **上下文生成** - 根据游戏历史生成AI续写的上下文提示
3. **持久化存储** - 游戏历史在页面刷新后仍然保留
4. **原始内容保存** - 保存DeepSeek生成的原始纯文本内容，确保上下文续写的准确性和一致性
5. **历史清除功能** - 可以清除内存和localStorage中的游戏历史，重新开始
6. **智能提示选择** - 根据是否有游戏历史自动选择使用start prompt还是context prompt
7. **初始故事保存** - 使用start prompt生成的初始故事会自动保存到游戏历史中

## 核心函数

### getContextForContinuation()

该函数会根据游戏历史生成适合发送给AI的上下文提示：

```typescript
function getContextForContinuation(): string
```

- 如果没有历史记录，返回初始提示（START_JOURNEY）
- 如果有历史记录，返回最近3个回合的详细信息

## 使用方法

### 1. 在游戏中测试

1. 启动游戏：`npm run dev`
2. 在游戏界面中执行一些操作（选择单词并执行动作）
3. 点击导航栏中的"测试上下文"按钮
4. 打开浏览器控制台查看生成的上下文

### 2. 使用AI Console Tester

AI Console Tester组件提供了以下功能：

1. **运行测试按钮** - 调用DeepSeek API生成内容
2. **清除游戏历史按钮** - 清除内存和localStorage中的游戏历史记录
3. **智能提示选择** - 自动根据是否有游戏历史选择使用start prompt还是context prompt
4. **初始故事保存** - 使用start prompt生成的初始故事会自动保存到游戏历史中

### 3. 在代码中使用

```typescript
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()

// 执行操作会自动保存历史
store.performAction('talk')

// 获取续写上下文
const context = store.getContextForContinuation()
console.log(context)
```

## 数据结构

### GameHistoryEntry

游戏历史记录的数据结构：

```typescript
interface GameHistoryEntry {
  gm_narrative: string    // GM叙述（保存的是原始AI生成内容）
  player_action: string   // 玩家动作
  action_result: string   // 动作结果
}
```

## localStorage存储

游戏历史会被保存在localStorage的`lexiquest-save`键中：

```javascript
// 查看保存的游戏数据
console.log(localStorage.getItem('lexiquest-save'))
```

## 原始内容保存机制

为了确保AI续写的准确性和一致性，系统会保存DeepSeek生成的原始纯文本内容：

1. **rawGeneratedContent** - 存储原始的AI生成内容（未处理的）
2. **generatedContent** - 存储经过前端处理的交互式内容
3. 在游戏历史记录中，[gm_narrative](file://d:\__ARCHIEVE__\GamDev\LexiQuest\src\stores\gameStore.ts#L5-L5)字段保存的是原始内容，而不是处理后的内容

## 内容续写机制

当AI生成新内容时，系统会根据是否有游戏历史来决定如何显示内容：

1. **无历史记录** - 直接显示新生成的内容
2. **有历史记录** - 在原有内容下方添加分隔符和新内容

## 清除游戏历史

清除游戏历史功能会同时清除内存和localStorage中的以下数据：

1. **游戏历史记录** - gameHistory数组
2. **原始生成内容** - rawGeneratedContent字段
3. **处理后的内容** - generatedContent字段
4. **故事文本** - story.text字段

## 初始故事保存

当使用start prompt生成初始故事时，系统会自动将生成的内容保存到游戏历史中，确保后续的续写能够基于正确的上下文进行。

## 测试

运行单元测试以验证功能：

```bash
npm run test:unit
```

相关的测试文件：
- `src/components/game/__tests__/gameHistory.test.ts`
- `src/components/game/__tests__/localStorage.test.ts`
- `src/components/game/__tests__/rawContent.test.ts`
- `src/components/game/__tests__/aiConsole.test.ts`
- `src/components/game/__tests__/clearHistory.test.ts`
- `src/components/game/__tests__/initialStory.test.ts`

## 与AIConsoleTester集成

AIConsoleTester组件已更新为：
1. 使用`getContextForContinuation()`函数来生成发送给AI的提示
2. 提供清除游戏历史的功能，同时清除内存和localStorage中的数据
3. 根据是否有游戏历史自动选择使用start prompt还是context prompt
4. 自动将使用start prompt生成的初始故事保存到游戏历史中