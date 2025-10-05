<template>
 
  <router-view/>
</template>

<script setup>
// Nada que importar acá
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