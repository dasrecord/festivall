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
      <h2>REUNION FESTIVAL FAQ's</h2>

      <div class="faq-section">
        <div class="crew-header">
          <img :src="front_gate_icon" alt="Front Gate Icon" />
          <h3>FRONT GATE - FAQ</h3>
        </div>

        <div class="faq-item">
          <strong>Q: What do I do if someone doesn't have a ticket?</strong>
          <p>
            A: There should be service there, so you can direct them to the website to purchase the
            ticket directly by etransfer or bitcoin, or they can pay directly at the site with cash.
            Please note: Door sales are subject to an additional $10 fee per ticket.
          </p>
        </div>

        <div class="faq-item">
          <strong>Q: What if someone says they're on the guest list or a volunteer?</strong>
          <p>
            A: Check the printed/online list. If they're not on it, radio your Front Gate
            coordinator.
          </p>
        </div>

        <div class="faq-item">
          <strong>Q: Can I leave the gate unattended for a break?</strong>
          <p>A: No. Always make sure another trained volunteer is there before stepping away.</p>
        </div>

        <div class="faq-item">
          <strong>Q: How do I use the ticket scanner or check-in system?</strong>
          <p>
            A: You'll have a virtual ticket scanner, which you can either use on your phone or the
            provided phones/tablets. You'll be given access to the ticket scanning application
            onsite.
          </p>
        </div>

        <div class="faq-item">
          <strong>Q: Where is the lost and found?</strong>
          <p>A: Lost and found is at the front gate.</p>
        </div>
      </div>

      <div class="faq-section">
        <div class="crew-header">
          <img :src="food_team_icon" alt="Food Team Icon" />
          <h3>FOOD TEAM - FAQ</h3>
        </div>

        <div class="faq-item">
          <strong>Q: What should I wear?</strong>
          <p>
            A: Close-toed shoes and hair tied back. Aprons and gloves are provided. Make sure you
            have good hygiene for working in the kitchen.
          </p>
        </div>

        <div class="faq-item">
          <strong>Q: What if we run out of something or need help?</strong>
          <p>A: Let Angela (your Kitchen coordinator) know right away.</p>
        </div>

        <div class="faq-item">
          <strong>Q: Can I eat while working a shift?</strong>
          <p>
            A: During prep or cleanup, yes—but not while serving. You're more than welcome to take a
            break for your meal.
          </p>
        </div>
      </div>

      <div class="faq-section">
        <div class="crew-header">
          <img :src="setup_crew_icon" alt="Setup Crew Icon" />
          <h3>SETUP CREW - FAQ</h3>
        </div>

        <div class="faq-item">
          <strong>Q: What should I bring?</strong>
          <p>
            A: Work gloves, water bottle, close-toed shoes, and work-appropriate clothing. We
            provide the tools you should need.
          </p>
        </div>

        <div class="faq-item">
          <strong>Q: Who decides where things go?</strong>
          <p>
            A: The setup coordinator will direct placement. Check in before moving anything large or
            finalizing an area.
          </p>
        </div>
      </div>

      <div class="faq-section">
        <div class="crew-header">
          <img :src="cleanup_crew_icon" alt="Cleanup Crew Icon" />
          <h3>CLEANUP CREW - FAQ</h3>
        </div>

        <div class="faq-item">
          <strong>Q: What kind of tasks will I be doing?</strong>
          <p>A: Packing gear, tearing down tents, picking up trash, sorting recycling, etc.</p>
        </div>

        <div class="faq-item">
          <strong>Q: What if I find lost items?</strong>
          <p>A: Bring them to the volunteer check-in or lost & found. Label if possible.</p>
        </div>

        <div class="faq-item">
          <strong>Q: What if something is broken or seems unsafe to move?</strong>
          <p>A: Don't attempt it alone. Notify your coordinator immediately.</p>
        </div>
      </div>

      <div class="faq-section">
        <div class="crew-header">
          <img :src="stage_crew_icon" alt="Stage Crew Icon" />
          <h3>STAGE CREW - FAQ</h3>
        </div>

        <div class="faq-item">
          <strong>Q: Do I need prior tech experience?</strong>
          <p>
            A: No, but let us know your comfort level. Some shifts require lifting, while others
            focus on artist support or technical aspects.
          </p>
        </div>

        <div class="faq-item">
          <strong>Q: What do I do if an artist is missing or late?</strong>
          <p>
            A: Let your coordinator know immediately — they will check the schedule or contact the
            performer.
          </p>
        </div>

        <div class="faq-item">
          <strong>Q: What if there's a sound issue on stage?</strong>
          <p>A: Radio the sound tech or flag down the lead crew member.</p>
        </div>
      </div>

      <h3 style="margin-top: 2rem">
        If you have any questions or require further assistance, please contact us at
        <a href="mailto:reunionvolunteercoordinator@festivall.ca">
          reunionvolunteercoordinator@festivall.ca
        </a>
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
  max-width: 800px;
  padding: 1rem;
  border: 1px solid #444;
  border-radius: 15px;
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  margin-bottom: 2rem;
}

.faq-section {
  width: 100%;
  margin-bottom: 2rem;
  border: 1px solid var(--reunion-frog-green);
  border-radius: 10px;
  padding: 1.5rem;
}

.crew-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.crew-header img {
  width: 48px;
  height: auto;
  margin-right: 1rem;
}

.crew-header h3 {
  color: var(--reunion-frog-green);
  text-shadow: 0px 0px 5px rgb(255, 255, 255, 0.3);
  margin: 0;
  font-size: 1.2rem;
}

.faq-item {
  text-align: left;
  margin-bottom: 1.5rem;
}

.faq-item:last-child {
  margin-bottom: 0;
}

.faq-item strong {
  color: #ffffff;
  font-weight: bold;
  font-size: 1rem;
  display: block;
  margin-bottom: 0.5rem;
}

.faq-item p {
  margin: 0;
  color: #cccccc;
  line-height: 1.4;
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

  .faq-section {
    padding: 1rem;
  }

  .crew-header {
    flex-direction: column;
    text-align: center;
  }

  .crew-header img {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }

  h2,
  h3 {
    font-size: 1rem;
  }

  .faq-item strong,
  .faq-item p {
    font-size: 0.9rem;
  }
}
</style>
