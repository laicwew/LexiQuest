<script setup lang="ts">
const props = defineProps<{
  progress: {
    wordsLearnedToday: number
    timeSpent: number
    actionsTaken: number
  }
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Quick Stats -->
    <div class="parchment-bg p-6 magical-glow">
      <h3 class="fantasy-title text-lg font-bold mb-3">Today's Progress</h3>
      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="text-sm">Words Learned</span>
          <span class="font-bold text-yellow-600">{{ progress.wordsLearnedToday }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-sm">Play Time</span>
          <span class="font-bold text-blue-600"
            >{{ Math.floor(progress.timeSpent / 60) }} minutes</span
          >
        </div>
        <div class="flex justify-between">
          <span class="text-sm">Actions Taken</span>
          <span class="font-bold text-green-600">{{ progress.actionsTaken }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.parchment-bg {
  background: var(--secondary-parchment); /* Flat background */
  border: 4px solid var(--primary-gold) !important; /* Changed from 2px to 4px to match StoryDisplay */
  box-shadow: none; /* Remove shadow */
}

.fantasy-title {
  font-family: 'Cinzel', serif;
  color: var(--primary-gold);
  text-shadow: none; /* Remove shadow */
}

.stat-bar {
  background: var(--primary-green); /* Flat background */
  height: 8px;
  border-radius: 0; /* Remove rounded corners */
  transition: width 0.5s ease;
}
</style>
