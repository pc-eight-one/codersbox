<template>
  <article class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow transition-all duration-300 article-card">
    <div class="bg-gray-800 h-2"></div>
    <div class="p-6">
      <div class="flex items-center mb-4">
        <span class="text-xs text-gray-500 font-medium">{{date}}</span>
        <span class="mx-2 text-gray-300">•</span>
        <span class="text-xs text-gray-500 font-medium">{{readTime}}</span>
      </div>
      <h3 class="font-bold text-lg mb-2 line-clamp-2">{{ title }}</h3>
      <p class="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{{ description }}</p>
      <div class="flex items-center">
        <span v-for="tag in tags" :key="tag" class="bg-gray-100 rounded-full px-3 py-1 text-xs mr-2">{{ tag }}</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps({
  date: {
    type: String,
    default: 'April 25, 2025'
  },
  readTime: {
    type: String,
    default: '12 min read'
  },
  title: {
    type: String,
    default: 'Understanding JavaScript Promises and Async/Await'
  },
  description: {
    type: String,
    default: 'A deep dive into asynchronous programming in JavaScript, covering promises, async/await, and best practices for error handling.'
  },
  tags: {
    type: Array<String>,
    default: () => ['JavaScript', 'WebDev']
  }
})
</script>