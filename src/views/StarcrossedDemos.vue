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
        <img
          v-if="index === 0"
          :src="starcrossed_emblem"
          alt="Starcrossed Emblem"
          style="height: auto"
          id="starcrossed_emblem"
        />
        <h2 v-html="formatText(question.text)"></h2>
        <p v-if="question.subtext" v-html="formatText(question.subtext)"></p>

        <input v-if="question.type === 'text'" type="text" v-model="answers[index]" />
        <textarea v-if="question.type === 'textarea'" v-model="answers[index]"></textarea>
        <div class="controls">
          <button v-if="index > 0" @click="prevQuestion">
            <img :src="up_icon" alt="Previous" style="height: auto; width: 32px" />
          </button>
          <button v-if="index < questions.length - 1 && index > 0" @click="nextQuestion">
            <img :src="down_icon" alt="Next" style="height: auto; width: 32px" />
          </button>
          <button v-if="index === questions.length - 1" @click="submitForm">
            Submit Another Track
          </button>
        </div>
        <button v-if="index === 0" @click="nextQuestion">UPLOAD</button>
      </div>
    </div>
  </div>
</template>

<script>
import starcrossed_emblem from '@/assets/images/starcrossed/starcrossed_emblem_white.png'
import spaceBg from '@/assets/images/starcrossed/space_bg.png'
import up_icon from '@/assets/images/starcrossed/up.png'
import down_icon from '@/assets/images/starcrossed/down.png'
import axios from 'axios'

export default {
  data() {
    return {
      currentQuestion: 0,
      backgroundImage: spaceBg,
      questions: [
        {
          text: 'Welcome to the music submission portal for Starcrossed.\n\nWe are a low volume, high quality, boutique record label\ninterested in the best electronic dance music\nfrom across the universe.\n\nWe have one rule...\n keep it danceable.'
        },
        {
          text: 'Please have the following ready:',
          subtext:
            'Your Contact Info\nPRO Details\nDownloadable Track URL\nTrack Name & BPM\nProduction/Composition Notes'
        },
        { text: 'Please provide your fullname:', type: 'text' },
        { text: 'Please provide your email:', type: 'text' },
        { text: 'Please provide your Performing Rights Organization (PRO) details:', type: 'text' },
        { text: 'Please submit a downloadable URL here:', type: 'text' },
        { text: 'What is the name of this song/work?', type: 'text' },
        { text: 'What is the tempo of this song/work in BPM?', type: 'text' },
        {
          text: 'Please feel free to add any notes or comments regarding the composition:',
          type: 'textarea'
        },
        {
          text: 'Thank you for your submission!',
          subtext:
            'Your track will be reviewed by our in-house A&R team.\nThe most promising works will receive an invitation to have the track signed for release with a recoupable advance fee.\nArtists retain the masters and royalty splits are 50/50.'
        }
        // Add more questions as needed
      ],
      answers: [],
      up_icon: up_icon,
      down_icon: down_icon,
      starcrossed_emblem: starcrossed_emblem
    }
  },
  methods: {
    nextQuestion() {
      if (this.currentQuestion < this.questions.length - 1) {
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
      axios
        .post('https://relayproxy.vercel.app/festivall_notifications', this.answers)
        .then((response) => {
          console.log('Form submitted:', response.data)
          alert('Your submission has been received!')
          this.answers = []
          this.currentQuestion = 0
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
  top: 100vh;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: top 0.8s ease;
}

.form-slide.active {
  top: 0;
}

.form-slide.previous {
  top: -100vh;
}

.form-slide.next {
  top: 100vh;
}

.question {
  background-color: rgba(0, 0, 0, 0.288);
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  width: 67%;
  color: white;
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
}
.controls {
  display: flex;
  justify-content: right;
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
}

button:hover {
  background-color: black;
  color: white;
}
</style>
