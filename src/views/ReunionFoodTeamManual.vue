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
          <h3>Kitchen Operations</h3>
          <ul>
            <li>Food preparation and cooking</li>
            <li>Kitchen setup and workflow organization</li>
            <li>Food safety and sanitation protocols</li>
            <li>Inventory tracking and supply management</li>
          </ul>
        </div>
        <div class="task-category">
          <h3>Service Management</h3>
          <ul>
            <li>Set up food service stations and equipment</li>
            <li>Coordinate volunteer food service staff</li>
            <li>Maintain service area cleanliness</li>
            <li>Handle kitchen cleanup and breakdown</li>
          </ul>
        </div>
        <div class="task-category">
          <h3>Note</h3>
          <ul>
            <li><strong>Meal scanning is handled by dedicated scanner operators</strong></li>
            <li>Food team focuses on preparation, cooking, and service setup</li>
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
import footer from '@/assets/images/poster_footer_v1.png'

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
      title: 'Kitchen Setup & Prep',
      description: 'Set up cooking stations, prep ingredients, and organize kitchen workflow',
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
      title: 'Food Safety & Sanitation',
      description:
        'Implement food safety protocols, temperature monitoring, and sanitation procedures',
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
      title: 'Service Station Setup',
      description: 'Set up food service lines, utensils, plates, and serving equipment',
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
      title: 'Inventory Management',
      description: 'Track food inventory, supplies, and coordinate resupply needs',
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
      id: 'food_005',
      title: 'Volunteer Coordination',
      description: 'Organize food service volunteers and assign serving duties',
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
      id: 'food_006',
      title: 'Kitchen Cleanup',
      description: 'Maintain ongoing cleanliness and post-service deep cleaning',
      department: 'food_team',
      priority: 'medium',
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
    const statusRef = collection(reunion_db, 'tasks_2026')
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
      await setDoc(doc(reunion_db, 'task_status_2025', taskId), {
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
      await setDoc(doc(reunion_db, 'task_status_2025', taskId), {
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
      await setDoc(doc(reunion_db, 'task_status_2025', taskId), {
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
      collection(reunion_db, 'task_status_2025'),
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
  color: var(--reunion-frog-green, #4caf50);
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
  border: 1px solid var(--reunion-frog-green, #4caf50);
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
  background-color: var(--reunion-frog-green, #4caf50);
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
  background-color: var(--reunion-frog-green, #4caf50);
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
  background-color: #45a049;
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
  border-radius: 10px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.task-item:hover {
  border-color: var(--reunion-frog-green, #4caf50);
  transform: translateY(-2px);
}

.task-item.completed {
  background-color: rgba(76, 175, 80, 0.2);
  border-color: var(--reunion-frog-green, #4caf50);
}

.task-item.assigned {
  background-color: rgba(255, 193, 7, 0.2);
  border-color: #ffc107;
}

.task-content h4 {
  color: var(--reunion-frog-green, #4caf50);
  margin-bottom: 0.5rem;
}

.task-content p {
  margin-bottom: 1rem;
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
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.claim-btn {
  background-color: #2196f3;
}

.complete-btn {
  background-color: var(--reunion-frog-green, #4caf50);
}

.unclaim-btn {
  background-color: #ff9800;
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
  background-color: var(--reunion-frog-green, #4caf50);
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
  color: var(--reunion-frog-green, #4caf50);
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
  border-left: 3px solid var(--reunion-frog-green, #4caf50);
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
