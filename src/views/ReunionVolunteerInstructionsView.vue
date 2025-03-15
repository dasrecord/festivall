<template>
  <div class="dark-theme">
    <div class="content">
      <img :src="reunion_emblem" alt="Reunion Emblem" class="reunion-emblem" />
      <img :src="frog_image" alt="Frog" class="frog-image" />
      <h2>REUNION VOLUNTEER INSTRUCTIONS</h2>
      <h3>Please select as many roles and shifts as you are able to commit to.</h3>
      <div class="instructions">
        <div class="team">
          <button @click="router.push('/reunion-frontgate-signup')" class="volunteer-button">
            FRONT GATE SIGNUP [Minimum One 4-Hour Shift/Day]
          </button>
          <p>
            Front Gate Volunteers are responsible for welcoming attendees, checking tickets, and
            providing information about the event. They are the first point of contact for attendees
            and play a crucial role in ensuring a positive experience for everyone.
          </p>
        </div>
        <div class="team">
          <button @click="router.push('/reunion-foodteam-signup')" class="volunteer-button">
            FOOD TEAM SIGNUP 
          </button>
          <p>
            Food Team Volunteers are responsible for assisting with food preparation, serving, and
            cleanup. They help ensure that attendees have access to food and refreshments during the
            event and maintain cleanliness and hygiene in the food service area.
          </p>
        </div>
        <div class="team">
          <button @click="router.push('/reunion-setupcrew-signup')" class="volunteer-button">
            SETUP CREW SIGNUP [Minimum One 8-Hour Shift PreShow]
          </button>
          <p>
            Setup Crew Volunteers are responsible for setting up equipment, decorations, and other
            items needed for the event. They help create a welcoming and festive atmosphere for
            attendees and ensure that the event space is ready for the activities and programs
            planned.
          </p>
        </div>
        <div class="team">
          <button @click="router.push('/reunion-cleanupcrew-signup')" class="volunteer-button">
            CLEANUP CREW SIGNUP [Minimum One 8-Hour Shift PostShow]
          </button>
          <p>
            Cleanup Crew Volunteers are responsible for clearing and cleaning the event space after
            the event. They help pack up equipment, decorations, and other items, and ensure that
            the venue is left in good condition. Cleanup Crew Volunteers play a vital role in
            wrapping up the event smoothly and efficiently.
          </p>
        </div>
        <div class="team">
          <button @click="router.push('/reunion-stagecrew-signup')" class="volunteer-button">
            STAGE CREW SIGNUP [Minimum One 4-Hour Shift/Day]
          </button>
          <p>
            Stage Crew Volunteers are responsible for assisting with stage setup, sound equipment,
            lighting, and other technical aspects of the event. They help ensure that performers and
            presenters have the necessary support and equipment for their performances and
            presentations.
          </p>
        </div>
      </div>

      <h3>
        If you have any questions or require further assistance, please contact us at
        <a href="mailto:reunion@festivall.ca">reunion@festivall.ca</a>.
      </h3>
    </div>
  </div>
</template>

<script setup>
import frog_image from '@/assets/images/frog.png'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.dark-theme {
  background-color: #121212;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.reunion-emblem {
  width: 75%;
  margin-bottom: 1rem;
}
.content {
  width: 80vw;
  padding: 1rem;
  border: 1px solid #444;
  border-radius: 15px;
  background-color: #1e1e1e;
}

.frog-image {
  width: 100%;
  max-width: 250px;
  margin-bottom: 1rem;
}
.instructions {
  text-align: left;
  margin-top: 1rem;
}

.team {
  margin-bottom: 1rem;
  border: 1px solid var(--reunion-frog-green);
  padding: 1rem;
}

h2 {
  color: var(--reunion-frog-green);
  text-shadow: 0px 0px 5px rgb(255, 255, 255, 0.3);
}

a {
  color: var(--reunion-frog-green);
}

a:hover {
  text-decoration: underline;
}

.volunteer-button {
  background-color: var(--reunion-frog-green);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

@media (max-width: 600px) {
  .content {
    width: 100%;
    padding: 0.5rem;
  }

  .dark-theme {
    padding: 0.5rem;
  }

  h2,
  h3,
  ul,
  li {
    font-size: 0.8rem;
  }
}
</style>
