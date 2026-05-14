import { ref, computed, onUnmounted } from 'vue'
import { reunion_db } from '@/firebase'
import { festivall_auth } from '@/firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'

const COLLECTION = 'inventory'

/**
 * useInventory — reactive inventory composable
 *
 * @param {string|null} department — if provided, filters to that dept only (for manuals).
 *   Pass null/undefined for the full collection (used by the map).
 */
export function useInventory(department = null) {
  const items = ref([])
  let unsubscribe = null

  // ── Subscribe ──────────────────────────────────────────────────────────────
  const colRef = collection(reunion_db, COLLECTION)
  const q = department
    ? query(colRef, where('departments', 'array-contains', department))
    : colRef

  unsubscribe = onSnapshot(q, (snap) => {
    items.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })

  // ── Derived ────────────────────────────────────────────────────────────────

  /** All items for this dept (or all items if no dept arg) */
  const deptItems = computed(() => items.value)

  /** Items tagged to a specific task ID */
  function getItemsForTask(taskId) {
    return items.value.filter(
      (item) => Array.isArray(item.task_ids) && item.task_ids.includes(taskId)
    )
  }

  /** All distinct SVG location IDs that have at least one item */
  const locationIds = computed(() => new Set(items.value.map((item) => item.location).filter(Boolean)))

  /** Items at a specific SVG location */
  function getItemsForLocation(svgId) {
    return items.value.filter((item) => item.location === svgId)
  }

  // ── Volunteer action ───────────────────────────────────────────────────────

  async function flagNeedsRestock(itemId, value = true) {
    try {
      await updateDoc(doc(reunion_db, COLLECTION, itemId), {
        needs_restock: value,
        updated_at: serverTimestamp()
      })
    } catch (e) {
      console.error('useInventory: flagNeedsRestock failed', e)
    }
  }

  // ── Admin CRUD (requires Firebase Auth) ───────────────────────────────────

  function assertAdmin() {
    if (!festivall_auth.currentUser) throw new Error('Admin authentication required')
  }

  async function createItem(data) {
    assertAdmin()
    await addDoc(collection(reunion_db, COLLECTION), {
      name: data.name || '',
      description: data.description || '',
      location: data.location || '',
      sub_location: data.sub_location || '',
      departments: Array.isArray(data.departments) ? data.departments : [],
      task_ids: Array.isArray(data.task_ids) ? data.task_ids : [],
      needs_restock: data.needs_restock ?? false,
      notes: data.notes || '',
      updated_at: serverTimestamp()
    })
  }

  async function updateItem(itemId, data) {
    assertAdmin()
    await updateDoc(doc(reunion_db, COLLECTION, itemId), {
      ...data,
      updated_at: serverTimestamp()
    })
  }

  async function deleteItem(itemId) {
    assertAdmin()
    await deleteDoc(doc(reunion_db, COLLECTION, itemId))
  }

  return {
    deptItems,
    getItemsForTask,
    locationIds,
    getItemsForLocation,
    flagNeedsRestock,
    createItem,
    updateItem,
    deleteItem
  }
}
