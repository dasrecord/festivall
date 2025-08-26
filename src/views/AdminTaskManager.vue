<template>
  <div class="admin-task-manager">
    <div v-if="!isAuthenticated" class="auth-required">
      <h2>🔒 Admin Access Required</h2>
      <p>Please log in to the Festivall dashboard to access task management.</p>
      <RouterLink to="/login" class="login-button">Go to Login</RouterLink>
    </div>

    <div v-else class="admin-interface">
      <div class="header">
        <h1>🛠️ Task Management Admin</h1>
        <p>Reset individual tasks or entire departments</p>
      </div>

      <div class="admin-actions">
        <div class="section">
          <h2>🏢 Department-Wide Reset</h2>
          <div class="department-grid">
            <div class="dept-card" v-for="dept in departments" :key="dept.id">
              <h3>{{ dept.icon }} {{ dept.name }}</h3>
              <p>{{ dept.description }}</p>
              <button 
                @click="resetDepartment(dept.id, dept.name)"
                class="reset-dept-btn"
                :disabled="loading"
              >
                Reset All {{ dept.name }} Tasks
              </button>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>📋 Individual Task Reset</h2>
          <div class="task-reset-interface">
            <div class="search-section">
              <label for="dept-select">Department:</label>
              <select v-model="selectedDepartment" @change="loadDepartmentTasks">
                <option value="">Select Department</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>

            <div v-if="selectedDepartment && departmentTasks.length > 0" class="tasks-list">
              <h3>{{ getDepartmentName(selectedDepartment) }} Tasks</h3>
              <div class="task-grid">
                <div 
                  v-for="task in departmentTasks" 
                  :key="task.id"
                  class="task-card"
                  :class="{ completed: task.completed }"
                >
                  <div class="task-info">
                    <h4>{{ task.title }}</h4>
                    <p>{{ task.description }}</p>
                    <div class="task-status">
                      <span v-if="task.completed" class="status completed">
                        ✅ Completed by {{ task.completedByName }} 
                        <small>{{ formatDate(task.completedAt) }}</small>
                      </span>
                      <span v-else class="status incomplete">⏳ Not completed</span>
                      <span v-if="task.type" class="task-type">{{ task.type }}</span>
                    </div>
                  </div>
                  <button 
                    @click="resetTask(task.id, task.title, selectedDepartment)"
                    class="reset-task-btn"
                    :disabled="loading || !task.completed"
                  >
                    Reset Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🔍 Quick Task Lookup</h2>
          <div class="quick-reset">
            <label for="task-id">Task ID:</label>
            <input 
              v-model="quickTaskId" 
              type="text" 
              placeholder="e.g., setup_001, frontgate_002"
              @keyup.enter="quickResetTask"
            />
            <button @click="quickResetTask" :disabled="!quickTaskId || loading">
              Quick Reset
            </button>
          </div>
        </div>
      </div>

      <div class="activity-log">
        <h2>📝 Reset Activity Log</h2>
        <div class="log-entries">
          <div v-for="entry in activityLog" :key="entry.id" class="log-entry">
            <span class="timestamp">{{ entry.timestamp }}</span>
            <span class="action">{{ entry.action }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { reunion_db } from '@/firebase'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  writeBatch 
} from 'firebase/firestore'

// Authentication state
const isAuthenticated = ref(false)
const loading = ref(false)

// Task management state
const selectedDepartment = ref('')
const departmentTasks = ref([])
const quickTaskId = ref('')
const activityLog = ref([])

