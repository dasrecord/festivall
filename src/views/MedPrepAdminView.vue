<template>
  <div class="medprep-admin">

    <div class="admin-header">
      <h1>MedPrep Admin</h1>
      <p class="admin-sub">Dr. Prasenjit Das — private reference dashboard</p>
    </div>

    <!-- ── APPLICANTS PANEL ─────────────────────────────── -->
    <section class="panel">
      <div class="panel-header">
        <h2>Applications</h2>
        <span class="applicant-count" v-if="!loadingApplicants">{{ applicants.length }} total</span>
        <button class="btn-refresh" @click="loadApplicants" :disabled="loadingApplicants">↻ Refresh</button>
      </div>

      <div class="loading" v-if="loadingApplicants">Loading applications...</div>

      <div v-else-if="applicants.length === 0" class="empty-state">
        No applications yet.
      </div>

      <div v-else class="applicant-table-wrapper">
        <table class="applicant-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Profile</th>
              <th>GPA / MCAT</th>
              <th>Cycle</th>
              <th>Submitted</th>
              <th>Contract</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="app in applicants"
              :key="app.id"
              :class="'row-' + app.status"
            >
              <td class="td-name">
                <div><span class="name-link" @click="openFirestoreRecord(app.id)">{{ app.contact?.fullname }}</span></div>
                <div class="td-sub">{{ app.contact?.email }}</div>
                <div class="td-sub">{{ app.contact?.phone }}</div>
              </td>
              <td class="td-profile">
                <span class="archetype-tag">{{ archetypeLabel(app.archetype) }}</span>
                <div class="td-sub">{{ packageLabel(app.logistics?.package_interest ?? '') }}</div>
              </td>
              <td>
                <div>{{ app.academic?.cumulative_gpa }}</div>
                <div class="td-mcat" v-if="app.academic?.mcat_status === 'completed'">MCAT {{ app.academic?.mcat?.total }}</div>
                <div class="td-mcat" v-else>MCAT {{ app.academic?.mcat_status }}</div>
              </td>
              <td class="td-cycle">
                <div>{{ app.target?.cycle }}</div>
                <div class="td-sub" v-if="app.history?.is_repeat">&#215;{{ app.history?.times_applied }} cycle</div>
              </td>
              <td class="td-date">{{ formatDate(app.submitted_at) }}</td>
              <td>
                <span v-if="app.contract?.signed" class="contract-signed">Signed</span>
                <span v-else class="contract-unsigned">Unsigned</span>
              </td>
              <td>
                <select
                  class="status-select"
                  :value="app.status"
                  @change="updateStatus(app.id, ($event.target as HTMLSelectElement).value)"
                  :class="'status-' + app.status"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="accepted">Accepted</option>
                  <option value="waitlist">Waitlist</option>
                  <option value="rejected">Rejected</option>
                </select>
              </td>
              <td class="td-actions">
                <div class="td-actions-row">
                  <span
                    v-if="appOverallScore(app) !== null"
                    class="score-badge"
                    :style="{ color: scoreBadgeColor(appOverallScore(app)) }"
                  >{{ appOverallScore(app) }}</span>
                  <span v-else class="score-badge-empty">&#8212;</span>
                  <button class="btn-assess" @click="openAssessPanel(app.id)">Rate</button>
                  <a
                    :href="buildOfferMailto(app)"
                    class="btn-offer"
                    :class="{ 'btn-offer-sent': app.contract?.signed }"
                    target="_blank"
                    :title="app.contract?.signed ? 'Contract already signed' : 'Extend offer'"
                  >Offer</a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- EXPANDED DETAIL -->
      <div class="detail-prompt" v-if="applicants.length > 0">
        <p>Click a row to expand — or open in Firestore console for full details.</p>
      </div>
    </section>

    <!-- ── DISTRIBUTION CHART ──────────────────────────── -->
    <section class="panel chart-panel" v-if="!loadingApplicants && applicants.length > 0">
      <div class="panel-header">
        <h2>Cohort Distribution</h2>
        <div class="chart-modes">
          <button v-if="radarApplicantId" class="mode-btn mode-back" @click="backToCohort">&#8592; Back</button>
          <template v-else>
            <button class="mode-btn" :class="{ active: chartMode === 'gpa' }" @click="setChartMode('gpa')">GPA</button>
            <button class="mode-btn" :class="{ active: chartMode === 'mcat' }" @click="setChartMode('mcat')">MCAT</button>
            <button class="mode-btn" :class="{ active: chartMode === 'score' }" @click="setChartMode('score')">Score</button>
          </template>
        </div>
      </div>
      <div class="chart-wrap">
        <canvas
          ref="chartCanvas"
          class="dist-canvas"
          @click="onCanvasClick"
          :style="{ cursor: chartMode === 'score' && !radarApplicantId ? 'pointer' : 'default' }"
        ></canvas>
      </div>
      <div class="chart-legend" v-if="!radarApplicantId">
        <template v-if="chartMode !== 'score'">
          <span class="cl cl-curve">&#8212; Applicant pool</span>
          <span class="cl cl-median">&#xB7;&#xB7;&#xB7; USask admitted median</span>
          <span class="cl cl-above">&#9679; Above median</span>
          <span class="cl cl-below">&#9679; Below median</span>
          <span class="cl cl-accepted">&#9679; Accepted</span>
        </template>
        <template v-else>
          <span class="cl cl-accepted">&#9679; &#x2265;&thinsp;8.0</span>
          <span class="cl cl-above">&#9679; &#x2265;&thinsp;6.5</span>
          <span class="cl cl-below">&#9679; &#x2265;&thinsp;5.0</span>
          <span class="cl" style="color:#e0555566">&#9679; &lt;&thinsp;5.0</span>
          <span class="cl cl-median">&#xB7;&#xB7;&#xB7; Target threshold 7.0</span>
          <span class="cl" style="color:#333">Click dot for radar</span>
        </template>
      </div>
    </section>

    <!-- ── USask REFERENCE ──────────────────────────────── -->
    <section class="panel reference-panel">
      <div class="panel-header">
        <h2>USask College of Medicine — Admissions Reference</h2>
        <span class="ref-note">Verify against the <a href="https://medicine.usask.ca/documents/Admissions/applicant-information-document.pdf" target="_blank">AID (updated July 1 annually)</a></span>
      </div>

      <!-- CYCLE TIMELINE -->
      <div class="ref-block">
        <h3>2026–2027 Cycle Timeline</h3>
        <table class="ref-table">
          <tbody>
            <tr>
              <td>Application opens</td>
              <td>~August 2026</td>
            </tr>
            <tr>
              <td>Application deadline</td>
              <td>~October 1, 2026</td>
            </tr>
            <tr>
              <td>CASPer</td>
              <td>Must be completed before deadline — dates at <a href="https://acuityinsights.app" target="_blank">acuityinsights.app</a></td>
            </tr>
            <tr>
              <td>MMI invitations</td>
              <td>Typically February / March</td>
            </tr>
            <tr>
              <td>Acceptance offers</td>
              <td>Typically April / May</td>
            </tr>
            <tr>
              <td>AID updated</td>
              <td>July 1 each year — canonical source for all requirements</td>
            </tr>
            <tr>
              <td>Application fee</td>
              <td>$150 + $75 interview fee (Price of a Dream waiver available — portal open until July 15, 2026)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- SEAT BREAKDOWN -->
      <div class="ref-block">
        <h3>Seat Breakdown (~100 total)</h3>
        <table class="ref-table">
          <tbody>
            <tr>
              <td>Regular stream</td>
              <td class="td-num">~73</td>
              <td class="td-note">Predominantly SK-connected applicants via SCI score</td>
            </tr>
            <tr>
              <td>Indigenous Admissions Pathway (IAP)</td>
              <td class="td-num">20</td>
              <td class="td-note">Self-declared First Nations, Métis, or Inuit</td>
            </tr>
            <tr>
              <td>DSAAP</td>
              <td class="td-num">7</td>
              <td class="td-note">Diversity & Social Accountability — socioeconomic barriers</td>
            </tr>
            <tr>
              <td>Black Student Admissions Pathway (BSAP)</td>
              <td class="td-num">No dedicated seats</td>
              <td class="td-note">Assessed within the regular pool; introduced 2025 cycle (2026 entry)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ACADEMIC REQUIREMENTS -->
      <div class="ref-block">
        <h3>Academic Requirements</h3>
        <table class="ref-table">
          <tbody>
            <tr>
              <td>Degree requirement</td>
              <td>Completed 4-year bachelor's degree (any subject area) before entry</td>
            </tr>
            <tr>
              <td>UAA (University Adjusted Average)</td>
              <td>Best two 30-credit years of undergraduate study; adjustments for course load and full-time status. This is the primary academic metric.</td>
            </tr>
            <tr>
              <td>MCAT</td>
              <td>Required. No published minimum cutoff. Competitive admitted class median historically ~511–513. All four sections are considered.</td>
            </tr>
            <tr>
              <td>CASPer</td>
              <td>Required. Taken through Acuity Insights platform. Scored independently — not combined with GPA. Tests socio-cognitive skills.</td>
            </tr>
            <tr>
              <td>SK Connectedness Index (SCI)</td>
              <td>Scored. Rewards SK residence, education, employment, declared intention to practice in SK. Major factor for regular-stream ranking.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- SCORING COMPONENTS -->
      <div class="ref-block">
        <h3>Application Scoring Components</h3>
        <div class="scoring-flow">
          <div class="score-stage">
            <div class="score-label">Stage 1 — Paper Screen</div>
            <div class="score-items">
              <span>UAA</span>
              <span>MCAT</span>
              <span>CASPer</span>
              <span>SCI score</span>
              <span>ABS / Activities</span>
              <span>References</span>
            </div>
          </div>
          <div class="score-arrow">→</div>
          <div class="score-stage">
            <div class="score-label">Stage 2 — MMI</div>
            <div class="score-items">
              <span>Multiple Mini Interview</span>
              <span>Scored independently</span>
            </div>
          </div>
          <div class="score-arrow">→</div>
          <div class="score-stage">
            <div class="score-label">Stage 3 — Panel</div>
            <div class="score-items">
              <span>Panel interview (top MMI performers)</span>
              <span>DSAAP questionnaire (optional, confidential)</span>
            </div>
          </div>
          <div class="score-arrow">→</div>
          <div class="score-stage highlight">
            <div class="score-label">Offer</div>
          </div>
        </div>
      </div>

      <!-- KEY CHANGES -->
      <div class="ref-block">
        <h3>Key Changes to Watch</h3>
        <table class="ref-table">
          <tbody>
            <tr>
              <td>2025 cycle (2026 entry)</td>
              <td>BSAP introduced. Application deadline Oct 1, 2025.</td>
            </tr>
            <tr>
              <td>2027 cycle (2028 entry)</td>
              <td>
                Admissions changes announced — verify at
                <a href="https://medicine.usask.ca/admission-to-the-md-program/how-to-apply.php" target="_blank">
                  medicine.usask.ca/admission-to-the-md-program
                </a>
              </td>
            </tr>
            <tr>
              <td>AID refresh</td>
              <td>July 1 annually — check for changes to UAA calculation, MCAT policy, interview format</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- QUICK LINKS -->
      <div class="ref-block">
        <h3>Quick Reference Links</h3>
        <div class="links-grid">
          <a href="https://medicine.usask.ca/documents/Admissions/applicant-information-document.pdf" target="_blank" class="ref-link">
            📄 Applicant Information Document (AID)
          </a>
          <a href="https://medicine.usask.ca/admission-to-the-md-program/how-to-apply.php#AdmissionsStatistics" target="_blank" class="ref-link">
            📊 Admissions Statistics
          </a>
          <a href="https://admissions.usask.ca/medicine.php" target="_blank" class="ref-link">
            🎓 USask Medicine Admissions Page
          </a>
          <a href="https://acuityinsights.app" target="_blank" class="ref-link">
            🧠 CASPer / Acuity Insights
          </a>
          <a href="https://students-residents.aamc.org/taking-mcat-exam/taking-mcat-exam" target="_blank" class="ref-link">
            🔬 AAMC MCAT Registration
          </a>
          <a href="https://medicine.usask.ca/admission-to-the-md-program/how-to-apply.php" target="_blank" class="ref-link">
            📋 How to Apply — Full Page
          </a>
        </div>
      </div>

    </section>

  </div>

  <!-- ── ASSESSMENT BACKDROP ──────────────────────────────── -->
  <div class="assess-backdrop" v-if="assessPanelOpen" @click="closeAssessPanel"></div>

  <!-- ── ASSESSMENT SIDE PANEL ────────────────────────────── -->
  <aside class="assess-panel" :class="{ open: assessPanelOpen }">
    <template v-if="assessApplicant">

      <div class="ap-header">
        <div class="ap-identity">
          <div class="ap-name">{{ assessApplicant.contact?.fullname }}</div>
          <div class="ap-meta">{{ archetypeLabel(assessApplicant.archetype) }} &middot; {{ packageLabel(assessApplicant.logistics?.package_interest ?? '') }}</div>
        </div>
        <button class="ap-close" @click="closeAssessPanel" aria-label="Close">&#10005;</button>
      </div>

      <div class="ap-score-display">
        <div class="ap-score-number" :style="{ color: panelScoreColor }">
          {{ overallScore ?? '&mdash;' }}
        </div>
        <div class="ap-score-denom">/ 10</div>
        <div class="ap-score-label">Overall Score</div>
      </div>

      <div class="ap-dimensions">
        <div class="ap-dim" v-for="dim in DIMENSIONS" :key="dim.key">
          <div class="ap-dim-row">
            <span class="ap-dim-label">{{ dim.label }}</span>
            <span class="ap-dim-value" :style="{ color: dimColor(draftScores[dim.key]) }">
              {{ draftScores[dim.key] !== null ? draftScores[dim.key] : '&mdash;' }}
            </span>
          </div>
          <input
            type="range"
            min="0" max="10" step="0.5"
            :value="draftScores[dim.key] ?? 5"
            @input="setScore(dim.key, $event)"
            class="ap-slider"
            :style="{ '--pct': ((draftScores[dim.key] ?? 5) / 10 * 100) + '%', '--fill': dimColor(draftScores[dim.key]) }"
          />
        </div>
      </div>

      <div class="ap-notes-wrap">
        <label class="ap-notes-label">NOTES</label>
        <textarea
          v-model="draftNotes"
          class="ap-notes-input"
          placeholder="Observations, flags, talking points..."
          @input="scheduleAutoSave"
          rows="4"
        ></textarea>
      </div>

      <div class="ap-footer">
        <span class="ap-save-status" :class="'save-' + saveStatus">{{ saveStatusLabel }}</span>
        <button class="ap-save-btn" @click="saveAssessment">Save</button>
      </div>

    </template>
  </aside>

