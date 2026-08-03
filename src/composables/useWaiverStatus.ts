/**
 * Composable for managing waiver acceptance
 * Integrates with attendee slots and gate operations
 */

import { ref } from 'vue'
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import { getActiveWaiver, isWaiverCurrent } from '@/config/waiverContent'
import type {
  AttendeeSlot,
  WaiverAcceptance,
  AttendeeActivity,
  ScannerSource
} from '@/types/participant'

export function useWaiverStatus() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const activeWaiver = ref(getActiveWaiver())

  /**
   * Check if an attendee slot requires waiver acceptance
   */
  const needsWaiverAcceptance = (slot: AttendeeSlot): boolean => {
    if (!activeWaiver.value) {
      console.warn('No active waiver configured - bypassing waiver requirement')
      return false
    }

    // No waiver accepted yet
    if (!slot.waiver) {
      return true
    }

    // Waiver version has changed
    if (!isWaiverCurrent(slot.waiver.waiver_version)) {
      return true
    }

    return false
  }

  /**
   * Get the current festival day in YYYY-MM-DD format
   */
  const getCurrentFestivalDay = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * Record waiver acceptance for a specific attendee slot
   */
  const acceptWaiver = async (
    idCode: string,
    slotId: string,
    typedName: string,
    checkboxAccepted: boolean,
    source: ScannerSource = 'ticket_page',
    operator?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!activeWaiver.value) {
      return {
        success: false,
        error: 'No active waiver version configured. Please contact festival admin.'
      }
    }

    // Validate inputs
    if (!typedName || typedName.trim().length < 2) {
      return {
        success: false,
        error: 'Please type your full name to acknowledge the waiver'
      }
    }

    if (!checkboxAccepted) {
      return {
        success: false,
        error: 'You must check the acknowledgement box to accept the waiver'
      }
    }

    loading.value = true
    error.value = null

    try {
      const orderRef = doc(reunion_db, 'participants_2026', idCode)
      const festivalDay = getCurrentFestivalDay()

      await runTransaction(reunion_db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef)
        
        if (!orderDoc.exists()) {
          throw new Error('Order not found')
        }

        const orderData = orderDoc.data()
        const slots: AttendeeSlot[] = orderData.order?.attendee_slots || []
        
        const slotIndex = slots.findIndex(s => s.slot_id === slotId)
        if (slotIndex === -1) {
          throw new Error('Attendee slot not found')
        }

        const slot = slots[slotIndex]

        // Create waiver acceptance record
        const waiverAcceptance: WaiverAcceptance = {
          waiver_version: activeWaiver.value!.version,
          typed_name: typedName.trim(),
          checkbox_accepted: checkboxAccepted,
          accepted_at: new Date().toISOString(),
          festival_day: festivalDay,
          source,
          operator,
          ip_address: ipAddress,
          user_agent: userAgent
        }

        // Update slot with waiver
        slot.waiver = waiverAcceptance
        slot.updated_at = new Date().toISOString()

        // Create activity record
        const activity: AttendeeActivity = {
          timestamp: new Date().toISOString(),
          action: 'waiver_accepted',
          festival_day: festivalDay,
          admission_state_after: slot.admission_state,
          operator: operator || idCode,
          operator_name: typedName,
          source,
          notes: `Waiver ${activeWaiver.value!.version} accepted`
        }
        slot.activity_history.push(activity)

        slots[slotIndex] = slot

        transaction.update(orderRef, {
          'order.attendee_slots': slots,
          updated_at: serverTimestamp()
        })
      })

      loading.value = false
      return { success: true }
    } catch (err: any) {
      console.error('Waiver acceptance failed:', err)
      error.value = err.message
      loading.value = false
      return { success: false, error: err.message }
    }
  }

  /**
   * Get waiver status for a specific slot
   */
  const getWaiverStatus = (slot: AttendeeSlot): {
    required: boolean
    accepted: boolean
    current: boolean
    version?: string
    acceptedAt?: string
  } => {
    const required = needsWaiverAcceptance(slot)
    
    if (!slot.waiver) {
      return {
        required,
        accepted: false,
        current: false
      }
    }

    return {
      required,
      accepted: true,
      current: isWaiverCurrent(slot.waiver.waiver_version),
      version: slot.waiver.waiver_version,
      acceptedAt: slot.waiver.accepted_at
    }
  }

  /**
   * Validate that a name matches what was typed on the waiver
   */
  const validateWaiverName = (slot: AttendeeSlot, nameToCheck: string): boolean => {
    if (!slot.waiver) return false
    
    const normalizeForComparison = (str: string) => 
      str.trim().toLowerCase().replace(/\s+/g, ' ')
    
    return normalizeForComparison(slot.waiver.typed_name) === 
           normalizeForComparison(nameToCheck)
  }

  return {
    loading,
    error,
    activeWaiver,
    needsWaiverAcceptance,
    acceptWaiver,
    getWaiverStatus,
    validateWaiverName
  }
}
