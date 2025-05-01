<template>
  <article class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow transition-all duration-300 tutorial-card flex">
    <div class="bg-gray-900 w-2"></div>
    <div class="p-6 flex-grow">
      <span class="inline-block bg-gray-800 text-white text-xs px-2 py-1 rounded mb-4">{{ difficulty }}</span>
      <h3 class="font-bold text-lg mb-2">{{ title }}</h3>
      <p class="text-gray-600 text-sm mb-4 leading-relaxed">{{description}}</p>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span v-for="tag in tags" :key="tag" class="bg-gray-100 rounded-full px-3 py-1 text-xs mr-2">{{ tag }}</span>
        </div>
        <span class="text-xs text-gray-500">{{ seriesPartsCount }} parts series</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps({
  difficulty: {
    type: String,
    default: 'BEGINNER'
  },
  title: {
    type: String,
    default: 'Build a Portfolio Website with HTML, CSS, and JavaScript'
  },
  description: {
    type: String,
    default: 'Step-by-step tutorial to create your own responsive portfolio website from scratch without any frameworks.'
  },
  tags: {
    type: Array<String>,
    default: () => ['HTML', 'CSS']
  },
  seriesPartsCount: {
    type: Number,
    default: 5
  }
})
</script>