</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { festivall_db } from '@/firebase.js'

interface Applicant {
  id: string
  status: string
  submitted_at: string
  archetype: string
  contract?: { signed: boolean; signedAt?: string; availability?: string; signature?: string }
  contact?: { fullname: string; email: string; phone: string }
  academic?: { cumulative_gpa: string; mcat_status: string; mcat?: { total: number } }
  history?: { is_repeat: boolean; times_applied: number }
  target?: { cycle: string }
  logistics?: { package_interest: string }
  assessment?: { scores: Record<string, number | null>; notes: string; updatedAt: string }
}

const applicants = ref<Applicant[]>([])
const loadingApplicants = ref(true)

const archetypeMap: Record<string, string> = {
  has_the_sauce: 'Has the sauce',
  freezes_under_pressure: 'Freezes under pressure',
  been_through_cycle: 'Been through cycle',
  early_stage: 'Early stage',
  non_traditional: 'Non-traditional',
}

const packageMap: Record<string, string> = {
  blueprint: 'The Blueprint',
  campaign: 'The Campaign',
  the_return: 'The Return',
  full_ride: 'The Full Ride',
  not_sure: 'Not sure',
}

const packageNameMap: Record<string, string> = packageMap

function buildOfferMailto(app: Applicant): string {
  const name = app.contact?.fullname ?? 'there'
  const email = app.contact?.email ?? ''
  const pkg = packageNameMap[app.logistics?.package_interest ?? ''] ?? 'the program'
  const link = `https://festivall.ca/medprep/contract/${app.id}`
  const subject = encodeURIComponent('Dr. Das MedPrep — Your Offer')
  const body = encodeURIComponent(
    `Hi ${name},\n\n` +
    `I've reviewed your application and I'd like to extend an offer for ${pkg}.\n\n` +
    `To review and sign your agreement, visit:\n${link}\n\n` +
    `The agreement covers the program terms, conflict of interest declaration, and discovery call scheduling. ` +
    `Once you've signed, I'll follow up to confirm a time.\n\n` +
    `Looking forward to working with you.\n\n` +
    `Dr. Prasenjit Das, MD\n` +
    `prasun.das.89@gmail.com`
  )
  return `mailto:${email}?subject=${subject}&body=${body}&cc=prasun.das.89@gmail.com`
}

