<template>
  <div v-if="show" class="modal" @click.self="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-close" @click="$emit('close')"></div>
      <img
        src="@/assets/images/festivall_emblem_white.png"
        style="height: 64px; width: auto"
        alt="Festivall Emblem"
      />
      <img
        src="@/assets/images/icons/ticket_black.png"
        style="height: 64px; width: auto; margin: 0; filter: invert(1)"
        alt="Attendees Icon"
      />
      <h2>👥 Attendee Waivers</h2>
      
      <h3 style="margin-bottom: 1.5rem;">
        <strong style="color: orange">Before arrival:</strong><br />
        Each attendee must accept the safety waiver.<br />
        Names are captured during waiver acceptance.
      </h3>

      <div v-if="loading" style="padding: 2rem; text-align: center;">
        <p style="color: var(--reunion-frog-green); font-size: 1.2rem;">💾 Saving...</p>
      </div>

      <div v-else-if="successMessage" style="padding: 2rem; text-align: center;">
        <p style="color: var(--reunion-frog-green); font-size: 1.2rem; margin-bottom: 1rem;">
          ✅ {{ successMessage }}
        </p>
        <p style="color: #aaa; font-size: 0.95rem; margin-bottom: 1rem;">
          Next: Each attendee must accept the safety waiver before check-in.<br />
          Click "Manage Attendees" again to accept waivers.
        </p>
        <button @click="$emit('close')" style="margin-top: 1rem;">Done</button>
      </div>

      <div v-else style="width: 100%;">
        <div v-if="localSlots.length === 0" style="padding: 2rem; text-align: center; color: #ff6b6b;">
          <p>⚠️ No attendee slots found. Please refresh the page.</p>
          <button @click="$emit('close')" style="margin-top: 1rem;">Close</button>
        </div>
        <div
          v-else
          v-for="(slot, index) in localSlots"
          :key="slot.slot_id"
          style="margin-bottom: 1.5rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;"
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <strong style="color: var(--reunion-frog-green); font-size: 1.1rem;">
              Attendee #{{ index + 1 }}
              <span v-if="slot.pass_type === 'Day Pass'" style="color: orange; font-size: 0.85rem;">
                (Day Pass)
              </span>
            </strong>
          </div>

          <div v-if="slot.waiver" style="background: rgba(0,255,0,0.1); border: 1px solid var(--reunion-frog-green); border-radius: 8px; padding: 1rem;">
            <div style="color: var(--reunion-frog-green); font-size: 1rem; margin-bottom: 0.25rem;">
              ✅ <strong>{{ slot.attendee_name }}</strong>
            </div>
            <div style="color: #aaa; font-size: 0.85rem;">
              Waiver accepted: {{ formatDate(slot.waiver.accepted_at) }}
            </div>
          </div>
          <div v-else style="margin-top: 0.5rem;">
            <button 
              @click="openWaiverForSlot(slot)"
              style="width: 100%; padding: 0.75rem; background: orange; color: black; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem;"
            >
              ⚠️ Accept Safety Waiver
            </button>
            <p style="color: #aaa; font-size: 0.85rem; margin-top: 0.5rem; text-align: center;">
              Name will be captured during waiver acceptance
            </p>
          </div>
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2); text-align: center;">
          <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 1rem;">
            {{ completedCount }} / {{ localSlots.length }} waivers accepted
          </p>
          <button
            @click="$emit('close')"
            style="background: transparent; color: white; border-color: white;"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  idCode: {
    type: String,
    required: true
  },
  slots: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'openWaiver'])

const localSlots = ref([])
const loading = ref(false)
const successMessage = ref(null)

// Initialize local slots
const initSlots = () => {
  if (props.slots && props.slots.length > 0) {
    localSlots.value = JSON.parse(JSON.stringify(props.slots))
    successMessage.value = null
  }
}

// Open waiver modal for a specific slot
const openWaiverForSlot = (slot) => {
  emit('openWaiver', slot)
}

// Initialize on mount
onMounted(() => {
  if (props.show) {
    initSlots()
  }
})

// Watch for when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    initSlots()
  }
})

// Watch for changes to slots prop
watch(() => props.slots, (newSlots) => {
  if (newSlots && newSlots.length > 0 && props.show) {
    initSlots()
  }
}, { deep: true })

// Computed properties
const completedCount = computed(() => {
  return localSlots.value.filter(slot => slot.waiver).length
})

// Helper functions
const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit' 
  })
}
</script>
