<template>
  <div class="bbpquiz-page" :style="cssVars">
    <!-- ── Intro / name capture ────────────────────────────────────────────── -->
    <div v-if="phase === 'intro'" class="bbpquiz-slide bbpquiz-slide--active">
      <div class="bbpquiz-intro">
        <p class="bbpquiz-eyebrow">Bitcoin Block Party {{ BBP.year }}</p>
        <h1 class="bbpquiz-title">Bitcoin Quiz</h1>
        <p class="bbpquiz-subtitle">
          {{ questions.filter(q => q.type !== 'information').length }} questions &nbsp;·&nbsp;
          Bitcoin knowledge &nbsp;·&nbsp; Prizes for top scores
        </p>
        <label class="bbpquiz-name-label" for="bbpquiz-name">Your name (for leaderboard)</label>
        <input
          id="bbpquiz-name"
          v-model="playerName"
          class="bbpquiz-name-input"
          type="text"
          placeholder="Enter your name…"
          maxlength="40"
          @keyup.enter="startQuiz"
          autocomplete="off"
        />
        <button class="bbpquiz-btn bbpquiz-btn-primary" @click="startQuiz" :disabled="!playerName.trim()">
          Start Quiz →
        </button>
        <button class="bbpquiz-lb-btn" @click="openLeaderboard">🏆 View Leaderboard</button>
      </div>
    </div>

    <!-- ── Question slides ────────────────────────────────────────────────── -->
    <template v-if="phase === 'quiz'">
      <!-- Quick nav dots -->
      <div class="bbpquiz-nav">
        <span
          v-for="(q, i) in questions"
          :key="i"
          class="bbpquiz-dot"
          :class="{
            'bbpquiz-dot--current':    currentIndex === i,
            'bbpquiz-dot--done':       answers[i] && q.type !== 'information',
            'bbpquiz-dot--info':       q.type === 'information',
          }"
          @click="goTo(i)"
          :title="q.category || 'Q' + (getQuestionNumber(i) || '')"
        >{{ q.type === 'information' ? '' : (getQuestionNumber(i) || '?') }}</span>
        <span class="bbpquiz-nav-score">{{ calculateScore() }} / {{ scoredCount }}</span>
        <button class="bbpquiz-lb-btn-sm" @click="openLeaderboard">🏆</button>
      </div>

      <!-- Individual slide -->
      <div
        v-for="(q, i) in questions"
        :key="i"
        class="bbpquiz-slide"
        :class="{
          'bbpquiz-slide--active':   currentIndex === i,
          'bbpquiz-slide--prev':     currentIndex > i,
          'bbpquiz-slide--next':     currentIndex < i,
        }"
      >
        <div class="bbpquiz-question">
          <p class="bbpquiz-category">{{ q.category }}</p>
          <h2 class="bbpquiz-q-text" v-html="formatText(q.text)"></h2>

          <!-- Hint area -->
          <div v-if="q.subtext" class="bbpquiz-hint-area">
            <button v-if="!hintState[i]" class="bbpquiz-hint-btn" @click="hintState[i] = 'warn'">
              💡 Show Hint
            </button>
            <div v-else-if="hintState[i] === 'warn'" class="bbpquiz-hint-warn">
              <p>⚠️ Using a hint costs <strong>-1 point</strong>. Are you sure?</p>
              <div class="bbpquiz-hint-warn-btns">
                <button @click="revealHint(i)">Yes, show it</button>
                <button @click="hintState[i] = null">Never mind</button>
              </div>
            </div>
            <p v-else-if="hintState[i] === 'shown'" class="bbpquiz-hint-text" v-html="formatText(q.subtext)"></p>
          </div>

          <!-- Locked answer indicator (text/date only — MC uses button colours, mining uses its own UI) -->
          <p v-if="lockedAnswers[i] && q.type !== 'mining' && q.type !== 'multiple-choice'" class="bbpquiz-locked-note">✓ Collected</p>

          <!-- Text input -->
          <input
            v-if="q.type === 'text' && !lockedAnswers[i]"
            v-model="answers[i]"
            type="text"
            class="bbpquiz-input"
            placeholder="Type your answer…"
            @input="handleInput(i)"
            @keyup.enter="checkAnswer(i)"
          />

          <!-- Date picker -->
          <input
            v-if="q.type === 'date' && !lockedAnswers[i]"
            v-model="answers[i]"
            type="date"
            class="bbpquiz-input bbpquiz-date-input"
            @change="checkAnswer(i)"
          />

          <!-- Multiple choice -->
          <div v-if="q.type === 'multiple-choice'" class="bbpquiz-options">
            <button
              v-for="opt in q.options"
              :key="opt"
              class="bbpquiz-option"
              :class="{
                'bbpquiz-option--selected': answers[i] === opt && !feedback[i],
                'bbpquiz-option--correct':  feedback[i] && opt === q.answer,
                'bbpquiz-option--wrong':    feedback[i] === 'incorrect' && answers[i] === opt,
              }"
              :disabled="!!lockedAnswers[i]"
              @click="selectOption(i, opt)"
            >{{ opt }}</button>
          </div>

          <!-- Mining / SHA-256 challenge -->
          <div v-if="q.type === 'mining'" class="bbpquiz-mining">
            <div class="bbpquiz-mining-row">
              <input
                v-model="miningInput[i]"
                type="text"
                class="bbpquiz-input"
                placeholder="Enter any message or number…"
                @keyup.enter="mine(i, q.target_zeros || 3)"
              />
              <button
                class="bbpquiz-mine-btn"
                @click="mine(i, q.target_zeros || 3)"
                :disabled="!!miningLoading[i] || !!lockedAnswers[i]"
              >{{ lockedAnswers[i] ? '✓ Mined!' : miningLoading[i] ? 'Hashing…' : '⛏ Mine' }}</button>
            </div>
            <div v-if="miningHash[i]" class="bbpquiz-mining-result" :class="{ 'bbpquiz-mining-result--valid': miningValid[i] }">
              <span class="bbpquiz-hash-label">SHA-256:</span>
              <code class="bbpquiz-hash"><span v-if="miningValid[i]" class="bbpquiz-hash-zeros">{{ miningHash[i].slice(0, q.target_zeros || 3) }}</span>{{ miningHash[i].slice(miningValid[i] ? (q.target_zeros || 3) : 0) }}</code>
              <p v-if="miningValid[i]" class="bbpquiz-mining-success">✓ Valid hash found — you mined a block!</p>
              <p v-else class="bbpquiz-mining-fail">No leading zeros yet — try a different message.</p>
            </div>
            <p v-if="miningAttempts[i]" class="bbpquiz-mining-attempts">{{ miningAttempts[i] }} attempt{{ miningAttempts[i] === 1 ? '' : 's' }}</p>
          </div>

          <!-- Feedback (not shown for mining — its own UI handles it) -->
          <p
            v-if="feedback[i] && q.type !== 'mining'"
            class="bbpquiz-feedback"
            :class="feedback[i] === 'correct' ? 'bbpquiz-feedback--correct' : 'bbpquiz-feedback--wrong'"
          >
            {{ feedback[i] === 'correct' ? 'Correct!' : q.type === 'multiple-choice' ? 'Incorrect.' : 'Incorrect — try again.' }}
          </p>

          <!-- Controls -->
          <div class="bbpquiz-controls">
            <button v-if="i > 0" @click="goTo(i - 1)">← Back</button>
            <span v-if="q.type !== 'information'" class="bbpquiz-q-counter">
              {{ getQuestionNumber(i) }} / {{ scoredCount }}
            </span>
            <button v-if="i < questions.length - 1" @click="goTo(i + 1)">
              {{ q.type === 'information' ? 'Begin' : 'Next →' }}
            </button>
            <button v-if="i === questions.length - 1" class="bbpquiz-btn-finish" @click="finish">
              Finish
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Score slide ─────────────────────────────────────────────────────── -->
    <div v-if="phase === 'score'" class="bbpquiz-slide bbpquiz-slide--active">
      <div class="bbpquiz-score">
        <h2>🏆 Nice work, {{ playerName || 'Anon' }}!</h2>
        <p class="bbpquiz-score-number">{{ calculateScore() }} / {{ scoredCount }}</p>
        <p class="bbpquiz-score-prize">Top scores win Bitcoin. Submit to enter the leaderboard.</p>
        <button
          class="bbpquiz-btn bbpquiz-btn-primary"
          @click="submitScore"
          :disabled="scoreSubmitted || submitting"
        >
          {{ scoreSubmitted ? 'Submitted ✓' : submitting ? 'Submitting…' : 'Submit Score' }}
        </button>
        <p v-if="submitError" class="bbpquiz-submit-error">{{ submitError }}</p>
        <div class="bbpquiz-score-btns">
          <button @click="editAnswers">Edit Answers</button>
          <button @click="restart">Start Over</button>
        </div>
        <button class="bbpquiz-lb-btn" @click="openLeaderboard">🏆 View Leaderboard</button>
      </div>
    </div>

    <!-- ── Leaderboard overlay ─────────────────────────────────────────────── -->
    <div v-if="viewingLeaderboard" class="bbpquiz-lb-overlay">
      <div class="bbpquiz-lb-panel">
        <h2>🏆 Leaderboard</h2>
        <div v-if="lbLoading" class="bbpquiz-lb-loading">Loading…</div>
        <ol v-else-if="leaderboard.length" class="bbpquiz-lb-list">
          <li v-for="(entry, idx) in leaderboard" :key="idx" class="bbpquiz-lb-entry">
            <span class="bbpquiz-lb-rank">{{ idx + 1 }}</span>
            <span class="bbpquiz-lb-name">{{ entry.name }}</span>
            <span class="bbpquiz-lb-score">{{ entry.score }} / {{ entry.total }}</span>
          </li>
        </ol>
        <p v-else class="bbpquiz-lb-empty">No scores yet — be the first!</p>
        <button class="bbpquiz-lb-back" @click="viewingLeaderboard = false">← Back</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useHead } from '@vueuse/head'
