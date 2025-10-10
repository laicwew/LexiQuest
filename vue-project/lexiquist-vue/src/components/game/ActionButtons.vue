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
      class="action-button py-3 px-6 rounded-lg text-lg" 
      :disabled="!selectedWord"
      @click="performAction('eat')"
    >
      🍎 吃掉
    </button>
    <button 
      class="action-button py-3 px-6 rounded-lg text-lg" 
      :disabled="!selectedWord"
      @click="performAction('attack')"
    >
      ⚔️ 攻击
    </button>
    <button 
      class="action-button py-3 px-6 rounded-lg text-lg" 
      :disabled="!selectedWord"
      @click="performAction('talk')"
    >
      💬 对话
    </button>
    <button 
      class="action-button py-3 px-6 rounded-lg text-lg" 
      :disabled="!selectedWord"
      @click="performAction('imitate')"
    >
      🎯 模仿
    </button>
  </div>
  
  <div class="mt-4 text-center">
    <button 
      id="action-prompt-btn" 
      class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-lg transition-colors"
      @click="generatePrompt"
    >
      🎲 What should I do?
    </button>
  </div>
</template>

<style scoped>
.action-button {
  background: linear-gradient(135deg, var(--primary-burgundy), #B22222);
  border: 2px solid var(--primary-gold);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(128, 0, 32, 0.4);
}

.action-button:active {
  transform: translateY(0);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>