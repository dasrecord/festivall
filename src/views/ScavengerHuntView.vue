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
            completed: feedback[index] === 'correct',
            attempted: answers[index] && feedback[index] !== 'correct',
            information: question.type === 'information'
          }"
          @click="goToQuestion(index)"
          :title="question.category || 'Question ' + (getQuestionNumber(index) || '')"
        >
          {{ question.type === 'information' ? '' : getQuestionNumber(index) || '?' }}
        </span>
      </div>
      <div class="nav-score">Score: {{ calculateScore() }}/{{ countScoredQuestions() }}</div>
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
          <p v-if="question.subtext" v-html="formatText(question.subtext)"></p>

          <!-- Input for answers -->
          <input
            v-if="question.type === 'text'"
            type="text"
            v-model="answers[index]"
            @blur="checkAnswer(index)"
            @keyup.enter="checkAnswer(index)"
            placeholder="Type your answer here..."
          />

          <!-- Feedback for correct/incorrect answers -->
          <p
            v-if="feedback[index]"
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
        <h3>Your Score: {{ calculateScore() }}/{{ countScoredQuestions() }}</h3>
        <p v-if="difficulty === 'senior'" class="score-prize-note">
          Top 5 scores win Bitcoin. Submit to enter!
        </p>
        <p v-else class="score-junior-note">
          Amazing effort! You crushed it! 🎉
        </p>
        <button @click="restartHunt">Change Mode</button>
        <button @click="sendScore" :disabled="scoreSubmitted">{{ scoreSubmitted ? 'Submitted ✓' : 'Submit Score' }}</button>
        <button v-if="scoreSubmitted" @click="openLeaderboard" class="leaderboard-link-btn">🏆 View Leaderboard</button>
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
  </div>
</template>

