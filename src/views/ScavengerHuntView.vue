<template>
  <div class="form-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <!-- Question Slides -->
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

    <!-- Score Slide -->
    <div
      class="form-slide"
      :class="{ active: currentQuestion === 'score', previous: currentQuestion !== 'score' }"
      v-if="currentQuestion === 'score'"
    >
      <div class="score">
        <h2>Great job, {{ fullName }}!</h2>
        <h3>Your Score: {{ calculateScore() }}/{{ countScoredQuestions() }}</h3>
        <button @click="restartHunt">Go Back</button>
        <button @click="sendScore">Submit Score</button>
      </div>
    </div>
  </div>
</template>

<script>
import faded_frog from '@/assets/images/scavenger_hunt/faded_frog.png'
import chess_1 from '@/assets/images/scavenger_hunt/chess_1.png'
import binary from '@/assets/images/scavenger_hunt/binary.png'
import quest from '@/assets/images/scavenger_hunt/quest.png'
import trivia from '@/assets/images/scavenger_hunt/trivia.png'
import cypher from '@/assets/images/scavenger_hunt/cypher.png'
import sequence from '@/assets/images/scavenger_hunt/sequence.png'
import puzzle from '@/assets/images/scavenger_hunt/puzzle.png'

export default {
  props: ['id_code', 'fullName'],
  data() {
    return {
      currentQuestion: 0, // Tracks the current slide (index or 'score')
      backgroundImage: faded_frog,
      chess_1: chess_1,
      binary: binary,
      quest: quest,
      trivia: trivia,
      cypher: cypher,
      sequence: sequence,
      puzzle: puzzle,

      questions: [
        {
          text: `Welcome!\n Get ready to test your wits against a combination of brainteasers and onsite quests.\n The top 5 scores at the end of the festival will be entered to win some bitcoin!`,
          type: 'information',
          category: 'Reunion\nScavenger Hunt'
        },
        {
          text: 'Your first challenge is to identify the next letter in this sequence:\n O,T,T,F,F,S,S,?',
          answer: 'E',
          type: 'text',
          category: 'Sequence'
        },
        {
          text: 'Find the guardian of the flame and ask him to declare the magic word.',
          answer: 'eternal',
          type: 'text',
          category: 'Quest'
        },
        {
          text: 'Visit the main stage and look for the secret symbol.',
          answer: 'star',
          type: 'text',
          category: 'Quest'
        },
        {
          text: 'What is "Reunion" in Morse code?',
          subtext:
            'Hint: Use periods . and dashes - for the letters. Use spaces to separate letters.',
          answer: '.-. . ..- -. .. --- -.',
          type: 'text',
          category: 'Cypher'
        },
        {
          text: 'What is the next number in this sequence:\n0,1,1,2,3,5,8,13,?',
          answer: '21',
          type: 'text',
          category: 'Sequence'
        },
        {
          text: 'For this quest go to the Cote Corral and use a Nerf Gun to knock down the target to reveal the magic word.',
          answer: 'victory',
          type: 'text',
          category: 'Quest'
        },
        {
          text: 'What is the largest planet in our solar system?',
          answer: 'Jupiter',
          type: 'text',
          category: 'Trivia'
        },
        {
          text: 'Separated by commas, what are the next five numbers in this sequence?\n2,4,8,16,32,?,?,?,?,?',
          answer: '64,128,256,512,1024',
          type: 'text',
          category: 'Sequence'
        },
        {
          text: 'I wonder where the next magic word is wading for you...',
          answer: 'ocean',
          type: 'text',
          category: 'Quest'
        },
        {
          text: 'The poor have it, the rich want it, and if you eat it you die. What is it?',
          answer: 'nothing',
          type: 'text',
          category: 'Riddle'
        },
        {
          text: 'Go to the barn and find a book titled "TITLE" and discover the hidden word highlighted on page ##.',
          answer: 'imagine',
          type: 'text',
          category: 'Quest'
        },
        {
          text: 'Great! Now, solve this binary puzzle:\nThe decimal equivalent of the binary number 1100110 is 102 as shown here. What is the decimal equivalent of the the binary number 101010?',
          image: binary,
          answer: '42',
          type: 'text',
          category: 'Cypher'
        },
        {
          text: 'What is the chemical symbol for gold?',
          answer: 'Au',
          type: 'text',
          category: 'Trivia'
        },
        {
          text: "Find one of our Children's Coordinators and ask for the magic word.",
          answer: 'friendship',
          type: 'text',
          category: 'Quest'
        },

        {
          text: 'Look for the symbol of knowledge hidden somewhere on the festival grounds.',
          answer: 'brain',
          type: 'text',
          category: 'Quest'
        },
        {
          text: 'White to move and checkmate in two moves.',
          subtext:
            'Hint: Only the first move is required for the answer. Use standard chess notation.',
          answer: 'Ra6',
          type: 'text',
          image: chess_1,
          category: 'Puzzle'
        },
        {
          text: 'Locate our Food Coordinator for your final question.',
          answer: 'garlic',
          type: 'text',
          category: 'Quest'
        },
        {
          text: `Well done! You have completed the scavenger hunt.\n If your score is in the top 5, you will be entered to win some bitcoin!\n\n Thank you for participating!`,
          type: 'information',
          category: 'Congratulations!'
        }
      ],
      answers: [], // Tracks user answers
      feedback: [] // Tracks feedback for each question (correct/incorrect)
    }
  },
  mounted() {
    // Initialize arrays with proper length
    this.answers = new Array(this.questions.length).fill('')
    this.feedback = new Array(this.questions.length).fill(null)

    // Update welcome message with fullName
    this.questions[0].text = `Welcome ${this.fullName}!\n Get ready to test your wits against a combination of brainteasers and onsite quests.\n The top 5 scores at the end of the festival will be entered to win some bitcoin!`

    // Update congratulations message with fullName
    this.questions[this.questions.length - 1].text =
      `Well done, ${this.fullName}! You have completed the scavenger hunt.\n If your score is in the top 5, you will be entered to win some bitcoin!\n\n Thank you for participating!`
  },
  methods: {
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
    },
    showScoreSlide() {
      this.currentQuestion = 'score' // Switch to the score slide
    },
    checkAnswer(index) {
      if (!this.questions[index].answer) {
        // Skip checking for information type questions
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
        (status, index) => status === 'correct' && this.questions[index].type === 'text'
      ).length
    },
    countScoredQuestions() {
      return this.questions.filter((question) => question.type === 'text').length
    },
    getQuestionNumber(currentIndex) {
      // Count how many text-type questions come before the current index
      let count = 0
      for (let i = 0; i <= currentIndex; i++) {
        if (this.questions[i].type === 'text') {
          count++
        }
      }
      return count
    },
    async sendScore() {
      const score = this.calculateScore()
      const payload = {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:id: ${this.id_code}\n:ballot_box_with_check: ${score}/${this.countScoredQuestions()}`
            }
          }
        ]
      }

      try {
        const response = await fetch('https://relayproxy.vercel.app/festivall_notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          alert('Score submitted successfully!')
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
</style>
