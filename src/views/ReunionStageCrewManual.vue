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

      <div
        class="role-summary"
        style="
          margin: 1rem 0 2rem 0;
          padding: 1.5rem;
          background-color: rgba(156, 39, 176, 0.1);
          border: 2px solid #9c27b0;
          border-radius: 10px;
          text-align: left;
        "
      >
        <h3 style="color: #9c27b0; margin-bottom: 0.75rem"><img :src="stage_icon" style="width: 22px; height: auto; margin-right: 8px; vertical-align: middle" />Your Role</h3>
        <p style="margin-bottom: 0.75rem">
          You manage stage operations for the full duration of the festival. This means coordinating
          artist soundchecks, handling stage changeovers, managing the PA and monitor systems, and
          keeping the performance schedule running on time.
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

      <!-- Admin Panel (Firebase Auth Required) -->
      <div v-if="isFirebaseAuthenticated" class="admin-panel">
        <h3 style="color: #ff6b6b; margin-bottom: 1rem">🔧 Admin Controls</h3>
        <div class="admin-actions">
          <button @click="resetAllTasks" class="admin-btn danger">
            Reset All Stage Crew Tasks
          </button>
          <p style="font-size: 0.9rem; color: #ccc; margin-top: 0.5rem">
            ⚠️ This will reset all Stage Crew tasks. Use with caution.
          </p>
        </div>
      </div>
    </div>

    <!-- Public Task Overview -->
    <div v-if="!isAuthenticated" class="public-tasks">
      <h2>Stage Crew Responsibilities</h2>
      <div class="task-overview">
        <div class="task-category">
          <h3>The Custom Rig</h3>
          <ul>
            <li>Reunion runs a custom in-house soundsystem built by the team</li>
            <li>Horn-loaded subwoofer enclosures (fridge-sized cabinets) for deep, powerful low end</li>
            <li>Horn-loaded compression driver tops for FOH and stage monitors</li>
            <li>For sound: report to <strong>Brandon → Prasenjit → Arthur</strong></li>
          </ul>
        </div>
        <div class="task-category">
          <h3>Projection Mapping</h3>
          <ul>
            <li>Custom projection mapped visuals are a core part of the festival experience</li>
            <li>For lights &amp; projection mapping: report to <strong>Prasenjit → Christina</strong></li>
            <li>Set up and align projectors before doors open</li>
            <li>Monitor projection during performances, flag any issues immediately</li>
          </ul>
        </div>
        <div class="task-category">
          <h3>Show Flow</h3>
          <ul>
            <li><strong>Setup:</strong> Rig positioning → cabling → amp rack → FOH console</li>
            <li><strong>Pre-show:</strong> Line check → sound checks with each artist</li>
            <li><strong>During show:</strong> FOH mix, monitor adjustments, set changeovers</li>
            <li><strong>Post-festival:</strong> Full rig breakdown and storage per Brandon</li>
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
import stage_icon from '@/assets/images/icons/stage_crew.png'
import footer from '@/assets/images/poster_footer_v1.png'
import { useInventory } from '@/composables/useInventory'

const { deptItems, flagNeedsRestock, flagMissing } = useInventory('stage_crew')
const suppliesOpen = ref(false)

// Reactive data
const userIdCode = ref('')
const userName = ref('')
const isAuthenticated = ref(false)
const stageTasks = ref([])
const isFirebaseAuthenticated = ref(false)
let unsubscribe = null
let authCheckHandler = null

// Initialize stage crew tasks
const initializeTasks = () => {
  return [
    {
      id: 'stage_001',
      title: 'Rig Transport & Positioning',
      description:
        'Move the custom enclosures (fridge-sized horn-loaded sub cabinets and compression driver tops) to their stage positions. Follow Brandon’s direction on placement',
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
      title: 'Sub Stack Assembly & Cabling',
      description:
        'Position and stack the horn-loaded subwoofer enclosures, run speaker cables from amp rack to sub cabinets, verify all connections are secure',
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
      title: 'Tops & Monitor Cabling',
      description:
        'Position and cable the horn-loaded compression driver top cabinets (FOH) and stage monitors/wedges. Run cables neatly and verify polarity',
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
      id: 'stage_004',
      title: 'Amplifier Rack Setup',
      description:
        'Set up and cable the amplifier rack, verify gain structure per Arthur’s direction, confirm all amp channels power on without fault',
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
      title: 'FOH Console & Signal Chain',
      description:
        'Set up the front-of-house mixing console, patch all channels, verify signal routing from stage to FOH position. Report to Arthur, then Brandon',
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
      id: 'stage_006',
      title: 'Projection Mapping Setup',
      description:
        'Set up projectors, align and calibrate the projection mapping system. Report to Prasenjit first, then Christina for visual content and mapping details',
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
      id: 'stage_007',
      title: 'Line Check & Sound Check',
      description:
        'Run a full line check on all stage inputs, then coordinate sound checks with each performing artist. Dial in FOH mix and artist monitors per their needs',
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
      id: 'stage_008',
      title: 'Set Changeover Management',
      description:
        'Manage transitions between artists: reset stage inputs, adjust monitor mixes for incoming artist, coordinate with FOH and stage during changeovers',
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
      id: 'stage_009',
      title: 'Rig Breakdown & Storage',
      description:
        'After the final night: carefully break down and store all rig components (subs, tops, amps, cables). Follow Brandon’s direction for storage locations and packing order',
      department: 'stage_crew',
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
      await setDoc(doc(reunion_db, 'task_status_2026', taskId), {
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
      await setDoc(doc(reunion_db, 'task_status_2026', taskId), {
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
      await setDoc(doc(reunion_db, 'task_status_2026', taskId), {
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

// Firebase Auth check
const checkFirebaseAuth = () => {
  // Check localStorage for user authentication (same as router guard)
  authCheckHandler = () => {
    const isAuthenticatedFromStorage = !!localStorage.getItem('user')
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
    !confirm('Are you sure you want to reset ALL Stage Crew tasks? This action cannot be undone.')
  ) {
    return
  }

  try {
    const q = query(
      collection(reunion_db, 'task_status_2026'),
      where('department', '==', 'stage_crew')
    )
    const querySnapshot = await getDocs(q)

    const batch = writeBatch(reunion_db)
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    console.log('All Stage Crew tasks reset successfully')
    alert('All Stage Crew tasks have been reset')
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
  color: #9c27b0;
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
  border: 1px solid #9c27b0;
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
  background-color: #9c27b0;
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
  background-color: #9c27b0;
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
  background-color: #6a1b9a;
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
  border-left: 4px solid #9c27b0;
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
  border-color: #9c27b0;
  transform: translateY(-2px);
}

.task-item.completed {
  background-color: rgba(76, 175, 80, 0.2);
  border-color: #9c27b0;
}

.task-item.assigned {
  background-color: rgba(255, 193, 7, 0.2);
  border-color: #ffc107;
}

.task-content h4 {
  color: #9c27b0;
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
  background-color: #9c27b0;
}

.complete-btn {
  background-color: #9c27b0;
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
  background-color: #9c27b0;
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
  color: #9c27b0;
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
  border-left: 3px solid #9c27b0;
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