<script>
import faded_frog from '@/assets/images/scavenger_hunt/faded_frog.png'
import chess_1 from '@/assets/images/scavenger_hunt/chess_1.png'
import binary from '@/assets/images/scavenger_hunt/binary.png'
import quest from '@/assets/images/icons/quest.png'
import trivia from '@/assets/images/icons/trivia.png'
import riddle from '@/assets/images/icons/riddle.png'
import cypher from '@/assets/images/icons/cypher.png'
import sequence from '@/assets/images/icons/sequence.png'
import puzzle from '@/assets/images/icons/quiz.png'
import { reunion_db } from '@/firebase.js'
import { doc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

export default {
  props: ['id_code', 'fullName'],
  data() {
    return {
      difficulty: null, // null | 'junior' | 'senior'
      currentQuestion: 0,
      backgroundImage: faded_frog,
      chess_1: chess_1,
      binary: binary,
      quest: quest,
      trivia: trivia,
      cypher: cypher,
      sequence: sequence,
      puzzle: puzzle,

      // ── JUNIOR question set (12 scored questions) ────────────────────────
      questionsJunior: [
        {
          text: 'Welcome, __NAME__!\n Ready for a fun adventure?\n Complete 12 fun challenges and find magic words hidden around the festival!',
          type: 'information',
          category: 'Junior\nScavenger Hunt'
        },
        {
          text: 'What colour do you get when you mix red and blue?',
          answer: 'purple',
          type: 'text',
          category: 'Trivia',
          icon: trivia
        },
        {
          text: 'How many legs does a spider have?',
          answer: '8',
          type: 'text',
          category: 'Trivia',
          icon: trivia
        },
        {
          text: "I have hands but I can't clap. What am I?",
          answer: 'clock',
          type: 'text',
          category: 'Riddle',
          icon: riddle
        },
        {
          text: 'What is the next number?\n2, 4, 6, 8, ?',
          answer: '10',
          type: 'text',
          category: 'Sequence',
          icon: sequence
        },
        {
          text: 'Find the Guardian of the Flame and ask for his magic item.',
          answer: 'lighter',
          type: 'text',
          category: 'Quest',
          icon: quest
        },
        {
          text: 'What is a baby dog called?',
          answer: 'puppy',
          type: 'text',
          category: 'Trivia',
          icon: trivia
        },
        {
          text: 'Visit the main stage and look for the secret symbol.',
          answer: 'star',
          type: 'text',
          category: 'Quest',
          icon: quest
        },
        {
          // UPDATE: set `answer` to the magic word printed inside the Junior flipbook
          text: 'Go to the Flipbook Station for your next clue.',
          answer: 'motion',
          type: 'text',
          category: 'Quest',
          icon: quest
        },
        {
          text: 'What do caterpillars turn into?',
          answer: 'butterfly',
          type: 'text',
          category: 'Trivia',
          icon: trivia
        },
        {
          text: "I'm tall when I'm young and short when I'm old. What am I?",
          answer: 'candle',
          type: 'text',
          category: 'Riddle',
          icon: riddle
        },
        {
          text: "Find one of our Children's Coordinators and ask for the magic word.",
          answer: 'friendship',
          type: 'text',
          category: 'Quest',
          icon: quest
        },
        {
          text: 'What is 4 × 3?',
          answer: '12',
          type: 'text',
          category: 'Puzzle',
          icon: puzzle
        },
        {
          text: "Amazing work, __NAME__!\n You finished the Junior Hunt!\n You're a superstar! 🌟",
          type: 'information',
          category: 'Congratulations!'
        }
      ],

      // ── SENIOR question set (21 scored questions) ────────────────────────
      questionsSenior: [
        {
          text: 'Welcome, __NAME__.\n This is HARD.\n 21 brain-bending challenges stand between you and the leaderboard.\n The top 5 scores win Bitcoin.\n Think you\'re up for it?',
          type: 'information',
          category: 'Senior\nScavenger Hunt'
        },
        {
          text: 'Your first challenge is to identify the next letter in this sequence:\n O,T,T,F,F,S,S,?',
          answer: 'E',
          type: 'text',
          category: 'Sequence',
          icon: sequence
        },
        {
          text: 'Find the Guardian of the Flame and identify his magic item.',
          answer: 'lighter',
          type: 'text',
          category: 'Quest',
          icon: quest
        },
        {
          text: 'What is the largest planet in our solar system?',
          answer: 'Jupiter',
          type: 'text',
          category: 'Trivia',
          icon: trivia
        },
        {
          text: 'What is "Reunion" in Morse code?',
          subtext:
            'Hint: Use periods . and dashes - for the letters. Use spaces to separate letters.',
          answer: '.-. . ..- -. .. --- -.',
          type: 'text',
          category: 'Cypher',
          icon: cypher
        },
        {
          text: 'Visit the main stage and look for the secret symbol.',
          answer: 'star',
          type: 'text',
          category: 'Quest',
          icon: quest
        },
        {
          text: 'The poor have it, the rich want it, and if you eat it you die. What is it?',
          answer: 'nothing',
          type: 'text',
          category: 'Riddle',
          icon: riddle
        },
        {
          text: 'What is the next number in this sequence:\n0,1,1,2,3,5,8,13,?',
          answer: '21',
          type: 'text',
          category: 'Sequence',
          icon: sequence
        },
        {
          text: 'For this quest go to the Cote Corral and look for the magic word.',
          answer: 'victory',
          type: 'text',
          category: 'Quest',
          icon: quest
        },
        {
          text: 'Great! Now, solve this binary puzzle:\nThe decimal equivalent of the binary number 1100110 is 102 as shown here.\n What is the decimal equivalent of the binary number 101010?',
          image: binary,
          answer: '42',
          type: 'text',
          category: 'Cypher',
          icon: cypher
        },
        {
          text: 'I wonder where the next magic word is wading for you...',
          subtext: 'Hint: Raise the temperature.',
          answer: 'ocean',
          type: 'text',
          category: 'Quest',
          icon: quest
        },
        {
          text: 'What is the chemical symbol for gold?',
          answer: 'Au',
          type: 'text',
          category: 'Trivia',
          icon: trivia
        },
        {
          text: 'Separated by commas, what are the next five numbers in this sequence?\n2,4,8,16,32,?,?,?,?,?',
          answer: '64,128,256,512,1024',
          type: 'text',
          category: 'Sequence',
          icon: sequence
        },
        {
          text: 'White to move and checkmate in two moves.',
          subtext:
            'Hint: Only the first move is required for the answer. Use standard chess notation.',
          answer: 'Ra6',
          type: 'text',
          image: chess_1,
          category: 'Puzzle',
          icon: puzzle
        },
        {
          text: "Whispers speak of the story of Anno's seeds. What secret do they hold?",
          subtext: 'Hint: Begin at the end.',
          answer: 'magical events',
          type: 'text',
          category: 'Quest',
          icon: quest
        },
        {
          text: "Find one of our Children's Coordinators and ask for the magic word.",
          answer: 'friendship',
          type: 'text',
          category: 'Quest',
          icon: quest
        },
        {
          text: 'Decode this message:\n13-21-19-9-3',
          subtext: 'Hint: You will never see 27 in this type of cypher',
          answer: 'music',
          type: 'text',
          category: 'Cypher',
          icon: cypher
        },
        {
          text: "Where is our international headliner's original hometown?",
          answer: 'Preston',
          type: 'text',
          category: 'Quest',
          icon: quest
        },
        {
          text: 'What gets wetter the more it dries?',
          answer: 'towel',
          type: 'text',
          category: 'Riddle',
          icon: riddle
        },
        {
          text: 'Decode this encrypted message to find the magic word:\nSRFGVINYY',
          subtext: 'Hint: This is a Caesar cypher',
          answer: 'festivall',
          type: 'text',
          category: 'Cypher',
          icon: cypher
        },
        {
          text: 'What is the hardest natural substance on Earth?',
          answer: 'diamond',
          type: 'text',
          category: 'Trivia',
          icon: trivia
        },
        {
          // UPDATE: set `answer` to the magic word printed inside the Senior flipbook
          text: 'Go to the Flipbook Station for your next clue.',
          answer: 'illusion',
          type: 'text',
          category: 'Quest',
          icon: quest
        },
        {
          text: "Well done, __NAME__.\n You've completed the Senior Hunt.\n If your score is in the top 5, you're in the running for Bitcoin.\n Submit your score to enter.",
          type: 'information',
          category: 'Congratulations!'
        }
      ],

      answers: [],
      feedback: [],
      viewingLeaderboard: false,
      leaderboardData: { senior: [], junior: [] },
      leaderboardLoading: false,
      scoreSubmitted: false
    }
  },
  computed: {
    questions() {
      const base =
        this.difficulty === 'junior'
          ? this.questionsJunior
          : this.difficulty === 'senior'
            ? this.questionsSenior
            : []
      if (!base.length) return base
      const name = this.fullName || 'Guest'
      const out = [...base]
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
          feedback: this.feedback
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
      this.clearProgress()
      this.difficulty = null
    },
    showScoreSlide() {
      this.currentQuestion = 'score'
    },
    checkAnswer(index) {
      if (!this.questions[index]?.answer) {
        return
      }
      const userAnswer = this.answers[index]?.trim().toLowerCase()
      const correctAnswer = this.questions[index].answer?.toLowerCase()
      if (userAnswer === correctAnswer) {
        this.feedback[index] = 'correct'
      } else {
        this.feedback[index] = 'incorrect'
      }
    },
    calculateScore() {
      return this.feedback.filter(
        (status, index) => status === 'correct' && this.questions[index]?.type === 'text'
      ).length
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
        await updateDoc(doc(reunion_db, 'participants_2026', this.id_code), {
          scavenger_hunt: {
            score,
            total,
            difficulty: this.difficulty,
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
</style>
