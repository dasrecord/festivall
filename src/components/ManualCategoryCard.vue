<template>
  <div class="budget-card">
    <div class="card-header">
      <span class="card-title">{{ title }}</span>
      <span class="card-badge red">{{ fmtCAD(subtotal) }}</span>
    </div>

    <div
      v-for="item in items"
      :key="item.id"
      class="line-item"
    >
      <span class="line-name">{{ item.label }}</span>
      <span class="line-amount red">{{ fmtCAD(item.amount) }}</span>
      <button
        v-if="isAdmin"
        class="del-btn"
        @click="$emit('remove', item.id)"
        title="Remove"
      >×</button>
    </div>

    <div v-if="!items.length" class="empty-row">No entries yet</div>

    <div class="subtotal-row">
      <span class="subtotal-label">Subtotal</span>
      <span class="subtotal-amount red">{{ fmtCAD(subtotal) }}</span>
    </div>

    <div v-if="isAdmin" class="add-form">
      <input
        v-model="newLabel"
        class="input-label"
        placeholder="Description"
        @keyup.enter="submit"
      />
      <input
        v-model="newAmount"
        class="input-amount"
        placeholder="$"
        type="number"
        min="0"
        step="1"
        @keyup.enter="submit"
      />
      <button
        class="add-btn"
        :disabled="!newLabel.trim() || !newAmount || saving"
        @click="submit"
      >
        Add
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  category: { type: String, required: true },
  items: { type: Array, default: () => [] },
  isAdmin: { type: Boolean, default: false },
  saving: { type: Boolean, default: false }
})

const emit = defineEmits(['add', 'remove'])

const newLabel = ref('')
const newAmount = ref('')

const subtotal = computed(() =>
  props.items.reduce((sum, i) => sum + Number(i.amount || 0), 0)
)

const fmtCAD = (n) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(Number(n) || 0)

const submit = () => {
  if (!newLabel.value.trim() || !newAmount.value) return
  emit('add', {
    category: props.category,
    label: newLabel.value.trim(),
    amount: Number(newAmount.value)
  })
  newLabel.value = ''
  newAmount.value = ''
}
</script>

<style scoped>
.budget-card {
  background-color: #252528;
  padding: 0.6rem 0.75rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid #333;
}

.card-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ccc;
}

.card-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 3px;
}

.line-item {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding: 2px 0;
  border-bottom: 1px solid #2e2e32;
}

.line-name {
  flex: 1;
  font-size: 11px;
  color: #d0d0d0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-amount {
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  margin-left: auto;
}

.empty-row {
  font-size: 10px;
  color: #555;
  padding: 3px 0;
  font-style: italic;
}

.subtotal-row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0 0;
  margin-top: 2px;
  border-top: 1px solid #444;
}

.subtotal-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #666;
}

.subtotal-amount {
  font-size: 11px;
  font-weight: 700;
}

.add-form {
  display: flex;
  gap: 4px;
  margin-top: 0.5rem;
  padding-top: 0.4rem;
  border-top: 1px solid #333;
}

.add-form input {
  padding: 3px 6px;
  border-radius: 4px;
  border: 1px solid #444;
  background-color: #1f1e22;
  color: #e0e0e0;
  font-size: 11px;
  min-width: 0;
}

.add-form input::placeholder {
  color: #555;
}

.input-label {
  flex: 2;
}

.input-amount {
  flex: 1;
  width: 60px;
}

.add-btn {
  padding: 3px 8px;
  background-color: var(--festivall-baby-blue);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.add-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.del-btn {
  padding: 0 5px;
  background: none;
  border: none;
  color: #555;
  font-size: 13px;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
}

.del-btn:hover {
  color: #ff6b6b;
}

.red { color: #ef5350; }
</style>
