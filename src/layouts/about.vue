<template>
  <div class="bg-gray-100 text-gray-900 min-h-screen">

    <!-- Navigation -->
    <Navigation
        title="codersbox"
        :nav="navItems"
    />

    <!-- Hero Section -->
    <header class="bg-white border-b border-gray-200 py-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-10">
        <div class="w-full md:w-1/3 flex justify-center">
          <div class="relative w-64 h-64 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
            <img src="" alt="Profile Photo" class="object-cover w-full h-full">
          </div>
        </div>
        <div class="w-full md:w-2/3">
          <h1 class="text-4xl font-bold mb-4 tracking-tight">Hi, I'm Prashant Chaturvedi</h1>
          <p class="text-gray-600 text-xl mb-6 leading-relaxed">Full-stack developer passionate about building clean, user-friendly applications and sharing knowledge with the developer community.</p>
          <div class="flex flex-wrap gap-3">
            <a href="#" class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition">
              <Icon name="fa-brands:github" class="text-white"/>
              <span>GitHub</span>
            </a>
            <a href="#" class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition">
              <Icon name="fa-brands:linkedin" class="text-white"/>
              <span>LinkedIn</span>
            </a>
            <a href="#" class="flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white py-2 px-4 rounded-md transition">
              <Icon name="fa-brands:twitter" class="text-white"/>
              <span>Twitter</span>
            </a>
            <a href="#" class="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition">
              <Icon name="fa-solid:envelope" class="text-white"/>
              <span>Email</span>
            </a>
          </div>
        </div>
      </div>
    </header>

    <slot />

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">

import type NavItem from "@/types/NavItem";

const navItems: Array<NavItem> = [
  {name: 'Home', link: '/'},
  {name: 'Articles', link: '/articles'},
  {name: 'Tutorials', link: '/tutorials'},
  {name: 'Projects', link: '/projects'},
  {name: 'About', link: '/about'},
]
</script>