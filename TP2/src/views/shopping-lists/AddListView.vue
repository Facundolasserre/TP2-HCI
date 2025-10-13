<template>
  <Teleport to="body">
    <!-- Overlay (oscuro + blur) -->
    <div class="overlay" @click.self="close" @keydown.esc="onEsc" tabindex="-1">
      <!-- Modal -->
      <section class="modal">
        <header class="modal-head">
          <h2>{{ t('add_list.title') }}</h2>
          <button class="x" @click="close" aria-label="Close">✕</button>
        </header>

        <form class="modal-body" @submit.prevent="submit">
          <!-- List name -->
          <div class="block">
            <label class="label">{{ t('add_list.list_name_label') }}</label>
            <input class="input" v-model.trim="name" :placeholder="t('add_list.list_name_placeholder')" />
            <p v-if="touched && !name" class="error">{{ t('add_list.name_required') }}</p>
            <p v-if="nameError" class="error">{{ nameError }}</p>
          </div>

          <!-- Icon selector -->
          <hr class="separator">
          <div class="block">
            <label class="label">{{ t('add_list.icon_label') }}</label>
            <div class="icon-selector">
              <button
                v-for="iconOption in availableIcons"
                :key="iconOption.id"
                type="button"
                class="icon-option"
                :class="{ selected: selectedIcon === iconOption.id }"
                @click="selectedIcon = iconOption.id"
              >
                <img :src="iconOption.src" :alt="iconOption.name" class="icon-img" />
              </button>
            </div>
          </div>

          

          <!-- Row: Emojis (multi) + Colors -->
          <hr class="separator">
          <div class="row">
            

            <!-- Colores -->
            <div class="col">
              <label class="label">{{ t('add_list.color_label') }}</label>
              <div class="colors">
                <button
                  v-for="c in colors"
                  :key="c"
                  type="button"
                  class="swatch"
                  :style="{ background: c }"
                  :class="{ picked: color === c }"
                  @click="color = c"
                  aria-label="choose color"
                />
                
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="block">
            <label class="label">{{ t('add_list.notes_label') }}</label>
            <textarea class="textarea" v-model.trim="notes" :placeholder="t('add_list.notes_placeholder')"></textarea>
          </div>

          <!-- Footer actions -->
          <footer class="actions">
            <button type="button" class="btn ghost" @click="close">{{ t('add_list.cancel_button') }}</button>
            <button type="submit" class="btn primary" :disabled="!name">{{ t('add_list.create_button') }}</button>
          </footer>
        </form>
      </section>
    </div>

    <!-- Segunda vista: Share members -->
    <ShareMembersModal
      v-if="showShare"
      :list-id="0"
      :list-name="name"
      :owner="shareModalOwner"
      @close="onShareClose"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useShoppingListsStore } from '@/stores/shoppingLists';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { useI18n } from '@/composables/useI18n';
import ShareMembersModal from '@/components/members/ShareMembersModal.vue';
import type { User } from '@/types/shopping-lists';

const router = useRouter();
const shoppingListsStore = useShoppingListsStore();
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();

const name = ref('');
const notes = ref('');
const color = ref('#6B7CFF');
const nameError = ref(''); // For 409 Conflict error

const visibility = ref<'private'|'shared'>('private');
const touched = ref(false);
const selectedIcon = ref('shopping_cart.svg'); // icono por defecto

/** ============ Share modal state ============ */
const showShare = ref(false);
const sharedMembers = ref<string[]>([]);
const shareModalOwner = computed<User>(() => {
  const currentUser = authStore.user;
  if (currentUser) {
    return {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      surname: currentUser.surname,
      metadata: currentUser.metadata,
      createdAt: currentUser.createdAt,
      updatedAt: currentUser.updatedAt,
    };
  }

  return {
    id: 0,
    email: '',
    name: '',
    surname: '',
  };
});

// Iconos disponibles para seleccionar
const availableIcons = [
  { 
    id: 'shopping_cart.svg', 
    name: 'Carrito de compras',
    src: new URL('@/assets/shopping_cart.svg', import.meta.url).href
  },
  { 
    id: 'family.svg', 
    name: 'Familia',
    src: new URL('@/assets/family.svg', import.meta.url).href
  },
  { 
    id: 'travel.svg', 
    name: 'Viaje',
    src: new URL('@/assets/travel.svg', import.meta.url).href
  },
  { 
    id: 'liquor.svg', 
    name: 'Bebidas',
    src: new URL('@/assets/liquor.svg', import.meta.url).href
  },
  { 
    id: 'house.svg', 
    name: 'Casa',
    src: new URL('@/assets/house.svg', import.meta.url).href
  },
  { 
    id: 'work.svg', 
    name: 'Trabajo',
    src: new URL('@/assets/work.svg', import.meta.url).href
  },
];

