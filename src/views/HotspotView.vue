<template>
  <div class="form-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <img
      v-if="currentQuestion === 0"
      :src="festivall_emblem"
      alt="Festivall Emblem"
      style="
        position: absolute;
        top: 2rem;
        left: 50%;
        transform: translateX(-50%);
        height: 100px;
        width: auto;
      "
    />
    <div
      class="form-slide"
      v-for="(question, index) in filteredQuestions"
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

        <div v-if="question.type === 'radio'">
          <label v-for="option in question.options" :key="option" class="radio">
            <input type="radio" :value="option" v-model="answers[index]" />
            {{ option }}
          </label>
        </div>
        <input v-if="question.type === 'text'" type="text" v-model="answers[index]" />
        <textarea v-if="question.type === 'textarea'" v-model="answers[index]"></textarea>
        <div v-if="question.type === 'checkbox'">
          <label v-for="option in question.options" :key="option" class="checkbox">
            <input type="checkbox" :value="option" v-model="answers[index]" />
            {{ option }}
          </label>
        </div>
        <div class="controls">
          <button v-if="index > 0" @click="prevQuestion">
            <img :src="up_icon" alt="Previous" style="height: auto; width: 32px" />
          </button>
          <button v-if="index < filteredQuestions.length - 1 && index > 0" @click="nextQuestion">
            <img :src="down_icon" alt="Next" style="height: auto; width: 32px" />
          </button>
        </div>
        <button v-if="index === filteredQuestions.length - 1" @click="submitForm">Submit</button>
        <button v-if="index === 0" @click="nextQuestion">Begin</button>
      </div>
    </div>
  </div>
</template>

<script>
import festivall_emblem from '@/assets/images/festivall_emblem_white.png'
import stage_bg from '@/assets/images/hotspot/stage_bg.png'
import up_icon from '@/assets/images/starcrossed/up.png'
import down_icon from '@/assets/images/starcrossed/down.png'
import axios from 'axios'

export default {
  data() {
    return {
      currentQuestion: 0,
      backgroundImage: stage_bg,
      purpose: '',
      questions: [
        {
          text: 'Welcome to the Community Hotspot.',
          subtext:
            'This venue is a cozy and versatile space located in a private residence.\nIt is perfect for small gatherings, workshops, and microevents.\n\nPlease select your purpose:',
          type: 'radio',
          options: ['Attend an Event', 'Promote/Host an Event']
        },
        {
          text: 'Please provide your full name:',
          type: 'text'
        },
        {
          text: 'Please provide your email:',
          type: 'text'
        },
        {
          text: 'Please provide your phone number:',
          type: 'text'
        },
        {
          text: 'Which events are you interested in?',
          type: 'checkbox',
          options: [
            'Woodworking Classes',
            'DJ Nights',
            'House Concerts',
            'Spoken Word',
            'Coding Workshops'
          ],
          condition: 'attend'
        },
        {
          text: 'Please provide the date and time for the event:',
          type: 'text',
          condition: 'host'
        },
        {
          text: 'Please provide details about the event you want to host:',
          type: 'textarea',
          condition: 'host'
        },
        {
          text: 'Do you have any special requirements for the event?',
          type: 'textarea',
          condition: 'host'
        },
        {
          text: 'How did you hear about us?',
          type: 'text'
        },
        {
          text: 'Would you like to subscribe to our newsletter?',
          type: 'radio',
          options: ['Yes', 'No']
        },
        {
          text: 'Please provide any additional comments or suggestions:',
          type: 'textarea'
        },
        {
          text: 'Press Submit to complete the form.',
          subtext: 'We will get back to you shortly with more details.'
        }
      ],
      answers: [],
      up_icon: up_icon,
      down_icon: down_icon,
      festivall_emblem: festivall_emblem
    }
  },
  computed: {
    filteredQuestions() {
      if (this.purpose === 'attend') {
        return this.questions.filter((q) => !q.condition || q.condition === 'attend')
      } else if (this.purpose === 'host') {
        return this.questions.filter((q) => !q.condition || q.condition === 'host')
      }
      return this.questions
    }
  },
  methods: {
    nextQuestion() {
      if (this.currentQuestion === 0) {
        const purposeAnswer = this.answers[0]
        if (purposeAnswer === 'Attend an Event') {
          this.purpose = 'attend'
        } else if (purposeAnswer === 'Promote/Host an Event') {
          this.purpose = 'host'
        }
      }
      if (this.currentQuestion < this.filteredQuestions.length - 1) {
        this.currentQuestion++
      } else {
        this.submitForm()
      }
    },
    prevQuestion() {
      if (this.currentQuestion > 0) {
        this.currentQuestion--
      }
    },
    submitForm() {
      // Handle form submission
      const payload = {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*New Hotspot Submission*\n\n${this.answers.map((answer, index) => `*${this.questions[index].text}*\n${answer}`).join('\n')}`
            }
          }
        ]
      }

      axios
        .post('https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK', payload)
        .then((response) => {
          console.log('Form submitted:', response.data)
          alert('Your submission has been received!')
          this.answers = []
          this.currentQuestion = 0
          this.purpose = ''
          // Refresh the page to take them back to the beginning
          window.location.reload()
        })
        .catch((error) => {
          console.error('Error:', error)
          alert('There was an error with your submission. Please try again.')
        })
    },
    formatText(text) {
      return text.replace(/\n/g, '<br>')
    }
  },
  created() {
    // Initialize answers array with empty arrays for each question
    this.questions.forEach((_, index) => {
      this.answers[index] = []
    })
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
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  background-color: rgba(0, 0, 0, 0.288);
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  width: 67%;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

input,
textarea {
  width: 100%;
  padding: 0.5rem;
  margin: 1rem 0;
  background-color: rgba(255, 255, 255, 0);
  border: 1px solid white;
  border-radius: 5px;
  color: white;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus {
  border-color: white;
}

.checkbox {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  margin: 1rem 0;
  /* border: 1px solid white; */
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.1);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
  cursor: pointer;
}
.radio {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  margin: 1rem 0;
  /* border: 1px solid white; */
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.1);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
  cursor: pointer;
}

.checkbox:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.checkbox:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
}

button {
  padding: 0.75rem 1rem;
  margin: 1rem;
  border: none;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.2);
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
</style>