import { BITCOIN_BLOCK_PARTY as BBP } from '@/config/bitcoinBlockPartyConfig.js'
import { festivall_db } from '@/firebase.js'
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore'
import rawQuestions from '@/data/bitcoinQuizQuestions.json'

useHead({
  title: `Bitcoin Quiz — Bitcoin Block Party ${BBP.year}`,
  meta: [
    { name: 'description', content: 'Test your Bitcoin knowledge and compete for prizes at the Bitcoin Block Party.' },
  ],
})

// ── Questions ─────────────────────────────────────────────────────────────────
const questions = rawQuestions

const scoredCount = computed(() => questions.filter(q => q.type !== 'information').length)

function getQuestionNumber(i) {
  let n = 0
  for (let j = 0; j <= i; j++) {
    if (questions[j]?.type !== 'information') n++
  }
  return questions[i]?.type !== 'information' ? n : null
}

function goTo(i) {
  currentIndex.value = i
}

// ── State ─────────────────────────────────────────────────────────────────────
const phase        = ref('intro') // 'intro' | 'quiz' | 'score'
const playerName   = ref('')
const currentIndex = ref(0)
const answers      = ref(questions.map(() => ''))
const feedback     = ref(questions.map(() => null))
const hintState    = ref({}) // i → null | 'warn' | 'shown'
const hintsUsed    = ref({}) // i → true
const lockedAnswers = ref({})
const scoreSubmitted = ref(false)
const submitting     = ref(false)
const submitError    = ref('')

