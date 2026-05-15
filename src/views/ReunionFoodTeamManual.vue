<template>
  <div class="basic">
    <img :src="reunion_emblem" alt="Reunion Emblem" class="header-emblem" />
    <h1 class="highlight">Reunion Food Team Task List</h1>

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
      <p>Department: <span class="highlight">Food Team</span></p>

      <div
        class="role-summary"
        style="
          margin: 1rem 0 2rem 0;
          padding: 1.5rem;
          background-color: rgba(255, 152, 0, 0.1);
          border: 2px solid #ff9800;
          border-radius: 10px;
          text-align: left;
        "
      >
        <h3 style="color: #ff9800; margin-bottom: 0.75rem"><img :src="foodteam_icon" style="width: 22px; height: auto; margin-right: 8px; vertical-align: middle" />Your Role</h3>
        <p style="margin-bottom: 0.75rem">
          You support Angela (Food Coordinator) on the service side. Your job is order fulfillment
          and guest service — managing meal ticket redemptions, monitoring the self-serve kiosk,
          and keeping the handout station running smoothly.
        </p>
      </div>

      <!-- Supplies & Equipment Summary -->
      <div v-if="deptItems.length > 0" class="supplies-summary">
        <button class="supplies-header" @click="suppliesOpen = !suppliesOpen">
          📦 Supplies &amp; Equipment
          <span class="supplies-count">{{ deptItems.length }}</span>
          <span class="supplies-chevron">{{ suppliesOpen ? '▲' : '▼' }}</span>
        </button>
        <div v-show="suppliesOpen">
          <div
            v-for="item in deptItems"
            :key="item.id"
            class="supplies-row"
            :class="{ 'needs-restock': item.needs_restock, missing: item.missing }"
          >
            <span class="supplies-name">{{ item.name }}</span>
            <span class="supplies-location">
              📍 {{ item.location?.replace(/_icon$/, '').replace(/_/g, ' ') }}
              <template v-if="item.sub_location"> › {{ item.sub_location }}</template>
            </span>
            <span v-if="item.needs_restock" class="supplies-restock">⚠️ Needs restock</span>
            <span v-if="item.missing" class="supplies-missing">❌ Missing</span>
            <div class="supplies-actions">
              <button v-if="!item.needs_restock" class="supplies-flag-btn" @click="flagNeedsRestock(item.id)">⚠️ Restock</button>
              <button v-if="!item.missing" class="supplies-flag-btn" @click="flagMissing(item.id)">❌ Missing</button>
            </div>
          </div>
        </div>
      </div>

      <div class="task-section">
        <h3>Food Team Tasks</h3>
        <div class="task-grid">
          <div
            v-for="task in foodTasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.completed, assigned: task.assignedTo === userIdCode }"
          >
            <div class="task-content">
              <h4>{{ task.title }}</h4>
              <p>{{ task.description }}</p>
              <div class="task-meta">
                <span v-if="task.assignedTo" class="assigned-to">
                  Assigned to: {{ task.assignedToName }}
                </span>
                <span v-if="task.completed" class="completed-by">
                  Completed by: {{ task.completedByName }}
                </span>
              </div>
            </div>
            <div class="task-actions">
              <button
                v-if="!task.assignedTo && !task.completed"
                @click="claimTask(task.id)"
                class="claim-btn"
              >
                Claim Task
              </button>
              <button
                v-if="task.assignedTo === userIdCode && !task.completed"
                @click="completeTask(task.id)"
                class="complete-btn"
              >
                Mark Complete
              </button>
              <button
                v-if="task.assignedTo === userIdCode && !task.completed"
                @click="unclaimTask(task.id)"
                class="unclaim-btn"
              >
                Unclaim
              </button>
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
          <button @click="resetAllTasks" class="admin-btn danger">Reset All Food Team Tasks</button>
          <p style="font-size: 0.9rem; color: #ccc; margin-top: 0.5rem">
            ⚠️ This will reset all Food Team tasks. Use with caution.
          </p>
        </div>
      </div>
    </div>

    <!-- Public Task Overview -->
    <div v-if="!isAuthenticated" class="public-tasks">
      <h2>Food Team Responsibilities</h2>
      <div class="task-overview">
        <div class="task-category">
          <h3>Your Role</h3>
          <ul>
            <li>Food volunteers support Angela (Food Coordinator) on the service side</li>
            <li>Angela leads the kitchen — your job is order fulfillment and guest service</li>
            <li>Use the Meal Scanner app to redeem guest QR codes (1 ticket per meal)</li>
            <li>Monitor and assist the self-serve kiosk for guests placing orders</li>
          </ul>
        </div>
        <div class="task-category">
          <h3>Meal Ticket System</h3>
          <ul>
            <li>Scan guest QR code → redeem 1 meal ticket per meal ordered</li>
            <li>Successful redeems post automatically to the Food Team Slack channel</li>
            <li>No tickets remaining? Charge <strong>$15 cash per meal</strong></li>
            <li>Scanner issues? Report to Angela immediately</li>
          </ul>
        </div>
        <div class="task-category">
          <h3>Before Service Opens</h3>
          <ul>
            <li>Confirm you’re active in the Food Team Slack channel</li>
            <li>Test the Meal Scanner app with your Operator ID</li>
            <li>Boot up and verify the self-serve kiosk is functional</li>
            <li>Set up the service handout station per Angela’s direction</li>
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
import foodteam_icon from '@/assets/images/icons/food.png'
import footer from '@/assets/images/poster_footer_v1.png'
import { useInventory } from '@/composables/useInventory'

