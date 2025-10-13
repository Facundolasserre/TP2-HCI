<template>
  <Teleport to="body">
    <div class="overlay" @click.self="close" @keydown.esc="onEsc" tabindex="-1">
      <section class="modal">
        <header class="modal-head">
          <h2>{{ t('edit_list.title') }}</h2>
          <button class="x" @click="close" aria-label="Close">✕</button>
        </header>

        <form class="modal-body" @submit.prevent="submit">
          <div class="block">
            <label class="label">{{ t('add_list.list_name_label') }}</label>
            <input
              class="input"
              v-model.trim="name"
              :placeholder="t('add_list.list_name_placeholder')"
            />
            <p v-if="touched && !name" class="error">{{ t('add_list.name_required') }}</p>
            <p v-if="nameError" class="error">{{ nameError }}</p>
          </div>

          <hr class="separator" />
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

          <hr class="separator" />
          <div class="row">
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

          <div class="block">
            <label class="label">{{ t('add_list.visibility_label') }}</label>
            <div class="segmented">
              <button
                type="button"
                class="seg"
                :class="{ on: visibility === 'private' }"
                @click="setPrivate"
              >
                {{ t('add_list.private') }}
              </button>
              <button
                type="button"
                class="seg"
                :class="{ on: visibility === 'shared' }"
                @click="setShared"
              >
                {{ t('add_list.shared') }}
              </button>
            </div>
          </div>

          <div class="block">
            <label class="label">{{ t('add_list.notes_label') }}</label>
            <textarea
              class="textarea"
              v-model.trim="notes"
              :placeholder="t('add_list.notes_placeholder')"
            ></textarea>
          </div>

          <footer class="actions">
            <button type="button" class="btn ghost" @click="close">
              {{ t('add_list.cancel_button') }}
            </button>
            <button type="submit" class="btn primary" :disabled="!name || isSubmitting">
              <span v-if="isSubmitting" class="spinner-small"></span>
              <span v-else>{{ t('edit_list.save_button') }}</span>
            </button>
          </footer>
        </form>
      </section>
    </div>

    <ShareMembersModal
      v-if="showShare && listId"
      :list-id="listId"
      :list-name="name"
      :owner="shareModalOwner"
      @close="onShareClose"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useShoppingListsStore } from '@/stores/shoppingLists';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { useI18n } from '@/composables/useI18n';
import ShareMembersModal from '@/components/members/ShareMembersModal.vue';
import type { User } from '@/types/shopping-lists';

const route = useRoute();
const router = useRouter();
const shoppingListsStore = useShoppingListsStore();
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();

const listId = Number(route.params.id);

const name = ref('');
const notes = ref('');
const color = ref('#6B7CFF');
const selectedIcon = ref('shopping_cart.svg');
const visibility = ref<'private' | 'shared'>('private');
const touched = ref(false);
const nameError = ref('');
const isSubmitting = ref(false);

const showShare = ref(false);

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

const colors = [
  '#6B7CFF',
  '#5EC5A7',
  '#F0B429',
  '#E76F51',
  '#E91E63',
  '#9B59B6',
  '#3498DB',
  '#F39C12',
];

const availableIcons = [
  {
    id: 'shopping_cart.svg',
    name: 'Shopping Cart',
    src: new URL('@/assets/shopping_cart.svg', import.meta.url).href,
  },
  {
    id: 'family.svg',
    name: 'Family',
    src: new URL('@/assets/family.svg', import.meta.url).href,
  },
  {
    id: 'travel.svg',
    name: 'Travel',
    src: new URL('@/assets/travel.svg', import.meta.url).href,
  },
  {
    id: 'liquor.svg',
    name: 'Liquor',
    src: new URL('@/assets/liquor.svg', import.meta.url).href,
  },
  {
    id: 'house.svg',
    name: 'House',
    src: new URL('@/assets/house.svg', import.meta.url).href,
  },
  {
    id: 'work.svg',
    name: 'Work',
    src: new URL('@/assets/work.svg', import.meta.url).href,
  },
];

const loadList = async () => {
  try {
    const list = await shoppingListsStore.fetchListById(listId);
    if (!list) {
      toast.error(t('edit_list.load_error'));
      close();
      return;
    }

    name.value = list.name ?? '';
    notes.value = list.description ?? '';
    const meta = (list.metadata || {}) as Record<string, any>;
    color.value = meta.color || '#6B7CFF';
    selectedIcon.value = meta.icon || 'shopping_cart.svg';
    visibility.value = list.sharedWith && list.sharedWith.length > 0 ? 'shared' : 'private';
  } catch (error) {
    console.error('Failed to load list', error);
    toast.error(t('edit_list.load_error'));
    close();
  }
};

