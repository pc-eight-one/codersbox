<template>
  <div class="bg-gray-100 text-gray-900 min-h-screen">

    <!-- Navigation Bar -->
    <Navigation
        title="codersbox"
        :nav="navItems"
    />

    <!-- Hero Section -->
    <header class="bg-white border-b border-gray-200 py-20 relative">
      <!-- Subtle Dotted Background Pattern -->
      <HeroBackground />
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-4xl font-bold mb-6 tracking-tight">Articles</h1>
        <p class="text-gray-600 text-lg mb-8 max-w-3xl leading-relaxed">In-depth technical articles about web development, software engineering, and programming concepts.</p>

        <!-- Search Bar -->
        <div class="relative max-w-3xl">
          <input
              type="text"
              placeholder="Search articles..."
              class="w-full py-4 pl-5 pr-10 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          >
          <div class="absolute inset-y-0 right-0 flex items-center pr-4">
            <span class="bg-gray-200 text-gray-500 rounded px-2 py-1 text-xs">⌘K</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Filter Section -->
    <section class="border-b border-gray-200 bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-wrap items-center justify-between">
          <div class="flex flex-wrap items-center space-x-4 mb-3 sm:mb-0">
            <span class="text-sm font-medium text-gray-700">Filter by:</span>
            <div class="relative group">
              <button class="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm flex items-center space-x-1 hover:bg-gray-50">
                <span>Topic</span>
                <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
            <div class="relative group">
              <button class="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm flex items-center space-x-1 hover:bg-gray-50">
                <span>Difficulty</span>
                <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
            <button class="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-800 hover:bg-gray-200">JavaScript</button>
            <button class="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-800 hover:bg-gray-200">React</button>
            <button class="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-800 hover:bg-gray-200">CSS</button>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm font-medium text-gray-700">Sort by:</span>
            <select class="text-sm bg-white border border-gray-300 rounded-md px-2 py-1">
              <option>Most Recent</option>
              <option>Popularity</option>
              <option>Reading Time</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <slot />

    <!-- Newsletter Section -->
    <Newsletter />
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