const { deptItems, flagNeedsRestock, flagMissing } = useInventory('food_team')
const suppliesOpen = ref(false)

// Reactive data
const userIdCode = ref('')
const userName = ref('')
const isAuthenticated = ref(false)
const foodTasks = ref([])
const isFirebaseAuthenticated = ref(false)
let unsubscribe = null
let authCheckHandler = null

// Initialize food team tasks
const initializeTasks = () => {
  return [
    {
      id: 'food_001',
      title: 'Service Area Setup',
      description:
        'Set up the food service handout station: arrange serving equipment, plates, cups, cutlery, and any condiments per Angela’s direction',
      department: 'food_team',
      priority: 'high',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'food_002',
      title: 'Self-Serve Kiosk Verification',
      description:
        'Boot up and test the self-serve kiosk system, verify it’s connected and accepting orders correctly before service opens',
      department: 'food_team',
      priority: 'high',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'food_003',
      title: 'Slack Channel Check-In',
      description:
        'Confirm you are active in the Food Team Slack channel — successful meal ticket redeems are sent there automatically and you need to be monitoring it during service',
      department: 'food_team',
      priority: 'high',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'food_004',
      title: 'Meal Scanner Test',
      description:
        'Open the Meal Scanner app, verify your Operator ID loads correctly, and run a test scan to confirm the scanner and database connection are working before guests arrive',
      department: 'food_team',
      priority: 'high',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'food_005',
      title: 'Order Fulfillment (On-Demand)',
      description:
        'Greet guests warmly, scan their QR code to redeem 1 meal ticket per meal ordered, and hand out their order. If a guest has no meal tickets remaining, charge $15 cash per meal. Report any scanner issues to Angela',
      department: 'food_team',
      priority: 'high',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'food_006',
      title: 'Kiosk Monitoring & Guest Assistance',
      description:
        'Monitor the self-serve kiosk throughout service — assist guests who are having trouble placing orders, flag any kiosk errors to the tech team via Slack',
      department: 'food_team',
      priority: 'medium',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'food_007',
      title: 'Service Area Restocking & Cleanliness',
      description:
        'Maintain the service area during the event — restock plates, cups, cutlery, and condiments as needed; keep the handout station tidy between orders',
      department: 'food_team',
      priority: 'medium',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'food_008',
      title: 'End of Service Breakdown',
      description:
        'Clean and break down the service station per Angela’s direction, secure leftover food and supplies, log scanner off, and confirm kiosk is powered down',
      department: 'food_team',
      priority: 'high',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    }
  ]
}

// Computed properties
const completedTasks = computed(() => foodTasks.value.filter((task) => task.completed).length)
const totalTasks = computed(() => foodTasks.value.length)
const progressPercentage = computed(() =>
  totalTasks.value > 0 ? Math.round((completedTasks.value / totalTasks.value) * 100) : 0
)

