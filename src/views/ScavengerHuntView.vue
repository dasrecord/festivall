<template>
  <div class="form-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
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
        <h2 v-html="formatText(question.text)"></h2>
        <p v-if="question.subtext" v-html="formatText(question.subtext)"></p>

        <!-- Input for answers -->
        <input
          v-if="question.type === 'text'"
          type="text"
          v-model="answers[index]"
          @blur="checkAnswer(index)"
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
          <button v-if="index < questions.length - 1" @click="nextQuestion">Next</button>
        </div>
      </div>
      <!-- Score & Submit display -->
      <div v-if="index === questions.length - 1" class="score">
        <h3>Your Score: {{ calculateScore() }}/{{ questions.length }}</h3>
        <button @click="sendScore">Submit Score</button>
      </div>
    </div>
  </div>
</template>

<script>
import faded_frog from '@/assets/images/scavenger_hunt/faded_frog.png'

export default {
  data() {
    return {
      currentQuestion: 0,
      backgroundImage: faded_frog,
      questions: [
        {
          text: 'Welcome to the Scavenger Hunt! Get ready to test your wits and have fun solving puzzles. Click "Next" to begin!',
          type: 'information'
        },
        {
          text: 'Welcome to the Scavenger Hunt!\nYour first challenge is to identify the next number in this sequence:\n O, T, T, F, F, S, S, ?',
          answer: 'E',
          type: 'text'
        },
        {
          text: 'Great! Now, solve this binary puzzle:\nWhat is the decimal equivalent of 1010?',
          answer: '10',
          type: 'text'
        },
        {
          text: 'What is the next number in this sequence:\n0, 1, 1, 2, 3, 5, 8, 13, ?',
          answer: '21',
          type: 'text'
        },
        {
          text: 'Binary puzzle again! What is the binary representation of the decimal number 15?',
          answer: '1111',
          type: 'text'
        },
        {
          text: 'Solve this riddle: The poor have it, the rich want it, and if you eat it you die. What is it?',
          answer: 'Nothing',
          type: 'text'
        },
        {
          text: 'Decode this cipher: What is "Reunion" in Morse code?',
          subtext: 'Hint: Use periods .\n dashes -\n and spaces to separate letters.',
          answer: '.-. . ..- -. .. --- -.',
          type: 'text'
        },
        {
          text: 'Riddle: I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?',
          answer: 'Echo',
          type: 'text'
        },
        {
          text: 'Sequence puzzle: Separated by commas, what are the next five numbers in this sequence? 2, 4, 8, 16, 32',
          answer: '64,128,256,512,1024',
          type: 'text'
        },
        {
          text: "Magic Word Challenge: Find our children's coordinator? and ask him for the magic word.",
          answer: 'friendship',
          type: 'text'
        },
        {
          text: 'Find the Festival Organizer: Ask the festival organizer for the secret code.',
          answer: 'celebrate',
          type: 'text'
        },
        {
          text: 'Trivia Hunt: Locate the information booth and ask for the trivia question of the day.',
          answer: 'knowledge',
          type: 'text'
        },
        {
          text: 'Photo Task: Take a photo with one of the festival mascots and ask them for the next clue.',
          answer: 'smile',
          type: 'text'
        },
        {
          text: 'Interactive Puzzle: Visit the main stage and ask the host for the interactive puzzle. Look for the secret code.',
          answer: 'star',
          type: 'text'
        },

        {
          text: 'Riddle: I can be cracked, made, told, and played. What am I?',
          answer: 'Joke',
          type: 'text'
        },
        {
          text: 'Riddle: The more of this you take, the more you leave behind. What is it?',
          answer: 'Footsteps',
          type: 'text'
        }
      ],

      answers: [],
      feedback: [] // Tracks feedback for each question (correct/incorrect)
    }
  },
  methods: {
    nextQuestion() {
      if (this.currentQuestion < this.questions.length - 1) {
        this.currentQuestion++
      }
    },
    prevQuestion() {
      if (this.currentQuestion > 0) {
        this.currentQuestion--
      }
    },
    checkAnswer(index) {
      const userAnswer = this.answers[index]?.trim().toLowerCase()
      const correctAnswer = this.questions[index].answer.toLowerCase()

      if (userAnswer === correctAnswer) {
        this.feedback[index] = 'correct'
      } else {
        this.feedback[index] = 'incorrect'
      }
    },
    calculateScore() {
      // Calculate the score based on the number of correct answers
      return this.feedback.filter((status) => status === 'correct').length
    },
    async sendScore() {
      const score = this.calculateScore()
      const payload = {
        user: 'Anonymous', // Replace with user data if available
        score: score,
        totalQuestions: this.questions.length
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
    completeHunt() {
      const score = this.calculateScore()
      alert(
        `Congratulations! You have completed the scavenger hunt! Your score is ${score}/${this.questions.length}.`
      )
      this.sendScore() // Send the score when the hunt is completed
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
  font-optical-sizing: auto;
  font-weight: 100;
  font-style: normal;
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
  background-color: rgba(0, 0, 0, 0.8);
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  width: 67%;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
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
  margin: 1rem;
  border: none;
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

button:hover {
  background-color: black;
  color: white;
  transform: scale(1.05);
}

.correct {
  color: limegreen;
  font-weight: bold;
}

.incorrect {
  color: red;
  font-weight: bold;
}
</style>
