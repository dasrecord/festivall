<template>
  <div class="dark-theme">
    <div class="content">
      <img :src="reunion_emblem" alt="Reunion Emblem" class="reunion-emblem" />
      <img :src="frog_image" alt="Frog" class="frog-image" />
      <h2>REUNION VOLUNTEER RESPONSIBILITIES</h2>
      <h3>As a Reunion Volunteer, you are expected to adhere to the following responsibilities:</h3>
      <ul class="responsibilities">
        <li>
          <strong>Ensure that your contact information is up-to-date and accurate:</strong>
          <p>
            Regularly check and update your contact details to avoid any miscommunication. This
            includes your email address, phone number, and any other relevant contact information.
          </p>
        </li>
        <li>
          <strong
            >Communicate promptly with the Reunion team regarding any changes or updates:</strong
          >
          <p>
            If there are any changes to your availability or assigned tasks, please inform the
            Reunion team as soon as possible. Prompt communication helps us manage the event
            smoothly and efficiently.
          </p>
        </li>
        <li>
          <strong>Participate in scheduled events and activities as agreed upon:</strong>
          <p>
            As a Reunion Volunteer, you are expected to participate in all scheduled events and
            activities that you have agreed to. This includes meetings, training sessions, and any
            other related activities.
          </p>
        </li>
        <li>
          <strong>Respect the venue and its rules during your participation:</strong>
          <p>
            Adhere to the rules and regulations of the venue where the event is being held. This
            includes respecting the property, following safety guidelines, and being mindful of
            other participants and attendees.
          </p>
        </li>
        <li>
          <strong>Provide feedback and suggestions to help improve future events:</strong>
          <p>
            Your feedback is valuable to us. After the event, please provide any suggestions or
            comments that can help us improve future events. Your insights and experiences can
            contribute to making the Reunion experience better for everyone.
          </p>
        </li>
        <ul class="front-gate">
          <li>
            <strong>Front Gate Volunteers:</strong>
            <p>
              Front Gate Volunteers are responsible for welcoming attendees, checking tickets, and
              providing information about the event. They are the first point of contact for
              attendees and play a crucial role in ensuring a positive experience for everyone.
            </p>
          </li>
        </ul>
        <ul class="food-team">
          <li>
            <strong>Food Team Volunteers:</strong>
            <p>
              Food Team Volunteers are responsible for assisting with food preparation, serving, and
              cleanup. They help ensure that attendees have access to food and refreshments during
              the event and maintain cleanliness and hygiene in the food service area.
            </p>
          </li>
        </ul>
        <ul class="setup-crew">
          <li>
            <strong>Setup Crew Volunteers:</strong>
            <p>
              Setup Crew Volunteers are responsible for setting up equipment, decorations, and other
              items needed for the event. They help create a welcoming and festive atmosphere for
              attendees and ensure that the event space is ready for the activities and programs
              planned.
            </p>
          </li>
        </ul>
        <ul class="cleanup-crew">
          <li>
            <strong>Cleanup Crew Volunteers:</strong>
            <p>
              Cleanup Crew Volunteers are responsible for clearing and cleaning the event space
              after the event. They help pack up equipment, decorations, and other items, and ensure
              that the venue is left in good condition. Cleanup Crew Volunteers play a vital role in
              wrapping up the event smoothly and efficiently.
            </p>
          </li>
        </ul>
        <ul class="stage-crew">
          <li>
            <strong>Stage Crew Volunteers:</strong>
            <p>
              Stage Crew Volunteers are responsible for assisting with stage setup, sound equipment,
              lighting, and other technical aspects of the event. They help ensure that performers
              and presenters have the necessary support and equipment for their performances and
              presentations.
            </p>
          </li>
        </ul>
      </ul>

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
}

.responsibilities {
  text-align: left;
  margin-top: 1rem;
}

.reunion-emblem {
  width: 75%;
  margin-bottom: 1rem;
}

.frog-image {
  width: 100%;
  max-width: 250px;
  margin-bottom: 1rem;
}

h2,
h3 {
  color: var(--reunion-frog-green);
  text-shadow: 0px 0px 5px rgb(255, 255, 255, 0.3);
}

ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

li {
  margin-bottom: 1rem;
}

li p {
  margin: 0.5rem 0 1rem 0;
  color: #cccccc;
}

strong {
  color: #ffffff;
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