function openFirestoreRecord(id: string) {
  const project = import.meta.env.VITE_APP_FESTIVALL_PROJECT_ID
  const url = `https://console.firebase.google.com/project/${project}/firestore/databases/-default-/data/~2Fmedprep_applications~2F${id}`
  window.open(url, '_blank', 'noopener')
}

function archetypeLabel(val: string) {
  return archetypeMap[val] ?? val
}

function packageLabel(val: string) {
  return packageMap[val] ?? val
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function loadApplicants() {
  loadingApplicants.value = true
  try {
    const snapshot = await getDocs(collection(festivall_db, 'medprep_applications'))
    applicants.value = snapshot.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Applicant, 'id'>) }))
      .sort((a, b) => (b.submitted_at > a.submitted_at ? 1 : -1))
  } catch (err) {
    console.error('Error loading medprep applications:', err)
  } finally {
    loadingApplicants.value = false
  }
}

async function updateStatus(id: string, newStatus: string) {
  try {
    await updateDoc(doc(festivall_db, 'medprep_applications', id), { status: newStatus })
    const target = applicants.value.find((a) => a.id === id)
    if (target) target.status = newStatus
  } catch (err) {
    console.error('Error updating status:', err)
  }
}

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartMode = ref<'gpa' | 'mcat' | 'score'>('gpa')
const radarApplicantId = ref<string | null>(null)
const dotHitTargets = ref<{ id: string; x: number; y: number }[]>([])

function setChartMode(mode: 'gpa' | 'mcat' | 'score') {
  radarApplicantId.value = null
  chartMode.value = mode
  nextTick(drawChart)
}

function parseGPA(str: string): number | null {
  if (!str) return null
  const m = str.match(/^(\d+\.\d+)/)
  return m ? parseFloat(m[1]) : null
}

function gaussian(x: number, mu: number, sigma: number): number {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2)
}

