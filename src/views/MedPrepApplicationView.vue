<template>
  <div class="medprep-apply">

    <!-- CONFIRMATION -->
    <div v-if="submitted" class="confirmation">
      <div class="confirmation-inner">
        <div class="confirm-icon">✓</div>
        <h2>Application Received</h2>
        <p>
          Dr. Das personally reviews every application. If there's a fit, he'll be in touch.
          Given the limited spots, expect candour either way.
        </p>
        <p class="confirm-sub">Check your inbox — a copy of your submission has been noted on file.</p>
        <RouterLink to="/medprep" class="btn-ghost">← Back to the program</RouterLink>
      </div>
    </div>

    <!-- FORM -->
    <div v-else class="form-shell">

      <!-- HEADER -->
      <div class="form-header">
        <RouterLink to="/medprep" class="back-link">← Dr. Das MedPrep</RouterLink>
        <h1>Apply for a Spot</h1>
        <p class="form-subtitle">This is not a casual form. It is designed to reveal exactly where you are and what you need.</p>
      </div>

      <!-- PROGRESS -->
      <div class="progress-bar">
        <div
          v-for="n in 8"
          :key="n"
          class="progress-dot"
          :class="{
            active: currentStep === n,
            done: currentStep > n
          }"
          @click="goToStep(n)"
        >
          <span>{{ n }}</span>
        </div>
      </div>
      <div class="step-label">Step {{ currentStep }} of 8 — {{ stepLabels[currentStep - 1] }}</div>

      <!-- STEP 1: VIBE CHECK -->
      <div v-show="currentStep === 1" class="step-content">
        <h2>The Vibe Check</h2>
        <p class="step-desc">Before we get into numbers, let's establish who you are. Pick the one that fits.</p>
        <div class="archetype-grid">
          <label
            v-for="a in archetypes"
            :key="a.value"
            class="archetype-card"
            :class="{ selected: form.archetype === a.value }"
          >
            <input type="radio" name="archetype" :value="a.value" v-model="form.archetype" />
            <div class="archetype-title">{{ a.label }}</div>
            <div class="archetype-sub">{{ a.sub }}</div>
          </label>
        </div>
        <div class="step-error" v-if="stepError">{{ stepError }}</div>
      </div>

      <!-- STEP 2: ACADEMIC PROFILE -->
      <div v-show="currentStep === 2" class="step-content">
        <h2>Academic Profile</h2>
        <p class="step-desc">Be precise. Ranges or approximations are fine if you don't have exact numbers yet.</p>

        <div class="field-group">
          <label>Undergraduate degree & major</label>
          <input type="text" v-model="form.degree" placeholder="e.g. BSc Biology" />
        </div>
        <div class="field-row">
          <div class="field-group">
            <label>Institution</label>
            <input type="text" v-model="form.institution" placeholder="University name" />
          </div>
          <div class="field-group">
            <label>Graduation year (or expected)</label>
            <input type="text" v-model="form.grad_year" placeholder="e.g. 2025" />
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label>Cumulative GPA (cGPA)</label>
            <input type="text" v-model="form.cumulative_gpa" placeholder="e.g. 3.75 / 4.0 or 84%" />
          </div>
          <div class="field-group">
            <label>Last-2-years GPA <span class="label-note">(UAA-relevant)</span></label>
            <input type="text" v-model="form.last2_gpa" placeholder="e.g. 3.9 / 4.0" />
          </div>
          <div class="field-group">
            <label>Weighted GPA <span class="label-note">(if applicable)</span></label>
            <input type="text" v-model="form.wgpa" placeholder="Leave blank if unsure" />
          </div>
        </div>

        <div class="field-group">
          <label>MCAT status</label>
          <div class="radio-row">
            <label class="radio-option">
              <input type="radio" value="completed" v-model="form.mcat_status" /> Completed
            </label>
            <label class="radio-option">
              <input type="radio" value="planned" v-model="form.mcat_status" /> Not yet written — planned
            </label>
            <label class="radio-option">
              <input type="radio" value="not_planned" v-model="form.mcat_status" /> Not yet planned
            </label>
          </div>
        </div>

        <div v-if="form.mcat_status === 'completed'" class="mcat-grid">
          <div class="field-group">
            <label>CPBS <span class="label-note">Chem/Phys</span></label>
            <input type="number" v-model.number="form.mcat_cpbs" min="118" max="132" placeholder="118–132" />
          </div>
          <div class="field-group">
            <label>CARS</label>
            <input type="number" v-model.number="form.mcat_cars" min="118" max="132" placeholder="118–132" />
          </div>
          <div class="field-group">
            <label>BBFL <span class="label-note">Bio/Biochem</span></label>
            <input type="number" v-model.number="form.mcat_bbfl" min="118" max="132" placeholder="118–132" />
          </div>
          <div class="field-group">
            <label>PSBB <span class="label-note">Psych/Soc</span></label>
            <input type="number" v-model.number="form.mcat_psbb" min="118" max="132" placeholder="118–132" />
          </div>
          <div class="field-group">
            <label>Total</label>
            <input type="number" v-model.number="form.mcat_total" min="472" max="528" placeholder="472–528" />
          </div>
        </div>
        <div v-if="form.mcat_status === 'planned'" class="field-group">
          <label>Planned MCAT date</label>
          <input type="text" v-model="form.mcat_planned_date" placeholder="e.g. January 2026" />
        </div>
        <div class="step-error" v-if="stepError">{{ stepError }}</div>
      </div>

      <!-- STEP 3: APPLICATION HISTORY -->
      <div v-show="currentStep === 3" class="step-content">
        <h2>Application History</h2>
        <p class="step-desc">Honesty here is what makes this work. Dr. Das has seen every version of this story.</p>

        <div class="field-group">
          <label>Have you applied to medical school before?</label>
          <div class="radio-row">
            <label class="radio-option">
              <input type="radio" :value="false" v-model="form.is_repeat" /> No — this will be my first application
            </label>
            <label class="radio-option">
              <input type="radio" :value="true" v-model="form.is_repeat" /> Yes — I have applied before
            </label>
          </div>
        </div>

        <template v-if="form.is_repeat">
          <div class="field-row">
            <div class="field-group">
              <label>How many application cycles have you completed?</label>
              <input type="number" v-model.number="form.times_applied" min="1" placeholder="e.g. 2" />
            </div>
          </div>
          <div class="field-group">
            <label>Which schools did you apply to?</label>
            <textarea v-model="form.schools_applied" rows="3" placeholder="List all schools you have applied to" />
          </div>
          <div class="field-group">
            <label>Furthest stage reached</label>
            <select v-model="form.furthest_stage">
              <option value="">Select one</option>
              <option value="paper_screen">Paper screen only (no interview invite)</option>
              <option value="mmi_invite">MMI invite received</option>
              <option value="panel_interview">Panel interview reached</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="rejected_post_offer">Accepted at one school, rejected at target</option>
            </select>
          </div>
          <div class="field-group">
            <label>What feedback did you receive, if any?</label>
            <textarea v-model="form.prior_feedback" rows="3" placeholder="Formal feedback, informal feedback, your own assessment — all valid" />
          </div>
          <div class="field-group">
            <label>What has changed since your last application?</label>
            <textarea v-model="form.changes_since" rows="3" placeholder="New experiences, improved scores, updated materials, mindset shift..." />
          </div>
        </template>
        <div class="step-error" v-if="stepError">{{ stepError }}</div>
      </div>

      <!-- STEP 4: EXPERIENCE & ECS -->
      <div v-show="currentStep === 4" class="step-content">
        <h2>Experience & Extracurriculars</h2>
        <p class="step-desc">This is the non-academic half of your application. It matters as much as your GPA, especially at USask.</p>

        <div class="field-group">
          <label>Clinical experience — setting(s)</label>
          <input type="text" v-model="form.clinical_setting" placeholder="e.g. hospital volunteering, clinic shadowing, community health" />
        </div>
        <div class="field-row">
          <div class="field-group">
            <label>Total clinical hours (approximate)</label>
            <input type="number" v-model.number="form.clinical_hours" min="0" placeholder="e.g. 200" />
          </div>
        </div>
        <div class="field-group">
          <label>Brief description of your clinical experience</label>
          <textarea v-model="form.clinical_description" rows="3" placeholder="What have you done, where, and what did you take from it?" />
        </div>

        <div class="field-group">
          <label>Research experience?</label>
          <div class="radio-row">
            <label class="radio-option">
              <input type="radio" :value="true" v-model="form.has_research" /> Yes
            </label>
            <label class="radio-option">
              <input type="radio" :value="false" v-model="form.has_research" /> No
            </label>
          </div>
        </div>
        <div v-if="form.has_research" class="field-group">
          <label>Describe your research experience (publications, posters, abstracts if any)</label>
          <textarea v-model="form.research_description" rows="3" placeholder="Lab, supervisor, duration, publications or posters..." />
        </div>

        <div class="field-group">
          <label>Leadership positions</label>
          <textarea v-model="form.leadership" rows="3" placeholder="Student government, clubs, teams, committees, community organizations..." />
        </div>
        <div class="field-group">
          <label>Community & volunteer involvement</label>
          <textarea v-model="form.community" rows="3" placeholder="Non-clinical community work, mentorship, advocacy..." />
        </div>
        <div class="field-group">
          <label>Rural, remote, or Indigenous health experience</label>
          <p class="field-note">This is explicitly valued at USask and factors into your Saskatchewan Connectedness Index score.</p>
          <textarea v-model="form.rural_experience" rows="3" placeholder="Any experience in rural/remote communities or Indigenous health settings — none is fine to say." />
        </div>
        <div class="field-group">
          <label>Anything else worth knowing?</label>
          <textarea v-model="form.other_experience" rows="3" placeholder="Work history, languages, unique life circumstances, other achievements..." />
        </div>
        <div class="step-error" v-if="stepError">{{ stepError }}</div>
      </div>

      <!-- STEP 5: TARGET APPLICATION -->
      <div v-show="currentStep === 5" class="step-content">
        <h2>Target Application</h2>
        <p class="step-desc">Tell me where you're aiming and when. This shapes the entire strategy.</p>

        <div class="field-group">
          <label>Target application cycle</label>
          <select v-model="form.target_cycle">
            <option value="">Select one</option>
            <option value="2026-2027">2026–2027 (applications open August 2026)</option>
            <option value="2027-2028">2027–2028</option>
            <option value="2028-plus">2028 or later — building long-term</option>
          </select>
        </div>

        <div class="field-group">
          <label>Target schools <span class="label-note">(list all you plan to apply to)</span></label>
          <textarea v-model="form.target_schools" rows="3" placeholder="e.g. University of Saskatchewan, University of Calgary, University of Manitoba..." />
        </div>

        <div class="field-group">
          <label>Specialty interest <span class="label-note">(if any — too early to commit is a valid answer)</span></label>
          <input type="text" v-model="form.specialty_interest" placeholder="e.g. Family Medicine, Emergency, Surgery, or 'Not sure yet'" />
        </div>

        <div class="field-group">
          <label>Are you open to or interested in rural medicine?</label>
          <p class="field-note">This affects how we approach your USask application and SCI score strategy.</p>
          <div class="radio-row">
            <label class="radio-option">
              <input type="radio" value="yes" v-model="form.rural_interest" /> Yes — I'm genuinely interested
            </label>
            <label class="radio-option">
              <input type="radio" value="open" v-model="form.rural_interest" /> Open to it
            </label>
            <label class="radio-option">
              <input type="radio" value="no" v-model="form.rural_interest" /> Not particularly
            </label>
          </div>
        </div>

        <div class="field-group">
          <label>Are you also applying to dentistry or residency programs?</label>
          <p class="field-note">Dr. Das has experience advising for dental school and CaRMS residency matching as well.</p>
          <div class="radio-row">
            <label class="radio-option">
              <input type="radio" value="dentistry" v-model="form.other_programs" /> Dentistry
            </label>
            <label class="radio-option">
              <input type="radio" value="residency" v-model="form.other_programs" /> Residency / CaRMS
            </label>
            <label class="radio-option">
              <input type="radio" value="none" v-model="form.other_programs" /> Medicine only
            </label>
          </div>
        </div>
        <div class="step-error" v-if="stepError">{{ stepError }}</div>
      </div>

      <!-- STEP 6: EXISTING MATERIALS -->
      <div v-show="currentStep === 6" class="step-content">
        <h2>Existing Materials</h2>
        <p class="step-desc">Paste what you have. "Not started yet" is a perfectly honest answer.</p>

        <div class="field-group">
          <label>Personal statement / letter of intent</label>
          <textarea v-model="form.personal_statement" rows="8" placeholder="Paste your current draft here, or write 'Not started yet' if you haven't begun." />
        </div>
        <div class="field-group">
          <label>Autobiographical sketch (ABS) / activities overview</label>
          <textarea v-model="form.abs_overview" rows="5" placeholder="List your key activities and roles — a rough ABS is fine. Format doesn't matter here." />
        </div>
        <div class="field-group">
          <label>Reference letter status</label>
          <select v-model="form.reference_status">
            <option value="">Select one</option>
            <option value="none">I haven't secured any referees yet</option>
            <option value="in_progress">I have potential referees in mind but nothing confirmed</option>
            <option value="some">I have 1–2 referees secured</option>
            <option value="secured">All reference letters are secured</option>
          </select>
        </div>
        <div class="step-error" v-if="stepError">{{ stepError }}</div>
      </div>

      <!-- STEP 7: PACKAGE & LOGISTICS -->
      <div v-show="currentStep === 7" class="step-content">
        <h2>Package & Logistics</h2>
        <p class="step-desc">Select the program that fits where you are. Dr. Das can adjust after reviewing your full application — pick your best guess for now.</p>

        <div class="field-group">
          <label>Which program are you most interested in?</label>
          <div class="package-grid">
            <label
              v-for="pkg in packages"
              :key="pkg.value"
              class="package-card"
              :class="{ selected: form.package_interest === pkg.value }"
            >
              <input type="radio" :value="pkg.value" v-model="form.package_interest" />
              <div class="pkg-name">{{ pkg.name }}</div>
              <div class="pkg-total">{{ pkg.total }}</div>
              <div class="pkg-sub">{{ pkg.sub }}</div>
              <ul v-if="pkg.features.length" class="pkg-features">
                <li v-for="f in pkg.features" :key="f">{{ f }}</li>
              </ul>
            </label>
          </div>
        </div>

        <div class="field-group">
          <label>How did you hear about Dr. Das?</label>
          <input type="text" v-model="form.how_heard" placeholder="Word of mouth, Instagram, someone you know, etc." />
        </div>

        <div class="field-group">
          <label>Anything else you want to share?</label>
          <textarea v-model="form.additional_notes" rows="4" placeholder="Circumstances, context, things that don't fit anywhere above..." />
        </div>
        <div class="step-error" v-if="stepError">{{ stepError }}</div>
      </div>

      <!-- STEP 8: CONTACT + COI -->
      <div v-show="currentStep === 8" class="step-content">
        <h2>Contact Info & Acknowledgments</h2>
        <p class="step-desc">Last step. Read the two acknowledgments carefully before submitting.</p>

        <div class="field-row">
          <div class="field-group">
            <label>Full legal name</label>
            <input type="text" v-model="form.fullname" placeholder="First and last name" />
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label>Email address</label>
            <input type="email" v-model="form.email" placeholder="your@email.com" />
          </div>
          <div class="field-group">
            <label>Phone number</label>
            <input type="tel" v-model="form.phone" placeholder="(306) 555-1234" @input="formatPhone" />
          </div>
        </div>

        <div class="acknowledgment-block">
          <label class="checkbox-option" :class="{ checked: form.coi_acknowledged }">
            <input type="checkbox" v-model="form.coi_acknowledged" />
            <div class="checkbox-text">
              <strong>Conflict of Interest Acknowledgment</strong>
              <span>
                I acknowledge that Dr. Prasenjit Das occasionally teaches at the University of
                Saskatchewan College of Medicine. If I am accepted into this program and am
                applying to the U of S College of Medicine, I agree to submit a formal recusal
                request to ensure Dr. Das is not involved in evaluating my application, to avoid
                any perceived conflict of interest. I understand a written agreement to this
                effect will be required before the program begins.
              </span>
            </div>
          </label>
        </div>

        <div class="acknowledgment-block">
          <label class="checkbox-option" :class="{ checked: form.terms_acknowledged }">
            <input type="checkbox" v-model="form.terms_acknowledged" />
            <div class="checkbox-text">
              <strong>Terms & Expectations</strong>
              <span>
                I understand that spots are limited to 3–5 students per year, that submitting
                this application does not guarantee acceptance into the program, and that Dr. Das
                will be in touch only if he believes there is a genuine fit.
              </span>
            </div>
          </label>
        </div>

        <div class="step-error" v-if="stepError">{{ stepError }}</div>
        <div class="submit-error" v-if="submitError">{{ submitError }}</div>
      </div>

      <!-- NAVIGATION -->
      <div class="form-nav">
        <button
          v-if="currentStep > 1"
          class="btn-back"
          @click="prevStep"
          :disabled="submitting"
        >← Back</button>
        <div class="nav-spacer" v-else></div>

        <button
          v-if="currentStep < 8"
          class="btn-next"
          @click="nextStep"
        >Next →</button>

        <button
          v-if="currentStep === 8"
          class="btn-submit"
          @click="submitApplication"
          :disabled="!form.coi_acknowledged || !form.terms_acknowledged || submitting"
        >
          {{ submitting ? 'Submitting...' : 'Submit Application' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { doc, setDoc } from 'firebase/firestore'
import { festivall_db } from '@/firebase.js'
import { sendMedPrep } from '@/../scripts/notifications.js'

const currentStep = ref(1)
const submitted = ref(false)
const submitting = ref(false)
const stepError = ref('')
const submitError = ref('')

const stepLabels = [
  'The Vibe Check',
  'Academic Profile',
  'Application History',
  'Experience & ECs',
  'Target Application',
  'Existing Materials',
  'Package & Logistics',
  'Contact & Acknowledgments',
]

const archetypes = [
  {
    value: 'has_the_sauce',
    label: 'My grades are okay, but I have the sauce',
    sub: 'Strong personality, experiences, and drive — the numbers just need work',
  },
  {
    value: 'freezes_under_pressure',
    label: 'My grades are unmatched — I just freeze when it counts',
    sub: 'Academic strength is there; interviews or soft skills are the gap',
  },
  {
    value: 'been_through_cycle',
    label: "I've applied before and came close",
    sub: 'Not a first-timer — I know the process and I know what went wrong',
  },
  {
    value: 'early_stage',
    label: "I'm early in my premed journey and want to start right",
    sub: 'Still in undergrad, building from scratch, want a real roadmap',
  },
  {
    value: 'non_traditional',
    label: "I'm a non-traditional candidate with a story to tell",
    sub: 'Career change, mature student, unconventional path — all the more reason',
  },
]

const packages = [
  {
    value: 'blueprint',
    name: 'The Blueprint',
    total: '$2,500 total',
    sub: '$500 deposit + $2,000 on acceptance',
    features: ['3 strategy sessions', 'GPA & MCAT roadmap', 'Experience gap analysis', 'Written strategic report', '30-day email Q&A'],
  },
  {
    value: 'campaign',
    name: 'The Campaign',
    total: '$8,000 total',
    sub: '$750 deposit + $7,250 on acceptance',
    features: ['Unlimited sessions through cycle', 'Personal statement (multi-draft)', 'ABS review', 'CASPer prep', 'MMI mock sessions', 'References strategy'],
  },
  {
    value: 'the_return',
    name: 'The Return',
    total: '$4,500 total',
    sub: '$500 deposit + $4,000 on acceptance',
    features: ['Prior cycle gap analysis', 'Updated personal statement', 'MMI + panel interview prep', 'Strategic reapplication plan'],
  },
  {
    value: 'full_ride',
    name: 'The Full Ride',
    total: '$12,500 total',
    sub: '$1,500 deposit + $11,000 on acceptance',
    features: ['Everything in The Campaign', 'Monthly 1-on-1s year-round', 'Residency & CaRMS strategy', 'Direct messaging access', 'Multi-year support if needed'],
  },
  {
    value: 'not_sure',
    name: 'Not sure yet',
    total: 'Discuss after review',
    sub: 'Dr. Das will recommend the right fit after reviewing your application',
    features: [],
  },
]

const form = ref({
  // Step 1
  archetype: '',
  // Step 2
  degree: '',
  institution: '',
  grad_year: '',
  cumulative_gpa: '',
  last2_gpa: '',
  wgpa: '',
  mcat_status: '',
  mcat_cpbs: null as number | null,
  mcat_cars: null as number | null,
  mcat_bbfl: null as number | null,
  mcat_psbb: null as number | null,
  mcat_total: null as number | null,
  mcat_planned_date: '',
  // Step 3
  is_repeat: false,
  times_applied: null as number | null,
  schools_applied: '',
  furthest_stage: '',
  prior_feedback: '',
  changes_since: '',
  // Step 4
  clinical_setting: '',
  clinical_hours: null as number | null,
  clinical_description: '',
  has_research: false,
  research_description: '',
  leadership: '',
  community: '',
  rural_experience: '',
  other_experience: '',
  // Step 5
  target_cycle: '',
  target_schools: '',
  specialty_interest: '',
  rural_interest: '',
  other_programs: '',
  // Step 6
  personal_statement: '',
  abs_overview: '',
  reference_status: '',
  // Step 7
  package_interest: '',
  how_heard: '',
  additional_notes: '',
  // Step 8
  fullname: '',
  email: '',
  phone: '',
  coi_acknowledged: false,
  terms_acknowledged: false,
})

function formatPhone(e: Event) {
  const input = e.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) {
    form.value.phone = digits.length ? `(${digits}` : ''
  } else if (digits.length <= 6) {
    form.value.phone = `(${digits.slice(0, 3)})${digits.slice(3)}`
  } else {
    form.value.phone = `(${digits.slice(0, 3)})${digits.slice(3, 6)}-${digits.slice(6)}`
  }
}

function validateStep(step: number): string {
  switch (step) {
    case 1:
      return form.value.archetype ? '' : 'Please select one option to continue.'
    case 2:
      if (!form.value.degree) return 'Please enter your degree.'
      if (!form.value.institution) return 'Please enter your institution.'
      if (!form.value.cumulative_gpa) return 'Please enter your cumulative GPA.'
      if (!form.value.mcat_status) return 'Please indicate your MCAT status.'
      return ''
    case 3:
      if (form.value.is_repeat && !form.value.furthest_stage) return 'Please select the furthest stage you reached.'
      return ''
    case 4:
      if (!form.value.clinical_setting) return 'Please describe your clinical experience setting.'
      return ''
    case 5:
      if (!form.value.target_cycle) return 'Please select your target application cycle.'
      if (!form.value.target_schools) return 'Please list your target schools.'
      return ''
    case 6:
      if (!form.value.personal_statement) return 'Please enter your personal statement or write "Not started yet".'
      if (!form.value.reference_status) return 'Please indicate your reference letter status.'
      return ''
    case 7:
      if (!form.value.package_interest) return 'Please select a program you\'re interested in.'
      return ''
    case 8:
      if (!form.value.fullname) return 'Please enter your full name.'
      if (!form.value.email || !form.value.email.includes('@')) return 'Please enter a valid email address.'
      if (!form.value.coi_acknowledged) return 'You must acknowledge the conflict of interest statement.'
      if (!form.value.terms_acknowledged) return 'You must acknowledge the terms.'
      return ''
    default:
      return ''
  }
}

function goToStep(n: number) {
  if (n === currentStep.value) return
  if (n < currentStep.value) {
    // Going backward — always allowed
    stepError.value = ''
    currentStep.value = n
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  // Going forward — validate each step sequentially up to target
  for (let s = currentStep.value; s < n; s++) {
    const error = validateStep(s)
    if (error) {
      stepError.value = error
      currentStep.value = s
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
  }
  stepError.value = ''
  currentStep.value = n
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function nextStep() {
  const error = validateStep(currentStep.value)
  if (error) {
    stepError.value = error
    return
  }
  stepError.value = ''
  currentStep.value++
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function prevStep() {
  stepError.value = ''
  currentStep.value--
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function submitApplication() {
  const error = validateStep(8)
  if (error) {
    stepError.value = error
    return
  }

  submitting.value = true
  submitError.value = ''

  const docId = `${Date.now()}`
  const submittedAt = new Date().toISOString()

  const payload = {
    submitted_at: submittedAt,
    status: 'pending',
    archetype: form.value.archetype,
    academic: {
      degree: form.value.degree,
      institution: form.value.institution,
      grad_year: form.value.grad_year,
      cumulative_gpa: form.value.cumulative_gpa,
      last2_gpa: form.value.last2_gpa,
      wgpa: form.value.wgpa,
      mcat_status: form.value.mcat_status,
      mcat: {
        cpbs: form.value.mcat_cpbs,
        cars: form.value.mcat_cars,
        bbfl: form.value.mcat_bbfl,
        psbb: form.value.mcat_psbb,
        total: form.value.mcat_total,
      },
      mcat_planned_date: form.value.mcat_planned_date,
    },
    history: {
      is_repeat: form.value.is_repeat,
      times_applied: form.value.times_applied,
      schools_applied: form.value.schools_applied,
      furthest_stage: form.value.furthest_stage,
      prior_feedback: form.value.prior_feedback,
      changes_since: form.value.changes_since,
    },
    experience: {
      clinical_hours: form.value.clinical_hours,
      clinical_setting: form.value.clinical_setting,
      clinical_description: form.value.clinical_description,
      has_research: form.value.has_research,
      research_description: form.value.research_description,
      leadership: form.value.leadership,
      community: form.value.community,
      rural_experience: form.value.rural_experience,
      other_experience: form.value.other_experience,
    },
    target: {
      cycle: form.value.target_cycle,
      schools: form.value.target_schools,
      specialty_interest: form.value.specialty_interest,
      rural_interest: form.value.rural_interest,
      other_programs: form.value.other_programs,
    },
    materials: {
      personal_statement: form.value.personal_statement,
      abs_overview: form.value.abs_overview,
      reference_status: form.value.reference_status,
    },
    logistics: {
      package_interest: form.value.package_interest,
      how_heard: form.value.how_heard,
      additional_notes: form.value.additional_notes,
    },
    contact: {
      fullname: form.value.fullname,
      email: form.value.email,
      phone: form.value.phone,
    },
    coi_acknowledged: true,
    terms_acknowledged: true,
    notes: '',
  }

  try {
    // Write to Firestore
    await setDoc(doc(festivall_db, 'medprep_applications', docId), payload)

    // Notify via Slack relay
    const slackMessage = [
      `:stethoscope: *New MedPrep Application*`,
      `:bust_in_silhouette: ${form.value.fullname}`,
      `:email: ${form.value.email}   :phone: ${form.value.phone}`,
      `:label: Archetype: ${form.value.archetype.replace(/_/g, ' ')}`,
      `:mortar_board: ${form.value.degree} — ${form.value.institution} (${form.value.grad_year})`,
      `:bar_chart: cGPA: ${form.value.cumulative_gpa}  |  MCAT: ${form.value.mcat_status === 'completed' ? form.value.mcat_total : form.value.mcat_status}`,
      `:repeat: Repeat applicant: ${form.value.is_repeat ? 'Yes (' + form.value.times_applied + ' cycles)' : 'No'}`,
      `:dart: Target cycle: ${form.value.target_cycle}  |  Package: ${form.value.package_interest}`,
      `:handshake: COI acknowledged: ✓`,
      `:calendar: ${submittedAt}`,
    ].join('\n')
    await sendMedPrep(slackMessage)

    submitted.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    console.error('Submission error:', err)
    submitError.value = 'Something went wrong submitting your application. Please try again or email directly.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* ─── Shell ──────────────────────────────────────────────── */
.medprep-apply {
  background: #0d0d0d;
  min-height: 100vh;
  color: #e8e8e8;
  font-family: 'Oswald', sans-serif;
}

/* ─── Confirmation ───────────────────────────────────────── */
.confirmation {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 24px;
}
.confirmation-inner {
  max-width: 560px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.confirm-icon {
  font-size: 3rem;
  color: #c9a227;
}
.confirmation h2 {
  font-size: 2rem;
  color: #fff;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.confirmation p {
  font-size: 0.95rem;
  color: #aaa;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.7;
}
.confirm-sub {
  font-size: 0.82rem !important;
  color: #666 !important;
}
.btn-ghost {
  display: inline-block;
  color: #c9a227;
  text-decoration: none;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  margin-top: 12px;
  border: 1px solid #c9a227;
  padding: 10px 24px;
  transition: background 0.2s, color 0.2s;
}
.btn-ghost:hover {
  background: #c9a227;
  color: #0d0d0d;
}

/* ─── Form Shell ─────────────────────────────────────────── */
.form-shell {
  max-width: 760px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

/* ─── Header ─────────────────────────────────────────────── */
.form-header {
  margin-bottom: 40px;
}
.back-link {
  color: #666;
  text-decoration: none;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 20px;
  transition: color 0.2s;
}
.back-link:hover { color: #c9a227; }
.form-header h1 {
  font-size: 2rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
}
.form-subtitle {
  font-size: 0.88rem;
  color: #777;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.6;
}

/* ─── Progress ───────────────────────────────────────────── */
.progress-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.progress-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #555;
  transition: all 0.2s;
  user-select: none;
  cursor: pointer;
}
.progress-dot:hover {
  border-color: #555;
  color: #aaa;
}
.progress-dot.done {
  border-color: #c9a227;
  color: #c9a227;
}
.progress-dot.done:hover {
  background: #c9a22722;
}
.progress-dot.active {
  border-color: #c9a227;
  background: #c9a227;
  color: #0d0d0d;
  font-weight: 700;
  cursor: default;
}
.step-label {
  font-size: 0.72rem;
  color: #555;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 40px;
}

/* ─── Step Content ───────────────────────────────────────── */
.step-content {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.step-content h2 {
  font-size: 1.5rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}
.step-desc {
  font-size: 0.88rem;
  color: #777;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.6;
  margin: 0;
}

/* ─── Fields ─────────────────────────────────────────────── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
label {
  font-size: 0.78rem;
  color: #aaa;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.label-note {
  text-transform: none;
  font-size: 0.7rem;
  color: #555;
  letter-spacing: 0;
}
.field-note {
  font-size: 0.78rem;
  color: #555;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.5;
  margin: 0;
}
input[type='text'],
input[type='email'],
input[type='tel'],
input[type='number'],
select,
textarea {
  background: #111;
  border: 1px solid #2a2a2a;
  color: #e8e8e8;
  font-family: sans-serif;
  font-size: 0.9rem;
  font-weight: 300;
  padding: 10px 14px;
  border-radius: 2px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
input:focus,
select:focus,
textarea:focus {
  border-color: #c9a227;
}
textarea {
  resize: vertical;
}
select option {
  background: #111;
}

/* ─── Radio ──────────────────────────────────────────────── */
.radio-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #aaa;
  font-family: sans-serif;
  font-weight: 300;
  cursor: pointer;
  text-transform: none;
  letter-spacing: 0;
  padding: 8px 14px;
  border: 1px solid #2a2a2a;
  border-radius: 2px;
  transition: border-color 0.2s;
}
.radio-option:has(input:checked) {
  border-color: #c9a227;
  color: #e8e8e8;
}
.radio-option input { display: none; }

/* ─── Archetypes ─────────────────────────────────────────── */
.archetype-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.archetype-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px;
  border: 1px solid #2a2a2a;
  border-radius: 2px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.archetype-card:hover {
  border-color: #444;
}
.archetype-card.selected {
  border-color: #c9a227;
  background: #14120844;
}
.archetype-card input { display: none; }
.archetype-title {
  font-size: 0.95rem;
  color: #fff;
  letter-spacing: 0.02em;
}
.archetype-sub {
  font-size: 0.78rem;
  color: #666;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.4;
}

/* ─── MCAT Grid ──────────────────────────────────────────── */
.mcat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 16px;
}

/* ─── Package Grid ───────────────────────────────────────── */
.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}
.package-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid #2a2a2a;
  border-radius: 2px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.package-card:hover { border-color: #444; }
.package-card.selected {
  border-color: #c9a227;
  background: #14120844;
}
.package-card input { display: none; }
.pkg-name {
  font-size: 0.88rem;
  color: #fff;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.pkg-total {
  font-size: 0.82rem;
  color: #c9a227;
}
.pkg-sub {
  font-size: 0.72rem;
  color: #555;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.4;
}
.pkg-features {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid #1e1e1e;
  padding-top: 10px;
}
.pkg-features li {
  font-size: 0.7rem;
  color: #666;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.3;
  padding-left: 12px;
  position: relative;
}
.pkg-features li::before {
  content: '–';
  position: absolute;
  left: 0;
  color: #444;
}
.package-card.selected .pkg-features li {
  color: #999;
}

/* ─── Acknowledgments ────────────────────────────────────── */
.acknowledgment-block {
  border: 1px solid #2a2a2a;
  border-radius: 2px;
  padding: 20px;
  transition: border-color 0.2s;
}
.acknowledgment-block:has(input:checked) {
  border-color: #c9a22766;
}
.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  cursor: pointer;
  text-transform: none;
  letter-spacing: 0;
}
.checkbox-option input[type='checkbox'] {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 2px;
  accent-color: #c9a227;
  cursor: pointer;
}
.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.checkbox-text strong {
  font-size: 0.85rem;
  color: #fff;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.checkbox-text span {
  font-size: 0.8rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.7;
}

/* ─── Errors ─────────────────────────────────────────────── */
.step-error,
.submit-error {
  font-size: 0.82rem;
  color: #e05555;
  font-family: sans-serif;
  font-weight: 300;
  padding: 10px 14px;
  border: 1px solid #e0555544;
  border-radius: 2px;
  background: #e0555511;
}

/* ─── Navigation ─────────────────────────────────────────── */
.form-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid #1e1e1e;
}
.nav-spacer { flex: 1; }
.btn-back {
  background: transparent;
  border: 1px solid #333;
  color: #888;
  font-family: 'Oswald', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 12px 28px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.btn-back:hover {
  border-color: #888;
  color: #e8e8e8;
}
.btn-next {
  background: #1e1e1e;
  border: 1px solid #444;
  color: #e8e8e8;
  font-family: 'Oswald', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 12px 32px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.btn-next:hover {
  background: #2a2a2a;
  border-color: #666;
}
.btn-submit {
  background: #c9a227;
  border: none;
  color: #0d0d0d;
  font-family: 'Oswald', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 14px 40px;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}
.btn-submit:hover:not(:disabled) {
  background: #e0b52e;
}
.btn-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 600px) {
  .form-shell {
    padding: 32px 18px 60px;
  }
  .mcat-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .package-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
