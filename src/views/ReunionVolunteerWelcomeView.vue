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

      <h1 class="welcome-title">🎉 Welcome to the Volunteer Team!</h1>

      <div class="next-steps">
        <h3>What happens next?</h3>
        <div class="step-list">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Slack Invitation</h3>
              <p>
                Our Volunteer Coordinator will reach out to you on Slack regarding any updates and
                coordination.
              </p>
              <button
                @click="window.open('https://festivall.ca/reunionslack', '_blank')"
                class="dept-button primary-signup"
              >
                Click Here to Join Slack
              </button>
            </div>
          </div>

          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Confirm/Adjust Your Shift</h3>
              <p>
                View all available shifts and claim the ones that work for you. You can see openings
                across all teams or filter by your department.
              </p>
              <div class="department-access">
                <button
                  @click="router.push('/reunion-volunteer-signup')"
                  class="dept-button primary-signup"
                >
                  📅 Sign Up for Shifts
                </button>
              </div>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Access Your Department Manual</h3>
              <p>
                Review and manage your specific Manual during the festival using our real-time
                coordination system.
              </p>
              <div class="department-access">
                <h5>Select your department to access task management:</h5>
                <div class="department-buttons">
                  <button @click="router.push('/reunionfrontgate')" class="dept-button frontgate">
                    🚪 Front Gate Manual
                  </button>
                  <button @click="router.push('/reunionfoodteam')" class="dept-button foodteam">
                    🍽️ Food Team Manual
                  </button>
                  <button @click="router.push('/reunionsetupcrew')" class="dept-button setup">
                    🔧 Setup Crew Manual
                  </button>
                  <button @click="router.push('/reunionstagecrew')" class="dept-button stage">
                    🎵 Stage Crew Manual
                  </button>
                  <button @click="router.push('/reunioncleanupcrew')" class="dept-button cleanup">
                    🧹 Cleanup Crew Manual
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>During the Festival</h3>
              <p>
                Use the task management system to coordinate with your team in real-time. Claim
                tasks, mark them complete, and see what your teammates are working on!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-info">
        <h3>Questions?</h3>
        <p>
          Reach out to our Volunteer Coordinator on Slack or check the
          <router-link to="/reunion-volunteer-instructions">volunteer instructions</router-link>
          again.
        </p>
      </div>

      <div class="footer-actions">
        <button @click="router.push('/reunion')" class="secondary-button">
          ← Back to Reunion Info
        </button>
        <button @click="router.push('/reunion-volunteer-instructions')" class="secondary-button">
          View All Volunteer Info
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import reunion_emblem from '@/assets/images/reunion_emblem_white.png'

const router = useRouter()
</script>

<style scoped>
.dark-theme {
  background-color: black;
  color: white;
  min-height: 100vh;
  padding: 2rem;
}

.content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.reunion-emblem {
  width: 120px;
  height: auto;
  margin-bottom: 2rem;
}

.welcome-title {
  color: var(--reunion-frog-green, #4caf50);
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.success-message {
  color: #4caf50;
  font-size: 1.5rem;
  margin-bottom: 3rem;
  font-weight: 300;
}

.next-steps {
  text-align: left;
  margin: 3rem 0;
}

.next-steps h3 {
  color: var(--reunion-frog-green, #4caf50);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border-left: 4px solid var(--reunion-frog-green, #4caf50);
}

.step-number {
  background-color: var(--reunion-frog-green, #4caf50);
  color: black;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.step-content h4,
.step-content h3 {
  color: var(--reunion-frog-green, #4caf50);
  margin-bottom: 0.5rem;
  text-align: left;
}

.step-content p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.department-access {
  margin-top: 1rem;
}

.department-access h5 {
  color: #ccc;
  margin-bottom: 1rem;
}

.department-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.dept-button {
  padding: 1rem;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.dept-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.frontgate {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
}
.foodteam {
  background: linear-gradient(135deg, #ff9800, #e65100);
  color: white;
}
.setup {
  background: linear-gradient(135deg, #2196f3, #0d47a1);
  color: white;
}
.stage {
  background: linear-gradient(135deg, #9c27b0, #4a148c);
  color: white;
}
.cleanup {
  background: linear-gradient(135deg, #607d8b, #263238);
  color: white;
}

.primary-signup {
  background: linear-gradient(135deg, var(--reunion-frog-green, #4caf50), #2e7d32);
  color: white;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  font-weight: bold;
  border: none;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.primary-signup:hover {
  background: linear-gradient(135deg, #2e7d32, var(--reunion-frog-green, #4caf50));
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.important-note {
  background-color: rgba(255, 193, 7, 0.1);
  border: 2px solid #ffc107;
  border-radius: 15px;
  padding: 1.5rem;
  margin: 3rem 0;
}

.important-note h3 {
  color: #ffc107;
  margin-bottom: 1rem;
}

.contact-info {
  margin: 3rem 0;
  padding: 1.5rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
}

.contact-info h3 {
  color: var(--reunion-frog-green, #4caf50);
  margin-bottom: 1rem;
}

.footer-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 3rem;
}

.secondary-button {
  background-color: transparent;
  color: var(--reunion-frog-green, #4caf50);
  border: 2px solid var(--reunion-frog-green, #4caf50);
  padding: 12px 24px;
  border-radius: 15px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.secondary-button:hover {
  background-color: var(--reunion-frog-green, #4caf50);
  color: black;
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .step {
    flex-direction: column;
    text-align: center;
  }

  .department-buttons {
    grid-template-columns: 1fr;
  }

  .footer-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
