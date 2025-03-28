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
      <h2>REUNION VENDOR RESPONSIBILITIES</h2>
      <h3>As a Reunion Vendor, you are expected to adhere to the following responsibilities:</h3>
      <ul class="responsibilities">
        <li>
          <strong>Purchase festival passes as part of your participation:</strong>
          <p>
            Vendors are required to purchase festival passes. This allows you to keep 100% of your
            profits while supporting the festival.
          </p>
        </li>
        <li>
          <strong
            >Ensure that your vendor booth is set up on time and meets festival standards:</strong
          >
          <p>
            Arrive early to set up your booth and ensure it complies with the festival's guidelines.
            This includes safety measures, cleanliness, and visual appeal.
          </p>
        </li>
        <li>
          <strong>Maintain a professional and friendly demeanor with attendees:</strong>
          <p>
            Engage with festival attendees in a courteous and professional manner. Represent your
            brand and the festival positively.
          </p>
        </li>
        <li>
          <strong>Adhere to the festival's rules and regulations for vendors:</strong>
          <p>
            Follow all vendor-specific rules, including those related to sales, waste management,
            and booth operations. Ensure compliance with local laws and festival policies.
          </p>
        </li>
        <li>
          <strong
            >Communicate promptly with the festival team regarding any issues or concerns:</strong
          >
          <p>
            If you encounter any problems or have questions during the event, notify the festival
            team immediately to resolve them efficiently.
          </p>
        </li>
      </ul>
      <h3>
        If you have any questions or require further assistance, please contact us at
        <a href="mailto:reunion@festivall.ca">reunion@festivall.ca</a>
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
