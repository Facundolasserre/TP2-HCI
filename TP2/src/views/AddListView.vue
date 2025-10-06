<template>
  <Teleport to="body">
    <!-- Overlay (oscuro + blur) -->
    <div class="overlay" @click.self="close" @keydown.esc="onEsc" tabindex="-1">
      <!-- Modal -->
      <section class="modal" @click="maybeClosePickers($event)">
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

          <!-- Row: Emojis (multi) + Colors -->
          <div class="row">
            <!-- ✅ Multi-emoji -->
            <div class="col">
              <label class="label">Emojis</label>

              <!-- Seleccion actual -->
              <div class="picked-emojis" aria-live="polite">
                <button
                  v-for="(e,i) in emojis"
                  :key="e + i"
                  type="button"
                  class="chip"
                  @click="removeEmoji(i)"
                  :aria-label="`Remove ${e}`"
                  title="Remove"
                >
                  <span class="chip-emoji">{{ e }}</span>
                  <span class="chip-x">×</span>
                </button>

                <button
                  type="button"
                  class="add-emoji"
                  @click.stop="togglePicker"
                  aria-haspopup="dialog"
                  :aria-expanded="showPicker"
                  :aria-label="showPicker ? 'Close emoji picker' : 'Open emoji picker'"
                >
                  {{ emojis.length ? 'Add' : 'Choose' }}
                </button>

                <button
                  v-if="emojis.length"
                  type="button"
                  class="clear-emoji"
                  @click="clearEmojis"
                  aria-label="Clear all emojis"
                >
                  Clear
                </button>
              </div>

              <!-- Popover del picker -->
              <div v-if="showPicker" class="emoji-popover" role="dialog" @click.stop>
                <div class="emoji-head">
                  <input
                    class="input small"
                    v-model.trim="emojiQuery"
                    placeholder="Search… (e.g. star)"
                    @keydown.stop
                  />
                  <span class="hint">{{ emojis.length }}/{{ maxEmojis }}</span>
                </div>

                <div class="emoji-grid">
                  <button
                    v-for="e in filteredEmojiOptions"
                    :key="e"
                    type="button"
                    class="emoji-btn"
                    :disabled="isDisabled(e)"
                    @click="toggleEmoji(e)"
                    :title="hasEmoji(e) ? 'Remove' : 'Add'"
                  >
                    {{ e }}
                  </button>
                </div>

                <div class="emoji-actions">
                  <button type="button" class="btn-mini" @click="showPicker=false">Done</button>
                </div>
              </div>
            </div>

            <!-- Colores -->
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

              <!-- Abre modal de miembros -->
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ShareMembersModal from '@/components/ShareMembersModal.vue'

const router = useRouter()

const name = ref('')
const notes = ref('')
const color = ref('#6B7CFF')
const visibility = ref<'private'|'shared'>('private')
const touched = ref(false)

/** ============ Multi-emoji state ============ */
const emojis = ref<string[]>([])         // selección actual
const showPicker = ref(false)
const emojiQuery = ref('')
const maxEmojis = 4

// catálogo básico (podés extenderlo)
const emojiOptions = [
  // smileys
  '😀','😄','😊','🙂','😉','🥳','🤓','😎','🫶','❤️','✨','⭐️','⚡️','🔥','🌈','🎯','🚀',
  // comida / super
  '🛒','🍎','🍌','🍇','🥦','🥕','🥛','🍞','🧀','🥩','🥚','🧻','🧴','🧂','🥫','🧼',
  // animales
  '🐶','🐱','🐼','🐸','🦊','🐧','🐥','🦄',
  // objetos
  '📦','🗂️','🧺','🔑','📝','📅','⏰','🔒'
]

// filtro simple por nombre corto (heurística mínima)
const nameMap: Record<string,string> = {
  '😀':'grinning','😄':'smile','😊':'blush','🙂':'slight','😉':'wink','🥳':'party','🤓':'nerd','😎':'cool',
  '🫶':'hearthands','❤️':'heart','✨':'sparkles','⭐️':'star','⚡️':'zap','🔥':'fire','🌈':'rainbow','🎯':'target','🚀':'rocket',
  '🛒':'cart','🍎':'apple','🍌':'banana','🍇':'grapes','🥦':'broccoli','🥕':'carrot','🥛':'milk','🍞':'bread','🧀':'cheese','🥩':'meat','🥚':'egg','🧻':'toiletpaper','🧴':'lotion','🧂':'salt','🥫':'canned','🧼':'soap',
  '🐶':'dog','🐱':'cat','🐼':'panda','🐸':'frog','🦊':'fox','🐧':'penguin','🐥':'chick','🦄':'unicorn',
  '📦':'box','🗂️':'folders','🧺':'basket','🔑':'key','📝':'note','📅':'calendar','⏰':'alarm','🔒':'lock'
}
const filteredEmojiOptions = computed(()=>{
  const q = emojiQuery.value.trim().toLowerCase()
  if(!q) return emojiOptions
  return emojiOptions.filter(e => (nameMap[e] || '').includes(q))
})

function togglePicker(){ showPicker.value = !showPicker.value }
function onEsc(){ 
  if (showPicker.value) showPicker.value = false
  else close()
}
function maybeClosePickers(e: MouseEvent){
  const el = e.target as HTMLElement
  if (!el.closest('.emoji-popover') && !el.closest('.add-emoji')) {
    showPicker.value = false
  }
}
function hasEmoji(e: string){ return emojis.value.includes(e) }
function isDisabled(e: string){
  return !hasEmoji(e) && emojis.value.length >= maxEmojis
}
function toggleEmoji(e: string){
  if (hasEmoji(e)) {
    emojis.value = emojis.value.filter(x => x !== e)
  } else if (emojis.value.length < maxEmojis) {
    emojis.value.push(e)
  }
}
function removeEmoji(i: number){ emojis.value.splice(i,1) }
function clearEmojis(){ emojis.value = [] }

/** ============ Share modal state ============ */
const showShare = ref(false)
function setShared(){
  visibility.value = 'shared'
  showShare.value = true
}
function onShareClose(){ showShare.value = false }
function onShareSave(payload: { members: string[], pending: string[], blocked: string[] }){
  console.log('SHARE SETTINGS', payload)
  showShare.value = false
}

/** ============ Colors ============ */
const colors = ['#6B7CFF','#8A6BFB','#7D68D0','#5EC5A7','#F0B429','#E76F51','#B3B4BE']

/** ============ Submit/Close ============ */
function close(){ router.back() }
function submit(){
  touched.value = true
  if(!name.value) return
  console.log('CREATE LIST', {
    name: name.value,
    color: color.value,
    visibility: visibility.value,
    notes: notes.value,
    emojis: emojis.value
  })
  close()
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
.input.small{ height: 38px; padding: 8px 12px; font-size: 14px; }
.textarea{ min-height: 120px; resize: vertical; }

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
  .emoji-grid{ grid-template-columns: repeat(8, 1fr); }
}
</style>