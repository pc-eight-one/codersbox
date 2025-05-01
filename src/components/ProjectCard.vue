<template>
  <div
      class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow transition-all duration-300 h-full">
    <div class="bg-gray-900 h-40 flex items-center justify-center">
      <img :src="image" alt="Project Image" class="w-16 h-16 object-cover">
    </div>
    <div class="p-6">
      <h3 class="font-bold text-lg mb-2">{{ title }}</h3>
      <p class="text-gray-600 text-sm mb-4 leading-relaxed">{{ description }}</p>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span v-for="tag in tags"
                :key="tag"
                class="bg-gray-100 rounded-full px-3 py-1 text-xs mr-2">
            {{ tag }}
          </span>
        </div>
        <a :href="githubLink" v-if="githubLink && githubLink !== '#'" class="text-gray-700 hover:text-black transition-colors">
          <i class="fab fa-github text-lg"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  image: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  title: {
    type: String,
    default: 'Weather Dashboard'
  },
  description: {
    type: String,
    default: 'A responsive weather app built with Vue.js and the OpenWeather API. Features 7-day forecasts and location search.'
  },
  tags: {
    type: Array<String>,
    default: () => ['Vue', 'API']
  },
  githubLink: {
    type: String,
    default: '#'
  }
})
</script>