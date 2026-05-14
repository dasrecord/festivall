<template>
  <div v-if="items.length > 0" class="inventory-task-items">
    <div class="inventory-header">📍 Where to find it</div>
    <div
      v-for="item in items"
      :key="item.id"
      class="inventory-row"
      :class="{ 'needs-restock': item.needs_restock }"
    >
      <div class="inventory-row-info">
        <span class="inventory-item-name">{{ item.name }}</span>
        <span class="inventory-item-location">
          {{ item.location?.replace(/_icon$/, '').replace(/_/g, ' ') }}
          <template v-if="item.sub_location"> › {{ item.sub_location }}</template>
        </span>
        <span v-if="item.needs_restock" class="restock-badge">⚠️ Needs restock</span>
        <span v-if="item.notes" class="inventory-notes">{{ item.notes }}</span>
      </div>
      <button
        v-if="canFlag && !item.needs_restock"
        class="flag-btn"
        @click.stop="$emit('flag', item.id)"
        title="Flag this item as needing restock"
      >
        Flag needs restock
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  },
  canFlag: {
    type: Boolean,
    default: false
  }
})

defineEmits(['flag'])
</script>

<style scoped>
.inventory-task-items {
  margin-top: 0.75rem;
  padding: 0.6rem 0.75rem;
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 2px solid rgba(255, 200, 80, 0.5);
  border-radius: 6px;
}

.inventory-header {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 200, 80, 0.8);
  margin-bottom: 0.4rem;
}

.inventory-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.inventory-row:last-child {
  border-bottom: none;
}

.inventory-row.needs-restock {
  opacity: 0.7;
}

.inventory-row-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.inventory-item-name {
  font-size: 0.85rem;
  color: #e0e0e0;
  font-weight: 500;
}

.inventory-item-location {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
  text-transform: capitalize;
}

.restock-badge {
  font-size: 0.72rem;
  color: #ffa726;
  font-weight: 600;
}

.inventory-notes {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
  font-style: italic;
}

.flag-btn {
  flex-shrink: 0;
  font-size: 0.7rem;
  padding: 3px 8px;
  background: transparent;
  border: 1px solid rgba(255, 167, 38, 0.4);
  color: #ffa726;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0;
  font-weight: normal;
  transition: background-color 0.2s;
}

.flag-btn:hover {
  background-color: rgba(255, 167, 38, 0.12);
}
</style>
