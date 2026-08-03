/**
 * Comprehensive type definitions for Reunion participant data model
 * Phase 1: Attendee-level admission tracking
 */

// ============================================================================
// ATTENDEE SLOTS (New in Phase 1)
// ============================================================================

export type AdmissionState = 'not_arrived' | 'on_site' | 'returning' | 'final_exit'

export interface AttendeeSlot {
  /** Stable unique identifier for this attendee slot (UUID v4) */
  slot_id: string
  
  /** Attendee's full name (required before first entry) */
  attendee_name: string
  
  /** Empty until filled by purchaser or gate staff */
  attendee_name_pending?: boolean
  
  /** Which ticket entitlement this slot represents */
  pass_type: 'Weekend Pass' | 'Day Pass'
  
  /** For day passes: which day(s) this slot is valid for */
  valid_days?: string[]
  
  /** Current admission state for tracking on-site/off-site status */
  admission_state: AdmissionState
  
  /** Per-day admission tracking (allows multi-day events) */
  daily_admission: DailyAdmission[]
  
  /** Waiver acceptance record (required before first entry) */
  waiver: WaiverAcceptance | null
  
  /** Append-only activity history for this specific attendee */
  activity_history: AttendeeActivity[]
  
  /** Timestamp when slot was created */
  created_at: string
  
  /** Last updated timestamp */
  updated_at: string
}

export interface DailyAdmission {
  /** Festival day identifier (e.g., "2026-08-14") */
  festival_day: string
  
  /** Whether this attendee has checked in on this day */
  checked_in: boolean
  
  /** Number of check-ins on this day */
  check_in_count: number
  
  /** Number of check-outs on this day */
  check_out_count: number
  
  /** Whether final exit was declared for this day (blocks same-day re-entry) */
  final_exit_declared: boolean
  
  /** Timestamp of first check-in on this day */
  first_check_in_at?: string
  
  /** Timestamp of last activity on this day */
  last_activity_at?: string
}

export interface AttendeeActivity {
  /** ISO 8601 timestamp */
  timestamp: string
  
  /** Type of activity */
  action: 'check_in' | 'check_out' | 'waiver_accepted' | 'admin_override'
  
  /** Festival day when activity occurred */
  festival_day: string
  
  /** Checkout intent (only for check_out actions) */
  checkout_intent?: 'returning' | 'final_exit'
  
  /** Admission state after this action */
  admission_state_after: AdmissionState
  
  /** Operator who performed the action */
  operator: string
  
  /** Operator's display name */
  operator_name: string
  
  /** Source of the action (scanner type) */
  source: 'operator_scanner' | 'self_service_kiosk' | 'admin_panel'
  
  /** Device identifier (optional) */
  device_id?: string
  
  /** Override reason (required for admin overrides) */
  override_reason?: string
  
  /** Additional notes */
  notes?: string
}

// ============================================================================
// WAIVER ACCEPTANCE
// ============================================================================

export interface WaiverAcceptance {
  /** Which waiver version was accepted */
  waiver_version: string
  
  /** Typed name for acknowledgement */
  typed_name: string
  
  /** Checkbox acceptance */
  checkbox_accepted: boolean
  
  /** ISO 8601 timestamp of acceptance */
  accepted_at: string
  
  /** Festival day when accepted */
  festival_day: string
  
  /** Source of acceptance */
  source: ScannerSource
  
  /** Operator who witnessed/facilitated (if applicable) */
  operator?: string
  
  /** IP address (if available and legal to store) */
  ip_address?: string
  
  /** User agent string */
  user_agent?: string
}

export interface WaiverContent {
  /** Waiver version identifier */
  version: string
  
  /** Organizer-approved waiver text */
  content: string
  
  /** Safety topics covered */
  topics: string[]
  
  /** Effective date */
  effective_date: string
  
  /** Whether this version is currently active */
  active: boolean
  
  /** Created by (admin id_code) */
  created_by: string
  
  /** Created timestamp */
  created_at: string
}

// ============================================================================
// ORDER & PARTICIPANT SCHEMAS (Extended)
// ============================================================================

export interface ParticipantOrder {
  /** Original ticket/pass type */
  ticket_type: 'Weekend Pass' | 'Day Pass'
  