function drawChart() {
  const canvas = chartCanvas.value
  if (!canvas) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const W = rect.width
  const H = rect.height
  const PAD = { top: 52, right: 28, bottom: 44, left: 28 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  ctx.clearRect(0, 0, W, H)
  if (radarApplicantId.value) { drawRadarChart(ctx, W, H); return }
  if (chartMode.value === 'score') { drawScorePlot(ctx, W, H, PAD); return }

  const CFG = chartMode.value === 'gpa'
    ? { mu: 3.70, sigma: 0.22, xMin: 3.0, xMax: 4.02, median: 3.80, label: 'GPA (UAA)', fmt: (v: number) => v.toFixed(2), ticks: [3.0, 3.2, 3.4, 3.6, 3.8, 4.0] }
    : { mu: 507, sigma: 6.5, xMin: 490, xMax: 528, median: 511, label: 'MCAT TOTAL', fmt: (v: number) => String(Math.round(v)), ticks: [492, 497, 502, 507, 512, 517, 522, 527] }

  const xPx = (x: number) => PAD.left + ((x - CFG.xMin) / (CFG.xMax - CFG.xMin)) * plotW
  const yPx = (y: number, yMax: number) => PAD.top + plotH - (y / yMax) * plotH

  const STEPS = 280
  const pts: [number, number][] = []
  let yMax = 0
  for (let i = 0; i <= STEPS; i++) {
    const x = CFG.xMin + (i / STEPS) * (CFG.xMax - CFG.xMin)
    const y = gaussian(x, CFG.mu, CFG.sigma)
    if (y > yMax) yMax = y
    pts.push([x, y])
  }
  yMax *= 1.18

  // ── Background ────────────────────────────────────────
  ctx.clearRect(0, 0, W, H)

  // Radial glow behind peak
  const peakX = xPx(CFG.mu)
  const rg = ctx.createRadialGradient(peakX, PAD.top + plotH * 0.3, 0, peakX, PAD.top + plotH * 0.3, plotW * 0.45)
  rg.addColorStop(0, 'rgba(201,162,39,0.04)')
  rg.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = rg
  ctx.fillRect(PAD.left, PAD.top, plotW, plotH)

  // ── Grid ──────────────────────────────────────────────
  ctx.save()
  ctx.strokeStyle = '#161616'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const gy = PAD.top + (i / 4) * plotH
    ctx.beginPath(); ctx.moveTo(PAD.left, gy); ctx.lineTo(W - PAD.right, gy); ctx.stroke()
  }
  ctx.restore()

  // ── Curve fill ────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom)
  grad.addColorStop(0, 'rgba(201,162,39,0.16)')
  grad.addColorStop(1, 'rgba(201,162,39,0.01)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.moveTo(xPx(pts[0][0]), H - PAD.bottom)
  for (const [x, y] of pts) ctx.lineTo(xPx(x), yPx(y, yMax))
  ctx.lineTo(xPx(pts[pts.length - 1][0]), H - PAD.bottom)
  ctx.closePath()
  ctx.fill()

  // ── Curve line ────────────────────────────────────────
  ctx.save()
  ctx.shadowColor = '#c9a227'
  ctx.shadowBlur = 10
  ctx.strokeStyle = '#c9a227'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  pts.forEach(([x, y], i) => {
    i === 0 ? ctx.moveTo(xPx(x), yPx(y, yMax)) : ctx.lineTo(xPx(x), yPx(y, yMax))
  })
  ctx.stroke()
  ctx.restore()

  // ── USask median line (cyan) ───────────────────────────
  ctx.save()
  ctx.shadowColor = '#00d4ff'
  ctx.shadowBlur = 8
  ctx.strokeStyle = 'rgba(0,212,255,0.55)'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 4])
  ctx.beginPath()
  ctx.moveTo(xPx(CFG.median), PAD.top)
  ctx.lineTo(xPx(CFG.median), H - PAD.bottom)
  ctx.stroke()
  ctx.restore()

  // Median label
  ctx.save()
  ctx.fillStyle = 'rgba(0,212,255,0.65)'
  ctx.font = '9px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(String(CFG.median), xPx(CFG.median), PAD.top - 22)
  ctx.font = '8px monospace'
  ctx.fillText('USask median', xPx(CFG.median), PAD.top - 12)
  ctx.restore()

  // ── X-axis ────────────────────────────────────────────
  ctx.save()
  ctx.strokeStyle = '#2a2a2a'
  ctx.lineWidth = 1
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(PAD.left, H - PAD.bottom)
  ctx.lineTo(W - PAD.right, H - PAD.bottom)
  ctx.stroke()
  CFG.ticks.forEach(t => {
    const tx = xPx(t)
    ctx.strokeStyle = '#2a2a2a'
    ctx.beginPath(); ctx.moveTo(tx, H - PAD.bottom); ctx.lineTo(tx, H - PAD.bottom + 4); ctx.stroke()
    ctx.fillStyle = '#444'
    ctx.font = '9px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(CFG.fmt(t), tx, H - PAD.bottom + 15)
  })
  ctx.restore()

  // Mode label
  ctx.save()
  ctx.fillStyle = '#2a2a2a'
  ctx.font = '700 10px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(CFG.label + ' DISTRIBUTION', PAD.left, PAD.top - 22)
  ctx.restore()

  // ── Applicant dots ────────────────────────────────────
  const dotData = applicants.value.map(app => {
    const name = (app.contact?.fullname ?? '?').split(' ')[0]
    const score = chartMode.value === 'gpa'
      ? parseGPA(app.academic?.cumulative_gpa ?? '')
      : app.academic?.mcat_status === 'completed' ? (app.academic?.mcat?.total ?? null) : null
    return { name, score, status: app.status }
  }).filter(d => d.score !== null && d.score >= CFG.xMin && d.score <= CFG.xMax) as { name: string; score: number; status: string }[]

  // Offset labels vertically so they don't overlap
  const sorted = [...dotData].sort((a, b) => a.score - b.score)
  const labelOffsets: Record<string, number> = {}
  sorted.forEach((d, i) => {
    const prev = sorted[i - 1]
    const xRange = CFG.xMax - CFG.xMin
    if (prev && Math.abs(d.score - prev.score) / xRange < 0.05) {
      labelOffsets[d.name + d.score] = (labelOffsets[prev.name + prev.score] ?? 0) - 18
    } else {
      labelOffsets[d.name + d.score] = 0
    }
  })

  for (const { name, score, status } of dotData) {
    const px = xPx(score)
    const curveY = gaussian(score, CFG.mu, CFG.sigma)
    const py = yPx(curveY, yMax)
    const aboveMedian = score >= CFG.median
    const color = status === 'accepted' ? '#4caf80' : aboveMedian ? '#c9a227' : '#e8843a'

    // Drop line
    ctx.save()
    ctx.strokeStyle = color + '28'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 3])
    ctx.beginPath(); ctx.moveTo(px, py + 7); ctx.lineTo(px, H - PAD.bottom); ctx.stroke()
    ctx.restore()

    // Outer ring
    ctx.save()
    ctx.strokeStyle = color + '55'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()

    // Dot with glow
    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = 16
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill()
    ctx.restore()

    // Labels
    const labelOffset = labelOffsets[name + score] ?? 0
    ctx.save()
    ctx.fillStyle = '#dddddd'
    ctx.font = '700 10px Oswald, monospace'
    ctx.textAlign = 'center'
    ctx.fillText(name, px, py - 20 + labelOffset)
    ctx.fillStyle = color + 'cc'
    ctx.font = '8px monospace'
    ctx.fillText(CFG.fmt(score), px, py - 10 + labelOffset)
    ctx.restore()
  }
}

