<template>
  <div class="inv-page">
    <div class="inv-page-header">
      <RouterLink to="/dashboard" class="inv-back-link">← Dashboard</RouterLink>
      <h1 class="inv-page-title">📦 Inventory Manager</h1>
      <button class="inv-add-btn" @click="invOpenAdd">+ Add Item</button>
    </div>

    <!-- Add / Edit Form -->
    <div v-if="invFormOpen" class="inv-form-card">
      <h3 class="inv-form-title">{{ invEditId ? 'Edit Item' : 'New Item' }}</h3>
      <div class="inv-form-grid">
        <label class="inv-label">Name
          <input class="inv-input" v-model="invForm.name" placeholder="e.g. Trash Bags" />
        </label>
        <label class="inv-label">Location (SVG ID)
          <input class="inv-input" v-model="invForm.location" placeholder="e.g. trailer_C_icon" />
        </label>
        <label class="inv-label">Sub-location
          <input class="inv-input" v-model="invForm.sub_location" placeholder="e.g. Bin_1" />
        </label>
        <label class="inv-label" style="grid-column:1/-1;">Description
          <input class="inv-input" v-model="invForm.description" placeholder="Optional description" />
        </label>
        <label class="inv-label" style="grid-column:1/-1;">Notes
          <input class="inv-input" v-model="invForm.notes" placeholder="Optional notes" />
        </label>
        <div class="inv-label" style="grid-column:1/-1;">
          <span class="inv-section-label">Departments</span>
          <div class="inv-checkbox-row">
            <label v-for="dept in ALL_DEPARTMENTS" :key="dept.key" class="inv-checkbox-label">
              <input type="checkbox" :value="dept.key" v-model="invForm.departments" />
              {{ dept.label }}
            </label>
          </div>
        </div>
        <label class="inv-checkbox-label" style="grid-column:1/-1;">
          <input type="checkbox" v-model="invForm.needs_restock" />
          ⚠️ Needs restock
        </label>
        <label class="inv-checkbox-label" style="grid-column:1/-1;">
          <input type="checkbox" v-model="invForm.missing" />
          ❌ Missing
        </label>
        <div v-if="invEditId" class="inv-flag-clear-row" style="grid-column:1/-1;">
          <span class="inv-flag-clear-label">Clear volunteer flags:</span>
          <button type="button" class="inv-flag-clear-btn" @click="invClearFlag('needs_restock')">✓ Mark Restocked</button>
          <button type="button" class="inv-flag-clear-btn" @click="invClearFlag('missing')">✓ Mark Found</button>
        </div>
      </div>
      <div class="inv-form-actions">
        <button class="inv-cancel-btn" @click="invFormOpen = false">Cancel</button>
        <button class="inv-save-btn" :disabled="invSaving" @click="invSave">
          {{ invSaving ? 'Saving…' : (invEditId ? 'Save Changes' : 'Add Item') }}
        </button>
      </div>
    </div>

    <!-- Filter / Group toolbar -->
    <div class="inv-toolbar">
      <input class="inv-search" v-model="searchQuery" placeholder="Search items…" />
      <div class="inv-tb-seg">
        <span class="inv-tb-lbl">Group</span>
        <select class="inv-select" v-model="groupBy">
          <option value="none">None</option>
          <option value="sub_location">Sub-location</option>
          <option value="location">Location</option>
          <option value="department">Department</option>
        </select>
      </div>
      <div class="inv-tb-seg">
        <span class="inv-tb-lbl">Dept</span>
        <select class="inv-select" v-model="filterDept">
          <option value="">All</option>
          <option v-for="d in ALL_DEPARTMENTS" :key="d.key" :value="d.key">{{ d.label }}</option>
        </select>
      </div>
      <div class="inv-tb-seg">
        <span class="inv-tb-lbl">Sort</span>
        <select class="inv-select" v-model="sortBy">
          <option value="name">Name</option>
          <option value="sub_location">Sub-loc</option>
          <option value="location">Location</option>
        </select>
      </div>
      <label class="inv-flag-toggle" :class="{ active: filterRestock }">
        <input type="checkbox" v-model="filterRestock" style="display:none" />⚠ Restock
      </label>
      <label class="inv-flag-toggle" :class="{ active: filterMissing }">
        <input type="checkbox" v-model="filterMissing" style="display:none" />❌ Missing
      </label>
      <span class="inv-result-count">{{ filteredItems.length }} items</span>
    </div>

    <!-- Items: flat or grouped -->
    <div class="inv-grid">
      <!-- Flat view -->
      <template v-if="groupBy === 'none'">
        <div class="inv-card">
          <div class="card-header">
            <span class="card-title">All Items</span>
            <span class="card-badge amber">{{ filteredItems.length }}</span>
          </div>
          <div v-if="!filteredItems.length" class="empty-row">No items match.</div>
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="line-item"
            :class="{ 'inv-restock': item.needs_restock }"
          >
            <span class="line-name">{{ item.name }}</span>
            <span class="line-meta">
              {{ item.location?.replace(/_icon$/, '').replace(/_/g, ' ') }}
              <template v-if="item.sub_location"> › {{ item.sub_location }}</template>
            </span>
            <span class="line-meta" style="color:#555;">
              {{ Array.isArray(item.departments) ? item.departments.map(k => deptLabel(k)).join(', ') : '' }}
            </span>
            <span v-if="item.needs_restock" class="line-amount amber" style="font-size:10px;">⚠ restock</span>
            <span v-if="item.missing" class="line-amount" style="font-size:10px;color:#ef5350;">❌ missing</span>
            <div class="inv-row-actions">
              <button class="inv-edit-btn" @click="invOpenEdit(item)">Edit</button>
              <button class="inv-del-btn" @click="invDelete(item.id)">✕</button>
            </div>
          </div>
        </div>
      </template>

      <!-- Grouped view -->
      <template v-else>
        <div v-if="!groupedItems.length" class="inv-card">
          <div class="empty-row" style="padding:0.4rem 0;">No items match.</div>
        </div>
        <div
          v-for="[groupLabel, groupItems] in groupedItems"
          :key="groupLabel"
          class="inv-card"
        >
          <div class="card-header inv-group-header" @click="toggleGroup(groupLabel)">
            <span class="card-title">{{ groupLabel }}</span>
            <span class="card-badge amber">{{ groupItems.length }}</span>
            <span class="inv-collapse-icon">{{ collapsedGroups.has(groupLabel) ? '▶' : '▼' }}</span>
          </div>
          <template v-if="!collapsedGroups.has(groupLabel)">
            <div
              v-for="item in groupItems"
              :key="item.id + '-' + groupLabel"
              class="line-item"
              :class="{ 'inv-restock': item.needs_restock }"
            >
              <span class="line-name">{{ item.name }}</span>
              <span class="line-meta">
                {{ item.location?.replace(/_icon$/, '').replace(/_/g, ' ') }}
                <template v-if="item.sub_location && groupBy !== 'sub_location'"> › {{ item.sub_location }}</template>
              </span>
              <span v-if="groupBy !== 'department'" class="line-meta" style="color:#555;">
                {{ Array.isArray(item.departments) ? item.departments.map(k => deptLabel(k)).join(', ') : '' }}
              </span>
              <span v-if="item.needs_restock" class="line-amount amber" style="font-size:10px;">⚠ restock</span>
              <span v-if="item.missing" class="line-amount" style="font-size:10px;color:#ef5350;">❌ missing</span>
              <div class="inv-row-actions">
                <button class="inv-edit-btn" @click="invOpenEdit(item)">Edit</button>
                <button class="inv-del-btn" @click="invDelete(item.id)">✕</button>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useInventory } from '@/composables/useInventory'

