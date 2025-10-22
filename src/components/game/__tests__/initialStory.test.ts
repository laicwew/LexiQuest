import { useGameStore } from '@/stores/gameStore'
import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, it, expect } from 'vitest'

describe('Initial Story Generation and Storage', () => {
  beforeEach(() => {
    // 创建一个新的 pinia 实例并使其处于激活状态
    setActivePinia(createPinia())
    
    // 清除localStorage
    localStorage.clear()
  })

  it('should save initial story to game history when using start prompt', () => {
    const store = useGameStore()
    
    // 模拟初始故事生成
    const initialStory = "You stand at the edge of a dense forest. The trees tower above you, their branches forming a canopy that filters the sunlight into dancing patches on the forest floor. A narrow path winds into the shadows ahead. You can hear the distant sound of running water.";
    
    // 检查初始状态
    expect(store.gameHistory).toHaveLength(0);
    
    // 模拟将初始故事添加到游戏历史（模拟AIConsoleTester中的逻辑）
    const initialHistoryEntry = {
      gm_narrative: initialStory,
      player_action: "START_JOURNEY",
      action_result: initialStory
    }
    store.gameHistory.push(initialHistoryEntry)
    
    // 保存到localStorage
    store.saveGame()
    
    // 检查内存中的数据
    expect(store.gameHistory).toHaveLength(1);
    expect(store.gameHistory[0]).toEqual(initialHistoryEntry);
    
    // 检查localStorage中的数据
    const savedData = localStorage.getItem('lexiquest-save')
    expect(savedData).not.toBeNull();
    
    if (savedData) {
      const parsed = JSON.parse(savedData)
      expect(parsed.gameHistory).toHaveLength(1);
      expect(parsed.gameHistory[0]).toEqual(initialHistoryEntry);
    }
  })
})