watch(applicants, () => nextTick(drawChart))

function onCanvasClick(e: MouseEvent) {
  if (chartMode.value !== 'score' || radarApplicantId.value) return
  const canvas = chartCanvas.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  for (const t of dotHitTargets.value) {
    if (Math.hypot(mx - t.x, my - t.y) <= 14) {
      radarApplicantId.value = t.id
      nextTick(drawChart)
      return
    }
  }
}

function backToCohort() {
  radarApplicantId.value = null
  nextTick(drawChart)
}

function drawScorePlot(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  PAD: { top: number; right: number; bottom: number; left: number }
) {
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const xPx = (x: number) => PAD.left + (x / 10) * plotW
  const midY = PAD.top + plotH * 0.50
  dotHitTargets.value = []

  // Grid
  ctx.strokeStyle = '#161616'; ctx.lineWidth = 1; ctx.setLineDash([])
  for (let i = 0; i <= 4; i++) {
    const gy = PAD.top + (i / 4) * plotH
    ctx.beginPath(); ctx.moveTo(PAD.left, gy); ctx.lineTo(W - PAD.right, gy); ctx.stroke()
  }

  // Target threshold at 7.0
  ctx.save()
  ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 6
  ctx.strokeStyle = 'rgba(0,212,255,0.55)'; ctx.lineWidth = 1; ctx.setLineDash([3, 4])
  ctx.beginPath(); ctx.moveTo(xPx(7), PAD.top); ctx.lineTo(xPx(7), H - PAD.bottom); ctx.stroke()
  ctx.restore()
  ctx.save(); ctx.fillStyle = 'rgba(0,212,255,0.65)'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
  ctx.fillText('7.0', xPx(7), PAD.top - 22)
  ctx.font = '8px monospace'; ctx.fillText('target threshold', xPx(7), PAD.top - 12)
  ctx.restore()

  // X-axis
  ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1; ctx.setLineDash([])
  ctx.beginPath(); ctx.moveTo(PAD.left, H - PAD.bottom); ctx.lineTo(W - PAD.right, H - PAD.bottom); ctx.stroke()
  for (let tick = 0; tick <= 10; tick++) {
    const tx = xPx(tick)
    ctx.strokeStyle = '#2a2a2a'
    ctx.beginPath(); ctx.moveTo(tx, H - PAD.bottom); ctx.lineTo(tx, H - PAD.bottom + 4); ctx.stroke()
    ctx.fillStyle = '#444'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
    ctx.fillText(String(tick), tx, H - PAD.bottom + 15)
  }

  ctx.save(); ctx.fillStyle = '#2a2a2a'; ctx.font = '700 10px monospace'; ctx.textAlign = 'left'
  ctx.fillText('ASSESSMENT SCORE DISTRIBUTION', PAD.left, PAD.top - 22); ctx.restore()

  const rated = applicants.value
    .map(app => ({ app, score: appOverallScore(app) }))
    .filter(d => d.score !== null) as { app: Applicant; score: string }[]

  if (rated.length === 0) {
    ctx.fillStyle = '#333'; ctx.font = '11px monospace'; ctx.textAlign = 'center'
    ctx.fillText('No rated applicants yet — use Rate button to score', W / 2, H / 2)
    return
  }

  const sorted = [...rated].sort((a, b) => parseFloat(a.score) - parseFloat(b.score))
  const yOff: number[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) { yOff.push(0); continue }
    const gap = Math.abs(parseFloat(sorted[i].score) - parseFloat(sorted[i - 1].score))
    yOff.push(gap < 0.8 ? (yOff[i - 1] - 26) : 0)
  }

  rated.forEach(({ app, score }) => {
    const px = xPx(parseFloat(score))
    const si = sorted.findIndex(s => s.app.id === app.id)
    const py = midY + (yOff[si] ?? 0)
    const color = scoreBadgeColor(score)
    const name = (app.contact?.fullname ?? '?').split(' ')[0]

    ctx.save(); ctx.strokeStyle = color + '28'; ctx.lineWidth = 1; ctx.setLineDash([2, 3])
    ctx.beginPath(); ctx.moveTo(px, py + 7); ctx.lineTo(px, H - PAD.bottom); ctx.stroke(); ctx.restore()
    ctx.save(); ctx.strokeStyle = color + '55'; ctx.lineWidth = 1; ctx.setLineDash([])
    ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.stroke(); ctx.restore()
    ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 16
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.restore()
    ctx.save()
    ctx.fillStyle = '#ddd'; ctx.font = '700 10px Oswald, monospace'; ctx.textAlign = 'center'
    ctx.fillText(name, px, py - 20)
    ctx.fillStyle = color + 'cc'; ctx.font = '8px monospace'
    ctx.fillText(score, px, py - 10)
    ctx.fillStyle = '#282828'; ctx.font = '7px monospace'
    ctx.fillText('tap for radar', px, py + 22)
    ctx.restore()
    dotHitTargets.value.push({ id: app.id, x: px, y: py })
  })
}

