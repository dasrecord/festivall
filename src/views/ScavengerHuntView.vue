<template>
  <div class="form-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <!-- Difficulty Selector -->
    <div class="form-slide" :class="{ active: difficulty === null, previous: difficulty !== null }">
      <div class="difficulty-selector">
        <h1>Reunion<br>Scavenger Hunt</h1>
        <p class="selector-subtitle">Choose your path</p>
        <div class="difficulty-options">
          <div class="difficulty-option junior" @click="selectDifficulty('junior')">
            <span class="diff-icon">🧒</span>
            <h2>Junior</h2>
            <p>12 challenges</p>
            <p>For the young adventurers</p>
          </div>
          <div class="difficulty-option senior" @click="selectDifficulty('senior')">
            <span class="diff-icon">🎓</span>
            <h2>Senior</h2>
            <p>21 DIFFICULT challenges</p>
            <p class="diff-prize">⚡ Bitcoin prizes for top 5</p>
          </div>
        </div>
        <button class="leaderboard-link-btn" @click="openLeaderboard">🏆 View Leaderboard</button>
      </div>
    </div>

    <!-- Quick Navigation -->
    <div class="quick-nav" v-if="difficulty !== null && currentQuestion !== 'score'">
      <div class="nav-dots">
        <span
          v-for="(question, index) in questions"
          :key="index"
          class="nav-dot"
          :class="{
            current: currentQuestion === index,
            completed: answers[index] && question.type !== 'information',
            information: question.type === 'information'
          }"
          @click="goToQuestion(index)"
          :title="question.category || 'Question ' + (getQuestionNumber(index) || '')"
        >
          {{ question.type === 'information' ? '' : getQuestionNumber(index) || '?' }}
        </span>
      </div>
      <div class="nav-score" v-if="showFeedback">Score: {{ calculateScore() }}/{{ countScoredQuestions() }}</div>
      <div class="nav-hints" v-if="Object.keys(hintsUsed).length > 0">💡 {{ Object.keys(hintsUsed).length }} hints used<br />{{ Object.keys(hintsUsed).length > 1 ? 's' : '' }} (-{{ Object.keys(hintsUsed).length }} pts)</div>
      <button v-if="difficulty === 'senior'" class="leaderboard-link-btn nav-toolkit-btn" @click="viewingToolkit = true">🧰</button>
      <button class="leaderboard-link-btn nav-leaderboard-btn" @click="openLeaderboard">🏆</button>
    </div>

    <!-- Question Slides -->
    <template v-if="difficulty !== null">
      <div
        class="form-slide"
        v-for="(question, index) in questions"
        :key="index"
        :class="{
          active: currentQuestion === index,
          previous: currentQuestion > index,
          next: currentQuestion < index
        }"
      >
        <div class="question">
          <img v-if="question.icon" :src="question.icon" alt="Category Icon" class="category-icon" />
          
          <h1 v-html="formatText(question.category)"></h1>
          <h2 v-html="formatText(question.text)"></h2>
          <img v-if="question.image" :src="question.image" alt="Question Image" />
          <!-- Hint reveal with friction -->
          <template v-if="question.subtext">
            <div class="hint-area">
              <!-- Junior: no friction, free hints -->
              <template v-if="difficulty === 'junior'">
                <button
                  v-if="!hintState[index]"
                  class="hint-trigger-btn"
                  @click="revealHint(index)"
                >💡 Show Hint</button>
                <p v-else-if="hintState[index] === 'shown'" class="hint-revealed" v-html="formatText(question.subtext)"></p>
              </template>

              <!-- Senior: two-step warning with penalty -->
              <template v-else>
                <!-- Step 0: offer hint -->
                <button
                  v-if="!hintState[index]"
                  class="hint-trigger-btn"
                  @click="hintState[index] = 'warn1'; $forceUpdate()"
                >💡 Show Hint</button>

                <!-- Step 1: first warning -->
                <div v-else-if="hintState[index] === 'warn1'" class="hint-warn">
                  <p class="hint-warn-text">⚠️ This is a <strong>Bitcoin competition</strong>. This may have an impact on your score and ranking. Are you sure?</p>
                  <div class="hint-warn-actions">
                    <button class="hint-warn-yes" @click="hintState[index] = 'warn2'; $forceUpdate()">Yes, I need it</button>
                    <button class="hint-warn-no" @click="hintState[index] = null; $forceUpdate()">Never mind</button>
                  </div>
                </div>

                <!-- Step 2: last chance -->
                <div v-else-if="hintState[index] === 'warn2'" class="hint-warn">
                  <p class="hint-warn-text">🚨 <strong>Last chance.</strong> This will cost you <strong>-1 point</strong>. The top competitors won't need this.</p>
                  <div class="hint-warn-actions">
                    <button class="hint-warn-yes" @click="revealHint(index)">Show the hint</button>
                    <button class="hint-warn-no" @click="hintState[index] = null; $forceUpdate()">Actually, no</button>
                  </div>
                </div>

                <!-- Hint revealed -->
                <p v-else-if="hintState[index] === 'shown'" class="hint-revealed" v-html="formatText(question.subtext)"></p>
              </template>
            </div>
          </template>
          
                    <!-- Live SHA256 preview -->
                    <div v-if="question.validation?.type === 'sha256-leading-zeros' && answers[index]?.trim()" class="sha-preview">
                      <span class="sha-label">SHA256:</span>
                      <span class="sha-hash" :class="{ 'sha-match': liveHashes[index]?.startsWith('00') }">{{ liveHashes[index] || '…' }}</span>
                    </div>
          
          <!-- Input for answers -->
          <p v-if="lockedAnswers[index]" class="answer-locked-note">Points Collected. Well done.</p>

          <input
            v-if="question.type === 'text' && !lockedAnswers[index]"
            type="text"
            v-model="answers[index]"
            @input="handleInput(index)"
            @keyup.enter="checkAnswer(index)"
            placeholder="Type your answer here..."
          />

          <!-- Live ROT13 preview -->
          <div v-if="question.validation?.type === 'rot13' && answers[index]?.trim()" class="sha-preview">
            <span class="sha-label">Result:</span>
            <span class="sha-hash" :class="{ 'sha-match': liveRot13s[index] === question.validation.encoded }">{{ liveRot13s[index] || '…' }}</span>
          </div>

          <!-- Feedback for correct/incorrect answers -->
          <p
            v-if="showFeedback && feedback[index]"
            :class="{
              correct: feedback[index] === 'correct',
              incorrect: feedback[index] === 'incorrect'
            }"
          >
            {{ feedback[index] === 'correct' ? 'Correct!' : 'Incorrect.' }}
          </p>

          <!-- Navigation buttons -->
          <div class="controls">
            <button v-if="index > 0" @click="prevQuestion">Previous</button>
            <p v-if="index > 0 && question.type === 'text'">
              {{ getQuestionNumber(index) }}/{{ countScoredQuestions() }}
            </p>
            <button v-if="index < questions.length - 1" @click="nextQuestion">
              {{ question.type === 'information' ? 'Begin' : 'Next' }}
            </button>
            <button v-if="index === questions.length - 1" @click="showScoreSlide">Finish</button>
          </div>
        </div>
      </div>
    </template>

    <!-- Score Slide -->
    <div
      class="form-slide"
      :class="{ active: currentQuestion === 'score', previous: currentQuestion !== 'score' }"
      v-if="currentQuestion === 'score'"
    >
      <div class="score">
        <h2>{{ difficulty === 'senior' ? '🏆' : '⭐' }} Great job, {{ fullName }}!</h2>
        <h3 v-if="showFeedback">Your Score: {{ calculateScore() }}/{{ countScoredQuestions() }}</h3>
        <p v-if="difficulty === 'senior'" class="score-prize-note">
          Top 5 scores win Bitcoin. Submit to enter!
        </p>
        <p v-else class="score-junior-note">
          Amazing effort! You crushed it! 🎉
        </p>
        <button @click="sendScore" :disabled="scoreSubmitted" class="submit-score-btn">{{ scoreSubmitted ? 'Submitted ✓' : 'Submit Score' }}</button>
        <div class="score-secondary-btns">
          <button @click="editAnswers">Edit Answers</button>
          <button @click="restartHunt">Change Mode</button>
        </div>
        <button @click="openLeaderboard" class="leaderboard-link-btn">🏆 View Leaderboard</button>
      </div>
    </div>

    <!-- Leaderboard Overlay -->
    <div class="leaderboard-overlay" v-if="viewingLeaderboard">
      <div class="leaderboard-panel">
        <h2>🏆 Leaderboard</h2>
        <div v-if="leaderboardLoading" class="lb-loading">Loading...</div>
        <div v-else class="lb-tables">
          <div class="lb-section">
            <h3>🎓 Senior — Top 5</h3>
            <ol v-if="leaderboardData.senior.length">
              <li v-for="(e, i) in leaderboardData.senior" :key="i">
                <span class="lb-rank">{{ i + 1 }}</span>
                <span class="lb-name">{{ e.name }}</span>
                <span class="lb-score">{{ e.score }}/{{ e.total }}</span>
              </li>
            </ol>
            <p v-else class="lb-empty">No scores yet</p>
          </div>
          <div class="lb-section">
            <h3>🧒 Junior — Top 5</h3>
            <ol v-if="leaderboardData.junior.length">
              <li v-for="(e, i) in leaderboardData.junior" :key="i">
                <span class="lb-rank">{{ i + 1 }}</span>
                <span class="lb-name">{{ e.name }}</span>
                <span class="lb-score">{{ e.score }}/{{ e.total }}</span>
              </li>
            </ol>
            <p v-else class="lb-empty">No scores yet</p>
          </div>
        </div>
        <button class="lb-back-btn" @click="viewingLeaderboard = false">← Back</button>
      </div>
    </div>

    <!-- Toolkit Overlay -->
    <div class="leaderboard-overlay" v-if="viewingToolkit">
      <div class="leaderboard-panel toolkit-panel">
        <h2>🧰 Puzzle Toolkit</h2>
        <p class="toolkit-subtitle">Here you'll find useful tools for solving puzzles and challenges.</p>
                <h3 class="toolkit-section-title">Lookups & Converters</h3>
        <div class="toolkit-links">
          <button
            v-for="(tool, i) in puzzleToolkitLinks"
            :key="i"
            class="toolkit-link-btn"
            @click="openExternalTool(tool.url)"
          >
            <span class="toolkit-link-name">{{ tool.name }}</span>
            <span class="toolkit-link-desc">{{ tool.description }}</span>
          </button>
        </div>
        <h3 class="toolkit-section-title">Chess Helpers</h3>
        <div class="toolkit-links">
          <button
            v-for="(tool, i) in chessToolkitLinks"
            :key="`chess-${i}`"
            class="toolkit-link-btn"
            @click="openExternalTool(tool.url)"
          >
            <span class="toolkit-link-name">{{ tool.name }}</span>
            <span class="toolkit-link-desc">{{ tool.description }}</span>
          </button>
        </div>
        <button class="lb-back-btn" @click="viewingToolkit = false">← Back</button>
      </div>
    </div>
  </div>
