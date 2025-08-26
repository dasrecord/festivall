<template>
  <div class="basic">
    <img :src="reunion_emblem" alt="Reunion Emblem" class="header-emblem" />
    <h1 class="highlight">Reunion Front Gate Manual</h1>

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
      <p>Department: <span class="highlight">Front Gate Scanner Operator</span></p>

      <!-- Admin Panel (only visible if logged into Firebase Auth) -->
      <div v-if="isFirebaseAuthenticated" class="admin-panel">
        <h3>🛠️ Admin Controls</h3>
        <div class="admin-actions">
          <button @click="adminResetAllTasks" class="admin-btn reset">
            Reset All Front Gate Tasks
          </button>
          <RouterLink to="/admin/tasks" class="admin-btn manage">
            Full Task Manager
          </RouterLink>
        </div>
      </div>

      <div
        class="scanner-access"
        style="
          margin: 1rem 0 2rem 0;
          padding: 1.5rem;
          background-color: rgba(76, 175, 80, 0.1);
          border: 2px solid var(--reunion-frog-green, #4caf50);
          border-radius: 10px;
        "
      >
        <h3 style="color: var(--reunion-frog-green, #4caf50); margin-bottom: 1rem">
          🎫 Access Ticket Scanner
        </h3>
        <p style="margin-bottom: 1rem">
          Ready to start scanning? Access the ticket scanner interface:
        </p>
        <a
          href="/reunionticketscanner"
          target="_blank"
          style="
            display: inline-block;
            background-color: var(--reunion-frog-green, #4caf50);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 15px;
            font-weight: bold;
            transition: all 0.3s ease;
          "
        >
          Open Ticket Scanner
        </a>
      </div>

      <div class="task-section">
        <h3>Front Gate Tasks</h3>
        <div class="task-grid">
          <div
            v-for="task in frontGateTasks"
            :key="task.id"
            class="task-item"
            :class="{
              completed: task.completed,
              assigned: task.assignedTo === userIdCode,
              'personal-task': task.type === 'personal',
              'one-time-task': task.type === 'one-time'
            }"
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
              <!-- One-time tasks: traditional claim/complete workflow -->
              <template v-if="task.type === 'one-time'">
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
              </template>

              <!-- Personal tasks: just completion checkbox -->
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
    </div>

    <!-- Public Task Overview -->
    <div v-if="!isAuthenticated" class="public-tasks">
      <h2>Front Gate Scanner Operators</h2>
      <div class="task-overview">
        <div class="task-category">
          <h3>Scanner Operations</h3>
          <ul>
            <li>Operate ticket scanner using phone or provided device</li>
            <li>Process check-ins and verify payment status</li>
            <li>Handle cash payments for unpaid orders</li>
            <li>Manage crowd flow around scanning stations</li>
          </ul>
        </div>
        <div class="task-category">
          <h3>Technical Setup</h3>
          <ul>
            <li>Configure phone hotspot for device scanning</li>
            <li>Test QR scanner functionality and connectivity</li>
            <li>Set up backup equipment and charging stations</li>
            <li>Coordinate entry barriers and signage</li>
          </ul>
        </div>
        <div class="task-category">
          <h3>Key Features</h3>
          <ul>
            <li><strong>Mobile Flexibility:</strong> Use your phone or provided device</li>
            <li><strong>Hotspot Setup:</strong> Share phone internet for device scanning</li>
            <li><strong>Real-time Data:</strong> Live attendance and payment tracking</li>
          </ul>
        </div>
      </div>

      <div
        class="scanner-access"
        style="
          margin-top: 2rem;
          padding: 1.5rem;
          background-color: rgba(76, 175, 80, 0.1);
          border: 2px solid var(--reunion-frog-green, #4caf50);
          border-radius: 10px;
        "
      >
        <h3 style="color: var(--reunion-frog-green, #4caf50); margin-bottom: 1rem">
          📋 Shift-Based Tasks
        </h3>
        <p style="margin-bottom: 1rem">
          Tasks are organized by frequency to help you focus on what's needed for your shift:
        </p>
        <ul style="text-align: left; margin: 0; padding-left: 1.5rem">
          <li><strong>First Shift Only:</strong> Initial setup and tent/booth setup</li>
          <li>
            <strong>Every Shift:</strong> Hotspot config, scanner testing, cash setup, operator ID
          </li>
          <li><strong>Last Shift Only:</strong> Gate closure and equipment breakdown</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <img :src="footer" alt="footer" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { reunion_db, festivall_auth } from '@/firebase'
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, deleteDoc, getDocs, writeBatch } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import footer from '@/assets/images/poster_footer_v1.png'

// Reactive data
const userIdCode = ref('')
const userName = ref('')
const isAuthenticated = ref(false)
const frontGateTasks = ref([])
const isFirebaseAuthenticated = ref(false)
let unsubscribe = null

// Initialize front gate tasks
const initializeTasks = () => {
  return [
    {
      id: 'frontgate_001',
      title: 'Initial Gate Setup (First Shift Only)',
      description: 'Set up front gate tent/booth, table, chairs, signage, and entry barriers',
      department: 'front_gate',
      priority: 'high',
      type: 'one-time', // Can be claimed/completed by team
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'frontgate_002',
      title: 'Device Hotspot Configuration (Every Shift)',
      description:
        'Connect provided scanner device to your mobile hotspot, verify internet connection',
      department: 'front_gate',
      priority: 'high',
      type: 'personal', // Personal checklist item
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'frontgate_003',
      title: 'Scanner Testing (Every Shift)',
      description: 'Test QR scanner functionality, verify database connection, check audio alerts',
      department: 'front_gate',
      priority: 'high',
      type: 'personal', // Personal checklist item
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'frontgate_004',
      title: 'Cash Box Setup (Every Shift)',
      description:
        'Count starting cash, verify change amounts, test payment processing for unpaid orders',
      department: 'front_gate',
      priority: 'high',
      type: 'personal', // Personal checklist item
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'frontgate_005',
      title: 'Operator ID Entry (Every Shift)',
      description:
        'Enter your Scanner Operator ID in ticket scanner, verify name appears correctly',
      department: 'front_gate',
      priority: 'high',
      type: 'personal', // Personal checklist item
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'frontgate_006',
      title: 'Equipment Check (Every Shift)',
      description: 'Verify chargers, backup devices, and all equipment functioning properly',
      department: 'front_gate',
      priority: 'medium',
      type: 'personal', // Personal checklist item
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'frontgate_007',
      title: 'Shift Handover Documentation',
      description: 'Document attendance numbers, cash collected, and any issues for next shift',
      department: 'front_gate',
      priority: 'medium',
      type: 'personal', // Personal checklist item
      assignedTo: null,
      assignedToName: null,
      completed: false,
      completedBy: null,
      completedByName: null,
      completedAt: null
    },
    {
      id: 'frontgate_008',
      title: 'Gate Closure (Last Shift Only)',
      description: 'Close front gate, secure equipment, final cash count, breakdown tent/booth',
      department: 'front_gate',
      priority: 'high',
      type: 'one-time', // Can be claimed/completed by team
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
const completedTasks = computed(() => frontGateTasks.value.filter((task) => task.completed).length)
const totalTasks = computed(() => frontGateTasks.value.length)
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
    // Check orders_2025 for ticket holders (volunteers should have tickets)
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
    const q = query(statusRef, where('department', '==', 'front_gate'))

    unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Create status map for quick lookup
      const statusMap = {}
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        statusMap[data.taskId] = data
      })

      // Merge task definitions with status
      frontGateTasks.value = defaultTasks.map((task) => {
        if (task.type === 'personal') {
          // Personal tasks: check if THIS user has completed it
          const personalStatus = statusMap[`${task.id}_${userIdCode.value}`]
          return {
            ...task,
            assignedTo: null, // Personal tasks aren't "assigned"
            assignedToName: null,
            completed: personalStatus?.completed || false,
            completedBy: personalStatus?.completedBy || null,
            completedByName: personalStatus?.completedByName || null,
            completedAt: personalStatus?.completedAt || null
          }
        } else {
          // One-time tasks: use shared status
          return {
            ...task,
            assignedTo: statusMap[task.id]?.assignedTo || null,
            assignedToName: statusMap[task.id]?.assignedToName || null,
            completed: statusMap[task.id]?.completed || false,
            completedBy: statusMap[task.id]?.completedBy || null,
            completedByName: statusMap[task.id]?.completedByName || null,
            completedAt: statusMap[task.id]?.completedAt || null
          }
        }
      })
    })
  } catch (error) {
    console.error('Error loading tasks:', error)
  }
}