  /** Current ticket quantity (legacy, maintained for backward compatibility) */
  ticket_quantity: number
  
  /** Original ticket quantity at purchase */
  original_ticket_quantity: number
  
  /** NEW: Stable attendee slots (authoritative for admission after migration) */
  attendee_slots: AttendeeSlot[]
  
  /** Whether attendee slots are authoritative (vs legacy ticket_quantity) */
  slots_active: boolean
  
  /** Selected day for day passes */
  selected_day?: string
  
  /** Meal packages purchased */
  meal_packages: number
  
  /** Remaining meal tickets */
  meal_tickets_remaining: number
  
  /** Pending meal purchases */
  pending_meal_purchases?: any[]
  
  /** Payment type */
  payment_type: 'etransfer' | 'bitcoin' | 'cash' | 'inkind'
  
  /** Total price in CAD */
  fiat_total_price_cad: number
  
  /** Whether order is fully paid */
  paid: boolean
  
  /** Legacy: Overall checked-in state (maintained for backward compatibility) */
  checked_in: boolean
  
  /** Legacy: Entrance activity history (preserved, but per-slot history is authoritative) */
  entrance_activity_history: any[]
  
  /** Meal redemption history */
  meal_redemption_history?: any[]
  
  /** Referral information */
  referral?: {
    referral_id_code?: string
    referral_earnings?: number
  }
}

export interface ParticipantContact {
  fullname: string
  email: string
  phone: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  country?: string
}

export interface ParticipantRoles {
  applicant_types: string[]
  volunteer_type?: string
  act_type?: string
  act_name?: string
}

export interface ParticipantApplication {
  submittedAt?: string
  data?: {
    statement?: string
    genre?: string
    act_description?: string
    mix_track_url?: string
    social_url?: string
    act_website?: string
    press_kit_url?: string
    logo_url?: string
    [key: string]: any
  }
}

export interface ParticipantDocument {
  /** 5-character unique ID code */
  id_code: string
  
  /** Full UUID */
  id_code_long: string
  
  /** Document status */
  status: 'customer' | 'applicant' | 'pending' | 'approved' | 'declined'
  
  /** Contact information */
  contact: ParticipantContact
  
  /** Roles and applicant types */
  roles: ParticipantRoles
  
  /** Application data (for artists/volunteers/vendors) */
  application?: ParticipantApplication
  
  /** Order/ticket information */
  order: ParticipantOrder
  
  /** Contract signing status */
  contract?: {
    signed: boolean
    signed_at?: string
    contract_version?: string
  }
  
  /** Volunteer data */
  volunteer?: {
    claimed_slots?: any[]
    team?: string
  }
  
  /** NEW: SMS consent tracking */
  sms_consent?: {
    opted_in: boolean
    consent_version: string
    consented_at?: string
    withdrawn_at?: string
  }
  
  /** Document creation timestamp */
  timestamp?: string
  
  /** Last updated timestamp */
  updated_at?: string
  
  /** Set times (for artists) */
  settimes?: string[]
  
  /** Security metadata (bot detection) */
  security?: {
    recaptcha_token?: string
    time_on_page?: number
    form_fill_time?: number
    [key: string]: any
  }
}

// ============================================================================
// MIGRATION SUPPORT
// ============================================================================

export interface MigrationRecord {
  /** Order id_code being migrated */
  id_code: string
  
  /** Migration timestamp */
  migrated_at: string
  
  /** Number of slots created */
  slots_created: number
  
  /** Whether legacy history was ambiguous */
  ambiguous_history: boolean
  
  /** Manual reconciliation needed */
  needs_review: boolean
  
  /** Migration notes */
  notes: string
  
  /** Legacy data snapshot (for rollback) */
  legacy_snapshot: {
    ticket_quantity: number
    checked_in: boolean
    entrance_activity_history: any[]
  }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type ScannerSource = 'operator_scanner' | 'self_service_kiosk' | 'admin_panel' | 'ticket_page'
export type CheckoutIntent = 'returning' | 'final_exit'
export type ActivityAction = 'check_in' | 'check_out' | 'waiver_accepted' | 'admin_override'
