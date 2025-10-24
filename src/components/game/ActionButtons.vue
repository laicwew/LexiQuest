<script setup lang="ts">
const props = defineProps<{
  selectedWord: string | null
}>()

const emit = defineEmits<{
  (e: 'performAction', action: string): void
}>()

const performAction = (action: string) => {
  if (props.selectedWord) {
    emit('performAction', action)
  }
}
</script>

<template>
  <div class="mt-6 flex justify-center">
    <!-- 模仿按钮已移至WordFeeder组件中 -->
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