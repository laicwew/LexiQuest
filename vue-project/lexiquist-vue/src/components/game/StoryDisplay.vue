<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  storyText: string
  selectedWord: string | null
}>()

const emit = defineEmits<{
  (e: 'wordSelected', word: string): void
}>()

const storyContent = ref('')

// Process text to highlight vocabulary words
const processStoryText = () => {
  // This would be replaced with actual vocabulary processing logic
  storyContent.value = '你走进魔法超市，看到一个红色的apple放在shelf上。一个友好的clerk正在cleaning地面。明亮的灯光照亮了各种fruits和vegetables，它们被整齐地排列在架子上。'
}

const selectWord = (word: string) => {
  emit('wordSelected', word)
}

onMounted(() => {
  processStoryText()
})
</script>

<template>
  <div class="parchment-bg rounded-lg p-8 magical-glow min-h-96">
    <div class="story-text">
      <!-- In a real implementation, we would dynamically insert the story content with interactive words -->
      <p>你走进魔法超市，看到一个红色的<span class="interactive-word" :class="{ selected: selectedWord === 'apple' }" @click="selectWord('apple')">apple</span>放在<span class="interactive-word" :class="{ selected: selectedWord === 'shelf' }" @click="selectWord('shelf')">shelf</span>上。一个友好的<span class="interactive-word" :class="{ selected: selectedWord === 'clerk' }" @click="selectWord('clerk')">clerk</span>正在<span class="interactive-word" :class="{ selected: selectedWord === 'cleaning' }" @click="selectWord('cleaning')">cleaning</span>地面。明亮的灯光照亮了各种<span class="interactive-word" :class="{ selected: selectedWord === 'fruits' }" @click="selectWord('fruits')">fruits</span>和<span class="interactive-word" :class="{ selected: selectedWord === 'vegetables' }" @click="selectWord('vegetables')">vegetables</span>，它们被整齐地排列在架子上。</p>
    </div>
    
    <!-- Action Prompt -->
    <div id="action-prompt" class="mt-6 p-4 bg-blue-100 rounded-lg hidden">
      <p class="font-medium text-blue-800 mb-3">你想深入探索市场吗？</p>
      <div class="flex space-x-3">
        <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
          Yes
        </button>
        <button class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors">
          Try Another
        </button>
        <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
          No
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.parchment-bg {
  background: linear-gradient(135deg, var(--secondary-parchment) 0%, #F0E68C 100%);
  border: 2px solid var(--primary-gold);
  box-shadow: inset 0 0 20px rgba(139, 69, 19, 0.1);
}

.story-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-charcoal);
}

.interactive-word {
  background: linear-gradient(45deg, var(--primary-gold), #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-weight: 600;
}

.interactive-word:hover {
  text-shadow: 0 0 15px var(--primary-gold);
  transform: scale(1.05);
}

.interactive-word.selected {
  background: linear-gradient(45deg, var(--accent-cyan), #00CED1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px var(--accent-cyan);
}
</style>