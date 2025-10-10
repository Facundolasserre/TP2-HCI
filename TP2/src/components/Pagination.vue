<template>
  <div class="pagination">
    <button 
      class="pagination-button"
      :disabled="currentPage === 1"
      @click="goToPage(currentPage - 1)"
      aria-label="Previous page"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Previous
    </button>

    <div class="pagination-pages">
      <button
        v-for="page in visiblePages"
        :key="page"
        :class="['pagination-page', { active: page === currentPage }]"
        @click="goToPage(page)"
        :aria-label="`Go to page ${page}`"
        :aria-current="page === currentPage ? 'page' : undefined"
      >
        {{ page }}
      </button>
    </div>

    <button 
      class="pagination-button"
      :disabled="currentPage === totalPages"
      @click="goToPage(currentPage + 1)"
      aria-label="Next page"
    >
      Next
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>

    <div class="pagination-info">
      Page {{ currentPage }} of {{ totalPages }} ({{ total }} total)
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  total: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 7
  
  if (props.totalPages <= maxVisible) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    let start = Math.max(2, props.currentPage - 2)
    let end = Math.min(props.totalPages - 1, props.currentPage + 2)
    
    if (props.currentPage <= 3) {
      end = 5
    }
    
    if (props.currentPage >= props.totalPages - 2) {
      start = props.totalPages - 4
    }
    
    if (start > 2) {
      pages.push(-1) // Ellipsis
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (end < props.totalPages - 1) {
      pages.push(-1) // Ellipsis
    }
    
    // Always show last page
    pages.push(props.totalPages)
  }
  
  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
  flex-wrap: wrap;
}

.pagination-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(50, 45, 89, 0.4);
  border: 1px solid rgba(107, 124, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-button:hover:not(:disabled) {
  background: rgba(50, 45, 89, 0.6);
  border-color: rgba(107, 124, 255, 0.5);
  transform: translateY(-1px);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination-page {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  background: rgba(50, 45, 89, 0.4);
  border: 1px solid rgba(107, 124, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-page:hover {
  background: rgba(50, 45, 89, 0.6);
  border-color: rgba(107, 124, 255, 0.5);
}

.pagination-page.active {
  background: linear-gradient(135deg, #6B7CFF 0%, #5B5DD9 100%);
  border-color: #6B7CFF;
  box-shadow: 0 4px 12px rgba(107, 124, 255, 0.3);
}

.pagination-info {
  margin-left: auto;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .pagination {
    gap: 8px;
  }
  
  .pagination-button {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .pagination-page {
    min-width: 36px;
    height: 36px;
    font-size: 13px;
  }
  
  .pagination-info {
    width: 100%;
    text-align: center;
    margin-left: 0;
  }
}
</style>