function drawRadarChart(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const app = applicants.value.find(a => a.id === radarApplicantId.value)
  if (!app) return
  const scores = app.assessment?.scores ?? {}
  const RDIMS = [
    { key: 'academic_trajectory', label: 'Academics' },
    { key: 'ps',                  label: 'Personal Statement' },
    { key: 'extracurriculars',    label: 'Extracurriculars' },
    { key: 'clinical',            label: 'Clinical' },
    { key: 'references',          label: 'References' },
    { key: 'interview',           label: 'Interview' },
    { key: 'strategy',            label: 'Strategy' },
    { key: 'grit',                label: 'Grit' },
  ]
  const N = RDIMS.length
  const cx = W / 2
  const cy = H / 2 + 16
  const maxR = Math.min(W * 0.33, H * 0.33)
  const ang  = (i: number) => (i / N) * 2 * Math.PI - Math.PI / 2
  const spk  = (i: number, r: number) => ({ x: cx + r * Math.cos(ang(i)), y: cy + r * Math.sin(ang(i)) })

  // Web rings
  for (const lv of [2, 4, 6, 8, 10]) {
    const r = (lv / 10) * maxR
    ctx.strokeStyle = lv === 10 ? '#222' : '#181818'; ctx.lineWidth = 1; ctx.setLineDash([])
    ctx.beginPath()
    for (let i = 0; i < N; i++) { const p = spk(i, r); i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y) }
    ctx.closePath(); ctx.stroke()
    ctx.fillStyle = '#2a2a2a'; ctx.font = '7px monospace'; ctx.textAlign = 'center'
    ctx.fillText(String(lv), cx + 4, cy - r - 3)
  }

  // Spokes
  for (let i = 0; i < N; i++) {
    const e = spk(i, maxR)
    ctx.strokeStyle = '#181818'; ctx.lineWidth = 1; ctx.setLineDash([])
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(e.x, e.y); ctx.stroke()
  }

  const dimVals = RDIMS.map(d => ({ ...d, val: (scores[d.key] as number | null) ?? 0 }))

  // Gradient fill
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR)
  grad.addColorStop(0, 'rgba(201,162,39,0.28)')
  grad.addColorStop(1, 'rgba(201,162,39,0.04)')
  ctx.fillStyle = grad
  ctx.beginPath()
  dimVals.forEach(({ val }, i) => {
    const p = spk(i, Math.max((val / 10) * maxR, 2))
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
  })
  ctx.closePath(); ctx.fill()

  // Stroke with glow
  ctx.save(); ctx.shadowColor = '#c9a227'; ctx.shadowBlur = 10
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 1.5; ctx.setLineDash([])
  ctx.beginPath()
  dimVals.forEach(({ val }, i) => {
    const p = spk(i, Math.max((val / 10) * maxR, 2))
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
  })
  ctx.closePath(); ctx.stroke(); ctx.restore()

  // Vertex dots
  dimVals.forEach(({ val }, i) => {
    const p = spk(i, Math.max((val / 10) * maxR, 2))
    const col = dimColor(val)
    ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 12
    ctx.fillStyle = col
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore()
  })

  // Axis labels
  RDIMS.forEach(({ label }, i) => {
    const lPt = spk(i, maxR + 30)
    const cosA = Math.cos(ang(i))
    ctx.textAlign = cosA > 0.3 ? 'left' : cosA < -0.3 ? 'right' : 'center'
    const val = dimVals[i].val
    const col = dimColor(val)
    ctx.fillStyle = '#777'; ctx.font = '9px monospace'
    ctx.fillText(label, lPt.x, lPt.y - 2)
    ctx.fillStyle = col; ctx.font = '700 9px monospace'
    ctx.fillText(val > 0 ? String(val) : '–', lPt.x, lPt.y + 10)
  })

  // Center: overall score
  const overall = appOverallScore(app)
  const oc = scoreBadgeColor(overall)
  ctx.save(); ctx.shadowColor = oc; ctx.shadowBlur = 24
  ctx.fillStyle = oc; ctx.font = '700 30px Oswald, sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(overall ?? '–', cx, cy + 11); ctx.restore()
  ctx.fillStyle = '#444'; ctx.font = '8px monospace'; ctx.textAlign = 'center'
  ctx.fillText('/ 10', cx, cy + 26)

  // Name header
  ctx.fillStyle = '#e8e8e8'; ctx.font = '700 13px Oswald, sans-serif'; ctx.textAlign = 'center'
  ctx.fillText((app.contact?.fullname ?? '').toUpperCase(), W / 2, 26)
  ctx.fillStyle = '#333'; ctx.font = '8px monospace'
  ctx.fillText('switch mode above to return', W / 2, 40)
}

// ─── Assessment panel ─────────────────────────────────────────
const DIMENSIONS = [
  { key: 'ps',                label: 'Personal Statement' },
  { key: 'extracurriculars',  label: 'Extracurriculars / Sketch' },
  { key: 'clinical',          label: 'Clinical Experience' },
  { key: 'references',        label: 'Reference Letters' },
  { key: 'interview',         label: 'Interview Readiness' },
  { key: 'academic_trajectory', label: 'Academic Trajectory' },
  { key: 'strategy',          label: 'Application Strategy' },
  { key: 'grit',              label: 'Grit / Non-traditional' },
]

const assessPanelOpen    = ref(false)
const assessApplicantId  = ref<string | null>(null)
const draftScores        = ref<Record<string, number | null>>({})
const draftNotes         = ref('')
const saveStatus         = ref<'idle' | 'unsaved' | 'saving' | 'saved'>('idle')
let saveTimer: ReturnType<typeof setTimeout> | null = null

const assessApplicant = computed(() =>
  applicants.value.find(a => a.id === assessApplicantId.value) ?? null
)

const overallScore = computed(() => {
  const vals = Object.values(draftScores.value).filter(v => v !== null) as number[]
  if (!vals.length) return null
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
})

const panelScoreColor = computed(() => scoreBadgeColor(overallScore.value))
const saveStatusLabel = computed(() => ({
  idle: '', unsaved: 'Unsaved', saving: 'Saving...', saved: 'Saved'
}[saveStatus.value]))

function scoreBadgeColor(score: string | null): string {
  if (!score) return '#444'
  const s = parseFloat(score)
  if (s >= 8)   return '#4caf80'
  if (s >= 6.5) return '#c9a227'
  if (s >= 5)   return '#e8843a'
  return '#e05555'
}

function dimColor(val: number | null): string {
  if (val === null || val === undefined) return '#444'
  if (val >= 8)   return '#4caf80'
  if (val >= 6.5) return '#c9a227'
  if (val >= 5)   return '#e8843a'
  return '#e05555'
}

function appOverallScore(app: Applicant): string | null {
  if (!app.assessment?.scores) return null
  const vals = Object.values(app.assessment.scores).filter(v => v !== null) as number[]
  if (!vals.length) return null
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}

function openAssessPanel(appId: string) {
  assessApplicantId.value = appId
  const saved = applicants.value.find(a => a.id === appId)?.assessment?.scores ?? {}
  draftScores.value = Object.fromEntries(DIMENSIONS.map(d => [d.key, saved[d.key] ?? null]))
  draftNotes.value = applicants.value.find(a => a.id === appId)?.assessment?.notes ?? ''
  saveStatus.value = 'idle'
  assessPanelOpen.value = true
}

function closeAssessPanel() {
  if (saveTimer) clearTimeout(saveTimer)
  assessPanelOpen.value = false
  assessApplicantId.value = null
}

function setScore(key: string, event: Event) {
  draftScores.value[key] = parseFloat((event.target as HTMLInputElement).value)
  scheduleAutoSave()
}

