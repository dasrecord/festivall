<template>
  <div class="basic">
    <img :src="reunion_emblem" alt="Reunion Emblem" class="header-emblem" />
    <h1 class="highlight">Reunion Arcade Attendant Manual</h1>

    <!-- ID Code Authentication -->
    <div class="auth-section" v-if="!isAuthenticated">
      <h2>Enter your ID_CODE to access task management</h2>
      <div class="form-section">
        <label for="id_code">Your ID_CODE:</label>
        <input
          type="text"
          id="id_code"
          v-model="userIdCode"
          placeholder="Enter your 5-character ID_CODE"
          maxlength="5"
          @input="handleIdCodeInput"
          @blur="validateIdCode"
        />
      </div>
      <button @click="authenticateUser" :disabled="!userIdCode || userIdCode.length !== 5">
        Access Tasks
      </button>
    </div>

    <!-- Task Management Interface -->
    <div v-if="isAuthenticated" class="task-interface">
      <h2>Welcome {{ userName }}!</h2>
      <p>Department: <span class="highlight">Arcade Attendant</span></p>

      <div
        class="role-summary"
        style="
          margin: 1rem 0 2rem 0;
          padding: 1.5rem;
          background-color: rgba(233, 30, 99, 0.1);
          border: 2px solid #e91e63;
          border-radius: 10px;
          text-align: left;
        "
      >
        <h3 style="color: #e91e63; margin-bottom: 0.75rem"><img :src="arcade_icon" style="width: 22px; height: auto; margin-right: 8px; vertical-align: middle" />Your Role</h3>
        <p style="margin-bottom: 0.75rem">
          The Arcade Trailer is operational during all festival stage hours. You are responsible for
          managing the full lifecycle of the trailer: starting the generator, booting arcade systems,
          running the flipbook station, and safely shutting everything down at end of day.
        </p>
        <p style="margin: 0; font-size: 0.9rem; color: #ccc">
          <strong>Equipment used:</strong> Generator · Arcade cabinets · Flipbook computer ·
          Paper cutter · Heavy-duty stapler
        </p>
      </div>

      <!-- Supplies & Equipment Summary -->
      <div v-if="deptItems.length > 0" class="supplies-summary">
        <div class="supplies-header">📦 Supplies &amp; Equipment</div>
        <div
          v-for="item in deptItems"
          :key="item.id"
          class="supplies-row"
          :class="{ 'needs-restock': item.needs_restock }"
        >
          <span class="supplies-name">{{ item.name }}</span>
          <span class="supplies-location">
            📍 {{ item.location?.replace(/_icon$/, '').replace(/_/g, ' ') }}
            <template v-if="item.sub_location"> › {{ item.sub_location }}</template>
          </span>
          <span v-if="item.needs_restock" class="supplies-restock">⚠️ Needs restock</span>
        </div>
      </div>

      <div class="task-section">
        <h3>Arcade Attendant Tasks</h3>
        <div class="task-grid">
          <div
            v-for="task in arcadeTasks"
            :key="task.id"
            class="task-item"
            :class="{
              completed: task.completed,
              'personal-task': task.type === 'personal'
            }"
          >
            <div class="task-content">
              <h4>{{ task.title }}</h4>
              <p>{{ task.description }}</p>
              <InventoryTaskItems
                :items="getItemsForTask(task.id)"
                :canFlag="true"
                @flag="flagNeedsRestock"
              />
              <div class="task-meta">
                <span v-if="task.completed" class="completed-by">
                  ✓ Completed by: {{ task.completedByName }}
                </span>
              </div>
            </div>
            <div class="task-actions">
              <template v-if="task.type === 'personal'">
                <button
                  v-if="!task.completed"
                  @click="completeTask(task.id)"
                  class="personal-complete-btn"
                >
                  ✓ Mark as Done
                </button>
                <span v-if="task.completed" class="personal-completed"> ✓ Completed </span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="progress-section">
        <h3>Progress Overview</h3>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <p>{{ completedTasks }} of {{ totalTasks }} tasks completed ({{ progressPercentage }}%)</p>
      </div>

      <!-- Admin Panel (Firebase Auth Required) -->
      <div v-if="isFirebaseAuthenticated" class="admin-panel">
        <h3 style="color: #ff6b6b; margin-bottom: 1rem">🔧 Admin Controls</h3>
        <div class="admin-actions">
          <button @click="resetAllTasks" class="admin-btn danger">
            Reset All Arcade Attendant Tasks
          </button>
          <p style="font-size: 0.9rem; color: #ccc; margin-top: 0.5rem">
            ⚠️ This will reset all Arcade Attendant tasks. Use with caution.
          </p>
        </div>
      </div>
    </div>

    <!-- Public Task Overview -->
    <div v-if="!isAuthenticated" class="public-tasks">
      <h2>Arcade Attendant</h2>
      <div class="task-overview">
        <div class="task-category">
          <h3>Role Overview</h3>
          <ul>
            <li>Operational during all festival stage hours</li>
            <li>Manage generator and power supply for the arcade trailer</li>
            <li>Boot up and shut down all arcade systems each day</li>
            <li>Run the flipbook station and assemble flipbooks on demand</li>
            <li>Monitor and assist participants throughout the day</li>
          </ul>
        </div>
        <div class="task-category">
          <h3>Equipment</h3>
          <ul>
            <li><strong>Generator:</strong> Powers the arcade trailer — start/stop daily</li>
            <li><strong>Arcade Cabinets:</strong> Boot in sequence, monitor for faults</li>
            <li><strong>Flipbook Computer:</strong> Manages and prints flipbook jobs</li>
            <li><strong>Paper Cutter:</strong> Trim printed pages to flipbook dimensions</li>
            <li><strong>Heavy-Duty Stapler:</strong> Bind pages into a finished flipbook</li>
          </ul>
        </div>
        <div class="task-category">
          <h3>Daily Schedule</h3>
          <ul>
            <li><strong>Start of Day:</strong> Generator on → arcade boot-up → flipbook station setup → supply check</li>
            <li><strong>During Festival:</strong> Remain present, assist participants, assemble flipbooks on demand</li>
            <li><strong>End of Day:</strong> Flipbook breakdown → arcade shutdown → generator off</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="footer">
      <img :src="footer" alt="footer" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { reunion_db } from '@/firebase'
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import arcade_icon from '@/assets/images/icons/arcade.png'
import footer from '@/assets/images/poster_footer_v1.png'
import { useInventory } from '@/composables/useInventory'
import InventoryTaskItems from '@/components/InventoryTaskItems.vue'