// Methods (identical to setup crew)
const handleIdCodeInput = (event) => {
  const value = event.target.value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5)
  userIdCode.value = value
}

const validateIdCode = async () => {
  if (!userIdCode.value || userIdCode.value.length !== 5) {
    return false
  }

  try {
    // Check participants_2026 for ticket holders (volunteers should have tickets)
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
    // Always start with tasks from code (source of truth)
    const defaultTasks = initializeTasks()

    // Set up real-time listener for task status from Firestore
    const statusRef = collection(reunion_db, 'task_status_2026')
    const q = query(statusRef, where('department', '==', 'food_team'))

    unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Create status map for quick lookup
      const statusMap = {}
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        statusMap[data.taskId] = data
      })

      // Merge task definitions with status
      foodTasks.value = defaultTasks.map((task) => ({
        ...task,
        assignedTo: statusMap[task.id]?.assignedTo || null,
        assignedToName: statusMap[task.id]?.assignedToName || null,
        completed: statusMap[task.id]?.completed || false,
        completedBy: statusMap[task.id]?.completedBy || null,
        completedByName: statusMap[task.id]?.completedByName || null,
        completedAt: statusMap[task.id]?.completedAt || null
      }))
    })
  } catch (error) {
    console.error('Error loading tasks:', error)
  }
}

const claimTask = async (taskId) => {
  try {
    const taskIndex = foodTasks.value.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      foodTasks.value[taskIndex].assignedTo = userIdCode.value
      foodTasks.value[taskIndex].assignedToName = userName.value

      // Save only the status to Firestore
      await setDoc(doc(reunion_db, 'task_status_2026', taskId), {
        taskId: taskId,
        department: 'food_team',
        assignedTo: userIdCode.value,
        assignedToName: userName.value,
        completed: false,
        completedBy: null,
        completedByName: null,
        completedAt: null
      })
    }
  } catch (error) {
    console.error('Error claiming task:', error)
  }
}

const unclaimTask = async (taskId) => {
  try {
    const taskIndex = foodTasks.value.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      foodTasks.value[taskIndex].assignedTo = null
      foodTasks.value[taskIndex].assignedToName = null

      // Remove status from Firestore or update to unclaimed
      await setDoc(doc(reunion_db, 'task_status_2026', taskId), {
        taskId: taskId,
        department: 'food_team',
        assignedTo: null,
        assignedToName: null,
        completed: false,
        completedBy: null,
        completedByName: null,
        completedAt: null
      })
    }
  } catch (error) {
    console.error('Error unclaiming task:', error)
  }
}

