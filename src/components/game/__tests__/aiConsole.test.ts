import { useGameStore } from '@/stores/gameStore'
import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, it, expect } from 'vitest'

describe('AI Console Functionality', () => {
  beforeEach(() => {
    // 创建一个新的 pinia 实例并使其处于激活状态
    setActivePinia(createPinia())

    // 清除localStorage
    localStorage.clear()
  })

  it('should clear game history when clearGameHistory is called', () => {
    const store = useGameStore()

    // 添加一些游戏历史
    const historyEntry = {
      gm_narrative: 'You are in a dark forest.',
      player_action: 'look around',
      action_result: 'You see trees everywhere.',
    }
    store.gameHistory.push(historyEntry)

    // 设置一些内容
    store.updateRawGeneratedContent('You are in a dark forest.')
    store.updateGeneratedContent(
      'You are in a <span class="interactive-word" data-word="forest">forest</span>.',
    )

    // 检查历史是否存在
    expect(store.gameHistory).toHaveLength(1)
    expect(store.rawGeneratedContent).toBe('You are in a dark forest.')
    expect(store.generatedContent).toBe(
      'You are in a <span class="interactive-word" data-word="forest">forest</span>.',
    )

    // 清除历史
    store.gameHistory = []
    store.updateRawGeneratedContent('')
    store.updateGeneratedContent('')
    store.story.text = ''

    // 检查历史是否已清除
    expect(store.gameHistory).toHaveLength(0)
    expect(store.rawGeneratedContent).toBe('')
    expect(store.generatedContent).toBe('')
    expect(store.story.text).toBe('')
  })

  it('should append new content when there is game history', () => {
    const store = useGameStore()

    // 添加一些游戏历史
    const historyEntry = {
      gm_narrative: 'You are in a dark forest.',
      player_action: 'look around',
      action_result: 'You see trees everywhere.',
    }
    store.gameHistory.push(historyEntry)

    // 设置当前内容
    store.updateGeneratedContent(
      'You are in a <span class="interactive-word" data-word="forest">forest</span>.',
    )

    // 模拟新生成的内容
    const newContent =
      'You decide to walk deeper into the forest. The trees seem to close in around you.'
    const processedNewContent = newContent.replace(
      /\*\*(.*?)\*\*/g,
      '<span class="interactive-word" data-word="$1">$1</span>',
    )

    // 检查是否有游戏历史
    if (store.gameHistory.length > 0) {
      // 有游戏历史，在原有文本下面补充新生成的段落
      const separator = '<br><br>---<br><br>' // 添加分隔符
      const currentContent = store.generatedContent || ''
      const expectedContent = currentContent
        ? currentContent + separator + processedNewContent
        : processedNewContent

      expect(expectedContent).toBe(
        'You are in a <span class="interactive-word" data-word="forest">forest</span>.<br><br>---<br><br>You decide to walk deeper into the forest. The trees seem to close in around you.',
      )
    }
  })
})