const { deptItems, getItemsForTask, flagNeedsRestock } = useInventory('arcade_attendant')

const userIdCode = ref('')
const userName = ref('')
const isAuthenticated = ref(false)
const arcadeTasks = ref([])
const isFirebaseAuthenticated = ref(false)
let unsubscribe = null
let authCheckHandler = null

const initializeTasks = () => [
  {
    id: 'arcade_001',
    title: 'Generator & Trailer Power-On (Start of Day)',
    description:
      'Start the generator, verify stable power supply to the trailer, check all outlets are operational before powering any systems',
    department: 'arcade_attendant',
    priority: 'high',
    type: 'personal',
    completed: false,
    completedBy: null,
    completedByName: null,
    completedAt: null
  },
  {
    id: 'arcade_002',
    title: 'Arcade System Boot-Up',
    description:
      'Power on all arcade cabinets and systems in sequence, verify displays and controls are responsive, report any faults',
    department: 'arcade_attendant',
    priority: 'high',
    type: 'personal',
    completed: false,
    completedBy: null,
    completedByName: null,
    completedAt: null
  },
  {
    id: 'arcade_003',
    title: 'Flipbook Station Setup',
    description:
      'Boot flipbook computer, load flipbook software, run a test print, prepare paper cutter and heavy-duty stapler, verify paper stock and staple supply',
    department: 'arcade_attendant',
    priority: 'high',
    type: 'personal',
    completed: false,
    completedBy: null,
    completedByName: null,
    completedAt: null
  },
  {
    id: 'arcade_004',
    title: 'Supply Check',
    description:
      'Verify paper stock, staples, and other consumables are stocked for the session. Restock from supplies as needed',
    department: 'arcade_attendant',
    priority: 'medium',
    type: 'personal',
    completed: false,
    completedBy: null,
    completedByName: null,
    completedAt: null
  },
  {
    id: 'arcade_005',
    title: 'On-Demand Flipbook Assembly',
    description:
      'When a participant triggers a print job, retrieve pages, trim with paper cutter to size, bind with heavy-duty stapler, and present completed flipbook to participant',
    department: 'arcade_attendant',
    priority: 'high',
    type: 'personal',
    completed: false,
    completedBy: null,
    completedByName: null,
    completedAt: null
  },
  {
    id: 'arcade_006',
    title: 'Arcade Monitoring & Participant Assistance',
    description:
      'Remain present at the arcade trailer during stage hours, assist participants, reset cabinets or restart systems as needed, report persistent faults',
    department: 'arcade_attendant',
    priority: 'medium',
    type: 'personal',
    completed: false,
    completedBy: null,
    completedByName: null,
    completedAt: null
  },
  {
    id: 'arcade_007',
    title: 'Flipbook Station Breakdown (End of Day)',
    description:
      'Power down the flipbook computer, safely store paper cutter and stapler, secure remaining paper stock and supplies',
    department: 'arcade_attendant',
    priority: 'high',
    type: 'personal',
    completed: false,
    completedBy: null,
    completedByName: null,
    completedAt: null
  },
  {
    id: 'arcade_008',
    title: 'Arcade System Shutdown (End of Day)',
    description:
      'Power down all arcade cabinets and systems in sequence, ensure no systems are left running',
    department: 'arcade_attendant',
    priority: 'high',
    type: 'personal',
    completed: false,
    completedBy: null,
    completedByName: null,
    completedAt: null
  },
  {
    id: 'arcade_009',
    title: 'Generator & Power Shutdown (End of Day)',
    description:
      'Confirm all trailer systems are off, then safely shut down the generator and secure the trailer',
    department: 'arcade_attendant',
    priority: 'high',
    type: 'personal',
    completed: false,
    completedBy: null,
    completedByName: null,
    completedAt: null
  }
]

