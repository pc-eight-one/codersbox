<template>
  <div>
<!--    <span :class="logoClass">&gt;&nbsp;</span>-->
    <span :class="titleClass">{{ title }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: 'codersbox'
  },
  titleClass: {
    type: String,
    default: 'text-2xl'
  },
  logoClass: {
    type: String,
    default: 'text-2xl'
  },
})
</script>