// ── Mining challenge state ──────────────────────────────────────────────────────
const miningInput    = reactive({})  // index → message string
const miningHash     = reactive({})  // index → last computed hex
const miningValid    = reactive({})  // index → boolean
const miningLoading  = reactive({})  // index → boolean
const miningAttempts = reactive({})  // index → attempt count

// ── Progress persistence ──────────────────────────────────────────────────────
const STORAGE_KEY = `bbp_quiz_progress_2026_v2`

function persistProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      phase: phase.value,
      playerName: playerName.value,
      currentIndex: currentIndex.value,
      answers: answers.value,
      feedback: feedback.value,
      hintState: hintState.value,
      hintsUsed: hintsUsed.value,
      lockedAnswers: lockedAnswers.value,
      scoreSubmitted: scoreSubmitted.value,
    }))
  } catch (_) {}
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const s = JSON.parse(raw)
    if (!s) return
    playerName.value    = s.playerName || ''
    currentIndex.value  = typeof s.currentIndex === 'number' ? s.currentIndex : 0
    answers.value       = Array.isArray(s.answers)    ? s.answers    : questions.map(() => '')
    feedback.value      = Array.isArray(s.feedback)   ? s.feedback   : questions.map(() => null)
    hintState.value     = s.hintState    || {}
    hintsUsed.value     = s.hintsUsed    || {}
    lockedAnswers.value = s.lockedAnswers || {}
    scoreSubmitted.value = !!s.scoreSubmitted
    if (s.phase === 'quiz' || s.phase === 'score') phase.value = s.phase
  } catch (_) {}
}