const claimTask = async (taskId) => {
  try {
    const taskIndex = frontGateTasks.value.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      const task = frontGateTasks.value[taskIndex]

      if (task.type === 'personal') {
        // Personal tasks can't be "claimed" - they're just personal checklists
        return
      }

      // One-time tasks: normal claim behavior
      frontGateTasks.value[taskIndex].assignedTo = userIdCode.value
      frontGateTasks.value[taskIndex].assignedToName = userName.value

      // Save only the status to Firestore
      await setDoc(doc(reunion_db, 'task_status_2025', taskId), {
        taskId: taskId,
        department: 'front_gate',
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
    const taskIndex = frontGateTasks.value.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      frontGateTasks.value[taskIndex].assignedTo = null
      frontGateTasks.value[taskIndex].assignedToName = null

      // Remove status from Firestore or update to unclaimed
      await setDoc(doc(reunion_db, 'task_status_2025', taskId), {
        taskId: taskId,
        department: 'front_gate',
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
    const taskIndex = frontGateTasks.value.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      const task = frontGateTasks.value[taskIndex]

      frontGateTasks.value[taskIndex].completed = true
      frontGateTasks.value[taskIndex].completedBy = userIdCode.value
      frontGateTasks.value[taskIndex].completedByName = userName.value
      frontGateTasks.value[taskIndex].completedAt = new Date().toISOString()

      if (task.type === 'personal') {
        // Personal tasks: save with user-specific ID
        await setDoc(doc(reunion_db, 'task_status_2025', `${taskId}_${userIdCode.value}`), {
          taskId: `${taskId}_${userIdCode.value}`,
          originalTaskId: taskId,
          department: 'front_gate',
          userIdCode: userIdCode.value,
          assignedTo: null, // Personal tasks aren't assigned
          assignedToName: null,
          completed: true,
          completedBy: userIdCode.value,
          completedByName: userName.value,
          completedAt: new Date().toISOString()
        })
      } else {
        // One-time tasks: save completion status to Firestore
        await setDoc(doc(reunion_db, 'task_status_2025', taskId), {
          taskId: taskId,
          department: 'front_gate',
          assignedTo: userIdCode.value,
          assignedToName: userName.value,
          completed: true,
          completedBy: userIdCode.value,
          completedByName: userName.value,
          completedAt: new Date().toISOString()
        })
      }
    }
  } catch (error) {
    console.error('Error completing task:', error)
  }
}

// Firebase Auth check
const checkFirebaseAuth = () => {
  onAuthStateChanged(festivall_auth, (user) => {
    isFirebaseAuthenticated.value = !!user
  })
}

// Admin reset functions
const resetTask = async (taskId) => {
  if (!isFirebaseAuthenticated.value) {
    alert('Admin authentication required')
    return
  }
  
  try {
    const taskRef = doc(reunion_db, 'task_status_2025', taskId)
    await deleteDoc(taskRef)
    console.log(`Task ${taskId} reset successfully`)
  } catch (error) {
    console.error('Error resetting task:', error)
    alert('Error resetting task')
  }
}

const resetAllTasks = async () => {
  if (!isFirebaseAuthenticated.value) {
    alert('Admin authentication required')
    return
  }
  
  if (!confirm('Are you sure you want to reset ALL Front Gate tasks? This action cannot be undone.')) {
    return
  }
  
  try {
    const q = query(
      collection(reunion_db, 'task_status_2025'),
      where('department', '==', 'front_gate')
    )
    const querySnapshot = await getDocs(q)
    
    const batch = writeBatch(reunion_db)
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })
    
    await batch.commit()
    console.log('All Front Gate tasks reset successfully')
    alert('All Front Gate tasks have been reset')
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

.task-item.personal-task {
  border-left: 4px solid #2196f3;
}

.task-item.one-time-task {
  border-left: 4px solid var(--reunion-frog-green, #4caf50);
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

.personal-complete-btn {
  background-color: var(--reunion-frog-green, #4caf50);
  font-size: 0.9rem;
}

.personal-completed {
  color: var(--reunion-frog-green, #4caf50);
  font-weight: bold;
  padding: 12px 24px;
  display: inline-block;
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