// Department definitions
const departments = [
  {
    id: 'front_gate',
    name: 'Front Gate',
    icon: '🚪',
    description: 'Entry scanning, payment processing, crowd control'
  },
  {
    id: 'setup_crew', 
    name: 'Setup Crew',
    icon: '🔧',
    description: 'Pre-festival setup, equipment, decorations'
  },
  {
    id: 'food_team',
    name: 'Food Team', 
    icon: '🍽️',
    description: 'Kitchen operations, meal preparation, service'
  },
  {
    id: 'stage_crew',
    name: 'Stage Crew',
    icon: '🎵', 
    description: 'Audio/visual equipment, lighting, technical support'
  },
  {
    id: 'cleanup_crew',
    name: 'Cleanup Crew',
    icon: '🧹',
    description: 'Post-festival cleanup, equipment storage'
  }
]

// Check authentication status
const checkAuth = () => {
  const user = localStorage.getItem('user')
  isAuthenticated.value = !!user
}

// Get department name by ID
const getDepartmentName = (deptId) => {
  const dept = departments.find(d => d.id === deptId)
  return dept ? dept.name : deptId
}

// Load tasks for selected department
const loadDepartmentTasks = async () => {
  if (!selectedDepartment.value) {
    departmentTasks.value = []
    return
  }

  loading.value = true
  try {
    // Get all task status documents for this department
    const q = query(
      collection(reunion_db, 'task_status_2025'),
      where('department', '==', selectedDepartment.value)
    )
    const querySnapshot = await getDocs(q)
    
    const tasks = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      tasks.push({
        id: data.taskId,
        title: data.taskId, // We'll need to map this to actual titles
        description: `Task ID: ${data.taskId}`,
        completed: data.completed,
        completedBy: data.completedBy,
        completedByName: data.completedByName,
        completedAt: data.completedAt,
        type: data.type || 'standard'
      })
    })
    
    departmentTasks.value = tasks
  } catch (error) {
    console.error('Error loading department tasks:', error)
    addLogEntry(`Error loading ${selectedDepartment.value} tasks: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// Reset entire department
const resetDepartment = async (deptId, deptName) => {
  const confirmMsg = `⚠️ RESET ALL TASKS for ${deptName}?\n\nThis will reset ALL completed tasks in this department. This action cannot be undone.`
  
  if (!confirm(confirmMsg)) return

  loading.value = true
  try {
    // Get all task documents for this department
    const q = query(
      collection(reunion_db, 'task_status_2025'),
      where('department', '==', deptId)
    )
    const querySnapshot = await getDocs(q)
    
    // Use batch delete for efficiency
    const batch = writeBatch(reunion_db)
    let deleteCount = 0
    
    querySnapshot.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref)
      deleteCount++
    })
    
    await batch.commit()
    
    addLogEntry(`✅ Reset ${deleteCount} tasks in ${deptName} department`)
    alert(`✅ Successfully reset ${deleteCount} tasks in ${deptName}`)
    
    // Refresh current view if needed
    if (selectedDepartment.value === deptId) {
      await loadDepartmentTasks()
    }
  } catch (error) {
    console.error('Error resetting department:', error)
    addLogEntry(`❌ Error resetting ${deptName}: ${error.message}`)
    alert(`❌ Error resetting department: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// Reset individual task
const resetTask = async (taskId, taskTitle, deptId) => {
  const confirmMsg = `Reset task "${taskTitle}" (${taskId})?`
  
  if (!confirm(confirmMsg)) return

  loading.value = true
  try {
    await deleteDoc(doc(reunion_db, 'task_status_2025', taskId))
    
    addLogEntry(`✅ Reset task: ${taskId} (${taskTitle})`)
    alert(`✅ Task "${taskTitle}" has been reset`)
    
    // Refresh current view
    if (selectedDepartment.value === deptId) {
      await loadDepartmentTasks()
    }
  } catch (error) {
    console.error('Error resetting task:', error)
    addLogEntry(`❌ Error resetting ${taskId}: ${error.message}`)
    alert(`❌ Error resetting task: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// Quick reset by task ID
const quickResetTask = async () => {
  if (!quickTaskId.value.trim()) return

  const taskId = quickTaskId.value.trim()
  const confirmMsg = `Reset task "${taskId}"?`
  
  if (!confirm(confirmMsg)) return

  loading.value = true
  try {
    await deleteDoc(doc(reunion_db, 'task_status_2025', taskId))
    
    addLogEntry(`✅ Quick reset: ${taskId}`)
    alert(`✅ Task "${taskId}" has been reset`)
    
    quickTaskId.value = ''
    
    // Refresh current view if it matches
    if (selectedDepartment.value) {
      await loadDepartmentTasks()
    }
  } catch (error) {
    console.error('Error in quick reset:', error)
    addLogEntry(`❌ Error quick resetting ${taskId}: ${error.message}`)
    alert(`❌ Error resetting task: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// Add entry to activity log
const addLogEntry = (action) => {
  const entry = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    action: action
  }
  activityLog.value.unshift(entry)
  
  // Keep only last 20 entries
  if (activityLog.value.length > 20) {
    activityLog.value = activityLog.value.slice(0, 20)
  }
}

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

// Initialize component
onMounted(() => {
  checkAuth()
})
</script>

<style scoped>
.admin-task-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #1a1a1a;
  color: white;
  min-height: 100vh;
}

.auth-required {
  text-align: center;
  padding: 4rem 2rem;
}

.auth-required h2 {
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.login-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: var(--reunion-frog-green, #4caf50);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  margin-top: 1rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  color: var(--reunion-frog-green, #4caf50);
  margin-bottom: 0.5rem;
}

.section {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.section h2 {
  color: var(--reunion-frog-green, #4caf50);
  margin-bottom: 1.5rem;
}

.department-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.dept-card {
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid #444;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.dept-card h3 {
  color: var(--reunion-frog-green, #4caf50);
  margin-bottom: 0.5rem;
}

.reset-dept-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.reset-dept-btn:hover:not(:disabled) {
  background-color: #c82333;
  transform: translateY(-1px);
}

.reset-dept-btn:disabled {
  background-color: #666;
  cursor: not-allowed;
}

.search-section {
  margin-bottom: 2rem;
}

.search-section label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ccc;
}

.search-section select {
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #444;
  background-color: #2a2a2a;
  color: white;
  width: 100%;
  max-width: 300px;
}

.task-grid {
  display: grid;
  gap: 1rem;
}

.task-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid #444;
  border-radius: 8px;
  padding: 1rem;
}

.task-card.completed {
  border-color: #28a745;
}

.task-info {
  flex: 1;
}

.task-info h4 {
  color: var(--reunion-frog-green, #4caf50);
  margin-bottom: 0.5rem;
}

.task-status {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.5rem;
}

.status.completed {
  color: #28a745;
}

.status.incomplete {
  color: #ffc107;
}

.task-type {
  background-color: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.reset-task-btn {
  background-color: #ffc107;
  color: #000;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.reset-task-btn:hover:not(:disabled) {
  background-color: #ffca2c;
}

.reset-task-btn:disabled {
  background-color: #666;
  color: #999;
  cursor: not-allowed;
}

.quick-reset {
  display: flex;
  gap: 1rem;
  align-items: end;
}

.quick-reset label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ccc;
}

.quick-reset input {
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #444;
  background-color: #2a2a2a;
  color: white;
  flex: 1;
  max-width: 300px;
}

.quick-reset button {
  background-color: var(--reunion-frog-green, #4caf50);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.activity-log {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
}

.activity-log h2 {
  color: var(--reunion-frog-green, #4caf50);
  margin-bottom: 1rem;
}

.log-entries {
  max-height: 300px;
  overflow-y: auto;
}

.log-entry {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #444;
}

.timestamp {
  color: #888;
  font-size: 0.875rem;
  min-width: 150px;
}

.action {
  flex: 1;
}

@media (max-width: 768px) {
  .admin-task-manager {
    padding: 1rem;
  }
  
  .department-grid {
    grid-template-columns: 1fr;
  }
  
  .task-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .quick-reset {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
