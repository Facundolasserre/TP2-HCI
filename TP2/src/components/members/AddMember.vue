<template>
  <Teleport to="body">
    <div class="overlay" @click.self="close" @keydown.esc="close" tabindex="-1">
      <section class="modal" role="dialog" aria-modal="true" :aria-label="t('addMember.title')">
        <header class="head">
          <h2>{{ t('addMember.title') }}</h2>
          <button class="x" @click="close" :aria-label="t('common.close')">✕</button>
        </header>

        <form class="body" @submit.prevent="submit">
          <!-- Email -->
          <div class="block">
            <label class="label">{{ t('addMember.email_label') }}</label>
            <input
              class="input"
              v-model.trim="email"
              :placeholder="t('addMember.email_placeholder')"
              inputmode="email"
            />
            <p v-if="touched && !validEmail" class="error">{{ t('addMember.email_error') }}</p>
          </div>

          <!-- Role -->
          <div class="block">
            <label class="label">{{ t('addMember.role_label') }}</label>
            <div class="segmented">
              <button
                type="button"
                class="seg"
                :class="{ on: role === 'Member' }"
                @click="role = 'Member'"
              >{{ t('addMember.role.member') }}</button>
              <button
                type="button"
                class="seg"
                :class="{ on: role === 'Owner' }"
                @click="role = 'Owner'"
              >{{ t('addMember.role.owner') }}</button>
            </div>
          </div>

          <!-- Notes -->
          <div class="block">
            <label class="label">{{ t('addMember.notes_label') }}</label>
            <textarea
              class="textarea"
              v-model.trim="notes"
              :placeholder="t('addMember.notes_placeholder')"
            ></textarea>
          </div>

          <!-- Actions -->
          <footer class="actions">
            <button type="button" class="btn ghost" @click="close">{{ t('common.cancel') }}</button>
            <button type="submit" class="btn primary" :disabled="!canSubmit">{{ t('addMember.submit') }}</button>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: {
    email: string
    role: 'Owner' | 'Member'
    notes: string
  }): void
}>()

const email = ref('')
const role = ref<'Owner' | 'Member'>('Member')
const notes = ref('')
const touched = ref(false)
const { t } = useI18n()

const validEmail = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
)

const canSubmit = computed(() => validEmail.value)

function close() {
  emit('close')
}

function submit() {
  touched.value = true
  if (!canSubmit.value) return
  emit('save', { email: email.value, role: role.value, notes: notes.value })
  emit('close')
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 2200;
}

.modal {
  width: min(480px, 92vw);
  background: #322D59;
  color: #EDEAF6;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55); 
  padding: 10px 22px 18px;  /*error ==========================================================*/ 
  overflow: hidden; /* 👈 recorta outlines/halos que se salgan */
}

.head {
  position: relative;
  
}
.head h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
}

.x {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: none;
  background: #3C3A63;
  color: #fff;
  cursor: pointer;
}

.body { padding: 10px 22px 18px; }


.block { margin: 12px 0; }
.label {
  display: block;
  margin: 4px 0 8px;
  font-weight: 700;
  color: #CFC9E6;
}

.input,
.textarea {
  width: 100%;
  background: #0E0F1A;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 12px 14px;
  outline: none;     /* 👈 sin halo externo */
  box-shadow: none;  /* 👈 por si el navegador lo agrega */
}
.input:focus,
.textarea:focus {
  border-color: #6B7CFF; /* focus por borde, no por outline */
}

.textarea {
  min-height: 90px;
  resize: vertical;
}

.error {
  color: #ff9f9f;
  font-size: 12px;
  margin-top: 6px;
}

/* Role segmented */
.segmented {
  background: #0E0F1A;
  padding: 4px;
  border-radius: 10px;
  display: inline-flex;
  gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.seg {
  min-width: 110px;
  height: 40px;
  border-radius: 8px;
  background: transparent;
  color: #EDEAF6;
  border: none;
  font-weight: 800;
  cursor: pointer;
}
.seg.on {
  background: #2d2b46;
  /* outline: 2px solid rgba(107, 124, 255, 0.6);  <-- QUITADO */
  box-shadow: inset 0 0 0 2px rgba(107, 124, 255, 0.6); /* 👈 mismo efecto, no se sale */
}

/* Footer */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}
.btn {
  height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  border: none;
  font-weight: 800;
  cursor: pointer;
}
.btn.ghost {
  background: transparent;
  color: #EDEAF6;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
.btn.primary {
  background: #6B7CFF;
  color: #fff;
}
.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* (Opcional) Suavizar el autofill de Chrome */
.input:-webkit-autofill,
.input:-webkit-autofill:hover,
.input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  -webkit-box-shadow: 0 0 0px 1000px #0E0F1A inset;
  box-shadow: 0 0 0px 1000px #0E0F1A inset;
  transition: background-color 9999s ease-out 0s;
}
</style>
