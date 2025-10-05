<template>
  <Teleport to="body">
    <!-- Overlay (oscuro + blur) -->
    <div class="overlay" @click.self="close" @keydown.esc="close" tabindex="-1">
      <!-- Modal -->
      <section class="modal">
        <header class="modal-head">
          <h2>Add List</h2>
          <button class="x" @click="close" aria-label="Close">✕</button>
        </header>

        <form class="modal-body" @submit.prevent="submit">
          <!-- List name -->
          <div class="block">
            <label class="label">List name</label>
            <input class="input" v-model.trim="name" placeholder="e.g. Supermarket" />
            <p v-if="touched && !name" class="error">Name is required</p>
          </div>

          <!-- Row: Icon + Colors -->
          <div class="row">
            <div class="col">
              <label class="label">Icon</label>
              <div class="icon-row">
                <button v-for="n in 4" :key="n" type="button" class="icon-box">⋯</button>
              </div>
            </div>

            <div class="col">
              <label class="label">Color</label>
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

          <!-- Visibility -->
          <div class="block">
            <label class="label">Visibility</label>
            <div class="segmented">
              <button
                type="button"
                class="seg"
                :class="{ on: visibility === 'private' }"
                @click="visibility = 'private'"
              >Private</button>

              <!-- 👇 ABRE EL MODAL DE MIEMBROS -->
              <button
                type="button"
                class="seg"
                :class="{ on: visibility === 'shared' }"
                @click="setShared()"
              >Shared</button>
            </div>
          </div>

          <!-- Notes -->
          <div class="block">
            <label class="label">Notes</label>
            <textarea class="textarea" v-model.trim="notes" placeholder="Brief notes…"></textarea>
          </div>

          <!-- Footer actions -->
          <footer class="actions">
            <button type="button" class="btn ghost" @click="close">Cancel</button>
            <button type="submit" class="btn primary" :disabled="!name">Create List</button>
          </footer>
        </form>
      </section>
    </div>

    <!-- Segunda vista: Share members -->
    <ShareMembersModal
      v-if="showShare"
      @close="onShareClose"
      @save="onShareSave"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ShareMembersModal from '@/components/ShareMembersModal.vue' // ← ruta según tu árbol

const router = useRouter()

const name = ref('')
const notes = ref('')
const color = ref('#6B7CFF')
const visibility = ref<'private'|'shared'>('private')
const touched = ref(false)

/* ▼ estado y handlers para el modal de miembros */
const showShare = ref(false)
function setShared(){
  visibility.value = 'shared'
  showShare.value = true       // abre la segunda vista
}
function onShareClose(){
  showShare.value = false
}
function onShareSave(payload: { members: string[], pending: string[], blocked: string[] }){
  console.log('SHARE SETTINGS', payload)
  showShare.value = false
}

const colors = ['#6B7CFF','#8A6BFB','#7D68D0','#5EC5A7','#F0B429','#E76F51','#B3B4BE']

function close(){ router.back() }
function submit(){
  touched.value = true
  if(!name.value) return
  console.log('CREATE LIST', { name: name.value, color: color.value, visibility: visibility.value, notes: notes.value })
  close()
}
</script>

<style scoped>
/* ===== Overlay tipo “oscurecido con blur” ===== */
.overlay{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(4px);      /* 👈 desenfoque del fondo */
  -webkit-backdrop-filter: blur(4px);
  display: grid; place-items: center;
  z-index: 2000;
}

/* ===== Modal ===== */
.modal{
  width: min(760px, 92vw);
  background: #322D59;             /* panel violeta */
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,.55);
  border: 1px solid rgba(255,255,255,.08);
  color: #EDEAF6;
}

/* Header */
.modal-head{
  position: relative;
  padding: 18px 22px 6px;
}
.modal-head h2{
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}
.x{
  position: absolute; top: 14px; right: 14px;
  width: 36px; height: 36px; border-radius: 999px;
  background: #3C3A63; color: #fff; border: none; cursor: pointer;
}

/* Body */
.modal-body{ padding: 8px 22px 18px; }
.block{ margin: 12px 0; }
.label{ display:block; margin: 4px 0 8px; font-weight: 700; color: #CFC9E6; }

.input, .textarea{
  width: 100%;
  background: #0E0F1A;
  color: #fff;
  border: 2px solid rgba(255,255,255,.12);
  border-radius: 10px;
  padding: 12px 14px;
  outline: none;
}
.input:focus, .textarea:focus{ border-color: #6B7CFF; }
.textarea{ min-height: 120px; resize: vertical; }

.error{ color:#ff9f9f; font-size: 12px; margin-top: 6px; }

/* Row */
.row{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.col{ display: flex; flex-direction: column; }

/* Iconos placeholder */
.icon-row{ display: flex; gap: 10px; }
.icon-box{
  width: 46px; height: 46px; border-radius: 10px;
  background: #0E0F1A; color: #fff; border: 2px solid rgba(255,255,255,.12);
  cursor: pointer;
}

/* Colores */
.colors{ display: flex; gap: 10px; flex-wrap: wrap; }
.swatch{
  width: 30px; height: 30px; border-radius: 999px; border: 2px solid rgba(255,255,255,.25);
  cursor: pointer;
}
.swatch.picked{ outline: 2px solid #fff; }

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
}
</style>