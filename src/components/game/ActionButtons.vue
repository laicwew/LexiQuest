<script setup lang="ts">
const props = defineProps<{
  selectedWord: string | null
}>()

const emit = defineEmits<{
  (e: 'performAction', action: string): void
  (e: 'generatePrompt'): void
}>()

const performAction = (action: string) => {
  if (props.selectedWord) {
    emit('performAction', action)
  }
}

const generatePrompt = () => {
  emit('generatePrompt')
}
</script>

<template>
  <div class="mt-6 grid grid-cols-2 gap-4">
    <button
      class="action-button py-3 px-6 text-lg border border-yellow-600"
      :disabled="!selectedWord"
      @click="performAction('eat')"
    >
      🍎 吃掉
    </button>
    <button
      class="action-button py-3 px-6 text-lg border border-yellow-600"
      :disabled="!selectedWord"
      @click="performAction('attack')"
    >
      ⚔️ 攻击
    </button>
    <button
      class="action-button py-3 px-6 text-lg border border-yellow-600"
      :disabled="!selectedWord"
      @click="performAction('talk')"
    >
      💬 对话
    </button>
    <button
      class="action-button py-3 px-6 text-lg border border-yellow-600"
      :disabled="!selectedWord"
      @click="performAction('imitate')"
    >
      🎯 模仿
    </button>
  </div>

  <div class="mt-4 text-center">
    <button
      id="action-prompt-btn"
      class="bg-purple-700 hover:bg-purple-600 text-white px-6 py-3 text-lg transition-colors border border-purple-800"
      @click="generatePrompt"
    >
      🎲 What should I do?
    </button>
  </div>
</template>

<style scoped>
.action-button {
  background: var(--primary-burgundy); /* 扁平化背景 */
  border: 2px solid var(--primary-gold);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: none; /* 移除阴影 */
  border-radius: 0; /* 移除圆角 */
}

.action-button:hover {
  transform: none; /* 移除变换效果 */
  box-shadow: none; /* 移除阴影 */
  background: #a00028; /* 稍微亮一点的 burgundy */
}

.action-button:active {
  transform: none; /* 移除变换效果 */
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
