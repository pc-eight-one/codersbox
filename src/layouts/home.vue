<template>
  <div class="bg-gray-100 text-gray-900 min-h-screen">

    <!-- Navigation -->
    <Navigation
        title="codersbox"
        :nav="navItems"
    />

    <!-- Hero Section -->
    <header class="bg-white py-20 relative">
      <!-- Subtle Dotted Background Pattern -->
      <HeroBackground />
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <!-- Centered Developer Introduction -->
        <div class="text-center max-w-3xl mx-auto mb-14">
          <h1 class="text-5xl font-bold mb-6 pt-6 tracking-tight">Hello! my name is Prashant</h1>
          <p class="text-gray-600 text-lg mb-8 leading-relaxed">
            I am a software engineer and I love to share my knowledge with the world. This is my personal blog where I write about
            programming, technology, and everything in between. Join me on this journey of learning and discovery!
          </p>
        </div>

        <!-- Full-width Search Bar -->
        <div class="relative max-w-4xl mx-auto">
          <input
              type="text"
              placeholder="Search articles..."
              class="w-full py-4 pl-5 pr-10 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          >
          <div class="absolute inset-y-0 right-0 flex items-center pr-4">
            <span class="bg-gray-200 text-gray-500 rounded px-2 py-1 text-xs">ENTER</span>
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