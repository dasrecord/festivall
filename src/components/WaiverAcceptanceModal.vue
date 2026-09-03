<template>
  <div v-if="show" class="modal" @click.self="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-close" @click="$emit('close')"></div>
      <img
        src="@/assets/images/festivall_emblem_white.png"
        style="height: 64px; width: auto"
        alt="Festivall Emblem"
      />
      <h2>⚠️ Safety Waiver Required</h2>
      
      <h3 v-if="attendeeName" style="margin-bottom: 1.5rem;">
        <strong style="color: var(--reunion-frog-green)">{{ attendeeName }}</strong><br />
        <span style="font-size: 0.9rem; color: #aaa;">
          Required before first entry to Reunion Festival
        </span>
      </h3>
      
      <h3 v-else style="margin-bottom: 1.5rem;">
        <strong style="color: orange">Attendee #{{ slotIndex + 1 }}</strong><br />
        <span style="font-size: 0.9rem; color: #aaa;">
          Please read the waiver and enter your full name below
        </span>
      </h3>

      <div v-if="loading" style="padding: 2rem; text-align: center;">
        <p style="color: var(--reunion-frog-green); font-size: 1.2rem;">💾 Submitting...</p>
      </div>

      <div v-else-if="successMessage" style="padding: 2rem; text-align: center;">
        <p style="color: var(--reunion-frog-green); font-size: 1.2rem; margin-bottom: 1rem;">
          ✅ {{ successMessage }}
        </p>
        <button @click="$emit('close')" style="margin-top: 1rem;">Done</button>
      </div>

      <div v-else-if="activeWaiver" style="width: 100%; text-align: left;">
        <div style="background: rgba(255, 165, 0, 0.1); border: 1px solid orange; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; max-height: 300px; overflow-y: auto;">
          <div style="color: #aaa; font-size: 0.85rem; margin-bottom: 0.5rem; text-align: center;">
            Version {{ activeWaiver.version }} - Effective {{ formatDate(activeWaiver.effective_date) }}
          </div>
          
          <div style="color: white; line-height: 1.6; font-size: 0.95rem;" v-html="renderMarkdown(activeWaiver.content)"></div>

          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2);">
            <strong style="color: var(--reunion-frog-green); font-size: 0.9rem;">Topics Covered:</strong>
            <ul style="margin: 0.5rem 0 0 1.5rem; color: #ccc; font-size: 0.9rem;">
              <li v-for="topic in activeWaiver.topics" :key="topic" style="margin-bottom: 0.25rem;">{{ topic }}</li>
            </ul>
          </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="color: white; font-size: 0.9rem; display: block; margin-bottom: 4px;">
            {{ attendeeName ? 'Type your full name to acknowledge:' : 'Enter your full legal name:' }}
          </label>
          <input
            v-model="typedName"
            type="text"
            :placeholder="attendeeName || 'First Last'"
            style="width: 100%; padding: 0.5rem; border-radius: 8px; border: 1px solid var(--reunion-frog-green); background: #111; color: white; font-size: 1rem;"
            :style="{ borderColor: showValidationError ? '#ff6b6b' : 'var(--reunion-frog-green)' }"
            @input="onTypedNameChange"
          />
          <div v-if="showValidationError" style="color: #ff6b6b; font-size: 0.85rem; margin-top: 0.25rem;">
            ⚠️ {{ validationMessage }}
          </div>
          <div v-else-if="typedName && isNameValid" style="color: var(--reunion-frog-green); font-size: 0.85rem; margin-top: 0.25rem;">
            ✓ {{ attendeeName ? 'Name matches' : 'Valid name' }}
          </div>
        </div>

        <div style="margin-bottom: 1.5rem; display: flex; align-items: flex-start; gap: 0.75rem;">
          <input
            v-model="checkboxAccepted"
            type="checkbox"
            id="waiver-checkbox"
            style="margin-top: 4px; width: 18px; height: 18px; cursor: pointer;"
          />
          <label for="waiver-checkbox" style="color: white; font-size: 0.95rem; line-height: 1.5; cursor: pointer;">
            I have read and understood all safety and conduct requirements listed above.
            I agree to comply with all festival rules and staff instructions.
          </label>
        </div>

        <div v-if="error" style="background: rgba(255,0,0,0.2); border: 1px solid #ff6b6b; border-radius: 8px; padding: 1rem; margin: 1rem 0; color: #ff6b6b;">
          ❌ {{ error }}
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2); text-align: center;">
          <button
            @click="submitWaiver"
            :disabled="!canSubmit || loading"
            style="margin-right: 0.5rem;"
          >
            {{ loading ? 'Submitting...' : '✓ Accept Waiver' }}
          </button>
          <button
            @click="$emit('close')"
            :disabled="loading"
            style="background: transparent; color: white; border-color: white;"
          >
            Cancel
          </button>
        </div>
      </div>

      <div v-else style="padding: 2rem; text-align: center; color: #ff6b6b;">
        <p>⚠️ No active waiver version configured. Please contact festival administration.</p>
        <button @click="$emit('close')" style="margin-top: 1rem;">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useWaiverStatus } from '@/composables/useWaiverStatus'
