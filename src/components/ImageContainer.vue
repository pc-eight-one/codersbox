<template>
  <transition name="fade">
    <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div class="relative">
        <transition name="scale">
          <img :src="imageSrc" alt="Expanded Image" class="max-w-full max-h-full object-contain"/>
        </transition>
        <button
            @click="closeViewer"
            class="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded shadow hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';

defineProps({
  imageSrc: {
    type: String,
    required: true,
  },
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close']);

const closeViewer = () => {
  emit('close');
};
</script>

<style scoped>
/* Fade animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Scale animation */
.scale-enter-active, .scale-leave-active {
  transition: transform 0.3s ease;
}

.scale-enter-from {
  transform: scale(0.8);
}

.scale-leave-to {
  transform: scale(0.8);
}
</style>