onMounted(() => {
  loadProgress()
})

// ── Quiz control ───────────────────────────────────────────────────────────────
function startQuiz() {
  if (!playerName.value.trim()) return
  phase.value = 'quiz'
  currentIndex.value = 0
  persistProgress()
}

function finish() {
  phase.value = 'score'
  persistProgress()
}

function editAnswers() {
  const idx = questions.findIndex((q, i) => q.type !== 'information' && !answers.value[i])
  currentIndex.value = idx !== -1 ? idx : 0
  phase.value = 'quiz'
}

function restart() {
  phase.value = 'intro'
  currentIndex.value = 0
  answers.value   = questions.map(() => '')
  feedback.value  = questions.map(() => null)
  hintState.value = {}
  hintsUsed.value = {}
  lockedAnswers.value = {}
  scoreSubmitted.value = false
  submitError.value = ''
  try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
}

// ── Hints ─────────────────────────────────────────────────────────────────────
function revealHint(i) {
  hintState.value = { ...hintState.value, [i]: 'shown' }
  hintsUsed.value = { ...hintsUsed.value, [i]: true }
  persistProgress()
}

// ── Answer checking ───────────────────────────────────────────────────────────
function checkAnswer(i) {
  const q = questions[i]
  if (!q || q.type === 'information') return
  const input = (answers.value[i] || '').trim().toLowerCase()
  if (!q.answer) return
  const correct = q.answer.toLowerCase()
  // Accept close-enough matches: strip leading 'a '/'the ', check substring for long answers
  const normalized = input.replace(/^(a |the |an )/, '')
  const ok = input === correct || normalized === correct || correct.includes(input) && input.length > 3
  feedback.value = { ...feedback.value, [i]: ok ? 'correct' : 'incorrect' }
  persistProgress()
}

function handleInput(i) {
  checkAnswer(i)
}

// ── Multiple choice ────────────────────────────────────────────────────────────────
function selectOption(i, opt) {
  if (lockedAnswers.value[i]) return
  answers.value[i] = opt
  checkAnswer(i)
  lockedAnswers.value = { ...lockedAnswers.value, [i]: true }
  persistProgress()
}

