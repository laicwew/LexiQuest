<script setup lang="ts">
defineProps<{
  show: boolean
  text: string
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div 
    v-if="show" 
    class="fixed top-20 right-4 achievement-notification z-50 max-w-sm"
    @click="$emit('close')"
  >
    <div class="flex items-center space-x-3">
      <div class="text-2xl">🏆</div>
      <div>
        <h4 class="font-bold">Achievement Unlocked!</h4>
        <p class="text-sm">{{ text }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.achievement-notification {
  background: linear-gradient(135deg, var(--primary-gold), #FFD700);
  color: var(--primary-burgundy);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  animation: slideInRight 0.5s ease;
  cursor: pointer;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>