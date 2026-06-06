import { ref } from 'vue'
import { writeBatch, doc } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'

export function useLineupAdmin() {
  const saving = ref(false)
  const saveError = ref(null)

  /**
   * Batch-update settimes and set_durations for multiple participants.
   * @param {Array<{id: string, settimes: string[], set_durations: number[]}>} updates
   */
  async function batchUpdateSettimes(updates) {
    saving.value = true
    saveError.value = null
    try {
      const batch = writeBatch(reunion_db)
      for (const { id, settimes, set_durations, set_types } of updates) {
        const ref = doc(reunion_db, REUNION_FESTIVAL.participantsCollection, id)
        const payload = {
          settimes: settimes.map(t => new Date(t)),
          set_durations
        }
        if (set_types) payload.set_types = set_types
        batch.update(ref, payload)
      }
      await batch.commit()
    } catch (err) {
      saveError.value = err.message || 'Save failed'
      throw err
    } finally {
      saving.value = false
    }
  }

  return { saving, saveError, batchUpdateSettimes }
}
