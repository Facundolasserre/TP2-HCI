<template>
  <main class="grid">
    <article v-for="card in items" :key="card.id" class="card" @click="$emit('open', card)">
      <div class="card-ico" v-html="card.icon"></div>
      <h3 class="card-title">{{ card.title }}</h3>
      <p class="card-sub">
        <em v-if="card.sharedWith?.length">
          shared with {{ shareText(card.sharedWith) }}
        </em>
        <em v-else>no shares</em>
      </p>
    </article>
  </main>
</template>

<script setup lang="ts">

// ============= API ========== 
export type Card = { id: string; title: string; icon: string; sharedWith?: string[] }

const props = defineProps<{ items: Card[] }>()
defineEmits<{ (e: 'open', card: Card): void }>()
function shareText(list: string[]){ return list.length === 1 ? list[0] : `${list.length} contacts` }
</script>

<style>


.layout{
  min-height:100vh;
  background: var(--bg);
  color: var(--ink);
  display:flex;
  flex-direction:column;
  padding: 22px 26px 32px;
}

/* ===== GRID ===== */
.grid{
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 34px;
  width: 100%;
}
@media (max-width: 860px){
  .grid{ grid-template-columns: 1fr; }
}

.card{
  background:#0E0F1A;
  border-radius:16px;
  min-height: 260px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:8px;
  box-shadow: 0 10px 24px rgba(0,0,0,.35);
  transition: transform .08s ease;
  cursor:pointer;
}
.card:hover{ transform: translateY(-2px); }
.card-ico{ color:#EDEAF6; opacity:.85; }
.card-title{ margin:6px 0 0; font-weight:800; }
.card-sub{ margin:0; color:var(--muted); font-size:12px; }



</style>