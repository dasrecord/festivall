<template>
  <div class="admin-inventory">
    <div v-if="!isAuthenticated" class="auth-required">
      <h2>🔒 Admin Access Required</h2>
      <p>Please log in to the Festivall dashboard to access inventory management.</p>
      <RouterLink to="/login" class="login-button">Go to Login</RouterLink>
    </div>

    <div v-else class="admin-interface">
      <div class="header">
        <RouterLink to="/dashboard" class="back-link">← Dashboard</RouterLink>
        <h1>📦 Inventory Manager</h1>
        <p>Track items, locations, and volunteer flags across departments</p>
      </div>

      <!-- Overview by Department -->
      <div class="section section--overview">
        <h2>📚 Departments Overview</h2>
        <div class="overview-grid">
          <div
            v-for="dept in ALL_DEPARTMENTS"
            :key="dept.key"
            class="overview-card"
            :class="`dept--${dept.key}`"
          >
            <h3>{{ dept.label }}</h3>
            <div class="overview-stats">
              <span class="stat">
                <strong>{{ countByDept(dept.key) }}</strong> items
              </span>
              <span class="stat amber" v-if="restockByDept(dept.key)">
                ⚠ {{ restockByDept(dept.key) }} restock
              </span>
              <span class="stat red" v-if="missingByDept(dept.key)">
                ❌ {{ missingByDept(dept.key) }} missing
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Item button (form opens as modal) -->
      <div class="section section--add">
        <div class="section-header">
          <h2>➕ Add Inventory Item</h2>
          <button class="btn primary" @click="invOpenAdd">+ New Item</button>
        </div>
      </div>

      <!-- Modal Form Overlay -->
      <div v-if="invFormOpen" class="modal-backdrop" @click.self="invFormOpen = false">
        <div class="modal-panel" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h2>{{ invEditId ? '✏️ Edit Item' : '➕ Add Item' }}</h2>
            <button class="modal-close" @click="invFormOpen = false" aria-label="Close">✕</button>
          </div>
          <div class="inv-form">
            <div class="form-grid">
            <label class="form-label">Name
              <input class="form-input" v-model="invForm.name" placeholder="e.g. Trash Bags" />
            </label>
            <label class="form-label">Location (SVG ID)
              <input class="form-input" v-model="invForm.location" placeholder="e.g. trailer_C_icon" />
            </label>
            <label class="form-label">Sub-location
              <input class="form-input" v-model="invForm.sub_location" placeholder="e.g. Bin_1" />
            </label>
            <label class="form-label full">Description
              <input class="form-input" v-model="invForm.description" placeholder="Optional description" />
            </label>
            <label class="form-label full">Notes
              <input class="form-input" v-model="invForm.notes" placeholder="Optional notes" />
            </label>
            <div class="form-label full">
              <span class="form-section-label">Departments</span>
              <div class="checkbox-row">
                <label
                  v-for="dept in ALL_DEPARTMENTS"
                  :key="dept.key"
                  class="checkbox-pill"
                  :class="[`dept--${dept.key}`, { active: invForm.departments.includes(dept.key) }]"
                >
                  <input type="checkbox" :value="dept.key" v-model="invForm.departments" />
                  {{ dept.label }}
                </label>
              </div>
            </div>
            <label class="checkbox-inline">
              <input type="checkbox" v-model="invForm.needs_restock" />
              ⚠️ Needs restock
            </label>
            <label class="checkbox-inline">
              <input type="checkbox" v-model="invForm.missing" />
              ❌ Missing
            </label>
            <label class="form-label">Owner
              <select class="form-input" v-model="invForm.owner">
                <option value="">(festival)</option>
                <option v-for="name in ADMIN_OWNERS" :key="name" :value="name">{{ name }}</option>
              </select>
            </label>
            <label class="form-label">&nbsp;
              <label class="checkbox-inline" style="padding-top: 0.4rem;">
                <input type="checkbox" v-model="invForm.offsite" />
                🏠 Stored offsite (offseason)
              </label>
            </label>
            <label v-if="invForm.offsite" class="form-label full">Offsite location
              <input class="form-input" v-model="invForm.offsite_location" placeholder="e.g. Brandon's garage" />
            </label>
            <div v-if="invEditId" class="flag-clear-row full">
              <span class="flag-clear-label">Clear volunteer flags:</span>
              <button type="button" class="btn outline btn-sm" @click="invClearFlag('needs_restock')">✓ Mark Restocked</button>
              <button type="button" class="btn outline btn-sm" @click="invClearFlag('missing')">✓ Mark Found</button>
            </div>
          </div>
            <div class="form-actions">
              <button class="btn outline" @click="invFormOpen = false">Cancel</button>
              <button class="btn primary" :disabled="invSaving || !invForm.name.trim()" @click="invSave">
                {{ invSaving ? 'Saving…' : (invEditId ? 'Save Changes' : 'Add Item') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter / Group Toolbar -->
      <div class="section">
        <h2>📋 Inventory Items</h2>
        <div class="toolbar">
          <label>Department</label>
          <select v-model="deptFilter">
            <option value="all">All</option>
            <option v-for="dept in ALL_DEPARTMENTS" :key="dept.key" :value="dept.key">
              {{ dept.label }}
            </option>
          </select>

          <label>Status</label>
          <select v-model="statusFilter">
            <option value="all">All</option>
            <option value="ok">OK</option>
            <option value="needs_restock">Needs restock</option>
            <option value="missing">Missing</option>
            <option value="flagged">Any flag</option>
          </select>

          <label>Owner</label>
          <select v-model="ownerFilter">
            <option value="all">All</option>
            <option value="_unassigned">(festival)</option>
            <option v-for="name in ADMIN_OWNERS" :key="name" :value="name">{{ name }}</option>
          </select>

          <label>Location</label>
          <select v-model="offsiteFilter">
            <option value="all">All</option>
            <option value="onsite">📍 On-site</option>
            <option value="offsite">🏠 Offsite</option>
          </select>

          <label>Group by</label>
          <select v-model="groupBy">
            <option value="department">Department</option>
            <option value="location">Location</option>
            <option value="owner">Owner</option>
            <option value="status">Status</option>
            <option value="none">Alphabetical</option>
          </select>

          <input
            class="search-input"
            v-model="searchText"
            type="text"
            placeholder="🔍 Search name, location, notes…"
          />

          <span class="toolbar-count">{{ filteredItems.length }} / {{ inventoryItems.length }}</span>
        </div>

        <!-- Grouped Items -->
        <div v-if="!filteredItems.length" class="empty">No items match these filters.</div>
        <div v-for="group in groupedItems" :key="group.key" class="item-group" :class="group.classKey">
          <h3 class="group-title">
            {{ group.label }} <small>• {{ group.items.length }}</small>
          </h3>
          <div class="item-list">
          <div
            v-for="item in group.items"
            :key="item.id"
            class="item-row"
            :class="{ 'flag-restock': item.needs_restock, 'flag-missing': item.missing, 'flag-offsite': item.offsite }"
          >
            <div class="item-meta">
              <strong class="item-name">{{ item.name }}</strong>
              <div class="item-sub">
                <span v-if="item.location">📍 {{ prettyLoc(item.location) }}</span>
                <span v-if="item.sub_location"> › {{ item.sub_location }}</span>
              </div>
              <div class="item-depts" v-if="Array.isArray(item.departments) && item.departments.length">
                <span
                  v-for="d in item.departments"
                  :key="d"
                  class="dept-chip"
                  :class="`dept--${d}`"
                >{{ deptLabel(d) }}</span>
              </div>
              <small v-if="item.notes" class="item-notes">📝 {{ item.notes }}</small>
            </div>
            <div class="item-badges">
              <span v-if="item.owner" class="status-badge owner" :title="`Owned by ${item.owner}`">👤 {{ item.owner }}</span>
              <span v-if="item.offsite" class="status-badge offsite" :title="item.offsite_location || 'Stored offsite'">🏠 offsite<span v-if="item.offsite_location">: {{ item.offsite_location }}</span></span>
              <span v-if="item.needs_restock" class="status-badge restock">⚠ restock</span>
              <span v-if="item.missing" class="status-badge missing">❌ missing</span>
            </div>
            <div class="item-controls">
              <button class="btn outline btn-sm duplicate-btn" @click="invDuplicate(item)" title="Duplicate item">⎘ Duplicate</button>
              <button class="btn outline btn-sm" @click="invOpenEdit(item)">Edit</button>
              <button class="btn danger btn-sm" @click="invDelete(item.id)">✕</button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { useInventory } from '@/composables/useInventory'
import { REUNION_FESTIVAL } from '@/config/festivalConfig'

const { deptItems: inventoryItems, createItem, updateItem, deleteItem } = useInventory(null, { includeOffsite: true })

const ADMIN_OWNERS = REUNION_FESTIVAL.admins || []

const ALL_DEPARTMENTS = [
  { key: 'front_gate', label: 'Front Gate' },
  { key: 'food_team', label: 'Food Team' },
  { key: 'setup_crew', label: 'Setup Crew' },
  { key: 'stage_crew', label: 'Stage Crew' },
  { key: 'cleanup_crew', label: 'Cleanup Crew' },
  { key: 'arcade_attendant', label: 'Arcade Attendant' }
]

// Auth
const isAuthenticated = ref(false)
onMounted(() => {
  isAuthenticated.value = !!localStorage.getItem('user')
})

// Filters / grouping
const deptFilter = ref('all')
const statusFilter = ref('all')
const ownerFilter = ref('all')
const offsiteFilter = ref('all')
const groupBy = ref('department')
const searchText = ref('')

// Form state
const invFormOpen = ref(false)
const invEditId = ref(null)
const invSaving = ref(false)
const invForm = ref({
  name: '', description: '', location: '', sub_location: '',
  departments: [], notes: '', needs_restock: false, missing: false,
  owner: '', offsite: false, offsite_location: ''
})

// Lock body scroll & support Esc-to-close while modal is open
watch(invFormOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
function onKeydown(e) {
  if (e.key === 'Escape' && invFormOpen.value) invFormOpen.value = false
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

// Helpers
function deptLabel(key) {
  return ALL_DEPARTMENTS.find((d) => d.key === key)?.label || key
}
function prettyLoc(loc) {
  return (loc || '').replace(/_icon$/, '').replace(/_/g, ' ')
}
function countByDept(key) {
  return inventoryItems.value.filter((i) => Array.isArray(i.departments) && i.departments.includes(key)).length
}
function restockByDept(key) {
  return inventoryItems.value.filter((i) => i.needs_restock && Array.isArray(i.departments) && i.departments.includes(key)).length
}
function missingByDept(key) {
  return inventoryItems.value.filter((i) => i.missing && Array.isArray(i.departments) && i.departments.includes(key)).length
}

// Filtered list
const filteredItems = computed(() => {
  let list = inventoryItems.value.slice()
  if (deptFilter.value !== 'all') {
    list = list.filter((i) => Array.isArray(i.departments) && i.departments.includes(deptFilter.value))
  }
  if (statusFilter.value === 'needs_restock') list = list.filter((i) => i.needs_restock)
  else if (statusFilter.value === 'missing') list = list.filter((i) => i.missing)
  else if (statusFilter.value === 'flagged') list = list.filter((i) => i.needs_restock || i.missing)
  else if (statusFilter.value === 'ok') list = list.filter((i) => !i.needs_restock && !i.missing)

  if (ownerFilter.value === '_unassigned') list = list.filter((i) => !i.owner)
  else if (ownerFilter.value !== 'all') list = list.filter((i) => i.owner === ownerFilter.value)

  if (offsiteFilter.value === 'offsite') list = list.filter((i) => i.offsite)
  else if (offsiteFilter.value === 'onsite') list = list.filter((i) => !i.offsite)

  const q = searchText.value.trim().toLowerCase()
  if (q) {
    list = list.filter((i) =>
      (i.name || '').toLowerCase().includes(q) ||
      (i.location || '').toLowerCase().includes(q) ||
      (i.sub_location || '').toLowerCase().includes(q) ||
      (i.notes || '').toLowerCase().includes(q) ||
      (i.description || '').toLowerCase().includes(q) ||
      (i.owner || '').toLowerCase().includes(q) ||
      (i.offsite_location || '').toLowerCase().includes(q)
    )
  }
  return list
})

// Grouping
const groupedItems = computed(() => {
  const list = filteredItems.value
  if (groupBy.value === 'none') {
    return [{ key: 'all', label: 'All Items', items: list, classKey: '' }]
  }
  if (groupBy.value === 'department') {
    const byDept = {}
    for (const item of list) {
      const depts = Array.isArray(item.departments) && item.departments.length ? item.departments : ['_unassigned']
      for (const d of depts) {
        if (!byDept[d]) byDept[d] = []
        byDept[d].push(item)
      }
    }
    return Object.keys(byDept)
      .sort((a, b) => deptLabel(a).localeCompare(deptLabel(b)))
      .map((key) => ({
        key,
        label: key === '_unassigned' ? '(no department)' : deptLabel(key),
        items: byDept[key],
        classKey: key === '_unassigned' ? '' : `dept--${key}`
      }))
  }
  if (groupBy.value === 'location') {
    const byLoc = {}
    for (const item of list) {
      const key = item.location || '_unset'
      if (!byLoc[key]) byLoc[key] = []
      byLoc[key].push(item)
    }
    return Object.keys(byLoc)
      .sort()
      .map((key) => ({
        key,
        label: key === '_unset' ? '(no location)' : prettyLoc(key),
        items: byLoc[key],
        classKey: ''
      }))
  }
  if (groupBy.value === 'owner') {
    const byOwner = {}
    for (const item of list) {
      const key = item.owner || '_unassigned'
      if (!byOwner[key]) byOwner[key] = []
      byOwner[key].push(item)
    }
    return Object.keys(byOwner)
      .sort((a, b) => {
        if (a === '_unassigned') return 1
        if (b === '_unassigned') return -1
        return a.localeCompare(b)
      })
      .map((key) => ({
        key,
        label: key === '_unassigned' ? '(no owner)' : `👤 ${key}`,
        items: byOwner[key],
        classKey: ''
      }))
  }
  // status
  const buckets = { missing: [], restock: [], ok: [] }
  for (const item of list) {
    if (item.missing) buckets.missing.push(item)
    else if (item.needs_restock) buckets.restock.push(item)
    else buckets.ok.push(item)
  }
  const labels = { missing: '❌ Missing', restock: '⚠ Needs Restock', ok: '✓ OK' }
  return ['missing', 'restock', 'ok']
    .filter((k) => buckets[k].length)
    .map((k) => ({ key: k, label: labels[k], items: buckets[k], classKey: `status--${k}` }))
})

// Form handlers
function invOpenAdd() {
  invEditId.value = null
  invForm.value = { name: '', description: '', location: '', sub_location: '', departments: [], notes: '', needs_restock: false, missing: false, owner: '', offsite: false, offsite_location: '' }
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
    missing: !!item.missing,
    owner: item.owner || '',
    offsite: !!item.offsite,
    offsite_location: item.offsite_location || ''
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
      missing: invForm.value.missing,
      owner: invForm.value.owner || '',
      offsite: !!invForm.value.offsite,
      offsite_location: invForm.value.offsite ? (invForm.value.offsite_location || '').trim() : ''
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
function invDuplicate(item) {
  invEditId.value = null
  invForm.value = {
    name: item.name ? `${item.name} (copy)` : '',
    description: item.description || '',
    location: item.location || '',
    sub_location: item.sub_location || '',
    departments: Array.isArray(item.departments) ? [...item.departments] : [],
    notes: item.notes || '',
    needs_restock: !!item.needs_restock,
    missing: !!item.missing,
    owner: item.owner || '',
    offsite: !!item.offsite,
    offsite_location: item.offsite_location || ''
  }
  invFormOpen.value = true
}
</script>

<style scoped>
.admin-inventory {
  width: 100%;
  min-width: 100vw; /* fight #app flex shrink so we fill viewport on desktop */
  margin: 0;
  padding: 1.5rem 2rem;
  background-color: #1a1a1a;
  color: white;
  min-height: 100vh;
  box-sizing: border-box;
}

.admin-interface {
  width: 100%;
  max-width: none;
}

.auth-required {
  text-align: center;
  padding: 4rem 2rem;
}
.auth-required h2 {
  color: #ff6b6b;
  margin-bottom: 1rem;
}
.login-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: var(--reunion-frog-green, #4caf50);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  margin-top: 1rem;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}
.header h1 {
  color: var(--reunion-frog-green, #4caf50);
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
}
.header p {
  color: #aaa;
  margin: 0;
}
.back-link {
  position: absolute;
  left: 0;
  top: 0.4rem;
  font-size: 0.8rem;
  color: #888;
  text-decoration: none;
  padding: 4px 10px;
  border: 1px solid #444;
  border-radius: 4px;
}
.back-link:hover { color: #ccc; border-color: #666; }

/* Section pattern */
.section {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
}
.section h2 {
  color: var(--reunion-frog-green, #4caf50);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.section-header h2 { margin-bottom: 0; }

/* Overview */
.section--overview { padding: 1rem 1.25rem; }
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 0.5rem;
}
.overview-card {
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid #333;
  border-left: 3px solid #555;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  box-sizing: border-box;
}
.overview-card h3 {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.35rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #2e2e2e;
}
.overview-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #bbb;
}
.overview-stats .stat strong { color: #fff; font-size: 0.9rem; margin-right: 0.15rem; }
.overview-stats .amber { color: #ffc107; }
.overview-stats .red { color: #ef5350; }

.section--add {
  padding: 0.75rem 1.5rem;
}
.section--add .section-header { margin-bottom: 0; }

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 4vh 1rem;
  overflow-y: auto;
  backdrop-filter: blur(2px);
}
.modal-panel {
  width: 100%;
  max-width: 720px;
  background: #1e1e1e;
  border: 1px solid #444;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(76, 175, 80, 0.08);
  border-bottom: 1px solid #333;
}
.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--reunion-frog-green, #4caf50);
}
.modal-close {
  background: transparent;
  border: 1px solid #555;
  color: #aaa;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}
.modal-close:hover { color: #fff; border-color: #888; }
.modal-panel .inv-form {
  margin-top: 0;
  padding: 1.25rem 1.5rem 1.5rem;
  border-top: none;
}

/* Form */
.inv-form {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1rem;
}
.form-label {
  display: flex;
  flex-direction: column;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  gap: 0.3rem;
}
.form-label.full { grid-column: 1 / -1; }
.form-input {
  padding: 0.5rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #444;
  background: #1e1e1e;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
}
.form-input:focus { border-color: var(--reunion-frog-green, #4caf50); }
.form-section-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
}
.checkbox-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.4rem;
}
.checkbox-pill {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: #bbb;
  cursor: pointer;
  padding: 0.25rem 0.6rem;
  border-radius: 14px;
  border: 1px solid #444;
  background: rgba(255,255,255,0.02);
  transition: all 0.15s;
}
.checkbox-pill input { display: none; }
.checkbox-pill.active {
  color: #fff;
  background: rgba(76,175,80,0.15);
  border-color: var(--reunion-frog-green, #4caf50);
}
.checkbox-inline {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #ccc;
  cursor: pointer;
}
.flag-clear-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.5rem 0;
  border-top: 1px solid rgba(255,255,255,0.07);
}
.flag-clear-label {
  font-size: 0.8rem;
  color: #888;
}
.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

/* Toolbar */
.toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0.5rem 0 1rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
}
.toolbar label { color: #aaa; }
.toolbar select,
.toolbar .search-input {
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #444;
  background: #1e1e1e;
  color: #fff;
  font-size: 0.85rem;
}
.toolbar .search-input { flex: 1; min-width: 180px; max-width: 320px; }
.toolbar-count {
  margin-left: auto;
  color: #888;
  font-size: 0.8rem;
}

/* Item groups */
.item-group {
  margin-bottom: 1.25rem;
  border-left: 3px solid #444;
  padding-left: 0.75rem;
}
.group-title {
  margin: 0.25rem 0 0.5rem;
  color: #ddd;
  font-size: 0.95rem;
  font-weight: 600;
}
.group-title small { color: #888; font-weight: 400; }

.item-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(360px, 100%), 1fr));
  gap: 0.5rem;
}

.item-row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "meta badges"
    "meta controls";
  gap: 0.4rem 0.75rem;
  align-items: start;
  padding: 0.6rem 0.75rem;
  background: rgba(255,255,255,0.02);
  border: 1px solid #2e2e2e;
  border-radius: 6px;
}
.item-meta { grid-area: meta; min-width: 0; }
.item-badges { grid-area: badges; }
.item-controls { grid-area: controls; justify-self: end; }
/* Duplicate button hidden by default on hover-capable devices; always visible on touch */
@media (hover: hover) {
  .duplicate-btn { opacity: 0; transition: opacity 0.15s ease; }
  .item-row:hover .duplicate-btn,
  .duplicate-btn:focus-visible { opacity: 1; }
}
.item-row.flag-restock { border-left: 3px solid #ffc107; }
.item-row.flag-missing { border-left: 3px solid #ef5350; }
.item-row.flag-offsite { border-left: 3px dashed #e0e0e0; opacity: 0.85; }

.item-name {
  display: block;
  color: #fff;
  font-size: 0.95rem;
  margin-bottom: 0.15rem;
}
.item-sub {
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.25rem;
}
.item-depts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.2rem;
}
.dept-chip {
  font-size: 0.7rem;
  padding: 1px 8px;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid #444;
  color: #aaa;
}
.item-notes {
  display: block;
  font-size: 0.75rem;
  color: #777;
  font-style: italic;
}

.item-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: flex-start;
}
.status-badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid #555;
  background: #2a2a2a;
  white-space: nowrap;
}
.status-badge.restock { border-color: #ffc107; color: #ffc107; }
.status-badge.missing { border-color: #ef5350; color: #ef5350; }
.status-badge.owner { border-color: #64b5f6; color: #64b5f6; text-transform: none; letter-spacing: 0; }
.status-badge.offsite { border-color: #e0e0e0; color: #e0e0e0; text-transform: none; letter-spacing: 0; }

.item-controls {
  display: flex;
  gap: 0.35rem;
}

.empty {
  padding: 1.5rem;
  text-align: center;
  color: #666;
  font-style: italic;
  font-size: 0.85rem;
}

/* Buttons (shared pattern) */
.btn {
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  border: 1px solid #666;
  background: #2a2a2a;
  color: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}
.btn:hover:not(:disabled) { filter: brightness(1.15); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.primary {
  border-color: var(--reunion-frog-green, #4caf50);
  background: rgba(76, 175, 80, 0.18);
}
.btn.outline {
  background: transparent;
  border-color: #888;
  color: #ccc;
}
.btn.danger {
  background: #5a1a1a;
  border-color: #c00;
  color: #fff;
}
.btn.btn-sm {
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  border-radius: 5px;
}

/* Department color accents (matches AdminTaskManager palette) */
.overview-card.dept--front_gate,
.item-group.dept--front_gate { border-left: 3px solid #4caf50; }
.overview-card.dept--front_gate h3 { color: #4caf50; }
.dept-chip.dept--front_gate { border-color: #4caf50; color: #4caf50; }
.checkbox-pill.dept--front_gate.active { border-color: #4caf50; background: rgba(76,175,80,0.18); }

.overview-card.dept--setup_crew,
.item-group.dept--setup_crew { border-left: 3px solid #2196f3; }
.overview-card.dept--setup_crew h3 { color: #2196f3; }
.dept-chip.dept--setup_crew { border-color: #2196f3; color: #2196f3; }
.checkbox-pill.dept--setup_crew.active { border-color: #2196f3; background: rgba(33,150,243,0.18); }

.overview-card.dept--food_team,
.item-group.dept--food_team { border-left: 3px solid #ff9800; }
.overview-card.dept--food_team h3 { color: #ff9800; }
.dept-chip.dept--food_team { border-color: #ff9800; color: #ff9800; }
.checkbox-pill.dept--food_team.active { border-color: #ff9800; background: rgba(255,152,0,0.18); }

.overview-card.dept--stage_crew,
.item-group.dept--stage_crew { border-left: 3px solid #9c27b0; }
.overview-card.dept--stage_crew h3 { color: #9c27b0; }
.dept-chip.dept--stage_crew { border-color: #9c27b0; color: #9c27b0; }
.checkbox-pill.dept--stage_crew.active { border-color: #9c27b0; background: rgba(156,39,176,0.18); }

.overview-card.dept--cleanup_crew,
.item-group.dept--cleanup_crew { border-left: 3px solid #607d8b; }
.overview-card.dept--cleanup_crew h3 { color: #607d8b; }
.dept-chip.dept--cleanup_crew { border-color: #607d8b; color: #607d8b; }
.checkbox-pill.dept--cleanup_crew.active { border-color: #607d8b; background: rgba(96,125,139,0.22); }

.overview-card.dept--arcade_attendant,
.item-group.dept--arcade_attendant { border-left: 3px solid #e91e63; }
.overview-card.dept--arcade_attendant h3 { color: #e91e63; }
.dept-chip.dept--arcade_attendant { border-color: #e91e63; color: #e91e63; }
.checkbox-pill.dept--arcade_attendant.active { border-color: #e91e63; background: rgba(233,30,99,0.18); }

/* Responsive */
@media (max-width: 768px) {
  .admin-inventory { padding: 0.75rem; min-width: 100vw; }
  .section { padding: 0.75rem; }
  .section--overview { padding: 0.75rem; }
  .overview-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.4rem; }
  .form-grid { grid-template-columns: 1fr; }
  .item-row {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "meta controls"
      "badges badges";
    padding: 0.5rem 0.6rem;
  }
  .item-badges { justify-content: flex-start; align-items: flex-start; }
  .item-controls { justify-self: end; align-self: start; }
  .toolbar { gap: 0.4rem; }
  .toolbar .search-input { min-width: 0; max-width: none; width: 100%; flex-basis: 100%; order: 99; }
  .toolbar-count { font-size: 0.75rem; }
  .header h1 { font-size: 1.3rem; }
  .back-link { position: static; display: inline-block; margin-bottom: 0.5rem; }
  .modal-backdrop { padding: 1rem 0.5rem; }
  .modal-header { padding: 0.75rem 1rem; }
  .modal-panel .inv-form { padding: 1rem; }
  .form-actions { flex-direction: column-reverse; }
  .form-actions .btn { width: 100%; }
}
</style>