const completedTasks = computed(() => arcadeTasks.value.filter((t) => t.completed).length)
const totalTasks = computed(() => arcadeTasks.value.length)
const progressPercentage = computed(() =>
  totalTasks.value > 0 ? Math.round((completedTasks.value / totalTasks.value) * 100) : 0
)

const handleIdCodeInput = (event) => {
  userIdCode.value = event.target.value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5)
}

const validateIdCode = async () => {
  if (!userIdCode.value || userIdCode.value.length !== 5) return false
  try {
    const pDoc = await getDoc(doc(reunion_db, 'participants_2026', userIdCode.value))
    if (pDoc.exists()) {
      const data = pDoc.data()
      userName.value = data.contact?.fullname || data.fullname || ''
      return true
    }
    return false
  } catch (error) {
    console.error('Error validating ID code:', error)
    return false
  }
}

const authenticateUser = async () => {
  const isValid = await validateIdCode()
  if (isValid) {
    isAuthenticated.value = true
    await loadTasks()
  } else {
    alert('Invalid ID_CODE. Please check and try again.')
  }
}

const loadTasks = async () => {
  try {
    const defaultTasks = initializeTasks()
    const statusRef = collection(reunion_db, 'task_status_2026')
    const q = query(statusRef, where('department', '==', 'arcade_attendant'))

    unsubscribe = onSnapshot(q, (querySnapshot) => {
      const statusMap = {}
      querySnapshot.docs.forEach((d) => {
        const data = d.data()
        statusMap[data.taskId] = data
      })

      arcadeTasks.value = defaultTasks.map((task) => {
        const personalStatus = statusMap[`${task.id}_${userIdCode.value}`]
        return {
          ...task,
          completed: personalStatus?.completed || false,
          completedBy: personalStatus?.completedBy || null,
          completedByName: personalStatus?.completedByName || null,
          completedAt: personalStatus?.completedAt || null
        }
      })
    })
  } catch (error) {
    console.error('Error loading tasks:', error)
  }
}

