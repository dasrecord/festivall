<template>
  <div class="dark-theme">
    <div class="content">
      <img
        :src="reunion_emblem"
        alt="reunion"
        class="reunion-emblem"
        style="cursor: pointer"
        @click="$router.push('/reunion')"
      />
      <img :src="frog_image" alt="Frog" class="frog-image" />
      <h2>REUNION VOLUNTEER INSTRUCTIONS</h2>
      <h3>
        In addition to the minimum shift requirements,<br />
        we kindly encourage you to volunteer for as many roles and shifts as you can confidently and
        safely commit to.
      </h3>
      <div class="instructions">
        <div class="crew">
          <img
            :src="volunteer_icon"
            alt="Volunteer Icon"
            class="volunteer-icon"
            style="width: 64px"
          />
          <div>
            <button @click="router.push('/reunion-volunteer-signup')" class="volunteer-button">
              ALL TEAMS SIGNUP
            </button>
            <p>
              By selecting this option, you will be able to sign up for multiple teams and shifts
              during the event. This option is ideal for volunteers who are flexible and willing to
              help out in various capacities.
            </p>
          </div>
        </div>
        <div class="crew">
          <img
            :src="frontgate_icon"
            alt="Front Gate Icon"
            class="volunteer-icon"
            style="width: 64px"
          />
          <div>
            <button @click="router.push('/reunion-frontgate-signup')" class="volunteer-button">
              FRONT GATE SIGNUP<br />[Minimum Three 2-Hour Shifts/Weekend]
            </button>
            <p>
              Front Gate Volunteers are responsible for welcoming attendees and securing admission
              using our in-house ticketing system. They are the first point of contact for attendees
              and play a crucial role in ensuring a positive experience for everyone.
            </p>
          </div>
        </div>
        <div class="crew">
          <img
            :src="foodteam_icon"
            alt="Food Team Icon"
            class="volunteer-icon"
            style="width: 64px"
          />
          <div>
            <button @click="router.push('/reunion-foodteam-signup')" class="volunteer-button">
              FOOD TEAM SIGNUP<br />[Minimum Two 4-Hour Shifts Per Weekend]
            </button>
            <p>
              Food Team Volunteers are responsible for assisting with food preparation, serving, and
              cleanup. They help ensure that attendees have access to food and refreshments during
              the event and maintain cleanliness and hygiene in the food service area.
            </p>
          </div>
        </div>
        <div class="crew">
          <img
            :src="setupcrew_icon"
            alt="Setup Crew Icon"
            class="volunteer-icon"
            style="width: 64px"
          />
          <div>
            <button @click="router.push('/reunion-setupcrew-signup')" class="volunteer-button">
              SETUP CREW SIGNUP<br />[Minimum One 8-Hour Shift PreShow]
            </button>
            <p>
              Setup Crew Volunteers are responsible for setting up equipment, decorations, and other
              items needed for the event. They help create a welcoming and festive atmosphere for
              attendees and ensure that the event space is ready for the activities and programs
              planned.
            </p>
          </div>
        </div>
        <div class="crew">
          <img
            :src="cleanupcrew_icon"
            alt="Cleanup Crew Icon"
            class="volunteer-icon"
            style="width: 64px"
          />
          <div>
            <button @click="router.push('/reunion-cleanupcrew-signup')" class="volunteer-button">
              CLEANUP CREW SIGNUP<br />[Minimum One 8-Hour Shift PostShow]
            </button>
            <p>
              Cleanup Crew Volunteers are responsible for clearing and cleaning the event space
              after the event. They help pack up equipment, decorations, and other items, and ensure
              that the venue is left in good condition. Cleanup Crew Volunteers play a vital role in
              wrapping up the event smoothly and efficiently.
            </p>
          </div>
        </div>
        <div class="crew">
          <img
            :src="stagecrew_icon"
            alt="Stage Crew Icon"
            class="volunteer-icon"
            style="width: 64px"
          />
          <div>
            <button @click="router.push('/reunion-stagecrew-signup')" class="volunteer-button">
              STAGE CREW SIGNUP<br />[Minimum Two 4-Hour Shifts Per Weekend]
            </button>
            <p>
              Stage Crew Volunteers are responsible for assisting with stage setup, sound equipment,
              lighting, and other technical aspects of the event. They help ensure that performers
              and presenters have the necessary support and equipment for their performances and
              presentations.
            </p>
          </div>
        </div>
      </div>
      <h3 style="margin-top: 1rem">
        If you have any questions or require further assistance, please contact us at
        <a href="mailto:reunion@festivall.ca">reunion@festivall.ca</a>
      </h3>
    </div>
  </div>
</template>

<script setup>
import frog_image from '@/assets/images/frog.png'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import { useRouter } from 'vue-router'

import volunteer_icon from '@/assets/images/icons/volunteer.png'
import frontgate_icon from '@/assets/images/icons/front_gate.png'
import foodteam_icon from '@/assets/images/icons/meals.png'
import setupcrew_icon from '@/assets/images/icons/setup_crew.png'
import cleanupcrew_icon from '@/assets/images/icons/cleanup_crew.png'
import stagecrew_icon from '@/assets/images/icons/stage_crew.png'

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
  max-width: 600px;
  margin-bottom: 1rem;
}
.content {
  width: 80vw;
  display: flex;
  flex-direction: column;

  align-items: center;
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
  max-width: 700px;
}

.crew {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 1rem;
  border: 1px solid var(--reunion-frog-green);
  padding: 1rem;
  border-radius: 10px;
}

.crew img {
  width: 64px;
  height: auto;
  margin: 0 1rem;
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
  width: 100%;
  background-color: var(--reunion-frog-green);
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  text-transform: uppercase;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.volunteer-button:hover {
  transform: scale(1.05);
  box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.3);
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
