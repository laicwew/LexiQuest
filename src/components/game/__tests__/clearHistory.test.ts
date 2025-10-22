import { useGameStore } from '@/stores/gameStore'
import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, it, expect } from 'vitest'

describe('Clear Game History Functionality', () => {
  beforeEach(() => {
    // 创建一个新的 pinia 实例并使其处于激活状态
    setActivePinia(createPinia())
    
    // 清除localStorage
    localStorage.clear()
  })

  it('should clear both in-memory and localStorage game history', () => {
    const store = useGameStore()
    
    // 添加一些游戏历史
    const historyEntry = {
      gm_narrative: "You are in a dark forest.",
      player_action: "look around",
      action_result: "You see trees everywhere."
    }
    store.gameHistory.push(historyEntry)
    
    // 设置一些内容
    store.updateRawGeneratedContent("You are in a dark forest.")
    store.updateGeneratedContent("You are in a <span class=\"interactive-word\" data-word=\"forest\">forest</span>.")
    
    // 保存到localStorage
    store.saveGame()
    
    // 棪证数据已保存到localStorage
    const savedData = localStorage.getItem('lexiquest-save')
    expect(savedData).not.toBeNull()
    
    // 检查localStorage中的数据
    if (savedData) {
      const parsed = JSON.parse(savedData)
      expect(parsed.gameHistory).toHaveLength(1)
      expect(parsed.rawGeneratedContent).toBe("You are in a dark forest.")
      expect(parsed.generatedContent).toBe("You are in a <span class=\"interactive-word\" data-word=\"forest\">forest</span>.")
    }
    
    // 清除游戏历史
    store.gameHistory = []
    store.updateRawGeneratedContent('')
    store.updateGeneratedContent('')
    store.story.text = ''
    
    // 保存到localStorage
    store.saveGame()
    
    // 检查内存中的数据是否已清除
    expect(store.gameHistory).toHaveLength(0)
    expect(store.rawGeneratedContent).toBe("")
    expect(store.generatedContent).toBe("")
    expect(store.story.text).toBe("")
    
    // 检查localStorage中的数据是否已清除
    const savedDataAfterClear = localStorage.getItem('lexiquest-save')
    expect(savedDataAfterClear).not.toBeNull()
    
    if (savedDataAfterClear) {
      const parsed = JSON.parse(savedDataAfterClear)
      expect(parsed.gameHistory).toHaveLength(0)
      expect(parsed.rawGeneratedContent).toBe("")
      expect(parsed.generatedContent).toBe("")
    }
  })
})