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
      <h2>REUNION VOLUNTEER RESPONSIBILITIES</h2>
      <h3>As a Reunion Volunteer, you are expected to adhere to the following responsibilities:</h3>
      <ul class="responsibilities">
        <li>
          <strong>Join the Reunion Slack team:</strong>
          <p>
            Ensure you are part of the Reunion Slack team to stay updated with important
            announcements, schedules, and communications.
          </p>
        </li>
        <li>
          <strong>Maintain communication with the festival team:</strong>
          <p>
            Regularly check and respond to messages from the festival team to ensure smooth
            coordination and address any updates or changes promptly.
          </p>
        </li>
        <li>
          <strong>Complete minimum shift requirements:</strong>
          <p>
            Fulfill the minimum shift requirements as agreed upon to ensure the event runs
            efficiently and all responsibilities are covered.
          </p>
        </li>
        <li>
          <strong>Respect the venue and employ responsible behavior:</strong>
          <p>
            Adhere to the venue's rules and guidelines, respect the property, and demonstrate
            responsible behavior throughout the event.
          </p>
        </li>
        <li>
          <strong>Actively promote the event:</strong>
          <p>
            Help spread the word about the event through social media, word of mouth, or other means
            to encourage attendance and participation.
          </p>
        </li>
        <li>
          <strong>Provide assistance and support to attendees:</strong>
          <p>
            Be available to assist attendees, provide information, and address any questions or
            concerns to ensure a positive experience for all participants.
          </p>
        </li>
        <li>
          <strong>Arrival:</strong>
          <p>
            Please arrive 10 minutes before your scheduled shift. You should have all the tools or
            supplies you'll need for your shift. Check in at the front gate upon arrival. They'll
            radio the volunteer coordinator or your crew coordinator to connect.
          </p>
        </li>
        <li>
          <strong>Perks of Volunteering:</strong>
          <p>Free admission, meal tickets, and being part of the Reunion family.</p>
        </li>

        <ul class="crew">
          <img :src="front_gate_icon" alt="Front Gate Icon" />
          <li>
            <strong>Front Gate:</strong><br />
            <p class="minimum">[Minimum Three 2-Hour Shifts Per Weekend]</p>
            <p>
              Front Gate Volunteers are responsible for welcoming attendees and securing admission
              using our in-house ticketing system. They are the first point of contact for attendees
              and play a crucial role in ensuring a positive experience for everyone.
            </p>
            <p>Team Lead: Prasenjit</p>
          </li>
        </ul>
        <ul class="crew">
          <img :src="food_team_icon" alt="Food Team Icon" />
          <li>
            <strong>Food Team:</strong><br />
            <p class="minimum">[Minimum Two 4-Hour Shifts Per Weekend]</p>
            <p>
              Food Team Volunteers are responsible for assisting with food preparation, serving, and
              cleanup. They help ensure that attendees have access to food and refreshments during
              the event and maintain cleanliness and hygiene in the food service area. Shifts are
              structured as 1 hour of preparation, 2 hours of service, and 1 hour of cleanup.
            </p>
            DAYS: FRI,SAT,SUN<br />
            LUNCH: 11am-3pm<br />
            SUPPER: 5pm-9pm<br />
            <p>Team Lead: Angela</p>
          </li>
        </ul>
        <ul class="crew">
          <img :src="setup_crew_icon" alt="Setup Crew Icon" />
          <li>
            <h1><strong>Setup Crew:</strong><br /></h1>
            <p class="minimum">[Minimum One 8-Hour Shift PreShow]</p>
            <p>
              Setup Crew Volunteers are responsible for setting up equipment, decorations, and other
              items needed for the event. They help create a welcoming and festive atmosphere for
              attendees and ensure that the event space is ready for the activities and programs
              planned.
            </p>
            <p>Team Lead: Brandon</p>
          </li>
        </ul>
        <ul class="crew">
          <img :src="cleanup_crew_icon" alt="Cleanup Crew Icon" />
          <li>
            <strong>Cleanup Crew:</strong><br />
            <p class="minimum">[Minimum One 8-Hour Shift PostShow]</p>
            <p>
              Cleanup Crew Volunteers are responsible for clearing and cleaning the event space
              after the event. They help pack up equipment, decorations, and other items, and ensure
              that the venue is left in good condition. Cleanup Crew Volunteers play a vital role in
              wrapping up the event smoothly and efficiently.
            </p>
            <p>Team Lead: Chris</p>
          </li>
        </ul>
        <ul class="crew">
          <img :src="stage_crew_icon" alt="Stage Crew Icon" />
          <li>
            <strong>Stage Crew:</strong><br />
            <p class="minimum">[Minimum Two 4-Hour Shifts Per Weekend]</p>
            <p>
              Stage Crew Volunteers are responsible for assisting with stage setup, sound equipment,
              lighting, and other technical aspects of the event. They help ensure that performers
              and presenters have the necessary support and equipment for their performances and
              presentations.
            </p>
            <p>Team Lead: Arthur</p>
          </li>
        </ul>
      </ul>

      <h3 style="margin-top: 1rem">
        If you have any questions or require further assistance,<br />
        please contact our Volunteer Coordinator - Caitlin, at:<br />
        <a href="mailto:reunionvolunteercoordinator@festivall.ca"
          >reunionvolunteercoordinator@festivall.ca</a
        >
      </h3>
    </div>
  </div>
</template>

<script setup>
import frog_image from '@/assets/images/frog.png'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import setup_crew_icon from '../assets/images/icons/setup_crew.png'
import stage_crew_icon from '../assets/images/icons/stage_crew.png'
import cleanup_crew_icon from '../assets/images/icons/cleanup_crew.png'
import food_team_icon from '../assets/images/icons/meals.png'
import front_gate_icon from '../assets/images/icons/front_gate.png'
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

.content {
  width: 80vw;
  padding: 1rem;
  border: 1px solid #444;
  border-radius: 15px;
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.responsibilities {
  text-align: left;
  margin-top: 1rem;
}

.reunion-emblem {
  width: 100%;
  max-width: 600px;
  margin-bottom: 1rem;
}

.frog-image {
  width: 100%;
  max-width: 250px;
  margin-bottom: 1rem;
}

h2 {
  color: var(--reunion-frog-green);
  text-shadow: 0px 0px 5px rgb(255, 255, 255, 0.3);
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li p {
  margin: 0.5rem 0 1rem 0;
  text-transform: none;
  color: #cccccc;
}
.minimum {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  font-size: large;
  /* color: var(--reunion-frog-green); */
  font-weight: bold;
  margin: 0.5rem 0 1rem 0;
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
  margin: 0 2rem 0 1rem;
}
.crew li {
  text-transform: uppercase;
}

strong {
  color: #ffffff;
  font-weight: bold;
  font-size: medium;
}

a {
  color: var(--reunion-frog-green);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
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
