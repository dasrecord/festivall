<template>
  <div class="basic">
    <img :src="reunion_emblem" alt="Reunion Emblem" class="header-emblem" />
    <h1 class="highlight">Reunion Stage Crew Manual</h1>

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
      <p>Department: <span class="highlight">Stage Crew</span></p>

      <div class="task-section">
        <h3>Stage Crew Tasks</h3>
        <div class="task-grid">
          <div
            v-for="task in stageTasks"
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
    </div>

    <!-- Public Task Overview -->
    <div v-if="!isAuthenticated" class="public-tasks">
      <h2>Stage Crew Responsibilities</h2>
      <div class="task-overview">
        <div class="task-category">
          <h3>Audio & Sound</h3>
          <ul>
            <li>Set up and test sound system equipment</li>
            <li>Run sound checks with performing artists</li>
            <li>Monitor audio levels during performances</li>
            <li>Troubleshoot sound issues as they arise</li>
          </ul>
        </div>
        <div class="task-category">
          <h3>Stage & Lighting</h3>
          <ul>
            <li>Set up stage platform and barriers</li>
            <li>Install and test lighting systems</li>
            <li>Coordinate with artists for equipment needs</li>
            <li>Manage stage transitions between acts</li>
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
import { ref, computed, onUnmounted } from 'vue'
import { reunion_db } from '@/firebase'
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import footer from '@/assets/images/poster_footer_v1.png'

// Reactive data
const userIdCode = ref('')
const userName = ref('')
const isAuthenticated = ref(false)
const stageTasks = ref([])
let unsubscribe = null

// Initialize stage crew tasks
const initializeTasks = () => {
  return [
    {
      id: 'stage_001',
      title: 'Sound System Setup',
      description: 'Set up main PA system, monitors, and mixing console',
      department: 'stage_crew',
      priority: 'high',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'stage_002',
      title: 'Stage Platform Assembly',
      description: 'Assemble and secure stage platform, barriers, and safety equipment',
      department: 'stage_crew',
      priority: 'high',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'stage_003',
      title: 'Lighting Installation',
      description: 'Install stage lighting, test controls, and program lighting cues',
      department: 'stage_crew',
      priority: 'medium',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'stage_004',
      title: 'Power & Electrical',
      description: 'Run power cables, set up electrical distribution, and test all connections',
      department: 'stage_crew',
      priority: 'high',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'stage_005',
      title: 'Monitor System',
      description: 'Set up artist monitor system and wedges',
      department: 'stage_crew',
      priority: 'medium',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'stage_006',
      title: 'Sound Check Coordination',
      description: 'Coordinate and conduct sound checks with all performing artists',
      department: 'stage_crew',
      priority: 'high',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'stage_007',
      title: 'Equipment Inventory',
      description: 'Check and organize all audio/visual equipment and spare parts',
      department: 'stage_crew',
      priority: 'medium',
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'stage_008',
      title: 'Backstage Area Setup',
      description: 'Prepare artist backstage area and equipment storage',
      department: 'stage_crew',
      priority: 'low',
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
const completedTasks = computed(() => stageTasks.value.filter((task) => task.completed).length)
const totalTasks = computed(() => stageTasks.value.length)
const progressPercentage = computed(() =>
  totalTasks.value > 0 ? Math.round((completedTasks.value / totalTasks.value) * 100) : 0
)

// Methods
const handleIdCodeInput = (event) => {
  const value = event.target.value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5)
  userIdCode.value = value
}

const validateIdCode = async () => {
  if (!userIdCode.value || userIdCode.value.length !== 5) {
    return false
  }

  try {
    const appDoc = await getDoc(doc(reunion_db, 'applications_2025', userIdCode.value))
    if (appDoc.exists()) {
      userName.value = appDoc.data().fullname
      return true
    }

    const orderDoc = await getDoc(doc(reunion_db, 'orders_2025', userIdCode.value))
    if (orderDoc.exists()) {
      userName.value = orderDoc.data().fullname
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
    const statusRef = collection(reunion_db, 'task_status_2025')
    const q = query(statusRef, where('department', '==', 'stage_crew'))

    unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Create status map for quick lookup
      const statusMap = {}
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        statusMap[data.taskId] = data
      })

      // Merge task definitions with status
      stageTasks.value = defaultTasks.map((task) => ({
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
    const taskIndex = stageTasks.value.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      stageTasks.value[taskIndex].assignedTo = userIdCode.value
      stageTasks.value[taskIndex].assignedToName = userName.value

      // Save only the status to Firestore
      await setDoc(doc(reunion_db, 'task_status_2025', taskId), {
        taskId: taskId,
        department: 'stage_crew',
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
    const taskIndex = stageTasks.value.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      stageTasks.value[taskIndex].assignedTo = null
      stageTasks.value[taskIndex].assignedToName = null

      // Remove status from Firestore or update to unclaimed
      await setDoc(doc(reunion_db, 'task_status_2025', taskId), {
        taskId: taskId,
        department: 'stage_crew',
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
    const taskIndex = stageTasks.value.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      stageTasks.value[taskIndex].completed = true
      stageTasks.value[taskIndex].completedBy = userIdCode.value
      stageTasks.value[taskIndex].completedByName = userName.value
      stageTasks.value[taskIndex].completedAt = new Date().toISOString()

      // Save completion status to Firestore
      await setDoc(doc(reunion_db, 'task_status_2025', taskId), {
        taskId: taskId,
        department: 'stage_crew',
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

// Cleanup listener when component is unmounted
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
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
</style>
