<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

const props = defineProps<{
  show: boolean
  postcard: {
    id: string
    content: string
    createdAt: number
  } | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 处理文本中的交互式词汇
const processPostcardContent = (content: string) => {
  // 解析content中被**包裹的词汇，将其转换为可点击的交互式词汇
  return content.replace(
    /\*\*(.*?)\*\*/g,
    '<span class="interactive-word" data-word="$1">$1</span>',
  )
}

const close = () => {
  emit('close')
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal-content parchment-bg" @click.stop>
      <div class="modal-header">
        <button class="close-button" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <div
          v-if="props.postcard"
          class="postcard-content story-text"
          v-html="processPostcardContent(props.postcard.content)"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--secondary-parchment);
  border: 4px solid var(--primary-gold);
  border-radius: 0;
  padding: 1.5rem;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary-gold);
}

.modal-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-charcoal);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--text-charcoal);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: var(--primary-gold);
}

.modal-body {
  font-size: 1.5rem;
  line-height: 1.6;
}

.postcard-content {
  white-space: pre-wrap;
}

/* 滚动条样式 */
.modal-content::-webkit-scrollbar {
  width: 12px;
}

.modal-content::-webkit-scrollbar-track {
  background: var(--secondary-parchment);
  border-left: 1px solid var(--primary-gold);
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--primary-green);
  border: 1px solid var(--primary-gold);
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #1a2e0d;
}
</style>
