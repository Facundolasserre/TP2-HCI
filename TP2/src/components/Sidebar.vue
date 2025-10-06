<template>
  <Teleport to="body">
    <transition name="fade">
      <div  v-if="open" class="overlay" @click.self="emitClose" @keydown.esc="emitClose" tabindex="-1">
        <aside class="sidebar">
          <!-- ENCABEZADO -->
          <div class="sb-top">
            <div class="brand">
              <img src="@/assets/LogoHCI.png" alt="BagIt" />
            </div>
            <button class="close" @click="emitClose" aria-label="Close">✖</button>
          </div>

          <!-- MENÚ -->
          <ul class="sb-menu">
            <li
              :class="{ active: active === 'home' }"
              @click="set('home')"
            >
              <span class="ico">🏠</span>
              <span>Home</span>
            </li>

            <li
              :class="{ active: active === 'edit' }"
              @click="set('edit')"
            >
              <span class="ico">✏️</span>
              <span>Edit Lists</span>
            </li>

            <li
              :class="{ active: active === 'history' }"
              @click="set('history')"
            >
              <span class="ico">⏱️</span>
              <span>Shopping List History</span>
            </li>
          </ul>

          <!-- PIE -->
          <div class="sb-bottom">
            <button class="logout">
              <span>Log out</span>
              <span class="exit">↪︎</span>
            </button>
          </div>
        </aside>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
// Props que recibe del padre
const props = defineProps<{
  open: boolean
  active: 'home' | 'edit' | 'history'
}>()

// Eventos que emite al padre
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:active', v: 'home' | 'edit' | 'history'): void
}>()

// Cerrar sidebar
function emitClose() {
  emit('close')
}

// Cambiar sección activa y cerrar
function set(v: 'home' | 'edit' | 'history') {
  emit('update:active', v)
  emitClose()
}
</script>

<style>
:root {
  --panel: #322D59;
  --ink: #EDEAF6;
}

/* Animación de entrada */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Fondo oscuro detrás del sidebar */
.overlay{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  z-index: 1000;              /* ⬅️ que tape todo */
}

/* Panel lateral */
.sidebar{
  width: 300px;
  max-width: 85vw;
  height: 100%;
  background: var(--panel);
  display: flex;
  flex-direction: column;
  box-shadow: 6px 0 24px rgba(0,0,0,.45);
  z-index: 1001;              /* ⬅️ por encima del overlay */
}

/* Animación slide-in */
@keyframes slideIn {
  from {
    transform: translateX(-40px);
    opacity: 0.6;
  }
  to {
    transform: translateX(-8px);
    opacity: 1;
  }
}

/* Cabecera */
.sb-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 14px;
}
.brand img {
  width: 42px;
  height: auto;
  display: block;
}
.close {
  border: none;
  background: transparent;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}

/* Menú principal */
.sb-menu {
  list-style: none;
  padding: 8px;
  margin: 0;
}
.sb-menu li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.sb-menu li:hover {
  background: rgba(255, 255, 255, 0.06);
}
.sb-menu li.active {
  background: rgba(255, 255, 255, 0.08);
}
.sb-menu .ico {
  width: 22px;
  text-align: center;
}

/* Pie con botón logout */
.sb-bottom {
  margin-top: auto;
  padding: 18px;
}
.logout {
  width: 100%;
  height: 38px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #5f57d1;
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: 0.2s ease;
}
.logout:hover {
  background: #6e67de;
}
.logout .exit {
  background: #4f49b8;
  padding: 4px 8px;
  border-radius: 10px;
}
</style>