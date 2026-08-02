/**
 * Composable for managing attendee-level admission slots
 * Provides transactional gate operations and slot management
 */

import { ref, computed } from 'vue'
import { doc, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import type {
  AttendeeSlot,
  AttendeeActivity,
  WaiverAcceptance,
  AdmissionState,
  DailyAdmission,
  ScannerSource,
  CheckoutIntent
} from '@/types/participant'

export function useAttendeeSlots() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Get current festival day in YYYY-MM-DD format
   */
  const getCurrentFestivalDay = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * Generate a new attendee slot
   */
  const createAttendeeSlot = (
    passType: 'Weekend Pass' | 'Day Pass',
    validDays?: string[]
  ): AttendeeSlot => {
    const slotId = crypto.randomUUID()
    const now = new Date().toISOString()

    return {
      slot_id: slotId,
      attendee_name: '',
      attendee_name_pending: true,
      pass_type: passType,
      valid_days: validDays,
      admission_state: 'not_arrived',
      daily_admission: [],
      waiver: null,
      activity_history: [],
      created_at: now,
      updated_at: now
    }
  }

  /**
   * Initialize slots for an order (used during migration or new order creation)
   */
  const initializeSlots = (
    ticketQuantity: number,
    passType: 'Weekend Pass' | 'Day Pass',
    validDays?: string[]
  ): AttendeeSlot[] => {
    const slots: AttendeeSlot[] = []
    for (let i = 0; i < ticketQuantity; i++) {
      slots.push(createAttendeeSlot(passType, validDays))
    }
    return slots
  }

  /**
   * Check if an attendee slot requires waiver acceptance for the given festival day
   */
  const requiresWaiver = (
    slot: AttendeeSlot,
    festivalDay: string,
    currentWaiverVersion: string
  ): boolean => {
    // If no waiver has been accepted, it's required
    if (!slot.waiver) {
      return true
    }

    // If waiver version has changed, re-acceptance is required
    if (slot.waiver.waiver_version !== currentWaiverVersion) {
      return true
    }

    // Check if this is the first entry on this festival day
    const dailyAdmission = slot.daily_admission.find(d => d.festival_day === festivalDay)
    if (!dailyAdmission || dailyAdmission.check_in_count === 0) {
      // First entry on this day - waiver already accepted, no re-acceptance needed
      return false
    }

    return false
  }

  /**
   * Check if a slot is eligible for check-in on a given day
   */
  const canCheckIn = (slot: AttendeeSlot, festivalDay: string): {
    allowed: boolean
    reason?: string
  } => {
    // Check if attendee name is filled
    if (!slot.attendee_name || slot.attendee_name_pending) {
      return {
        allowed: false,
        reason: 'Attendee name must be provided before check-in'
      }
    }

    // Check pass validity for day passes
    if (slot.pass_type === 'Day Pass') {
      if (!slot.valid_days || !slot.valid_days.includes(festivalDay)) {
        return {
          allowed: false,
          reason: 'This day pass is not valid for today'
        }
      }
    }

    // Check if final exit was declared for this day
    const dailyAdmission = slot.daily_admission.find(d => d.festival_day === festivalDay)
    if (dailyAdmission?.final_exit_declared) {
      return {
        allowed: false,
        reason: 'Final exit was already declared for today. Admin override required.'
      }
    }

    // Check current admission state
    if (slot.admission_state === 'on_site') {
      return {
        allowed: false,
        reason: 'Already checked in'
      }
    }

    return { allowed: true }
  }

  /**
   * Check if a slot is eligible for check-out
   */
  const canCheckOut = (slot: AttendeeSlot): {
    allowed: boolean
    reason?: string
  } => {
    if (slot.admission_state !== 'on_site') {
      return {
        allowed: false,
        reason: 'Not currently checked in'
      }
    }

    return { allowed: true }
  }

  /**
   * Get or create daily admission record for a festival day
   */
  const getOrCreateDailyAdmission = (
    slot: AttendeeSlot,
    festivalDay: string
  ): DailyAdmission => {
    let dailyAdmission = slot.daily_admission.find(d => d.festival_day === festivalDay)
    
    if (!dailyAdmission) {
      dailyAdmission = {
        festival_day: festivalDay,
        checked_in: false,
        check_in_count: 0,
        check_out_count: 0,
        final_exit_declared: false
      }
      slot.daily_admission.push(dailyAdmission)
    }
    
    return dailyAdmission
  }

  /**
   * Transactional check-in for a specific attendee slot
   */
  const checkInAttendee = async (
    idCode: string,
    slotId: string,
    operator: string,
    operatorName: string,
    source: ScannerSource = 'operator_scanner',
    deviceId?: string
  ): Promise<{ success: boolean; error?: string; slot?: AttendeeSlot }> => {
    loading.value = true
    error.value = null

    try {
      const orderRef = doc(reunion_db, 'participants_2026', idCode)
      const festivalDay = getCurrentFestivalDay()

      const result = await runTransaction(reunion_db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef)
        
        if (!orderDoc.exists()) {
          throw new Error('Order not found')
        }

        const orderData = orderDoc.data()
        const slots: AttendeeSlot[] = orderData.order?.attendee_slots || []
        
        // Find the specific slot
        const slotIndex = slots.findIndex(s => s.slot_id === slotId)
        if (slotIndex === -1) {
          throw new Error('Attendee slot not found')
        }

        const slot = slots[slotIndex]

        // Check eligibility
        const eligibility = canCheckIn(slot, festivalDay)
        if (!eligibility.allowed) {
          throw new Error(eligibility.reason)
        }

        // Get or create daily admission record
        const dailyAdmission = getOrCreateDailyAdmission(slot, festivalDay)

        // Update daily admission
        dailyAdmission.checked_in = true
        dailyAdmission.check_in_count += 1
        if (!dailyAdmission.first_check_in_at) {
          dailyAdmission.first_check_in_at = new Date().toISOString()
        }
        dailyAdmission.last_activity_at = new Date().toISOString()

        // Update admission state
        slot.admission_state = 'on_site'
        slot.updated_at = new Date().toISOString()

        // Create activity record
        const activity: AttendeeActivity = {
          timestamp: new Date().toISOString(),
          action: 'check_in',
          festival_day: festivalDay,
          admission_state_after: 'on_site',
          operator,
          operator_name: operatorName,
          source,
          device_id: deviceId
        }
        slot.activity_history.push(activity)

        // Update the slot in the array
        slots[slotIndex] = slot

        // Write back to Firestore
        transaction.update(orderRef, {
          'order.attendee_slots': slots,
          'order.checked_in': true, // Legacy compatibility
          updated_at: serverTimestamp()
        })

        return slot
      })

      loading.value = false
      return { success: true, slot: result }
    } catch (err: any) {
      console.error('Check-in transaction failed:', err)
      error.value = err.message
      loading.value = false
      return { success: false, error: err.message }
    }
  }

  /**
   * Transactional check-out for a specific attendee slot
   */
  const checkOutAttendee = async (
    idCode: string,
    slotId: string,
    checkoutIntent: CheckoutIntent,
    operator: string,
    operatorName: string,
    source: ScannerSource = 'operator_scanner',
    deviceId?: string
  ): Promise<{ success: boolean; error?: string; slot?: AttendeeSlot }> => {
    loading.value = true
    error.value = null

    try {
      const orderRef = doc(reunion_db, 'participants_2026', idCode)
      const festivalDay = getCurrentFestivalDay()

      const result = await runTransaction(reunion_db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef)
        
        if (!orderDoc.exists()) {
          throw new Error('Order not found')
        }

        const orderData = orderDoc.data()
        const slots: AttendeeSlot[] = orderData.order?.attendee_slots || []
        
        // Find the specific slot
        const slotIndex = slots.findIndex(s => s.slot_id === slotId)
        if (slotIndex === -1) {
          throw new Error('Attendee slot not found')
        }

        const slot = slots[slotIndex]

        // Check eligibility
        const eligibility = canCheckOut(slot)
        if (!eligibility.allowed) {
          throw new Error(eligibility.reason)
        }

        // Get daily admission record (should exist if checked in)
        const dailyAdmission = getOrCreateDailyAdmission(slot, festivalDay)

        // Update daily admission
        dailyAdmission.checked_in = false
        dailyAdmission.check_out_count += 1
        dailyAdmission.last_activity_at = new Date().toISOString()

        // Handle final exit
        if (checkoutIntent === 'final_exit') {
          dailyAdmission.final_exit_declared = true
        }

        // Update admission state based on intent
        const newState: AdmissionState = 
          checkoutIntent === 'final_exit' ? 'final_exit' : 'returning'
        slot.admission_state = newState
        slot.updated_at = new Date().toISOString()

        // Create activity record
        const activity: AttendeeActivity = {
          timestamp: new Date().toISOString(),
          action: 'check_out',
          festival_day: festivalDay,
          checkout_intent: checkoutIntent,
          admission_state_after: newState,
          operator,
          operator_name: operatorName,
          source,
          device_id: deviceId
        }
        slot.activity_history.push(activity)

        // Update the slot in the array
        slots[slotIndex] = slot

        // Determine legacy checked_in status (true if ANY slot is on_site)
        const anyOnSite = slots.some(s => s.admission_state === 'on_site')

        // Write back to Firestore
        transaction.update(orderRef, {
          'order.attendee_slots': slots,
          'order.checked_in': anyOnSite, // Legacy compatibility
          updated_at: serverTimestamp()
        })

        return slot
      })

      loading.value = false
      return { success: true, slot: result }
    } catch (err: any) {
      console.error('Check-out transaction failed:', err)
      error.value = err.message
      loading.value = false
      return { success: false, error: err.message }
    }
  }

  /**
   * Admin override for admission (with required reason)
   */
  const adminOverride = async (
    idCode: string,
    slotId: string,
    newAdmissionState: AdmissionState,
    overrideReason: string,
    operator: string,
    operatorName: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!overrideReason || overrideReason.trim().length < 10) {
      return {
        success: false,
        error: 'Admin override requires a detailed reason (minimum 10 characters)'
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

        // Update admission state
        slot.admission_state = newAdmissionState
        slot.updated_at = new Date().toISOString()

        // Create activity record with override reason
        const activity: AttendeeActivity = {
          timestamp: new Date().toISOString(),
          action: 'admin_override',
          festival_day: festivalDay,
          admission_state_after: newAdmissionState,
          operator,
          operator_name: operatorName,
          source: 'admin_panel',
          override_reason: overrideReason
        }
        slot.activity_history.push(activity)

        slots[slotIndex] = slot

        const anyOnSite = slots.some(s => s.admission_state === 'on_site')

        transaction.update(orderRef, {
          'order.attendee_slots': slots,
          'order.checked_in': anyOnSite,
          updated_at: serverTimestamp()
        })
      })

      loading.value = false
      return { success: true }
    } catch (err: any) {
      console.error('Admin override failed:', err)
      error.value = err.message
      loading.value = false
      return { success: false, error: err.message }
    }
  }

  return {
    loading,
    error,
    createAttendeeSlot,
    initializeSlots,
    requiresWaiver,
    canCheckIn,
    canCheckOut,
    checkInAttendee,
    checkOutAttendee,
    adminOverride,
    getCurrentFestivalDay
  }
}