const completeTask = async (taskId) => {
  try {
    const taskIndex = arcadeTasks.value.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      arcadeTasks.value[taskIndex].completed = true
      arcadeTasks.value[taskIndex].completedBy = userIdCode.value
      arcadeTasks.value[taskIndex].completedByName = userName.value
      arcadeTasks.value[taskIndex].completedAt = new Date().toISOString()

      await setDoc(doc(reunion_db, 'task_status_2026', `${taskId}_${userIdCode.value}`), {
        taskId: `${taskId}_${userIdCode.value}`,
        originalTaskId: taskId,
        department: 'arcade_attendant',
        userIdCode: userIdCode.value,
        assignedTo: null,
        assignedToName: null,
        completed: true,
        completedBy: userIdCode.value,
        completedByName: userName.value,
        completedAt: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Error completing task:', error)
  }
}

const checkFirebaseAuth = () => {
  authCheckHandler = () => {
    isFirebaseAuthenticated.value = !!localStorage.getItem('user')
  }
  authCheckHandler()
  window.addEventListener('storage', authCheckHandler)
}

const resetAllTasks = async () => {
  if (!isFirebaseAuthenticated.value) {
    alert('Admin authentication required')
    return
  }
  if (
    !confirm(
      'Are you sure you want to reset ALL Arcade Attendant tasks? This cannot be undone.'
    )
  )
    return

  try {
    const q = query(
      collection(reunion_db, 'task_status_2026'),
      where('department', '==', 'arcade_attendant')
    )
    const querySnapshot = await getDocs(q)
    const batch = writeBatch(reunion_db)
    querySnapshot.forEach((d) => batch.delete(d.ref))
    await batch.commit()
    alert('All Arcade Attendant tasks have been reset')
  } catch (error) {
    console.error('Error resetting tasks:', error)
    alert('Error resetting tasks')
  }
}

onMounted(() => {
  checkFirebaseAuth()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
  if (authCheckHandler) window.removeEventListener('storage', authCheckHandler)
})
</script>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background-color: black;
  color: white;
  min-height: 100vh;
}

.header-emblem {
  width: 120px;
  display: block;
  margin: 0 auto 1rem auto;
}

.highlight {
  color: var(--reunion-arcade-pink, #e91e63);
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0px 0px 5px rgba(255, 255, 255, 0.5);
}

.auth-section,
.task-interface,
.public-tasks {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  margin: 1rem 0;
  width: 100%;
  max-width: 800px;
  border: 1px solid var(--reunion-arcade-pink, #e91e63);
}

.form-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 1rem 0;
  width: 100%;
}

label {
  width: 30%;
  text-align: left;
  padding: 10px;
  background-color: var(--reunion-arcade-pink, #e91e63);
  color: white;
  border-radius: 15px 0 0 15px;
  font-weight: bold;
}

input {
  width: 70%;
  padding: 10px;
  border: none;
  border-radius: 0 15px 15px 0;
  background-color: white;
  color: black;
}

button {
  background-color: var(--reunion-arcade-pink, #e91e63);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 15px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: var(--reunion-arcade-pink-dark, #880e4f);
  transform: translateY(-2px);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.task-item {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(233, 30, 99, 0.3);
  border-left: 4px solid #e91e63;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  text-align: left;
  transition: all 0.3s ease;
}

.task-item:hover {
  border-color: var(--reunion-arcade-pink, #e91e63);
  transform: translateY(-2px);
}

.task-item.completed {
  border-color: rgba(76, 175, 80, 0.5);
  background-color: rgba(76, 175, 80, 0.05);
  opacity: 0.7;
}

.task-content {
  flex: 1;
}

.task-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--reunion-arcade-pink, #e91e63);
}

.task-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #ccc;
}

.task-meta {
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

.completed-by {
  color: #4caf50;
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 130px;
}

.personal-complete-btn {
  background-color: var(--reunion-arcade-pink, #e91e63);
  margin-top: 0;
}

.personal-completed {
  color: #4caf50;
  font-weight: bold;
}

.progress-section {
  margin-top: 2rem;
  text-align: center;
}

.progress-bar {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  height: 20px;
  overflow: hidden;
  margin: 1rem 0;
}

.progress-fill {
  background-color: var(--reunion-arcade-pink, #e91e63);
  height: 100%;
  transition: width 0.3s ease;
}

.admin-panel {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 10px;
}

.admin-btn.danger {
  background-color: #ff6b6b;
}

.task-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
  text-align: left;
}

.task-category {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1.5rem;
  border: 1px solid #444;
}

.task-category h3 {
  color: #e91e63;
  margin-bottom: 1rem;
}

.task-category ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-category ul li {
  margin: 0.75rem 0;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  border-left: 3px solid #e91e63;
  color: #ccc;
}

.footer {
  background-color: white;
  padding: 1rem;
  border-radius: 15px;
  margin-top: 2rem;
  width: 100%;
  max-width: 700px;
}

.footer img {
  width: 100%;
  max-width: 700px;
}

.supplies-summary {
  margin: 0 0 1.5rem 0;
  padding: 0.75rem 1rem;
  background-color: rgba(255, 200, 80, 0.06);
  border: 1px solid rgba(255, 200, 80, 0.25);
  border-radius: 10px;
  text-align: left;
}

.supplies-header {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 200, 80, 0.9);
  margin-bottom: 0.5rem;
}

.supplies-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.supplies-row:last-child {
  border-bottom: none;
}

.supplies-row.needs-restock .supplies-name {
  opacity: 0.65;
}

.supplies-name {
  font-size: 0.88rem;
  color: #e0e0e0;
  font-weight: 500;
  min-width: 140px;
}

.supplies-location {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.45);
  text-transform: capitalize;
  flex: 1;
}

.supplies-restock {
  font-size: 0.72rem;
  color: #ffa726;
  font-weight: 600;
}
</style>
