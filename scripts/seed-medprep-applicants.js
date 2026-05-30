#!/usr/bin/env node

/**
 * seed-medprep-applicants.js
 *
 * Seeds 5 realistic dummy applicants into the `medprep_applications` Firestore
 * collection (reunion_db). Spread across archetypes, GPA/MCAT ranges, packages,
 * and statuses — useful for graphical/analytics views.
 *
 * Usage:
 *   node ./scripts/seed-medprep-applicants.js           # dry-run (prints, no writes)
 *   node ./scripts/seed-medprep-applicants.js --write   # write to Firestore
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, setDoc, doc } from 'firebase/firestore'
import dotenv from 'dotenv'
import process from 'process'

dotenv.config()
dotenv.config({ path: '.env.festivall' })

const WRITE = process.argv.includes('--write')

const FestivallConfig = {
  apiKey: process.env.VITE_APP_FESTIVALL_API_KEY,
  authDomain: process.env.VITE_APP_FESTIVALL_AUTH_DOMAIN,
  projectId: process.env.VITE_APP_FESTIVALL_PROJECT_ID,
  storageBucket: process.env.VITE_APP_FESTIVALL_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_APP_FESTIVALL_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_FESTIVALL_APP_ID,
}

const festivall_app = initializeApp(FestivallConfig, 'festivall')
const db = getFirestore(festivall_app)

// ─── Dummy applicants ─────────────────────────────────────────────────────────
//
// Spread across the realistic USask applicant bell curve:
//   - GPA (UAA): 3.45 → 3.60 → 3.75 → 3.82 → 3.95
//   - MCAT total: 506 → 508 → 511 → 514 → 517
// One of each archetype. Mix of packages and statuses.

const APPLICANTS = [
  {
    id: 'demo_001',
    submitted_at: '2026-05-10T14:23:00.000Z',
    status: 'reviewing',
    archetype: 'freezes_under_pressure',
    academic: {
      degree: 'BSc Biochemistry',
      institution: 'University of Saskatchewan',
      grad_year: '2025',
      cumulative_gpa: '3.95 / 4.0',
      last2_gpa: '3.97 / 4.0',
      wgpa: '',
      mcat_status: 'completed',
      mcat: { cpbs: 130, cars: 128, bbfl: 130, psbb: 129, total: 517 },
      mcat_planned_date: '',
    },
    history: {
      is_repeat: false,
      times_applied: null,
      schools_applied: '',
      furthest_stage: '',
      prior_feedback: '',
      changes_since: '',
    },
    experience: {
      clinical_hours: 320,
      clinical_setting: 'Emergency department volunteering, physician shadowing (internal medicine)',
      clinical_description: 'Two years in the RUH ED. Watched a lot. Learned more.',
      has_research: true,
      research_description: 'CIHR-funded lab, U of S — two conference abstracts, one manuscript under review.',
      leadership: 'VP Academic, Pre-Med Society. Peer tutor, anatomy lab.',
      community: 'Big Brothers Big Sisters volunteer. Blood donor clinic organizer.',
      rural_experience: 'None formal.',
      other_experience: 'Competitive swimmer. Fluent in Punjabi and Hindi.',
    },
    target: {
      cycle: '2026-2027',
      schools: 'University of Saskatchewan, University of Calgary, University of Manitoba',
      specialty_interest: 'Cardiology (long-term)',
      rural_interest: 'open',
      other_programs: 'none',
    },
    materials: {
      personal_statement: 'Not started yet',
      abs_overview: 'Rough notes compiled. ABS not formatted yet.',
      reference_status: 'some',
    },
    logistics: {
      package_interest: 'campaign',
      how_heard: 'Word of mouth — classmate',
      additional_notes: '',
    },
    contact: {
      fullname: 'Anika Sharma',
      email: 'anika.sharma.demo@email.com',
      phone: '(306)555-0101',
    },
    coi_acknowledged: true,
    terms_acknowledged: true,
    notes: 'DEMO — do not contact',
  },

  {
    id: 'demo_002',
    submitted_at: '2026-05-12T09:47:00.000Z',
    status: 'pending',
    archetype: 'has_the_sauce',
    academic: {
      degree: 'BSc Biology',
      institution: 'University of Regina',
      grad_year: '2024',
      cumulative_gpa: '3.60 / 4.0',
      last2_gpa: '3.71 / 4.0',
      wgpa: '',
      mcat_status: 'completed',
      mcat: { cpbs: 126, cars: 126, bbfl: 127, psbb: 127, total: 506 },
      mcat_planned_date: '',
    },
    history: {
      is_repeat: false,
      times_applied: null,
      schools_applied: '',
      furthest_stage: '',
      prior_feedback: '',
      changes_since: '',
    },
    experience: {
      clinical_hours: 500,
      clinical_setting: 'Paramedic ride-alongs, long-term care, northern health clinic (summer placement)',
      clinical_description: 'Most of my hours are in remote and underserved settings. High-acuity stuff early.',
      has_research: false,
      research_description: '',
      leadership: 'Captain, university rugby team. Founded a student mental health awareness club.',
      community: 'Northern SK youth sports mentorship program. Indigenous summer camp staff.',
      rural_experience: 'Summer placement at a nursing station in northern SK — 10 weeks.',
      other_experience: 'Works as an EMT-A. Comfortable with uncertainty.',
    },
    target: {
      cycle: '2026-2027',
      schools: 'University of Saskatchewan (primary), University of Manitoba',
      specialty_interest: 'Not sure yet — emergency or family',
      rural_interest: 'yes',
      other_programs: 'none',
    },
    materials: {
      personal_statement: 'Draft in progress — strong opening paragraph, needs structure.',
      abs_overview: 'Long list. Needs pruning and prioritization.',
      reference_status: 'secured',
    },
    logistics: {
      package_interest: 'campaign',
      how_heard: 'Instagram',
      additional_notes: 'GPA is my weak spot. I know it. My MCAT is not where I want it either. But I have lived experience nobody else in my cohort has.',
    },
    contact: {
      fullname: 'Liam Okafor',
      email: 'liam.okafor.demo@email.com',
      phone: '(306)555-0202',
    },
    coi_acknowledged: true,
    terms_acknowledged: true,
    notes: 'DEMO — do not contact',
  },

  {
    id: 'demo_003',
    submitted_at: '2026-05-14T17:05:00.000Z',
    status: 'accepted',
    archetype: 'been_through_cycle',
    academic: {
      degree: 'BSc Kinesiology',
      institution: 'University of Alberta',
      grad_year: '2023',
      cumulative_gpa: '3.75 / 4.0',
      last2_gpa: '3.80 / 4.0',
      wgpa: '3.83 / 4.0',
      mcat_status: 'completed',
      mcat: { cpbs: 127, cars: 127, bbfl: 129, psbb: 129, total: 512 },
      mcat_planned_date: '',
    },
    history: {
      is_repeat: true,
      times_applied: 2,
      schools_applied: 'University of Saskatchewan, University of Calgary, University of Alberta',
      furthest_stage: 'mmi_invite',
      prior_feedback: 'USask gave informal feedback: strong file, MMI performance inconsistent. Panel felt rehearsed.',
      changes_since: 'Did a second MMI prep circuit. Got more clinical hours. Took a year to work in a rural clinic.',
    },
    experience: {
      clinical_hours: 620,
      clinical_setting: 'Rural GP clinic (SK), hospital volunteer, EMT training',
      clinical_description: 'Wide and deep. I have real hours in a real rural clinic.',
      has_research: true,
      research_description: 'One published abstract — kinesiology / exercise physiology. Nothing medical yet.',
      leadership: 'Clinic admin manager. Patient intake coordinator.',
      community: 'Local soccer league coach. Food bank regular.',
      rural_experience: 'One full year working in a rural GP clinic, Nipawin SK.',
      other_experience: 'French-English bilingual. WHMIS and First Aid certified.',
    },
    target: {
      cycle: '2026-2027',
      schools: 'University of Saskatchewan (only)',
      specialty_interest: 'Family Medicine — rural track',
      rural_interest: 'yes',
      other_programs: 'none',
    },
    materials: {
      personal_statement: 'Full draft from last cycle. Ready for overhaul.',
      abs_overview: 'Previous ABS on hand. Needs updates for new experiences.',
      reference_status: 'secured',
    },
    logistics: {
      package_interest: 'the_return',
      how_heard: 'Someone you know — Dr. Das taught my friend',
      additional_notes: 'Third application. I am not giving up. I just need someone who has been on the other side of the table to tell me what I am actually missing.',
    },
    contact: {
      fullname: 'Meghan Tremblay',
      email: 'meghan.tremblay.demo@email.com',
      phone: '(306)555-0303',
    },
    coi_acknowledged: true,
    terms_acknowledged: true,
    contract: {
      signed: true,
      signature: 'Meghan Tremblay',
      signedAt: '2026-05-20T11:30:00.000Z',
      availability: 'Mon June 1 7–9 PM CST | Wed June 3 12–2 PM CST | Fri June 5 6–8 PM CST',
      contractVersion: '2026-01',
    },
    notes: 'DEMO — do not contact',
  },

  {
    id: 'demo_004',
    submitted_at: '2026-05-16T08:19:00.000Z',
    status: 'pending',
    archetype: 'early_stage',
    academic: {
      degree: 'BSc Physiology & Pharmacology (in progress)',
      institution: 'University of Saskatchewan',
      grad_year: '2028',
      cumulative_gpa: '3.82 / 4.0',
      last2_gpa: '',
      wgpa: '',
      mcat_status: 'not_planned',
      mcat: { cpbs: null, cars: null, bbfl: null, psbb: null, total: null },
      mcat_planned_date: '',
    },
    history: {
      is_repeat: false,
      times_applied: null,
      schools_applied: '',
      furthest_stage: '',
      prior_feedback: '',
      changes_since: '',
    },
    experience: {
      clinical_hours: 40,
      clinical_setting: 'Hospital volunteer (2 months)',
      clinical_description: 'Just getting started. Mostly observation.',
      has_research: false,
      research_description: '',
      leadership: 'Student union rep, first year.',
      community: 'High school tutoring.',
      rural_experience: 'Grew up in Meadow Lake, SK.',
      other_experience: 'Pre-med from day one. Want to build this right from the start.',
    },
    target: {
      cycle: '2028-plus',
      schools: 'University of Saskatchewan (primary)',
      specialty_interest: 'Not sure yet',
      rural_interest: 'yes',
      other_programs: 'none',
    },
    materials: {
      personal_statement: 'Not started yet',
      abs_overview: 'Not started yet',
      reference_status: 'none',
    },
    logistics: {
      package_interest: 'blueprint',
      how_heard: 'Word of mouth',
      additional_notes: 'I am in second year and I want to do this right. Looking for a roadmap, not a last-minute fix.',
    },
    contact: {
      fullname: 'Jordan Beaumont',
      email: 'jordan.beaumont.demo@email.com',
      phone: '(306)555-0404',
    },
    coi_acknowledged: true,
    terms_acknowledged: true,
    notes: 'DEMO — do not contact',
  },

  {
    id: 'demo_005',
    submitted_at: '2026-05-18T20:54:00.000Z',
    status: 'pending',
    archetype: 'non_traditional',
    academic: {
      degree: 'BSc Nursing',
      institution: 'University of Saskatchewan',
      grad_year: '2019',
      cumulative_gpa: '3.45 / 4.0',
      last2_gpa: '3.55 / 4.0',
      wgpa: '',
      mcat_status: 'completed',
      mcat: { cpbs: 126, cars: 127, bbfl: 128, psbb: 127, total: 508 },
      mcat_planned_date: '',
    },
    history: {
      is_repeat: false,
      times_applied: null,
      schools_applied: '',
      furthest_stage: '',
      prior_feedback: '',
      changes_since: '',
    },
    experience: {
      clinical_hours: 2400,
      clinical_setting: 'ICU RN (6 years), northern SK nursing station (1 year), air medevac team',
      clinical_description: 'I have run codes. I have worked remote medevac. I have more real clinical hours than most graduating physicians.',
      has_research: false,
      research_description: '',
      leadership: 'Charge nurse, ICU. Preceptor for new RN grads.',
      community: 'Indigenous community health outreach. Harm reduction volunteer.',
      rural_experience: 'One year in a nursing station, fly-in community, northern SK.',
      other_experience: 'Cree (conversational). ACLS, PALS, TNCC certified. I have been a nurse longer than most applicants have been adults.',
    },
    target: {
      cycle: '2026-2027',
      schools: 'University of Saskatchewan (DSAAP pathway consideration)',
      specialty_interest: 'Emergency Medicine or Rural Family Medicine',
      rural_interest: 'yes',
      other_programs: 'none',
    },
    materials: {
      personal_statement: 'Draft written. Needs focus — currently trying to say too much.',
      abs_overview: 'List is overwhelming. Needs curation and framing.',
      reference_status: 'secured',
    },
    logistics: {
      package_interest: 'full_ride',
      how_heard: 'Word of mouth — colleague',
      additional_notes: 'My GPA is my weakness. The rest of my file is not. I need someone who understands the DSAAP pathway and can help me tell this story the right way.',
    },
    contact: {
      fullname: 'Renata Sinclair',
      email: 'renata.sinclair.demo@email.com',
      phone: '(306)555-0505',
    },
    coi_acknowledged: true,
    terms_acknowledged: true,
    notes: 'DEMO — do not contact',
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY-RUN'}\n`)

  for (const applicant of APPLICANTS) {
    const { id, ...data } = applicant
    console.log(`\n── ${id} ─────────────────────────────────────────`)
    console.log(`  Name:    ${data.contact.fullname}`)
    console.log(`  Package: ${data.logistics.package_interest}`)
    console.log(`  Status:  ${data.status}`)
    console.log(`  GPA:     ${data.academic.cumulative_gpa}`)
    console.log(`  MCAT:    ${data.academic.mcat?.total ?? 'not written'}`)
    console.log(`  Arch:    ${data.archetype}`)

    if (WRITE) {
      await setDoc(doc(db, 'medprep_applications', id), data)
      console.log(`  ✓ Written to Firestore`)
    }
  }

  console.log(`\n${WRITE ? `\n✓ All ${APPLICANTS.length} applicants written.` : `\nDry-run complete. Run with --write to seed Firestore.`}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