const { deptItems: inventoryItems, createItem, updateItem, deleteItem } = useInventory()

const ALL_DEPARTMENTS = [
  { key: 'front_gate', label: 'Front Gate' },
  { key: 'food_team', label: 'Food Team' },
  { key: 'setup_crew', label: 'Setup Crew' },
  { key: 'stage_crew', label: 'Stage Crew' },
  { key: 'cleanup_crew', label: 'Cleanup Crew' },
  { key: 'arcade_attendant', label: 'Arcade Attendant' }
]

const invFormOpen = ref(false)
const invEditId = ref(null)
const invSaving = ref(false)
const invForm = ref({
  name: '', description: '', location: '', sub_location: '',
  departments: [], notes: '', needs_restock: false, missing: false
})

function invOpenAdd() {
  invEditId.value = null
  invForm.value = { name: '', description: '', location: '', sub_location: '', departments: [], notes: '', needs_restock: false, missing: false }
  invFormOpen.value = true
}

function invOpenEdit(item) {
  invEditId.value = item.id
  invForm.value = {
    name: item.name || '',
    description: item.description || '',
    location: item.location || '',
    sub_location: item.sub_location || '',
    departments: Array.isArray(item.departments) ? [...item.departments] : [],
    notes: item.notes || '',
    needs_restock: !!item.needs_restock,
    missing: !!item.missing
  }
  invFormOpen.value = true
}

