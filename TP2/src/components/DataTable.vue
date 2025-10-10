<template>
  <div class="data-table-container">
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              :class="{ sortable: column.sortable }"
              @click="column.sortable ? handleSort(column.key) : null"
            >
              <div class="th-content">
                {{ column.label }}
                <span v-if="column.sortable" class="sort-icon">
                  <svg 
                    v-if="sortBy === column.key && sortOrder === 'ASC'" 
                    width="14" height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2"
                  >
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                  <svg 
                    v-else-if="sortBy === column.key && sortOrder === 'DESC'" 
                    width="14" height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  <svg 
                    v-else 
                    width="14" height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2"
                    opacity="0.3"
                  >
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                </span>
              </div>
            </th>
            <th v-if="$slots.actions" class="actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)">
              <div class="loading-state">
                <div class="spinner"></div>
                Loading...
              </div>
            </td>
          </tr>
          <tr v-else-if="!items || items.length === 0" class="empty-row">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)">
              <div class="empty-state">
                <slot name="empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p>No data available</p>
                </slot>
              </div>
            </td>
          </tr>
          <tr 
            v-else 
            v-for="(item, index) in items" 
            :key="getRowKey(item, index)"
            class="data-row"
            :class="{ clickable: rowClickable }"
            @click="rowClickable ? handleRowClick(item) : null"
          >
            <td v-for="column in columns" :key="column.key">
              <slot :name="`cell-${column.key}`" :item="item" :value="getNestedValue(item, column.key)">
                {{ formatCellValue(item, column) }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="actions-cell">
              <slot name="actions" :item="item"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
  formatter?: (value: any, item: any) => string
}

interface Props {
  columns: Column[]
  items: any[]
  loading?: boolean
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  rowKey?: string
  rowClickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  sortBy: '',
  sortOrder: 'ASC',
  rowKey: 'id',
  rowClickable: false
})

const emit = defineEmits<{
  sort: [key: string, order: 'ASC' | 'DESC']
  'row-click': [item: any]
}>()

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

const formatCellValue = (item: any, column: Column) => {
  const value = getNestedValue(item, column.key)
  
  if (column.formatter) {
    return column.formatter(value, item)
  }
  
  if (value === null || value === undefined) {
    return '-'
  }
  
  return value
}

const handleSort = (key: string) => {
  let newOrder: 'ASC' | 'DESC' = 'ASC'
  
  if (props.sortBy === key) {
    newOrder = props.sortOrder === 'ASC' ? 'DESC' : 'ASC'
  }
  
  emit('sort', key, newOrder)
}

const getRowKey = (item: any, index: number) => {
  return item[props.rowKey] ?? index
}

const handleRowClick = (item: any) => {
  emit('row-click', item)
}
</script>

<style scoped>
.data-table-container {
  background: rgba(50, 45, 89, 0.3);
  border: 1px solid rgba(107, 124, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  color: #fff;
}

.data-table thead {
  background: rgba(50, 45, 89, 0.5);
  border-bottom: 1px solid rgba(107, 124, 255, 0.2);
}

.data-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.data-table th.sortable:hover {
  background: rgba(107, 124, 255, 0.1);
}

.th-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-icon {
  display: flex;
  align-items: center;
  color: #6B7CFF;
}

.actions-column {
  text-align: right;
}

.data-table tbody tr.data-row {
  border-bottom: 1px solid rgba(107, 124, 255, 0.1);
  transition: background 0.2s;
}

.data-table tbody tr.data-row:hover {
  background: rgba(50, 45, 89, 0.4);
}

.data-table tbody tr.data-row.clickable {
  cursor: pointer;
}

.data-table tbody tr.data-row.clickable:hover {
  background: rgba(107, 124, 255, 0.15);
}

.data-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.actions-cell {
  text-align: right;
  white-space: nowrap;
}

.loading-row,
.empty-row {
  border-bottom: none !important;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(107, 124, 255, 0.2);
  border-top-color: #6B7CFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

@media (max-width: 768px) {
  .data-table th,
  .data-table td {
    padding: 12px 16px;
    font-size: 13px;
  }
}
</style>