// ── SHA-256 mining challenge ─────────────────────────────────────────────────────
async function sha256hex(message) {
  const buf  = new TextEncoder().encode(message)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function mine(i, targetZeros) {
  if (miningLoading[i] || lockedAnswers.value[i]) return
  const input = (miningInput[i] || '').trim()
  if (!input) return
  miningLoading[i]  = true
  miningAttempts[i] = (miningAttempts[i] || 0) + 1
  const hash  = await sha256hex(input)
  miningHash[i]  = hash
  const valid = hash.startsWith('0'.repeat(targetZeros))
  miningValid[i] = valid
  if (valid) {
    answers.value[i]   = hash
    feedback.value     = { ...feedback.value,     [i]: 'correct' }
    lockedAnswers.value = { ...lockedAnswers.value, [i]: true }
    persistProgress()
  }
  miningLoading[i] = false
}

// ── Score ──────────────────────────────────────────────────────────────────────────────────────────────────────────
function calculateScore() {
  let score = 0
  questions.forEach((q, i) => {
    if (q.type !== 'information' && feedback.value[i] === 'correct') score++
  })
  const hintPenalty = Object.keys(hintsUsed.value).length
  return Math.max(0, score - hintPenalty)
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
const viewingLeaderboard = ref(false)
const leaderboard        = ref([])
const lbLoading          = ref(false)

async function fetchLeaderboard() {
  lbLoading.value = true
  try {
    const col = collection(festivall_db, BBP.collections.quizLeaderboard)
    const q   = query(col, orderBy('score', 'desc'), limit(20))
    const snap = await getDocs(q)
    leaderboard.value = snap.docs.map(d => d.data())
  } catch (e) {
    console.warn('Leaderboard fetch error:', e)
  } finally {
    lbLoading.value = false
  }
}

function openLeaderboard() {
  viewingLeaderboard.value = true
  fetchLeaderboard()
}

async function submitScore() {
  if (scoreSubmitted.value || submitting.value) return
  submitting.value = true
  submitError.value = ''
  const score = calculateScore()
  try {
    await addDoc(collection(festivall_db, BBP.collections.quizLeaderboard), {
      name:       (playerName.value || 'Anon').trim().slice(0, 40),
      score,
      total:      scoredCount.value,
      hints_used: Object.keys(hintsUsed.value).length,
      submitted_at: new Date().toISOString(),
    })
    scoreSubmitted.value = true
    persistProgress()
  } catch (e) {
    submitError.value = 'Could not submit score. Please try again.'
    console.error('Score submit error:', e)
  } finally {
    submitting.value = false
  }
}

// ── Text formatting ────────────────────────────────────────────────────────────
function formatText(text) {
  if (!text) return ''
  return text.replace(/\n/g, '<br>')
}

// ── CSS vars ──────────────────────────────────────────────────────────────────
const cssVars = computed(() => ({
  '--bbp-purple': BBP.palette.purple,
  '--bbp-teal':   BBP.palette.teal,
  '--bbp-orange': BBP.palette.orange,
  '--bbp-tan':    BBP.palette.tan,
  '--bbp-cream':  BBP.palette.cream,
}))
</script>

<style scoped>
/* ── Base ──────────────────────────────────────────────────────────────────── */
.bbpquiz-page {
  min-height: 100dvh;
  background: var(--bbp-cream);
  color: var(--bbp-teal);
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* ── Slides ─────────────────────────────────────────────────────────────────── */
.bbpquiz-slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s;
  opacity: 0;
  pointer-events: none;
  min-height: 100dvh;
}
.bbpquiz-slide--active {
  position: relative;
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}
.bbpquiz-slide--prev  { transform: translateX(-100%); }
.bbpquiz-slide--next  { transform: translateX(100%); }

/* ── Intro ──────────────────────────────────────────────────────────────────── */
.bbpquiz-intro {
  max-width: 440px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}
.bbpquiz-eyebrow {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--bbp-teal);
  margin: 0;
}
.bbpquiz-title {
  font-size: clamp(2.4rem, 8vw, 4rem);
  font-weight: 900;
  color: var(--bbp-teal);
  margin: 0;
  line-height: 1.05;
}
.bbpquiz-subtitle {
  font-size: 0.9rem;
  color: var(--bbp-tan);
  margin: 0;
}
.bbpquiz-name-label {
  font-size: 0.85rem;
  color: var(--bbp-tan);
  align-self: flex-start;
}
.bbpquiz-name-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--bbp-tan);
  background: white;
  color: var(--bbp-dark);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s;
}
.bbpquiz-name-input:focus { border-color: var(--bbp-teal); }

/* ── Buttons ─────────────────────────────────────────────────────────────────── */
.bbpquiz-btn {
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s;
}
.bbpquiz-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.bbpquiz-btn-primary  { background: var(--bbp-orange); color: #fff; }
.bbpquiz-btn-primary:hover:not(:disabled) { opacity: 0.88; }
.bbpquiz-lb-btn {
  background: transparent;
  border: 1px solid var(--bbp-tan);
  border-radius: 4px;
  color: var(--bbp-teal);
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
}
.bbpquiz-lb-btn:hover { background: rgba(7,94,114,0.06); }

/* ── Nav dots ────────────────────────────────────────────────────────────────── */
.bbpquiz-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: rgba(244,242,230,0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(188,186,165,0.5);
  padding: 0.6rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  overflow-x: auto;
}
.bbpquiz-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid rgba(188,186,165,0.8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
  color: var(--bbp-teal);
}
.bbpquiz-dot--current { border-color: var(--bbp-orange); background: rgba(200,63,15,0.3); }
.bbpquiz-dot--done    { background: rgba(7,94,114,0.4); border-color: var(--bbp-teal); }
.bbpquiz-dot--info    { opacity: 0.35; cursor: default; }
.bbpquiz-nav-score {
  margin-left: auto;
  font-size: 0.82rem;
  color: var(--bbp-tan);
  white-space: nowrap;
}
.bbpquiz-lb-btn-sm {
  background: transparent;
  border: none;
  color: var(--bbp-teal);
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  flex-shrink: 0;
}

/* ── Question ────────────────────────────────────────────────────────────────── */
.bbpquiz-question {
  max-width: 540px;
  width: 100%;
  padding-top: 3.5rem; /* clear fixed nav */
}
.bbpquiz-category {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--bbp-teal);
  margin: 0 0 0.5rem;
}
.bbpquiz-q-text {
  font-size: clamp(1.2rem, 4vw, 1.6rem);
  font-weight: 700;
  line-height: 1.4;
  margin: 0 0 1.5rem;
  color: var(--bbp-teal);
}