function scheduleAutoSave() {
  saveStatus.value = 'unsaved'
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(saveAssessment, 1400)
}

async function saveAssessment() {
  if (!assessApplicantId.value) return
  saveStatus.value = 'saving'
  try {
    await updateDoc(doc(festivall_db, 'medprep_applications', assessApplicantId.value), {
      assessment: {
        scores: { ...draftScores.value },
        notes: draftNotes.value,
        updatedAt: new Date().toISOString(),
      },
    })
    const idx = applicants.value.findIndex(a => a.id === assessApplicantId.value)
    if (idx !== -1) {
      applicants.value[idx] = {
        ...applicants.value[idx],
        assessment: {
          scores: { ...draftScores.value },
          notes: draftNotes.value,
          updatedAt: new Date().toISOString(),
        },
      }
    }
    saveStatus.value = 'saved'
  } catch (err) {
    console.error('Error saving assessment:', err)
    saveStatus.value = 'unsaved'
  }
}

onMounted(async () => {
  await loadApplicants()
  nextTick(drawChart)
})
</script>

<style scoped>
/* ─── Shell ──────────────────────────────────────────────── */
.medprep-admin {
  background: #0d0d0d;
  min-height: 100vh;
  color: #e8e8e8;
  font-family: 'Oswald', sans-serif;
  padding: 40px 24px 80px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ─── Header ─────────────────────────────────────────────── */
.admin-header {
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid #1e1e1e;
}
.admin-header h1 {
  font-size: 1.8rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}
.admin-sub {
  font-size: 0.78rem;
  color: #555;
  font-family: sans-serif;
  font-weight: 300;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ─── Panel ──────────────────────────────────────────────── */
.panel {
  background: #111;
  border: 1px solid #2a2a2a;
  border-radius: 2px;
  padding: 28px;
  margin-bottom: 28px;
}
.panel-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #1e1e1e;
}
.panel-header h2 {
  font-size: 1rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
  flex: 1;
}

/* ─── Chart panel ────────────────────────────────────── */
.chart-panel {
  background: #070707;
  border-color: #1a1a1a;
}
.chart-modes {
  display: flex;
  gap: 6px;
}
.mode-btn {
  background: transparent;
  border: 1px solid #2a2a2a;
  color: #555;
  font-family: 'Oswald', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 5px 14px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 2px;
}
.mode-btn:hover { border-color: #444; color: #aaa; }
.mode-btn.active {
  border-color: #c9a227;
  color: #c9a227;
  background: rgba(201,162,39,0.06);
}
.mode-back { color: #888; border-color: #333; }
.mode-back:hover { border-color: #c9a22766; color: #c9a227; }
.chart-wrap {
  width: 100%;
  height: 300px;
  position: relative;
}
.dist-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #111;
}
.cl {
  font-size: 0.68rem;
  font-family: monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.cl-curve  { color: #c9a22799; }
.cl-median { color: rgba(0,212,255,0.5); }
.cl-above  { color: #c9a227bb; }
.cl-below  { color: #e8843a99; }
.cl-accepted { color: #4caf8099; }
.applicant-count {
  font-size: 0.75rem;
  color: #555;
  font-family: sans-serif;
}
.ref-note {
  font-size: 0.75rem;
  color: #555;
  font-family: sans-serif;
  font-weight: 300;
}
.ref-note a {
  color: #c9a227;
  text-decoration: none;
}
.btn-refresh {
  background: transparent;
  border: 1px solid #333;
  color: #888;
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 16px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.btn-refresh:hover:not(:disabled) {
  border-color: #888;
  color: #e8e8e8;
}
.btn-refresh:disabled {
  opacity: 0.4;
  cursor: default;
}

/* ─── Loading / Empty ────────────────────────────────────── */
.loading,
.empty-state {
  font-size: 0.85rem;
  color: #555;
  font-family: sans-serif;
  font-weight: 300;
  padding: 24px 0;
}

/* ─── Applicant Table ────────────────────────────────────── */
.applicant-table-wrapper {
  overflow-x: auto;
}
.applicant-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
}
.applicant-table th {
  text-align: left;
  font-size: 0.65rem;
  color: #555;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 8px 12px;
  border-bottom: 1px solid #1e1e1e;
  white-space: nowrap;
}
.applicant-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #1a1a1a;
  color: #bbb;
  font-family: sans-serif;
  font-weight: 300;
  vertical-align: top;
}
.applicant-table tr:hover td {
  background: #141414;
}
.row-accepted td { color: #7ec87e; }
.row-rejected td { color: #555; }
.td-name { font-weight: 400; color: #e8e8e8 !important; }
.name-link { cursor: pointer; }
.name-link:hover { color: #00d4ff; text-decoration: underline; }
.td-sub { font-size: 0.69rem; color: #555; margin-top: 2px; }
.td-profile { min-width: 120px; }
.td-cycle { white-space: nowrap; }
.td-mcat { font-size: 0.7rem; color: #666; margin-top: 2px; }
.td-num { font-weight: 400; color: #e8e8e8; }
.td-note { font-size: 0.72rem; color: #555; }
.td-date { white-space: nowrap; font-size: 0.72rem; }
.td-actions { white-space: nowrap; }
.td-actions-row { display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; }
.contract-signed {
  font-size: 0.68rem;
  color: #4caf80;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-family: sans-serif;
}
.contract-unsigned {
  font-size: 0.68rem;
  color: #444;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-family: sans-serif;
}
.btn-offer {
  display: inline-block;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #c9a227;
  border: 1px solid #c9a22766;
  padding: 4px 10px;
  text-decoration: none;
  border-radius: 2px;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}
.btn-offer:hover {
  background: #c9a227;
  color: #0d0d0d;
}
.btn-offer-sent {
  color: #555;
  border-color: #2a2a2a;
}
.btn-offer-sent:hover {
  background: #2a2a2a;
  color: #777;
}
.archetype-tag {
  font-size: 0.68rem;
  color: #888;
  border: 1px solid #2a2a2a;
  padding: 2px 6px;
  border-radius: 2px;
  white-space: nowrap;
}

/* ─── Status Select ──────────────────────────────────────── */
.status-select {
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  color: #bbb;
  font-family: sans-serif;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 2px;
  cursor: pointer;
  outline: none;
}
.status-select.status-accepted { border-color: #7ec87e44; color: #7ec87e; }
.status-select.status-rejected { border-color: #e0555544; color: #e05555; }
.status-select.status-reviewing { border-color: #c9a22744; color: #c9a227; }
.status-select.status-waitlist { border-color: #81bdfe44; color: #81bdfe; }

.detail-prompt {
  margin-top: 16px;
  font-size: 0.72rem;
  color: #444;
  font-family: sans-serif;
}

/* ─── Reference Panel ────────────────────────────────────── */
.reference-panel h2 {
  font-size: 0.95rem;
}
.ref-block {
  margin-bottom: 32px;
}
.ref-block h3 {
  font-size: 0.78rem;
  color: #c9a227;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.ref-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}
.ref-table td {
  padding: 9px 12px;
  border-bottom: 1px solid #1a1a1a;
  color: #aaa;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.6;
  vertical-align: top;
}
.ref-table td:first-child {
  color: #666;
  white-space: nowrap;
  min-width: 200px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.ref-table a {
  color: #81bdfe;
  text-decoration: none;
}
.ref-table a:hover { text-decoration: underline; }

/* ─── Scoring Flow ───────────────────────────────────────── */
.scoring-flow {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.score-stage {
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  padding: 14px 16px;
  border-radius: 2px;
  min-width: 140px;
  flex: 1;
}
.score-stage.highlight {
  border-color: #c9a227;
  min-width: 80px;
  flex: 0;
  display: flex;
  align-items: center;
}
.score-label {
  font-size: 0.68rem;
  color: #c9a227;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.score-stage.highlight .score-label {
  margin: 0;
}
.score-items {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.score-items span {
  font-size: 0.75rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
}
.score-arrow {
  font-size: 1rem;
  color: #333;
  padding-top: 14px;
  flex-shrink: 0;
}

/* ─── Links ──────────────────────────────────────────────── */
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
}
.ref-link {
  display: block;
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  color: #aaa;
  text-decoration: none;
  font-size: 0.8rem;
  font-family: sans-serif;
  font-weight: 300;
  padding: 12px 16px;
  border-radius: 2px;
  transition: border-color 0.2s, color 0.2s;
}
.ref-link:hover {
  border-color: #c9a22766;
  color: #e8e8e8;
}

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 700px) {
  .medprep-admin { padding: 24px 14px 60px; }
  .scoring-flow { flex-direction: column; }
  .score-arrow { transform: rotate(90deg); }
  .ref-table td:first-child { min-width: 140px; }
}

/* ─── Score badge (table) ────────────────────────────────── */
.score-badge {
  font-family: monospace;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.score-badge-empty { color: #333; font-size: 0.8rem; }

/* ─── Assess button (table) ─────────────────────────────── */
.btn-assess {
  background: transparent;
  border: 1px solid #2a2a2a;
  color: #666;
  font-family: 'Oswald', sans-serif;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 4px 10px;
  cursor: pointer;
  border-radius: 2px;
  transition: border-color 0.2s, color 0.2s;
  white-space: nowrap;
}
.btn-assess:hover { border-color: #c9a22766; color: #c9a227; }

/* ─── Assessment backdrop ────────────────────────────────── */
.assess-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 199;
  backdrop-filter: blur(2px);
}

/* ─── Assessment side panel ──────────────────────────────── */
.assess-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 100vw;
  height: 100vh;
  background: #080808;
  border-left: 1px solid #1e1e1e;
  z-index: 200;
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: 0;
}
.assess-panel.open { transform: translateX(0); }

.ap-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 20px 20px;
  border-bottom: 1px solid #141414;
}
.ap-name {
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  color: #e8e8e8;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.ap-meta {
  font-size: 0.7rem;
  color: #555;
  font-family: monospace;
  margin-top: 4px;
  letter-spacing: 0.04em;
}
.ap-close {
  background: transparent;
  border: none;
  color: #555;
  font-size: 1rem;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.2s;
}
.ap-close:hover { color: #e8e8e8; }

.ap-score-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #141414;
}
.ap-score-number {
  font-family: 'Oswald', sans-serif;
  font-size: 2.6rem;
  font-weight: 700;
  line-height: 1;
  transition: color 0.3s;
  text-shadow: 0 0 18px currentColor;
}
.ap-score-denom {
  font-family: monospace;
  font-size: 0.85rem;
  color: #444;
  padding-bottom: 4px;
}
.ap-score-label {
  font-family: monospace;
  font-size: 0.65rem;
  color: #444;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding-bottom: 4px;
  margin-left: auto;
}

.ap-dimensions {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  border-bottom: 1px solid #141414;
}
.ap-dim-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 7px;
}
.ap-dim-label {
  font-family: monospace;
  font-size: 0.7rem;
  color: #888;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.ap-dim-value {
  font-family: monospace;
  font-size: 0.78rem;
  font-weight: 700;
  transition: color 0.2s;
}

/* Custom range slider */
.ap-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 2px;
  border-radius: 1px;
  background: linear-gradient(
    to right,
    var(--fill, #c9a227) var(--pct, 50%),
    #1e1e1e var(--pct, 50%)
  );
  outline: none;
  cursor: pointer;
}
.ap-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--fill, #c9a227);
  box-shadow: 0 0 8px var(--fill, #c9a227);
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.ap-slider::-webkit-slider-thumb:hover {
  box-shadow: 0 0 14px var(--fill, #c9a227);
}
.ap-slider::-moz-range-thumb {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: none;
  background: var(--fill, #c9a227);
  box-shadow: 0 0 8px var(--fill, #c9a227);
  cursor: pointer;
}

.ap-notes-wrap {
  padding: 16px 20px;
  border-bottom: 1px solid #141414;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ap-notes-label {
  font-family: monospace;
  font-size: 0.65rem;
  color: #555;
  letter-spacing: 0.1em;
}
.ap-notes-input {
  background: #0d0d0d;
  border: 1px solid #1e1e1e;
  color: #bbb;
  font-family: monospace;
  font-size: 0.78rem;
  line-height: 1.6;
  padding: 10px 12px;
  border-radius: 2px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}
.ap-notes-input:focus { border-color: #c9a22744; }

.ap-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  margin-top: auto;
}
.ap-save-status {
  font-family: monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
}
.save-idle    { color: transparent; }
.save-unsaved { color: #e8843a; }
.save-saving  { color: #888; }
.save-saved   { color: #4caf80; }

.ap-save-btn {
  background: transparent;
  border: 1px solid #c9a22766;
  color: #c9a227;
  font-family: 'Oswald', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 6px 20px;
  cursor: pointer;
  border-radius: 2px;
  transition: background 0.2s, border-color 0.2s;
}
.ap-save-btn:hover { background: rgba(201,162,39,0.08); border-color: #c9a227; }
</style>
