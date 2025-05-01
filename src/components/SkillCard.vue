<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm skill-card">
    <div class="flex items-center mb-4">
      <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
        <i class="fas fa-code text-blue-500 text-2xl"></i>
      </div>
      <h3 class="text-xl font-bold">Frontend</h3>
    </div>
    <ul class="space-y-2 text-gray-600">
      <li v-for="skill in skills" :key="skill" class="flex items-center">
        <i class="fas fa-check text-green-500 mr-2"></i>
        {{ skill }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  defineProps({
    title: {
      type: String,
      default: 'Frontend'
    },
    skills: {
      type: Array<String>,
      default: () => ['React', 'Vue.js', 'TypeScript', 'CSS', 'Responsive Design']
    },
    icon: {
      type: String,
      default: 'fas fa-code'
    }
  })
</script>