function setShared(){
  visibility.value = 'shared';
  showShare.value = true;
}
function onShareClose(){ showShare.value = false; }
function onShareSave(payload: { members: string[], pending: string[], blocked: string[] }){
  console.log('SHARE SETTINGS', payload);
  sharedMembers.value = payload.members;
  showShare.value = false;
}

/** ============ Colors ============ */
const colors = [
  '#6B7CFF', // Azul/Púrpura principal (original)
  '#5EC5A7', // Verde menta (original)
  '#F0B429', // Amarillo dorado (original)
  '#E76F51', // Coral/Naranja (original)
  '#E91E63', // Rosa fuerte (original)
  '#9B59B6', // Púrpura profundo (nuevo)
  '#3498DB', // Azul cielo (nuevo)
  '#F39C12', // Naranja brillante (nuevo)
];

function onEsc() {
  close();
}

/** ============ Submit/Close ============ */
function close(){ router.push('/Home'); }

async function submit(){
  touched.value = true;
  nameError.value = ''; // Clear previous errors
  if(!name.value) return;
  
  try {
    // Create list via API
    const newList = await shoppingListsStore.createList({
      name: name.value,
      description: notes.value || '', // Backend requires description field (can be empty string)
      recurring: false,
      metadata: {
        icon: selectedIcon.value,
        color: color.value
      }
    });
    
    toast.success('¡Lista creada exitosamente!');
    
    // If shared, share with members (TODO: implement after list creation)
    if (visibility.value === 'shared' && sharedMembers.value.length > 0) {
      // This would require sharing logic with emails
      console.log('TODO: Share list with:', sharedMembers.value);
    }
    
    // Redirect to Home so the new list appears in the grid
    router.push('/Home');
  } catch (error: any) {
    console.error('Failed to create list:', error);
    if (error.response?.status === 409 || error.status === 409) {
      nameError.value = 'Ya existe una lista con este nombre';
      toast.error('Ya existe una lista con este nombre');
    } else if (error.status === 0 || error.code === 'ERR_NETWORK') {
      console.warn('⚠️ Backend not available - simulating list creation');
      toast.success('List created (mock mode - backend not available)');
      router.push('/Home');
    } else {
      toast.error(error.message || 'Failed to create list');
    }
  }
}
</script>

<style scoped>
/* ===== Overlay tipo “oscurecido con blur” ===== */
.overlay{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: grid; place-items: center;
  z-index: 2000;
}

/* ===== Modal ===== */
.modal{
  width: min(760px, 92vw);
  background: #322D59;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,.55);
  border: 1px solid rgba(255,255,255,.08);
  color: #EDEAF6;
}

