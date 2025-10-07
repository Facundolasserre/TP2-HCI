<template>
  <router-view/>
  <ToastNotification />
</template>

<script setup>
import ToastNotification from './components/ToastNotification.vue'
</script>

<style>
/* opcional: si querés centrar siempre las vistas en pantalla */
:host {
  display: block;
  min-height: 100vh;
  display: grid;
  place-items: center;
}
</style>