/* ── Hint ──────────────────────────────────────────────────────────────────── */
.bbpquiz-hint-area { margin-bottom: 1rem; }
.bbpquiz-hint-btn {
  background: transparent;
  border: 1px solid var(--bbp-tan);
  border-radius: 4px;
  color: var(--bbp-purple);
  padding: 0.4rem 0.85rem;
  cursor: pointer;
  font-size: 0.85rem;
}
.bbpquiz-hint-warn {
  background: rgba(200,63,15,0.07);
  border: 1px solid rgba(200,63,15,0.3);
  border-radius: 6px;
  padding: 0.85rem 1rem;
  font-size: 0.88rem;
  color: var(--bbp-dark);
}
.bbpquiz-hint-warn p { margin: 0 0 0.6rem; }
.bbpquiz-hint-warn-btns { display: flex; gap: 0.5rem; }
.bbpquiz-hint-warn-btns button {
  padding: 0.35rem 0.8rem;
  border-radius: 4px;
  border: 1px solid var(--bbp-tan);
  background: rgba(255,255,255,0.6);
  color: var(--bbp-dark);
  cursor: pointer;
  font-size: 0.82rem;
}
.bbpquiz-hint-text {
  font-size: 0.88rem;
  color: var(--bbp-tan);
  background: rgba(7,94,114,0.12);
  border-radius: 4px;
  padding: 0.6rem 0.85rem;
  margin: 0;
  line-height: 1.55;
}

/* ── Input ───────────────────────────────────────────────────────────────────── */
.bbpquiz-locked-note {
  font-size: 0.85rem;
  color: var(--bbp-teal);
  margin: 0 0 0.5rem;
}
.bbpquiz-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  border: 1.5px solid var(--bbp-tan);
  background: white;
  color: var(--bbp-dark);
  font-size: 1rem;
  margin-bottom: 0.75rem;
  outline: none;
  transition: border-color 0.15s;
}
.bbpquiz-input:focus { border-color: var(--bbp-teal); }

/* ── Feedback ────────────────────────────────────────────────────────────────── */
.bbpquiz-feedback { font-size: 0.9rem; margin: 0 0 0.75rem; font-weight: 600; }
.bbpquiz-feedback--correct { color: #5ed3a0; }
.bbpquiz-feedback--wrong   { color: #ff6b6b; }

/* ── Controls ────────────────────────────────────────────────────────────────── */
.bbpquiz-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}
.bbpquiz-controls button {
  padding: 0.6rem 1.25rem;
  border-radius: 4px;
  border: 1px solid var(--bbp-tan);
  background: rgba(255,255,255,0.7);
  color: var(--bbp-teal);
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.1s;
}
.bbpquiz-controls button:hover { background: rgba(255,255,255,0.95); }
.bbpquiz-q-counter {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--bbp-tan);
}
.bbpquiz-btn-finish {
  margin-left: auto;
  padding: 0.6rem 1.5rem;
  border-radius: 4px;
  border: none;
  background: var(--bbp-orange);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

/* ── Score slide ─────────────────────────────────────────────────────────────── */
.bbpquiz-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
  max-width: 420px;
}
.bbpquiz-score h2 { font-size: 1.8rem; font-weight: 800; margin: 0; }
.bbpquiz-score-number {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--bbp-orange);
  margin: 0;
  line-height: 1;
}
.bbpquiz-score-prize { font-size: 0.9rem; color: var(--bbp-tan); margin: 0; }
.bbpquiz-submit-error { font-size: 0.82rem; color: #ff6b6b; margin: 0; }
.bbpquiz-score-btns {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}
.bbpquiz-score-btns button {
  padding: 0.5rem 1.25rem;
  border-radius: 4px;
  border: 1px solid var(--bbp-tan);
  background: rgba(255,255,255,0.7);
  color: var(--bbp-teal);
  cursor: pointer;
  font-size: 0.9rem;
}

/* ── Leaderboard overlay ──────────────────────────────────────────────────────── */
.bbpquiz-lb-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1.5rem;
}
.bbpquiz-lb-panel {
  background: var(--bbp-cream);
  border: 1px solid var(--bbp-tan);
  border-radius: 12px;
  padding: 2rem 1.75rem;
  max-width: 420px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}