onMounted(async () => {
  if (!Number.isFinite(listId)) {
    toast.error(t('edit_list.load_error'));
    close();
    return;
  }
  await loadList();
});

const setPrivate = () => {
  visibility.value = 'private';
};

const setShared = () => {
  visibility.value = 'shared';
  showShare.value = true;
};

const onShareClose = () => {
  showShare.value = false;
};

const onEsc = () => {
  close();
};

const close = () => {
  router.push(`/List/${listId}`);
};

const submit = async () => {
  touched.value = true;
  nameError.value = '';

  if (!name.value.trim()) {
    return;
  }

  try {
    isSubmitting.value = true;
    await shoppingListsStore.updateList(listId, {
      name: name.value.trim(),
      description: notes.value ?? '',
      metadata: {
        icon: selectedIcon.value,
        color: color.value,
      },
    });

    toast.success(t('edit_list.success'));
    await shoppingListsStore.fetchLists(undefined, true);
    close();
  } catch (error: any) {
    console.error('Failed to update list', error);
    if (error?.response?.status === 409 || error?.status === 409) {
      nameError.value = t('edit_list.duplicate_error');
      toast.error(t('edit_list.duplicate_error'));
    } else {
      toast.error(t('edit_list.generic_error'));
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.overlay{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: grid; place-items: center;
  z-index: 2000;
}

.modal{
  width: min(760px, 92vw);
  background: #322D59;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,.55);
  border: 1px solid rgba(255,255,255,.08);
  color: #EDEAF6;
}


.modal-head{ position: relative; padding: 18px 22px 6px; }
.modal-head h2{ margin: 0; font-size: 28px; font-weight: 800; }
.x{
  position: absolute; top: 14px; right: 14px;
  width: 36px; height: 36px; border-radius: 999px;
  background: #3C3A63; color: #fff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.modal-body{ padding: 8px 22px 18px; }

.block{ margin: 12px 0; }
.label{ display:block; margin: 4px 0 8px; font-weight: 700; color: #CFC9E6; }
.input, .textarea{
  width: 100%;
  box-sizing: border-box;
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

.separator{
  border:none;
  height:1px;
  background: rgba(255,255,255,.08);
}

.icon-selector{
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.icon-option{
  width: 60px;
  height: 60px;
  border-radius: 12px;
  border: 2px solid rgba(255,255,255,.15);
  background: #0E0F1A;
  display: grid;
  place-items: center;
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
.icon-option:hover .icon-img,
.icon-option.selected .icon-img{
  opacity: 1;
  filter: brightness(0) invert(1);
}

.row{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.col{ display: flex; flex-direction: column; }

.colors {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  align-items: center;
  overflow-x: auto;
  padding-bottom: 4px;
}

.swatch{
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid rgba(255,255,255,.25);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.swatch:hover{ transform: translateY(-2px); }
.swatch.picked{ border-color: rgba(255,255,255,.85); }

.segmented{
  background:#0E0F1A;
  padding: 4px;
  border-radius: 10px;
  display: inline-flex;
  gap: 6px;
  border: 1px solid rgba(255,255,255,.12);
}
.seg{
  min-width: 110px;
  height: 40px;
  border-radius: 8px;
  background: transparent;
  color:#EDEAF6;
  border: none;
  font-weight: 800;
  cursor: pointer;
}
.seg.on{ background:#24243a; }

.actions{
  display:flex;
  justify-content:flex-end;
  gap:12px;
  padding-top: 8px;
}
.btn{
  border:none;
  border-radius: 999px;
  padding: 12px 24px;
  font-weight:600;
  cursor:pointer;
  transition: transform .15s ease, box-shadow .18s ease, opacity .15s ease;
}
.btn.primary{
  background: linear-gradient(135deg, #7F89FF, #6B7CFF);
  color:white;
}
.btn.ghost{
  background: rgba(255,255,255,.08);
  color:white;
}
.btn:hover{
  transform: translateY(-2px);
}
.btn:disabled{
  opacity:.6;
  cursor:not-allowed;
  transform:none;
}

.error{
  color:#FF7B7B;
  font-size:13px;
  margin:0;
}

.spinner-small{
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,.25);
  border-top-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: spin .8s linear infinite;
}

@keyframes spin{
  to { transform: rotate(360deg); }
}

@media (max-width: 540px){
  .modal{
    width: calc(100% - 24px);
    border-radius: 20px;
  }

  .modal-head{
    padding: 20px 20px 10px;
  }

  .modal-body{
    padding: 0 20px 20px;
  }

  .actions{
    flex-direction: column;
    align-items: stretch;
  }

  .btn{
    width:100%;
  }
}
</style>