import { sendReunionFrontGate } from '/scripts/notifications.js'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  idCode: {
    type: String,
    required: true
  },
  slotId: {
    type: String,
    required: true
  },
  slotIndex: {
    type: Number,
    default: 0
  },
  attendeeName: {
    type: String,
    default: null
  },
  source: {
    type: String,
    default: 'ticket_page',
    validator: (value) => ['ticket_page', 'operator_scanner', 'self_service_kiosk'].includes(value)
  },
  operator: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'accepted'])

const { 
  loading, 
  error: waiverError, 
  activeWaiver, 
  acceptWaiver 
} = useWaiverStatus()

const typedName = ref('')
const checkboxAccepted = ref(false)
const error = ref(null)
const successMessage = ref(null)

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    typedName.value = ''
    checkboxAccepted.value = false
    error.value = null
    successMessage.value = null
  }
})

// Watch for composable errors
watch(waiverError, (newError) => {
  if (newError) {
    error.value = newError
  }
})

// Name validation
const normalizeForComparison = (str) => 
  str.trim().toLowerCase().replace(/\s+/g, ' ')

const isNameValid = computed(() => {
  const trimmed = typedName.value.trim()
  
  if (trimmed.length < 2) {
    return false
  }
  
  // If we have an existing attendee name, validate it matches
  if (props.attendeeName) {
    return normalizeForComparison(trimmed) === normalizeForComparison(props.attendeeName)
  }
  
  // Otherwise validate it's a valid name (first + last)
  const parts = trimmed.split(/\s+/)
  return parts.length >= 2 && parts.every(part => part.length > 0)
})

const showValidationError = computed(() => {
  if (!typedName.value || typedName.value.trim().length < 2) {
    return false
  }
  return !isNameValid.value
})

const validationMessage = computed(() => {
  if (props.attendeeName) {
    return `Name must match: ${props.attendeeName}`
  }
  return 'Please enter both first and last name'
})

const canSubmit = computed(() => {
  return activeWaiver.value &&
         isNameValid.value &&
         checkboxAccepted.value &&
         !loading.value
})

const onTypedNameChange = () => {
  error.value = null
  successMessage.value = null
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const renderMarkdown = (content) => {
  if (!content) return ''
  
  // Simple markdown rendering (headers, lists, bold)
  return content
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|l|p])/gm, '<p>')
    .replace(/(?<![h|l|p]>)$/gm, '</p>')
}

const submitWaiver = async () => {
  if (!canSubmit.value) {
    error.value = 'Please complete all required fields'
    return
  }

  error.value = null
  successMessage.value = null

  // Get user agent and attempt to get IP (note: IP not available client-side in production)
  const userAgent = navigator.userAgent

  const result = await acceptWaiver(
    props.idCode,
    props.slotId,
    typedName.value.trim(),
    checkboxAccepted.value,
    props.source,
    props.operator,
    undefined, // ipAddress - not available client-side
    userAgent
  )

  if (result.success) {
    successMessage.value = 'Waiver accepted successfully!'

    sendReunionFrontGate(
      `:page_facing_up: ${typedName.value.trim()} has accepted the safety waiver.\n:id: ${props.idCode}\n:bust_in_silhouette: ${props.operator ? `Operator: ${props.operator}` : `Source: ${props.source}`}`
    )

    // Notify parent and close after brief delay
    setTimeout(() => {
      emit('accepted', {
        slotId: props.slotId,
        typedName: typedName.value.trim(),
        acceptedAt: new Date().toISOString()
      })
      emit('close')
    }, 1000)
  } else {
    error.value = result.error || 'Failed to accept waiver. Please try again.'
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  z-index: 10;
  padding: 1rem;
  overflow-y: auto;
}

.modal-content {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  color: white;
  border: 2px solid var(--reunion-frog-green);
  border-radius: 15px;
  background-color: rgba(0, 0, 0, 0.9);
  font-size: 16px;
  position: relative;
  margin-top: 2rem;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 28px;
  color: white;
  cursor: pointer;
  z-index: 12;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.modal-close::before {
  content: '✕';
  font-size: 20px;
}

button {
  background: var(--reunion-frog-green);
  color: black;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover:not(:disabled) {
  background: #7ed957;
  transform: translateY(-2px);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button[style*="background: transparent"] {
  background: transparent !important;
  color: white !important;
  border: 1px solid white !important;
}

button[style*="background: transparent"]:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1) !important;
}

h2 {
  margin: 1rem 0;
  font-size: 1.5rem;
}

h3 {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  line-height: 1.5;
}

h4 {
  margin: 0.75rem 0 0.5rem;
  font-size: 1rem;
  color: var(--reunion-frog-green);
}
</style>
