<template>
  <router-view/>
  <ToastNotification />
</template>

<script setup>
import ToastNotification from './components/common/ToastNotification.vue'
</script>

<style>
/* Full-width layout for web views */
#app {
  min-height: 100vh;
  width: 100%;
}
</style>