/* Header */
.modal-head{ position: relative; padding: 18px 22px 6px; }
.modal-head h2{ margin: 0; font-size: 28px; font-weight: 800; }
.x{
  position: absolute; top: 14px; right: 14px;
  width: 36px; height: 36px; border-radius: 999px;
  background: #3C3A63; color: #fff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

/* Body */
.modal-body{ padding: 8px 22px 18px; }
.block{ margin: 12px 0; }
.label{ display:block; margin: 4px 0 8px; font-weight: 700; color: #CFC9E6; }

.input, .textarea{
  width: 100%;
  box-sizing: border-box; /* Fix overflow */
  background: #0E0F1A;
  color: #fff;
  border: 2px solid rgba(255,255,255,.12);
  border-radius: 10px;
  padding: 12px 14px;
  outline: none;
}
.input:focus, .textarea:focus{ border-color: #6B7CFF; }
.input.small{ height: 38px; padding: 8px 12px; font-size: 14px; }
.textarea{ min-height: 120px; resize: none; }

.separator {
  border: none;
  border-top: 1px solid rgba(255,255,255,.1);
  margin: 16px 0;
}

.error{ color:#ff9f9f; font-size: 12px; margin-top: 6px; }

/* Row */
.row{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.col{ display: flex; flex-direction: column; }

/* ===== Multi-emoji ===== */
.picked-emojis{
  display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
  min-height: 46px;
}
.chip{
  display: inline-flex; align-items: center; gap: 6px;
  background:#0E0F1A; border:1px solid rgba(255,255,255,.15);
  color:#fff; height: 34px; padding: 0 10px; border-radius: 16px;
  cursor: pointer;
}
.chip-emoji{ font-size: 16px; line-height: 1; }
.chip-x{ opacity:.8; font-weight: 700; }

.add-emoji, .clear-emoji{
  height: 34px; padding: 0 12px; border-radius: 16px; border:none; cursor:pointer;
  font-weight: 800;
}
.add-emoji{ background:#6B7CFF; color:#fff; }
.clear-emoji{ background:transparent; color:#EDEAF6; border:1px solid rgba(255,255,255,.18); }

.emoji-popover{
  position: relative; margin-top: 10px;
  background:#1b1b2a; border:1px solid rgba(255,255,255,.12);
  border-radius: 12px; box-shadow: 0 10px 24px rgba(0,0,0,.45);
  padding: 10px;
}
.emoji-head{
  display:flex; align-items:center; gap:8px; margin-bottom: 8px;
}
.hint{ font-size: 12px; opacity: .8; }

.emoji-grid{
  display:grid; grid-template-columns: repeat(12, 1fr);
  gap:6px; max-height: 180px; overflow:auto; padding:4px;
}
.emoji-btn{
  width:30px; height:30px; border:none; border-radius:8px;
  background:#0E0F1A; color:#fff; cursor:pointer; font-size:16px;
}
.emoji-btn:hover{ background:#26263a; }
.emoji-btn:disabled{ opacity:.4; cursor:not-allowed; }

.emoji-actions{ display:flex; justify-content:flex-end; padding-top:8px; }
.btn-mini{
  border:none; border-radius:8px; height:30px; padding:0 10px;
  background:#3C3A63; color:#fff; font-weight:700; cursor:pointer;
}

/* Colores */
.colors {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap; /* Mantener en una sola fila */
  align-items: center;
  overflow-x: auto; /* Permitir scroll horizontal si es necesario en pantallas pequeñas */
  padding-bottom: 4px; /* Espacio para el scrollbar si aparece */
}

.swatch{
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid rgba(255,255,255,.25);
  cursor: pointer;
  flex-shrink: 0; /* Evitar que los botones se compriman */
  transition: all 0.2s ease;
}

.swatch:hover{
  transform: scale(1.1);
  border-color: rgba(255,255,255,.45);
}

.swatch.picked{ 
  border: 3px solid #fff;
  transform: scale(1.05);
}



/* Icon selector */
.icon-selector{
  display: flex; gap: 12px; flex-wrap: wrap;
}
.icon-option{
  width: 60px; height: 60px; border-radius: 12px;
  border: 2px solid rgba(255,255,255,.15);
  background: #0E0F1A;
  display: grid; place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 12px;
}
.icon-option:hover{
  border-color: rgba(255,255,255,.35);
  background: #1a1b2a;
}
.icon-option.selected{
  border-color: #6B7CFF;
  background: rgba(107, 124, 255, 0.15);
  outline: 2px solid #6B7CFF;
}
.icon-img{
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: 0.85;
}
.icon-option:hover .icon-img{
  opacity: 1;
}
.icon-option.selected .icon-img{
  opacity: 1;
  filter: brightness(0) invert(1);
}

/* Visibility segmented */
.segmented{
  background:#0E0F1A; padding: 4px; border-radius: 10px; display: inline-flex; gap: 6px;
  border: 1px solid rgba(255,255,255,.12);
}
.seg{
  min-width: 110px; height: 40px; border-radius: 8px; background: transparent; color:#EDEAF6;
  border: none; font-weight: 800; cursor: pointer;
}
.seg.on{ background:#24243a; }

/* Footer */
.actions{
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px;
}
.btn{ height: 42px; padding: 0 18px; border-radius: 999px; border: none; font-weight: 800; cursor: pointer; }
.btn.ghost{ background: transparent; color: #EDEAF6; border: 1px solid rgba(255,255,255,.18); }
.btn.primary{ background: #6B7CFF; color: #fff; }
.btn.primary:disabled{ opacity: .5; cursor: not-allowed; }

@media (max-width: 760px){
  .row{ grid-template-columns: 1fr; }
  .emoji-grid{ grid-template-columns: repeat(8, 1fr); }
}
</style>