async function invClearFlag(flag) {
  if (!invEditId.value) return
  invForm.value[flag] = false
  await updateItem(invEditId.value, { [flag]: false })
}

async function invSave() {
  invSaving.value = true
  try {
    const data = {
      name: invForm.value.name.trim(),
      description: invForm.value.description.trim(),
      location: invForm.value.location.trim(),
      sub_location: invForm.value.sub_location.trim(),
      departments: [...invForm.value.departments],
      notes: invForm.value.notes.trim(),
      needs_restock: invForm.value.needs_restock,
      missing: invForm.value.missing
    }
    if (invEditId.value) {
      await updateItem(invEditId.value, data)
    } else {
      await createItem(data)
    }
    invFormOpen.value = false
  } finally {
    invSaving.value = false
  }
}

async function invDelete(id) {
  if (!confirm('Delete this inventory item?')) return
  await deleteItem(id)
}

// ── View controls ─────────────────────────────────────────────────────────────
const searchQuery = ref('')
const groupBy = ref('none')
const filterDept = ref('')
const filterRestock = ref(false)
const filterMissing = ref(false)
const sortBy = ref('name')
const collapsedGroups = ref(new Set())

function deptLabel(key) {
  return ALL_DEPARTMENTS.find(d => d.key === key)?.label ?? key
}

const filteredItems = computed(() => {
  let result = [...inventoryItems.value]
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    result = result.filter(i =>
      i.name?.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q) ||
      i.sub_location?.toLowerCase().includes(q) ||
      i.notes?.toLowerCase().includes(q)
    )
  }
  if (filterDept.value) {
    result = result.filter(i =>
      Array.isArray(i.departments) && i.departments.includes(filterDept.value)
    )
  }
  if (filterRestock.value) result = result.filter(i => i.needs_restock)
  if (filterMissing.value) result = result.filter(i => i.missing)
  result.sort((a, b) => {
    if (sortBy.value === 'sub_location') {
      return (a.sub_location || '').localeCompare(b.sub_location || '') || a.name.localeCompare(b.name)
    }
    if (sortBy.value === 'location') {
      return (a.location || '').localeCompare(b.location || '') || a.name.localeCompare(b.name)
    }
    return a.name.localeCompare(b.name)
  })
  return result
})

const groupedItems = computed(() => {
  if (groupBy.value === 'none') return []
  const groups = new Map()
  for (const item of filteredItems.value) {
    let keys = []
    if (groupBy.value === 'department') {
      keys = Array.isArray(item.departments) && item.departments.length
        ? item.departments.map(k => deptLabel(k))
        : ['Unassigned']
    } else if (groupBy.value === 'sub_location') {
      keys = [item.sub_location?.trim() || '(no sub-location)']
    } else {
      keys = [item.location?.replace(/_icon$/, '').replace(/_/g, ' ').trim() || '(no location)']
    }
    for (const key of keys) {
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(item)
    }
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))
})

function toggleGroup(label) {
  const next = new Set(collapsedGroups.value)
  if (next.has(label)) next.delete(label)
  else next.add(label)
  collapsedGroups.value = next
}
</script>

<style scoped>
.inv-page {
  background-color: #1f1e22;
  color: #f0f4f8;
  min-height: 100vh;
  padding: 1.5rem;
}

.inv-page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto 1.5rem;
  flex-wrap: wrap;
}

.inv-back-link {
  font-size: 11px;
  color: #888;
  text-decoration: none;
  padding: 4px 10px;
  border: 1px solid #444;
  border-radius: 3px;
  white-space: nowrap;
}

