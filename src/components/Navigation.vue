<template>
  <nav class="bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 font-extrabold text-2xl tracking-[-.1em]">
            <NuxtLink to="#" class="flex items-center">
              <Logo title-class="text-3xl" />
            </NuxtLink>
          </div>
          <div class="hidden md:flex ml-10 space-x-8">
            <NuxtLink v-for="item in nav" :key="item.name" :to="item.link"
                      class="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
              {{ item.name }}
            </NuxtLink>
          </div>
        </div>
        <div class="flex items-center">
          <NuxtLink to="#" class="p-2 text-gray-600 hover:text-black transition-colors">
            <Icon name="fa6-solid:sun" class="text-xl" />
          </NuxtLink>
          <button @click="toggleMenu" class="md:hidden ml-2 p-2 text-gray-600 hover:text-black transition-colors">
            <Icon name="fa6-solid:ellipsis-vertical" class="text-xl" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div :class="isMenuOpen ? 'block' : 'hidden'" class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 bg-white border-b border-gray-200">
        <NuxtLink v-for="item in nav" :key="item.name" :to="item.link"
                  class="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">
          {{ item.name }}
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type NavItem from "@/types/NavItem";

defineProps({
  title: {
    type: String,
    default: 'codersbox'
  },
  nav: {
    type: Array<NavItem>,
    required: true
  }
});

const isMenuOpen = ref(false);

const toggleMenu = () => isMenuOpen.value = !isMenuOpen.value;
</script>