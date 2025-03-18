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
      <h2>REUNION ARTIST RESPONSIBILITIES</h2>
      <h3>As a Reunion Artist, you are expected to adhere to the following responsibilities:</h3>
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
            If there are any changes to your availability, performance schedule, or any other
            relevant details, please inform the Reunion team as soon as possible. Prompt
            communication helps us manage the event smoothly and efficiently.
          </p>
        </li>
        <li>
          <strong>Ensure you are on time for your scheduled performance slot:</strong>
          <p>
            Punctuality is crucial to maintaining the event schedule. Please arrive on time and be
            prepared for your performance to ensure a seamless experience for everyone involved.
          </p>
        </li>
        <li>
          <strong>Actively promote the festival throughout the year:</strong>
          <p>
            Help us spread the word about the festival by sharing updates, announcements, and
            promotional materials on your social media platforms and with your network.
          </p>
        </li>
        <li>
          <strong>Respect the venue, volunteers, and attendees:</strong>
          <p>
            Adhere to the rules and regulations of the venue, and treat all volunteers, staff, and
            attendees with respect and kindness. Your cooperation helps create a positive
            environment for everyone.
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
