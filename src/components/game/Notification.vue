<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  message: string
  type: 'success' | 'error' | 'info' | 'achievement'
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isVisible = ref(false)

watch(
  () => props.show,
  (newVal) => {
    isVisible.value = newVal
    if (newVal) {
      // Auto-hide after 3 seconds
      setTimeout(() => {
        isVisible.value = false
        emit('close')
      }, 3000)
    }
  },
)
</script>

<template>
  <div
    v-if="isVisible"
    class="fixed top-20 right-4 p-4 border z-50 transition-all duration-300"
    :class="{
      'bg-green-600 text-white border-green-700': type === 'success',
      'bg-red-600 text-white border-red-700': type === 'error',
      'bg-blue-600 text-white border-blue-700': type === 'info',
      'bg-yellow-600 text-black border-yellow-700': type === 'achievement',
    }"
  >
    {{ message }}
  </div>
</template>

<style scoped>
/* 移除阴影和圆角，保持扁平化设计 */
</style>