.inv-back-link:hover { color: #ccc; border-color: #666; }

.inv-page-title {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #ccc;
  margin: 0;
}

.inv-add-btn {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 12px;
  background-color: #ffa726;
  color: #1f1e22;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  letter-spacing: 0.05em;
}

.inv-add-btn:hover { background-color: #ffb74d; }

/* Form card */
.inv-form-card {
  background-color: #252528;
  padding: 1rem;
  margin: 0 auto 1px;
  max-width: 900px;
}

.inv-form-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ccc;
  margin: 0 0 0.75rem;
}

.inv-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.inv-label {
  display: flex;
  flex-direction: column;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #666;
  gap: 0.2rem;
}

.inv-input {
  background-color: #1f1e22;
  border: 1px solid #3a3a3e;
  border-radius: 3px;
  color: #d0d0d0;
  font-size: 11px;
  padding: 4px 6px;
  outline: none;
}

.inv-input:focus { border-color: #ffa726; }

.inv-section-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #666;
}

.inv-checkbox-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.inv-checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 10px;
  color: #aaa;
  cursor: pointer;
}

.inv-form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  justify-content: flex-end;
}

.inv-cancel-btn {
  font-size: 11px;
  padding: 4px 12px;
  background: transparent;
  border: 1px solid #555;
  color: #888;
  border-radius: 3px;
  cursor: pointer;
}

.inv-save-btn {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 14px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.inv-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Grid / table */
.inv-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  background-color: #2a2a2e;
  padding: 1px;
  max-width: 900px;
  margin: 0 auto;
}

.inv-card {
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

.section-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #666;
  margin: 0.35rem 0 0.2rem;
}

.line-item {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding: 2px 0;
  border-bottom: 1px solid #2e2e32;
  flex-wrap: wrap;
}

.line-item.inv-restock .line-name { opacity: 0.55; }

.line-name {
  flex: 1;
  font-size: 11px;
  color: #d0d0d0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.line-meta {
  font-size: 10px;
  color: #666;
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

.inv-row-actions {
  display: flex;
  gap: 0.3rem;
  margin-left: auto;
}

.inv-edit-btn {
  font-size: 10px;
  padding: 1px 7px;
  background: transparent;
  border: 1px solid #555;
  color: #aaa;
  border-radius: 2px;
  cursor: pointer;
}

.inv-edit-btn:hover { border-color: #ffa726; color: #ffa726; }

.inv-del-btn {
  font-size: 10px;
  padding: 1px 6px;
  background: transparent;
  border: 1px solid #555;
  color: #888;
  border-radius: 2px;
  cursor: pointer;
}

.inv-del-btn:hover { border-color: #ef5350; color: #ef5350; }

.amber { color: #ffa726; }

.inv-flag-clear-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.4rem 0;
  border-top: 1px solid rgba(255,255,255,0.07);
  margin-top: 0.25rem;
}
.inv-flag-clear-label {
  font-size: 0.72rem;
  color: #777;
  margin-right: 0.25rem;
}
.inv-flag-clear-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.5);
  padding: 0.15rem 0.6rem;
  border-radius: 4px;
  font-size: 0.72rem;
  cursor: pointer;
}
.inv-flag-clear-btn:hover {
  border-color: #66bb6a;
  color: #66bb6a;
}

/* Toolbar */
.inv-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 900px;
  margin: 0 auto 1px;
  background-color: #252528;
  padding: 0.45rem 0.75rem;
  flex-wrap: wrap;
}

.inv-search {
  background-color: #1f1e22;
  border: 1px solid #3a3a3e;
  border-radius: 3px;
  color: #d0d0d0;
  font-size: 11px;
  padding: 3px 7px;
  outline: none;
  width: 150px;
  min-width: 0;
}

.inv-search:focus { border-color: #ffa726; }

.inv-tb-seg {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.inv-tb-lbl {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #555;
}

.inv-select {
  background-color: #1f1e22;
  border: 1px solid #3a3a3e;
  border-radius: 3px;
  color: #ccc;
  font-size: 10px;
  padding: 2px 5px;
  outline: none;
  cursor: pointer;
}

.inv-select:focus { border-color: #ffa726; }

.inv-flag-toggle {
  font-size: 10px;
  color: #666;
  padding: 2px 8px;
  border: 1px solid #3a3a3e;
  border-radius: 3px;
  cursor: pointer;
  user-select: none;
  transition: border-color 0.12s, color 0.12s;
}

.inv-flag-toggle.active {
  border-color: #ffa726;
  color: #ffa726;
}

.inv-result-count {
  margin-left: auto;
  font-size: 10px;
  color: #555;
  font-weight: 600;
}

.inv-group-header {
  cursor: pointer;
  user-select: none;
}

.inv-group-header:hover .card-title { color: #ffa726; }

.inv-collapse-icon {
  font-size: 9px;
  color: #555;
  margin-left: 0.25rem;
}
</style>
