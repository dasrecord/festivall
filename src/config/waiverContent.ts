/**
 * Waiver content configuration
 * Organizer-approved safety waiver versions
 */

import type { WaiverContent } from '@/types/participant'

/**
 * Active waiver versions
 * IMPORTANT: Only ONE version should have active: true at a time
 */
export const WAIVER_VERSIONS: WaiverContent[] = [
  {
    version: '2026-v1',
    content: `
# Reunion Festival 2026 - Safety & Conduct Waiver

By accepting this waiver, you acknowledge and agree to the following safety and conduct requirements:

## Safety & Personal Responsibility

- I understand that Reunion Festival is an outdoor event with inherent risks
- I am responsible for my own safety and well-being
- I will follow all posted safety guidelines and instructions from festival staff
- I understand that medical services are limited and will seek emergency assistance if needed

## Smoking & Substance Policy

- Smoking (including cannabis) is only permitted in designated adult areas
- I will not smoke in family areas, near children, or in non-designated spaces
- I will properly dispose of all cigarette butts in designated receptacles
- I understand that littering cigarette butts is prohibited and subject to removal from the event

## Child Supervision

- I understand that children must be supervised by a responsible adult at all times
- Parents/guardians are solely responsible for their children's safety and conduct
- I will ensure children under my care follow all festival rules and safety guidelines
- I acknowledge that certain areas (adult zones, smoking areas) are not suitable for children

## Conduct & Respect

- I will treat all attendees, staff, artists, and volunteers with respect
- I will respect the property and environment of the festival grounds
- I understand that harassment, violence, or destructive behavior will result in immediate removal
- I will leave the festival grounds in the same or better condition than I found them

## Acknowledgement

- I have read and understood all safety and conduct requirements
- I agree to comply with all festival rules and staff instructions
- I understand that failure to comply may result in removal from the event without refund

**Note:** This waiver covers safety, conduct, and environmental responsibility. By typing your name below and checking the acknowledgement box, you confirm your understanding and agreement to these terms.
    `.trim(),
    topics: [
      'Safety & Personal Responsibility',
      'Smoking & Designated Adult Areas',
      'Cigarette Butt Disposal',
      'Child Supervision',
      'Conduct & Respect',
      'Environmental Responsibility'
    ],
    effective_date: '2026-07-01',
    active: true, // Activated for testing - pending final organizer/legal approval
    created_by: 'admin',
    created_at: '2026-07-31T00:00:00Z'
  }
]

/**
 * Get the currently active waiver version
 */
export function getActiveWaiver(): WaiverContent | null {
  const active = WAIVER_VERSIONS.find(w => w.active)
  if (!active) {
    console.warn('No active waiver version configured')
    return null
  }
  return active
}

/**
 * Get a specific waiver version by version ID
 */
export function getWaiverByVersion(version: string): WaiverContent | null {
  return WAIVER_VERSIONS.find(w => w.version === version) || null
}

/**
 * Check if a waiver version is current (matches active version)
 */
export function isWaiverCurrent(acceptedVersion: string): boolean {
  const active = getActiveWaiver()
  return active ? active.version === acceptedVersion : false
}