const completeTask = async (taskId) => {
  try {
    const taskIndex = foodTasks.value.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      foodTasks.value[taskIndex].completed = true
      foodTasks.value[taskIndex].completedBy = userIdCode.value
      foodTasks.value[taskIndex].completedByName = userName.value
      foodTasks.value[taskIndex].completedAt = new Date().toISOString()

      // Save completion status to Firestore
      await setDoc(doc(reunion_db, 'task_status_2026', taskId), {
        taskId: taskId,
        department: 'food_team',
        assignedTo: userIdCode.value,
        assignedToName: userName.value,
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

// Firebase Auth check
const checkFirebaseAuth = () => {
  // Check localStorage for user authentication (same as router guard)
  authCheckHandler = () => {
    const isAuthenticatedFromStorage = !!localStorage.getItem('user')
    console.log('Auth check - localStorage user:', localStorage.getItem('user'))
    console.log('isFirebaseAuthenticated set to:', isAuthenticatedFromStorage)
    isFirebaseAuthenticated.value = isAuthenticatedFromStorage
  }

  // Check immediately
  authCheckHandler()

  // Also listen for storage changes (in case user logs in/out in another tab)
  window.addEventListener('storage', authCheckHandler)
}

// Admin reset functions
const resetAllTasks = async () => {
  if (!isFirebaseAuthenticated.value) {
    alert('Admin authentication required')
    return
  }

  if (
    !confirm('Are you sure you want to reset ALL Food Team tasks? This action cannot be undone.')
  ) {
    return
  }

  try {
    const q = query(
      collection(reunion_db, 'task_status_2026'),
      where('department', '==', 'food_team')
    )
    const querySnapshot = await getDocs(q)

    const batch = writeBatch(reunion_db)
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    console.log('All Food Team tasks reset successfully')
    alert('All Food Team tasks have been reset')
  } catch (error) {
    console.error('Error resetting all tasks:', error)
    alert('Error resetting all tasks')
  }
}

// Initialize Firebase Auth check
onMounted(() => {
  checkFirebaseAuth()
})

// Cleanup listener when component is unmounted
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
  if (authCheckHandler) {
    window.removeEventListener('storage', authCheckHandler)
  }
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
  color: #ff9800;
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
  border: 1px solid #ff9800;
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
  background-color: #ff9800;
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
  background-color: #ff9800;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-weight: bold;
  margin: 10px 5px;
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #e65100;
  transform: translateY(-2px);
}

button:disabled {
  background-color: #666;
  cursor: not-allowed;
  transform: none;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.task-item {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid #444;
  border-left: 4px solid #ff9800;
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
  border-color: #ff9800;
  transform: translateY(-2px);
}

.task-item.completed {
  background-color: rgba(76, 175, 80, 0.2);
  border-color: #ff9800;
}

.task-item.assigned {
  background-color: rgba(255, 193, 7, 0.2);
  border-color: #ffc107;
}

.task-content h4 {
  color: #ff9800;
  margin-bottom: 0.5rem;
}

.task-content p {
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.task-meta {
  font-size: 0.9rem;
  opacity: 0.8;
}

.assigned-to,
.completed-by {
  display: block;
  margin: 0.25rem 0;
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 130px;
}

.claim-btn {
  background-color: #ff9800;
}

.complete-btn {
  background-color: #ff9800;
}

.unclaim-btn {
  background-color: #666;
}

.progress-section {
  margin: 2rem 0;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #333;
  border-radius: 10px;
  overflow: hidden;
  margin: 1rem 0;
}

.progress-fill {
  height: 100%;
  background-color: #ff9800;
  transition: width 0.3s ease;
}

.task-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.task-category {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1.5rem;
  border: 1px solid #444;
}

.task-category h3 {
  color: #ff9800;
  margin-bottom: 1rem;
}

.task-category ul {
  list-style: none;
  padding: 0;
}

.task-category li {
  margin: 0.75rem 0;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  border-left: 3px solid #ff9800;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 200, 80, 0.9);
  margin-bottom: 0.25rem;
}
.supplies-count {
  background: rgba(255, 200, 80, 0.15);
  color: rgba(255, 200, 80, 0.75);
  border-radius: 10px;
  padding: 0 0.4rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}
.supplies-chevron {
  margin-left: auto;
  font-size: 0.6rem;
  opacity: 0.55;
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

.supplies-missing {
  font-size: 0.72rem;
  color: #ef5350;
  font-weight: 600;
}

.supplies-row.missing .supplies-name {
  opacity: 0.65;
}

.supplies-actions {
  display: flex;
  gap: 0.4rem;
  margin-left: auto;
}

.supplies-flag-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.45);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  margin: 0;
  font-weight: normal;
  transition: border-color 0.2s, color 0.2s;
}

.supplies-flag-btn:hover:not(:disabled) {
  background: none;
  border-color: rgba(255, 200, 80, 0.6);
  color: rgba(255, 200, 80, 0.9);
  transform: none;
}

@media (max-width: 600px) {
  .basic {
    padding: 0.5rem;
  }

  .auth-section,
  .task-interface,
  .public-tasks {
    padding: 1rem;
  }

  .form-section {
    flex-direction: column;
  }

  label,
  input {
    width: 100%;
    border-radius: 15px;
    margin: 0.25rem 0;
  }

  .task-grid {
    grid-template-columns: 1fr;
  }

  .task-actions {
    justify-content: center;
  }

  .task-overview {
    grid-template-columns: 1fr;
  }
}

/* Admin Panel Styles */
.admin-panel {
  background-color: rgba(255, 107, 107, 0.1);
  border: 2px solid #ff6b6b;
  border-radius: 10px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.admin-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.admin-btn.danger {
  background-color: #ff6b6b;
  color: white;
}

.admin-btn.danger:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
}

.admin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