.bbpquiz-lb-panel h2 { margin: 0 0 1.25rem; font-size: 1.4rem; color: var(--bbp-teal); }
.bbpquiz-lb-loading { color: var(--bbp-dark); }
.bbpquiz-lb-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.bbpquiz-lb-entry {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: rgba(7,94,114,0.05);
}
.bbpquiz-lb-rank  { font-weight: 800; color: var(--bbp-orange); min-width: 1.5rem; }
.bbpquiz-lb-name  { flex: 1; font-size: 0.95rem; }
.bbpquiz-lb-score { font-size: 0.9rem; color: var(--bbp-teal); font-weight: 700; }
.bbpquiz-lb-empty { color: var(--bbp-dark); font-size: 0.9rem; }
.bbpquiz-lb-back {
  background: transparent;
  border: 1px solid var(--bbp-tan);
  border-radius: 4px;
  color: var(--bbp-teal);
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.88rem;
}

/* ── Date input ──────────────────────────────────────────────────────────────────── */
.bbpquiz-date-input {
  cursor: pointer;
  color-scheme: light; /* keep native date picker light on all platforms */
}

/* ── Multiple choice ─────────────────────────────────────────────────────────────── */
.bbpquiz-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  margin-bottom: 0.75rem;
}
.bbpquiz-option {
  padding: 0.85rem 0.75rem;
  border-radius: 6px;
  border: 1.5px solid var(--bbp-tan);
  background: rgba(255,255,255,0.7);
  color: var(--bbp-teal);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  font-family: inherit;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.bbpquiz-option:hover:not(:disabled) {
  border-color: var(--bbp-teal);
  background: rgba(255,255,255,0.95);
}
.bbpquiz-option:disabled { cursor: default; }
.bbpquiz-option--selected { border-color: var(--bbp-teal); background: rgba(7,94,114,0.07); }
.bbpquiz-option--correct  { border-color: #2a8c5a; background: rgba(42,140,90,0.1);  color: #2a8c5a; font-weight: 700; }
.bbpquiz-option--wrong    { border-color: #c94a4a; background: rgba(201,74,74,0.08); color: #c94a4a; }

/* ── Mining challenge ────────────────────────────────────────────────────────────── */
.bbpquiz-mining {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.bbpquiz-mining-row {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}
.bbpquiz-mining-row .bbpquiz-input { flex: 1; margin-bottom: 0; }
.bbpquiz-mine-btn {
  padding: 0.8rem 1.25rem;
  border-radius: 6px;
  border: none;
  background: var(--bbp-teal);
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.15s;
}
.bbpquiz-mine-btn:hover:not(:disabled) { opacity: 0.85; }
.bbpquiz-mine-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.bbpquiz-mining-result {
  background: rgba(0,0,0,0.04);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--bbp-tan);
}
.bbpquiz-mining-result--valid {
  border-color: #2a8c5a;
  background: rgba(42,140,90,0.07);
}
.bbpquiz-hash-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--bbp-purple);
  margin-bottom: 0.3rem;
}
.bbpquiz-hash {
  display: block;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.75rem;
  word-break: break-all;
  color: var(--bbp-dark);
  line-height: 1.6;
}
.bbpquiz-hash-zeros { color: var(--bbp-orange); font-weight: 900; }
.bbpquiz-mining-success {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #2a8c5a;
}
.bbpquiz-mining-fail {
  margin: 0.5rem 0 0;
  font-size: 0.82rem;
  color: var(--bbp-purple);
}
.bbpquiz-mining-attempts {
  font-size: 0.75rem;
  color: var(--bbp-purple);
  margin: 0;
  opacity: 0.65;
}
</style>
