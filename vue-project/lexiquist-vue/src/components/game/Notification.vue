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

watch(() => props.show, (newVal) => {
  isVisible.value = newVal
  if (newVal) {
    // Auto-hide after 3 seconds
    setTimeout(() => {
      isVisible.value = false
      emit('close')
    }, 3000)
  }
})
</script>

<template>
  <div 
    v-if="isVisible"
    class="fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300"
    :class="{
      'bg-green-500 text-white': type === 'success',
      'bg-red-500 text-white': type === 'error',
      'bg-blue-500 text-white': type === 'info',
      'bg-yellow-500 text-black': type === 'achievement'
    }"
  >
    {{ message }}
  </div>
</template>

<style scoped>
/* Add any additional styling if needed */
</style>