</template>

<script>
import faded_frog from '@/assets/images/scavenger_hunt/faded_frog.png'
import chess_2 from '@/assets/images/scavenger_hunt/chess_2.png'
import binary from '@/assets/images/scavenger_hunt/binary.png'
import quest from '@/assets/images/icons/quest.png'
import trivia from '@/assets/images/icons/trivia.png'
import riddle from '@/assets/images/icons/riddle.png'
import cypher from '@/assets/images/icons/cypher.png'
import sequence from '@/assets/images/icons/sequence.png'
import puzzle from '@/assets/images/icons/quiz.png'
import scavengerQuestions from '@/data/scavengerQuestions.json'
import { reunion_db } from '@/firebase.js'
import { doc, updateDoc, arrayUnion, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

export default {
  props: ['id_code', 'fullName'],
  data() {
    return {
      difficulty: null, // null | 'junior' | 'senior'
      currentQuestion: 0,
      backgroundImage: faded_frog,
      rawQuestions: scavengerQuestions,

      answers: [],
      feedback: [],
      liveHashes: [],
      liveRot13s: [],
      viewingLeaderboard: false,
      viewingToolkit: false,
      puzzleToolkitLinks: [
        {
          name: 'Morse Code Translator',
          description: 'Decode and encode Morse quickly',
          url: 'https://morsecode.world/international/translator.html'
        },
        {
          name: 'Timechain Calendar',
          description: 'Map calendar dates to Bitcoin block heights',
          url: 'https://timechaincalendar.com/en'
        },
        {
          name: 'CyberChef ROT13',
          description: 'Solve ROT13 and other text ciphers',
          url: 'https://gchq.github.io/CyberChef/#recipe=ROT13(true,true,false,13)'
        },
        {
          name: 'Binary to Decimal',
          description: 'Convert binary numbers instantly',
          url: 'https://www.rapidtables.com/convert/number/binary-to-decimal.html'
        },
        {
          name: 'SHA256 Tool',
          description: 'Check hash outputs for leading zeros',
          url: 'https://emn178.github.io/online-tools/sha256.html'
        }
      ],
      chessToolkitLinks: [
        {
          name: 'Lichess Analysis Board',
          description: 'Set up and analyze positions quickly',
          url: 'https://lichess.org/analysis'
        },
        {
          name: 'Chess Tempo Puzzles',
          description: 'Tactics training and pattern recognition',
          url: 'https://chesstempo.com/chess-tactics/'
        },
        {
          name: 'Chess Notation Guide',
          description: 'Quick SAN notation reference',
          url: 'https://www.chess.com/terms/chess-notation'
        }
      ],
      leaderboardData: { senior: [], junior: [] },
      leaderboardLoading: false,
      scoreSubmitted: false,
      hostValidationKey: 'a2c4e2026', // change this to your onsite host key
      showFeedback: false,  // set true to reveal per-question correct/incorrect and nav score
      hintState: {},  // per-question hint reveal state: null | 'warn1' | 'warn2' | 'shown'
      hintsUsed: {},  // per-question flag set when hint is revealed
      lockedAnswers: {} // per-question lock state after host verification
    }
  },
  computed: {
    questions() {
      const icons = { quest, trivia, riddle, cypher, sequence, puzzle }
      const images = { binary, chess_2 }
      const base =
        this.difficulty === 'junior'
          ? this.rawQuestions.questionsJunior
          : this.difficulty === 'senior'
            ? this.rawQuestions.questionsSenior
            : []
      if (!base.length) return base
      const hydrated = base.map((q) => {
        const item = { ...q }
        if (item.iconKey) item.icon = icons[item.iconKey] || null
        if (item.imageKey) item.image = images[item.imageKey] || null
        if (item.validation?.type === 'regex' && typeof item.validation.pattern === 'string') {
          item.validation = {
            ...item.validation,
            pattern: new RegExp(item.validation.pattern, item.validation.flags || '')
          }
        }
        return item
      })
      const name = this.fullName || 'Guest'
      const out = [...hydrated]
      out[0] = { ...out[0], text: out[0].text.replace('__NAME__', name) }
      out[out.length - 1] = {
        ...out[out.length - 1],
        text: out[out.length - 1].text.replace('__NAME__', name)
      }
      return out
    },
    progressKey() {
      return `scavenger_hunt_progress_${this.difficulty}_${this.id_code || 'anon'}`
    }
  },
  mounted() {
    // Restore previously chosen difficulty — triggers watcher which loads saved progress
    try {
      const savedMode = window?.localStorage?.getItem(
        `scavenger_hunt_mode_${this.id_code || 'anon'}`
      )
      if (savedMode === 'junior' || savedMode === 'senior') {
        this.difficulty = savedMode
      }
    } catch (e) {
      // ignore storage errors
    }
  },
  watch: {
    difficulty(newVal) {
      if (!newVal) return
      const len = this.questions.length
      this.answers = new Array(len).fill('')
      this.feedback = new Array(len).fill(null)
      this.currentQuestion = 0
      this.loadProgress()
    },
    answers: {
      deep: true,
      handler() {
        this.persistProgress()
      }
    },
    feedback: {
      deep: true,
      handler() {
        this.persistProgress()
      }
    },
    currentQuestion() {
      this.persistProgress()
    }
  },
  methods: {
    selectDifficulty(mode) {
      this.difficulty = mode
      try {
        window?.localStorage?.setItem(`scavenger_hunt_mode_${this.id_code || 'anon'}`, mode)
      } catch (e) {
        // ignore
      }
    },
    persistProgress() {
      if (!this.difficulty) return
      try {
        const payload = {
          version: 1,
          updatedAt: new Date().toISOString(),
          currentQuestion: this.currentQuestion,
          answers: this.answers,
          feedback: this.feedback,
          hintsUsed: this.hintsUsed,
          hintState: this.hintState,
          lockedAnswers: this.lockedAnswers
        }
        window?.localStorage?.setItem(this.progressKey, JSON.stringify(payload))
      } catch (e) {
        // ignore storage errors (e.g., private mode)
      }
    },
    loadProgress() {
      try {
        const raw = window?.localStorage?.getItem(this.progressKey)
        if (!raw) return
        const saved = JSON.parse(raw)
        if (!saved) return
        const len = this.questions.length
        if (Array.isArray(saved.answers)) {
          for (let i = 0; i < Math.min(len, saved.answers.length); i++) {
            this.$set
              ? this.$set(this.answers, i, saved.answers[i] || '')
              : (this.answers[i] = saved.answers[i] || '')
          }
        }
        if (Array.isArray(saved.feedback)) {
          for (let i = 0; i < Math.min(len, saved.feedback.length); i++) {
            this.$set
              ? this.$set(this.feedback, i, saved.feedback[i] ?? null)
              : (this.feedback[i] = saved.feedback[i] ?? null)
          }
        }
        if (
          saved.currentQuestion === 'score' ||
          (typeof saved.currentQuestion === 'number' &&
            saved.currentQuestion >= 0 &&
            saved.currentQuestion < len)
        ) {
          this.currentQuestion = saved.currentQuestion
        }
        if (saved.hintsUsed && typeof saved.hintsUsed === 'object') {
          this.hintsUsed = { ...saved.hintsUsed }
        }
        if (saved.hintState && typeof saved.hintState === 'object') {
          this.hintState = { ...saved.hintState }
        }
        if (saved.lockedAnswers && typeof saved.lockedAnswers === 'object') {
          this.lockedAnswers = { ...saved.lockedAnswers }
        }
      } catch (e) {
        // ignore parse/storage errors
      }
    },
    clearProgress() {
      try {
        window?.localStorage?.removeItem(this.progressKey)
        window?.localStorage?.removeItem(`scavenger_hunt_mode_${this.id_code || 'anon'}`)
      } catch (e) {
        // ignore
      }
    },
    nextQuestion() {
      if (this.currentQuestion < this.questions.length) {
        this.currentQuestion++
      }
    },
    prevQuestion() {
      if (this.currentQuestion > 0) {
        this.currentQuestion--
      }
    },
    restartHunt() {
      this.currentQuestion = 0
      this.answers = []
      this.feedback = []
      this.hintState = {}
      this.hintsUsed = {}
      this.lockedAnswers = {}
      this.scoreSubmitted = false
      this.clearProgress()
      this.difficulty = null
    },
    showScoreSlide() {
      this.currentQuestion = 'score'
    },
    editAnswers() {
      const idx = this.questions.findIndex((q, i) => q.type !== 'information' && !this.answers[i])
      this.currentQuestion = idx !== -1 ? idx : 0
    },
    async revealHint(index) {
      this.hintState[index] = 'shown'
      this.hintsUsed[index] = true
      this.$forceUpdate()
      this.persistProgress()
      if (this.id_code) {
        try {
          await updateDoc(doc(reunion_db, 'participants_2026', this.id_code), {
            'scavenger_hunt.hintsUsed': arrayUnion(index)
          })
        } catch (e) {
          // non-fatal — penalty is still tracked locally
        }
      }
    },
    async checkAnswer(index) {
      const question = this.questions[index]
      if (!question) return
      if (this.lockedAnswers[index]) {
        this.feedback[index] = 'correct'
        return
      }

      const input = (this.answers[index] || '').trim()

      if (question.validation?.type === 'host-key') {
        const ok = input.toUpperCase() === (this.hostValidationKey || '').trim().toUpperCase()
        this.feedback[index] = ok ? 'correct' : 'incorrect'
        if (ok) {
          this.lockedAnswers = Object.assign({}, this.lockedAnswers, { [index]: true })
          this.answers = Object.assign([], this.answers, { [index]: 'VERIFIED' })
          this.persistProgress()
        }
        return
      }

      // Rule-based validator
      if (question.validation?.type === 'sha256-leading-zeros') {
        const ok = await this.validateShaLeadingZeros(input, question.validation.zeros || 2)
        this.feedback[index] = ok ? 'correct' : 'incorrect'
        return
      }

      if (question.validation?.type === 'rot13') {
        this.feedback[index] = this.rot13(input) === question.validation.encoded ? 'correct' : 'incorrect'
        return
      }

      if (question.validation?.type === 'regex') {
        this.feedback[index] = question.validation.pattern.test(input) ? 'correct' : 'incorrect'
        return
      }

      // Exact-match validator
      if (!question.answer) return
      const userAnswer = input.toLowerCase()
      const correctAnswer = question.answer.toLowerCase()
      this.feedback[index] = userAnswer === correctAnswer ? 'correct' : 'incorrect'
    },
    async handleInput(index) {
      const question = this.questions[index]
      if (this.lockedAnswers[index]) return
      if (question?.validation?.type === 'sha256-leading-zeros') {
        await this.updateLiveHash(index)
      }
      if (question?.validation?.type === 'rot13') {
        this.updateLiveRot13(index)
      }
      await this.checkAnswer(index)
    },
    async updateLiveHash(index) {
      const input = (this.answers[index] || '').trim()
      if (!input) {
        this.liveHashes[index] = ''
        return
      }
      const hash = await this.sha256Hex(input)
      this.liveHashes = Object.assign([], this.liveHashes, { [index]: hash })
    },
    rot13(text) {
      return text.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
      })
    },
    updateLiveRot13(index) {
      const input = (this.answers[index] || '').trim()
      if (!input) {
        this.liveRot13s[index] = ''
        return
      }
      this.liveRot13s = Object.assign([], this.liveRot13s, { [index]: this.rot13(input) })
    },
    async validateShaLeadingZeros(input, zeros = 2) {
      if (!/^\d+$/.test(input)) return false
      const hashHex = await this.sha256Hex(input)
      return hashHex.startsWith('0'.repeat(zeros))
    },
    async sha256Hex(text) {
      const bytes = new TextEncoder().encode(text)
      const digest = await crypto.subtle.digest('SHA-256', bytes)
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    },
    calculateScore() {
      const correct = this.feedback.filter(
        (status, index) => status === 'correct' && this.questions[index]?.type === 'text'
      ).length
      const hintPenalty = this.difficulty === 'senior' ? Object.keys(this.hintsUsed).length : 0
      return Math.max(0, correct - hintPenalty)
    },
    countScoredQuestions() {
      return this.questions.filter((question) => question.type === 'text').length
    },
    getQuestionNumber(currentIndex) {
      let count = 0
      for (let i = 0; i <= currentIndex; i++) {
        if (this.questions[i].type === 'text') {
          count++
        }
      }
      return count
    },
    goToQuestion(index) {
      this.currentQuestion = index
    },
    async sendScore() {
      const score = this.calculateScore()
      const total = this.countScoredQuestions()
      const modeLabel =
        this.difficulty === 'senior' ? ':mortar_board: *SENIOR*' : ':children_crossing: *JUNIOR*'
      const payload = {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:id: ${this.id_code} | ${modeLabel}\n:ballot_box_with_check: ${score}/${total}`
            }
          }
        ]
      }
      try {
        // Write score to participant's existing record in participants_2026
        const hintsUsedCount = Object.keys(this.hintsUsed).length
        await updateDoc(doc(reunion_db, 'participants_2026', this.id_code), {
          scavenger_hunt: {
            score,
            total,
            difficulty: this.difficulty,
            hintsUsed: hintsUsedCount,
            submittedAt: new Date()
          }
        })
        // Notify Slack
        const response = await fetch('https://relayproxy.vercel.app/festivall_notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        if (response.ok) {
          this.scoreSubmitted = true
          alert('Score submitted! Opening leaderboard...')
          await this.openLeaderboard()
        } else {
          alert('Failed to submit score. Please try again.')
        }
      } catch (error) {
        console.error('Error sending score:', error)
        alert('An error occurred while submitting your score.')
      }
    },
    formatText(text) {
      return text.replace(/\n/g, '<br>')
    },
    async openLeaderboard() {
      this.viewingLeaderboard = true
      await this.loadLeaderboard()
    },
    openExternalTool(url) {
      const opened = window.open(url, '_blank', 'noopener,noreferrer')
      if (opened) {
        opened.opener = null
      }
    },
    async loadLeaderboard() {
      this.leaderboardLoading = true
      try {
        const snap = await getDocs(
          query(
            collection(reunion_db, 'participants_2026'),
            orderBy('scavenger_hunt.score', 'desc'),
            limit(20)
          )
        )
        const all = snap.docs.map((d) => d.data()).filter((d) => d.scavenger_hunt?.score != null)
        const toEntry = (d) => ({
          name: d.fullname || 'Unknown',
          score: d.scavenger_hunt.score,
          total: d.scavenger_hunt.total
        })
        this.leaderboardData.senior = all
          .filter((d) => d.scavenger_hunt.difficulty === 'senior')
          .slice(0, 5)
          .map(toEntry)
        this.leaderboardData.junior = all
          .filter((d) => d.scavenger_hunt.difficulty === 'junior')
          .slice(0, 5)
          .map(toEntry)
      } catch (err) {
        console.error('Failed to load leaderboard:', err)
      } finally {
        this.leaderboardLoading = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@100..900&display=swap');

.form-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-size: cover;
  background-position: center;
  font-family: 'League Spartan', sans-serif;
}

.form-slide {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: white;
  transition:
    transform 1.2s ease,
    opacity 1.5s ease;
  opacity: 0;
  transform: translateY(100vh);
}

.form-slide.active {
  transform: translateY(0);
  opacity: 1;
}

.form-slide.previous {
  transform: translateY(-100vh);
  opacity: 0;
}

.form-slide.next {
  transform: translateY(100vh);
  opacity: 0;
}

.question {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  width: 90%;
  height: 90%;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

img {
  width: 100%;
  max-width: 300px;
  height: auto;
  margin: 1rem 0;
}
.category-icon {
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
}

.controls {
  margin-top: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  align-items: center;
}

input {
  width: 100%;
  padding: 0.5rem;
  margin: 1rem 0;
  background-color: rgba(255, 255, 255, 0);
  border: 1px solid white;
  border-radius: 5px;
  color: white;
  transition: border-color 0.3s ease;
  text-align: center;
}

input:focus {
  border-color: var(--festivall-baby-blue);
}

button {
  padding: 0.75rem 1rem;
  border: 1px solid white;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: black;
  color: white;
  transform: scale(1.05);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: rgba(0, 0, 0, 0.3);
}

.correct {
  color: limegreen;
  font-weight: bold;
}

.incorrect {
  color: red;
  font-weight: bold;
}

.answer-locked-note {
  color: rgba(120, 255, 120, 0.95);
  font-weight: 700;
  margin: 0.75rem 0;
}

.score {
  background-color: rgba(0, 0, 0, 0.8);
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  width: 67%;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

/* Quick Navigation Styles */
.quick-nav {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  padding: 10px 20px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-dots {
  display: flex;
  gap: 8px;
}

.nav-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.nav-dot:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.nav-dot.current {
  background-color: var(--festivall-baby-blue);
  border-color: white;
  box-shadow: 0 0 10px rgba(5, 155, 250, 0.5);
}

.nav-dot.completed {
  background-color: limegreen;
  color: white;
}

.nav-dot.attempted {
  background-color: #ff6b35;
  color: white;
}

.nav-dot.information {
  background-color: #6c757d;
  color: white;
}

.nav-score {
  color: white;
  font-weight: bold;
  font-size: 14px;
  padding-left: 15px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.nav-hints {
  font-size: 12px;
  color: rgba(255, 180, 60, 0.85);
  padding-left: 15px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  white-space: nowrap;
}

/* Mobile responsiveness for quick nav */
@media (max-width: 768px) {
  .quick-nav {
    position: relative;
    left: auto;
    transform: none;
    margin-bottom: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-dots {
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-dot {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }

  .nav-score {
    width: 100%;
    text-align: center;
    padding-left: 0;
    padding-top: 10px;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
  }
}

/* Difficulty Selector */
.difficulty-selector {
  background-color: rgba(0, 0, 0, 0.85);
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  width: 90%;
  max-width: 600px;
  color: white;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.difficulty-selector h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.selector-subtitle {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.difficulty-options {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.difficulty-option {
  flex: 1;
  max-width: 220px;
  padding: 1.5rem 1rem;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.05);
}

.difficulty-option:hover {
  transform: scale(1.05);
  border-color: white;
  background-color: rgba(255, 255, 255, 0.15);
}

.difficulty-option.junior {
  border-color: rgba(100, 220, 100, 0.5);
}

.difficulty-option.junior:hover {
  border-color: limegreen;
  background-color: rgba(50, 200, 50, 0.15);
}

.difficulty-option.senior {
  border-color: rgba(5, 155, 250, 0.5);
}

.difficulty-option.senior:hover {
  border-color: var(--festivall-baby-blue);
  background-color: rgba(5, 155, 250, 0.15);
}

.diff-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.75rem;
}

.difficulty-option h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.difficulty-option p {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0.25rem 0;
}

.diff-prize {
  color: gold;
  font-weight: bold;
  opacity: 1 !important;
}

.score-prize-note {
  color: gold;
  font-weight: bold;
  margin: 0.75rem 0 1.5rem;
  font-size: 1rem;
}

.score-junior-note {
  color: limegreen;
  font-weight: bold;
  margin: 0.75rem 0 1.5rem;
  font-size: 1rem;
}

@media (max-width: 480px) {
  .difficulty-options {
    flex-direction: column;
    align-items: center;
  }

  .difficulty-option {
    width: 100%;
    max-width: 280px;
  }
}

/* Leaderboard */
.leaderboard-link-btn {
  margin-top: 1.25rem;
  background-color: rgba(255, 215, 0, 0.15);
  border-color: gold;
  color: gold;
  width: 100%;
}

.leaderboard-link-btn:hover:not(:disabled) {
  background-color: rgba(255, 215, 0, 0.3);
  color: gold;
}

.nav-leaderboard-btn {
  margin-top: 0;
  width: auto;
  padding: 8px 6px;
  font-size: 16px;
  line-height: 1;
  border-radius: 50%;
  flex-shrink: 0;
}

.nav-toolkit-btn {
  margin-top: 0;
  width: auto;
  padding: 8px 6px;
  font-size: 16px;
  line-height: 1;
  border-radius: 50%;
  flex-shrink: 0;
}

.submit-score-btn {
  width: 100%;
  font-size: 1.15em;
  padding: 14px 20px;
  margin-bottom: 8px;
}

.score-secondary-btns {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-bottom: 8px;
}

.score-secondary-btns button {
  flex: 1;
}

.leaderboard-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.92);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'League Spartan', sans-serif;
  color: white;
}

.leaderboard-panel {
  background-color: rgba(10, 10, 20, 0.95);
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 560px;
  text-align: center;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.15);
}

.leaderboard-panel h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: gold;
}

.lb-tables {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.lb-section {
  flex: 1;
  min-width: 180px;
}

.lb-section h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.lb-section ol {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lb-section li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.05);
  margin-bottom: 0.4rem;
  font-size: 0.95rem;
}

.lb-section li:first-child {
  background-color: rgba(255, 215, 0, 0.15);
  border: 1px solid rgba(255, 215, 0, 0.4);
}

.lb-rank {
  font-weight: 800;
  min-width: 1.2rem;
  color: gold;
}

.lb-name {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lb-score {
  font-weight: 600;
  color: limegreen;
  white-space: nowrap;
}

.lb-empty {
  opacity: 0.5;
  font-style: italic;
  font-size: 0.9rem;
}

.lb-loading {
  opacity: 0.7;
  margin: 2rem 0;
  font-size: 1.1rem;
}

.lb-back-btn {
  margin-top: 1.5rem;
}

.toolkit-panel {
  max-width: 680px;
}

.toolkit-subtitle {
  opacity: 0.8;
  margin: -0.5rem 0 1rem;
}

.toolkit-section-title {
  margin: 1rem 0 0.5rem;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
}

.toolkit-links {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.toolkit-link-btn {
  width: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  border-color: rgba(255, 255, 255, 0.28);
  background-color: rgba(255, 255, 255, 0.05);
}

.toolkit-link-name {
  font-size: 1rem;
  font-weight: 700;
}

.toolkit-link-desc {
  opacity: 0.8;
  font-size: 0.86rem;
}

/* SHA256 live preview */
.hint-area {
  margin: 0.5rem 0;
  width: 100%;
  text-align: center;
}

.hint-trigger-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: 20px;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
  margin-top: 0;
  width: auto;
}

.hint-trigger-btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.55);
}

.hint-warn {
  background: rgba(255, 180, 0, 0.06);
  border: 1px solid rgba(255, 180, 0, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  text-align: center;
}

.hint-warn-text {
  font-size: 0.8rem;
  color: rgba(255, 220, 100, 0.75);
  margin: 0 0 10px;
  line-height: 1.4;
}

.hint-warn-text strong {
  color: rgba(255, 220, 100, 0.95);
}

.hint-warn-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.hint-warn-yes {
  background: transparent;
  border: 1px solid rgba(255, 100, 100, 0.4);
  color: rgba(255, 130, 130, 0.8);
  font-size: 0.75rem;
  padding: 5px 14px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 0;
  width: auto;
}

.hint-warn-no {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  padding: 5px 14px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 0;
  width: auto;
}

.hint-revealed {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
  margin: 0;
  line-height: 1.5;
}

.sha-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 0.5rem 0;
  font-size: 0.75rem;
  width: 100%;
}

.sha-label {
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.65rem;
}

.sha-hash {
  font-family: monospace;
  word-break: break-all;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.3s ease;
}

.sha-hash.sha-match {
  color: limegreen;
  font-weight: bold;
}
</style>
