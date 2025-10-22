import { useGameStore } from '@/stores/gameStore'
import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, it, expect } from 'vitest'

describe('Raw Content Storage', () => {
  beforeEach(() => {
    // 创建一个新的 pinia 实例并使其处于激活状态
    setActivePinia(createPinia())
    
    // 清除localStorage
    localStorage.clear()
  })

  it('should store raw AI generated content separately from processed content', () => {
    const store = useGameStore()
    
    // 模拟AI生成的原始内容
    const rawContent = "You are in a dark forest. There is a **sword** on the ground and a **torch** on the wall."
    const processedContent = "You are in a dark forest. There is a <span class=\"interactive-word\" data-word=\"sword\">sword</span> on the ground and a <span class=\"interactive-word\" data-word=\"torch\">torch</span> on the wall."
    
    // 更新原始内容
    store.updateRawGeneratedContent(rawContent)
    
    // 更新处理后的内容
    store.updateGeneratedContent(processedContent)
    
    // 检查两个内容是否都正确保存
    expect(store.rawGeneratedContent).toBe(rawContent)
    expect(store.generatedContent).toBe(processedContent)
    
    // 检查在执行操作时是否使用原始内容保存历史
    store.vocabulary.selectedWord = "apple"
    const action = "talk"
    
    store.performAction(action)
    
    // 检查历史记录是否使用原始内容
    expect(store.gameHistory).toHaveLength(1)
    expect(store.gameHistory[0]?.gm_narrative).toBe(rawContent)
    expect(store.gameHistory[0]?.player_action).toBe(`${action} apple`)
  })

  it('should save and load raw content to/from localStorage', () => {
    const store = useGameStore()
    
    // 设置一些数据
    const rawContent = "You are in a dark forest. There is a **sword** on the ground."
    store.updateRawGeneratedContent(rawContent)
    
    // 添加一个历史记录条目
    const historyEntry = {
      gm_narrative: rawContent,
      player_action: "take sword",
      action_result: "You take the sword. It feels balanced and sharp."
    }
    store.gameHistory.push(historyEntry)
    
    // 保存游戏
    store.saveGame()
    
    // 检查localStorage中是否有数据
    const savedData = localStorage.getItem('lexiquest-save')
    expect(savedData).not.toBeNull()
    
    // 创建一个新的store实例来模拟页面刷新
    setActivePinia(createPinia())
    const newStore = useGameStore()
    
    // 加载游戏
    newStore.loadGame()
    
    // 检查原始内容是否正确加载
    expect(newStore.rawGeneratedContent).toBe(rawContent)
    
    // 检查历史记录是否正确加载
    expect(newStore.gameHistory).toHaveLength(1)
    expect(newStore.gameHistory[0]).toEqual(historyEntry)
  })
})