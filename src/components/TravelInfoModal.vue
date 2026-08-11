<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-close" @click="$emit('close')"></div>
      <img
        class="festivall-emblem"
        :src="festivall_emblem_white"
        style="height: 64px; width: auto"
        alt="Festivall Emblem"
      />
      <img :src="travel_icon" style="height: 64px; width: auto; margin: 0" alt="Travel Icon" />
      <h2>Update Your Travel Information</h2>

      <h3 v-if="cutoffReached" style="color: orange;">
        ✋ Editing is closed.<br />
        The cutoff for self-service edits was
        <strong>{{ cutoffDate.toLocaleDateString() }}</strong>.<br />
        Email
        <a href="mailto:reunion@festivall.ca" style="color: orange;">reunion@festivall.ca</a>
        for any urgent changes.
      </h3>

      <form v-else @submit.prevent="onSave" class="travel-form">
        <div v-if="hasAirportServices" class="travel-section">
          <h3>✈️ Airport Travel (YXE - Saskatoon)</h3>
          
          <div v-if="hasArrival" class="travel-group">
            <h4>Arrival Information</h4>
            <label>Arrival Flight Number</label>
            <input 
              type="text" 
              v-model.trim="form.arrival_flight" 
              placeholder="e.g., AC 123"
              maxlength="20"
            />
            
            <label>Arrival Date & Time</label>
            <input 
              type="datetime-local" 
              v-model="form.arrival_datetime"
            />
            
            <small v-if="form.arrival_datetime" style="color: var(--reunion-frog-green);">
              Pickup scheduled for: {{ formatPickupTime(form.arrival_datetime) }}
            </small>
          </div>

          <div v-if="hasDeparture" class="travel-group">
            <h4>Departure Information</h4>
            <label>Departure Flight Number</label>
            <input 
              type="text" 
              v-model.trim="form.departure_flight" 
              placeholder="e.g., AC 456"
              maxlength="20"
            />
            
            <label>Departure Date & Time</label>
            <input 
              type="datetime-local" 
              v-model="form.departure_datetime"
            />
            
            <small v-if="form.departure_datetime" style="color: var(--reunion-frog-green);">
              Dropoff scheduled for: {{ formatDropoffTime(form.departure_datetime) }}
            </small>
          </div>
        </div>

        <div v-if="hasShuttle" class="travel-section">
          <h3>🚐 Festival Shuttle Service</h3>
          <p style="color: #ccc; font-size: 0.9rem;">
            Your shuttle service to/from the festival grounds is confirmed.
            Specific pickup times will be coordinated closer to the festival date.
          </p>
          
          <label>Additional Shuttle Notes (optional)</label>
          <textarea 
            v-model="form.shuttle_notes" 
            maxlength="500" 
            rows="3"
            placeholder="Any special requirements or notes..."
          />
        </div>

        <div class="travel-section">
          <label>Phone Number (for driver contact)</label>
          <input 
            type="tel" 
            v-model.trim="form.contact_phone" 
            placeholder="+1 (306) 555-1234"
          />
        </div>

        <h3 v-if="errorMessage" style="color: red;">{{ errorMessage }}</h3>

        <button type="submit" :disabled="saving || !isFormValid">
          {{ saving ? 'Saving…' : '💾 Save Travel Info' }}
        </button>
        <button
          type="button"
          @click="$emit('close')"
          style="background: transparent; color: white; border-color: white; margin-top: 0.5rem;"
        >
          Cancel
        </button>
      </form>

      <div v-if="!cutoffReached && existingTravel" class="existing-info">
        <h4>Current Travel Information:</h4>
        <div v-if="existingTravel.arrival_flight" class="info-item">
          <strong>Arrival:</strong> Flight {{ existingTravel.arrival_flight }} 
          @ {{ formatDateTime(existingTravel.arrival_datetime) }}
        </div>
        <div v-if="existingTravel.departure_flight" class="info-item">
          <strong>Departure:</strong> Flight {{ existingTravel.departure_flight }} 
          @ {{ formatDateTime(existingTravel.departure_datetime) }}
        </div>
        <div v-if="existingTravel.contact_phone" class="info-item">
          <strong>Phone:</strong> {{ existingTravel.contact_phone }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { doc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'
import festivall_emblem_white from '@/assets/images/festivall_emblem_white.png'
import travel_icon from '@/assets/images/icons/location.png'

export default {
  name: 'TravelInfoModal',
  props: {
    order: { type: Object, required: true },
    hasArrival: { type: Boolean, default: false },
    hasDeparture: { type: Boolean, default: false },
    hasShuttle: { type: Boolean, default: false },
    existingTravel: { type: Object, default: null }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const cfg = REUNION_FESTIVAL.artistEditing
    const cutoffDate = cfg.editCutoff
    const cutoffReached = computed(() => new Date() >= cutoffDate)
    
    const hasAirportServices = computed(() => props.hasArrival || props.hasDeparture)

    const initial = {
      arrival_flight: props.existingTravel?.arrival_flight || '',
      arrival_datetime: props.existingTravel?.arrival_datetime || '',
      departure_flight: props.existingTravel?.departure_flight || '',
      departure_datetime: props.existingTravel?.departure_datetime || '',
      shuttle_notes: props.existingTravel?.shuttle_notes || '',
      contact_phone: props.existingTravel?.contact_phone || props.order.phone || ''
    }
    const form = reactive({ ...initial })

    const saving = ref(false)
    const errorMessage = ref('')

    const isFormValid = computed(() => {
      // Require phone number
      if (!form.contact_phone) return false
      
      // If they have arrival service, require arrival details
      if (props.hasArrival && (!form.arrival_flight || !form.arrival_datetime)) return false
      
      // If they have departure service, require departure details
      if (props.hasDeparture && (!form.departure_flight || !form.departure_datetime)) return false
      
      return true
    })

    const formatPickupTime = (datetime) => {
      if (!datetime) return ''
      const dt = new Date(datetime)
      dt.setMinutes(dt.getMinutes() + 20) // Add 20 minutes after landing
      return dt.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }

    const formatDropoffTime = (datetime) => {
      if (!datetime) return ''
      const dt = new Date(datetime)
      dt.setMinutes(dt.getMinutes() - 90) // 90 minutes before departure
      return dt.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }

    const formatDateTime = (datetime) => {
      if (!datetime) return ''
      return new Date(datetime).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }

    const createVolunteerSlot = async (slotData) => {
      try {
        const slotPayload = {
          team: 'artisttransportation',
          date: slotData.date,
          start: slotData.start,
          end: slotData.end,
          capacity: 1,
          notes: slotData.notes,
          active: true,
          artist_id_code: props.order.id_code,
          artist_name: props.order.fullname,
          flight_number: slotData.flight_number || '',
          transport_type: slotData.transport_type, // 'pickup' or 'dropoff'
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          claimed: []
        }
        
        await addDoc(collection(reunion_db, 'volunteer_slots_2026'), slotPayload)
        console.log(`✅ Created ${slotData.transport_type} volunteer slot`)
      } catch (error) {
        console.error(`Error creating volunteer slot:`, error)
        throw error
      }
    }

    const deleteExistingSlots = async () => {
      // Delete any existing volunteer slots for this artist's transportation
      try {
        const q = query(
          collection(reunion_db, 'volunteer_slots_2026'),
          where('team', '==', 'artisttransportation'),
          where('artist_id_code', '==', props.order.id_code)
        )
        const snapshot = await getDocs(q)
        const deletePromises = snapshot.docs.map(doc => 
          updateDoc(doc.ref, { active: false })
        )
        await Promise.all(deletePromises)
        console.log('✅ Deactivated existing transportation slots')
      } catch (error) {
        console.error('Error deactivating old slots:', error)
      }
    }

    const onSave = async () => {
      if (!isFormValid.value) return
      
      saving.value = true
      errorMessage.value = ''

      try {
        // Save travel info to participant document
        const travelData = {
          'travel_info.arrival_flight': form.arrival_flight,
          'travel_info.arrival_datetime': form.arrival_datetime,
          'travel_info.departure_flight': form.departure_flight,
          'travel_info.departure_datetime': form.departure_datetime,
          'travel_info.shuttle_notes': form.shuttle_notes,
          'travel_info.contact_phone': form.contact_phone,
          'travel_info.updated_at': serverTimestamp()
        }

        await updateDoc(
          doc(reunion_db, REUNION_FESTIVAL.participantsCollection, props.order.id_code),
          travelData
        )

        // Deactivate any existing transportation slots for this artist
        await deleteExistingSlots()

        // Create volunteer slots if airport services are needed
        if (props.hasArrival && form.arrival_datetime) {
          const arrivalDate = new Date(form.arrival_datetime)
          const pickupDate = new Date(arrivalDate.getTime() + 20 * 60 * 1000) // +20 minutes
          
          await createVolunteerSlot({
            date: pickupDate.toISOString().split('T')[0],
            start: pickupDate.toTimeString().substring(0, 5),
            end: new Date(pickupDate.getTime() + 60 * 60 * 1000).toTimeString().substring(0, 5), // +1 hour
            notes: `Airport pickup for ${props.order.fullname} - Flight ${form.arrival_flight}`,
            flight_number: form.arrival_flight,
            transport_type: 'pickup'
          })
        }

        if (props.hasDeparture && form.departure_datetime) {
          const departureDate = new Date(form.departure_datetime)
          const dropoffDate = new Date(departureDate.getTime() - 90 * 60 * 1000) // -90 minutes
          
          await createVolunteerSlot({
            date: dropoffDate.toISOString().split('T')[0],
            start: dropoffDate.toTimeString().substring(0, 5),
            end: new Date(dropoffDate.getTime() + 60 * 60 * 1000).toTimeString().substring(0, 5), // +1 hour
            notes: `Airport dropoff for ${props.order.fullname} - Flight ${form.departure_flight}`,
            flight_number: form.departure_flight,
            transport_type: 'dropoff'
          })
        }

        emit('saved', { values: form })
        emit('close')
      } catch (error) {
        console.error('Error saving travel info:', error)
        errorMessage.value = 'Failed to save travel information. Please try again.'
      } finally {
        saving.value = false
      }
    }

    return {
      festivall_emblem_white,
      travel_icon,
      cutoffDate,
      cutoffReached,
      hasAirportServices,
      form,
      saving,
      errorMessage,
      isFormValid,
      formatPickupTime,
      formatDropoffTime,
      formatDateTime,
      onSave
    }
  }
}
</script>

<style scoped>
/* Reuse the same modal chrome variables/colors as other modals */
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
}

.modal-content {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
  border: 2px solid var(--reunion-frog-green);
  border-radius: 15px;
  background-color: rgba(0, 0, 0, 0.8);
  font-size: 16px;
  position: relative;
  margin-top: 2rem;
}

.festivall-emblem {
  position: absolute;
  top: 10px;
  left: 10px;
}

.modal-close {
  position: sticky;
  top: 15px;
  right: 20px;
  font-size: 24px;
  color: white;
  cursor: pointer;
  z-index: 12;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s ease;
  align-self: flex-end;
  margin-bottom: -30px;
}
.modal-close::before { content: '✕'; }
.modal-close:hover { background-color: rgba(255, 255, 255, 0.2); }

.modal-content h2 { font-size: 1.5rem; margin: 1rem 0; color: white; }
.modal-content h3 { font-size: 1rem; line-height: 1.4; margin: 0.75rem 0; }
.modal-content h4 { font-size: 0.95rem; margin: 0.75rem 0; color: #ccc; }
.modal-content img { margin: 0 0 0.5rem 0; }

.travel-form {
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.travel-section {
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.travel-section h3 {
  text-align: left;
  margin: 0 0 0.5rem;
}

.travel-group {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.travel-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.travel-form label {
  color: white;
  font-size: 0.95rem;
  font-weight: bold;
  margin-top: 0.75rem;
  display: block;
}

.travel-form small {
  color: #bbb;
  font-size: 0.8rem;
  display: block;
  margin-bottom: 4px;
  margin-top: 4px;
}

.travel-form input[type='text'],
.travel-form input[type='tel'],
.travel-form input[type='datetime-local'],
.travel-form textarea {
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--reunion-frog-green);
  background: #111;
  color: white;
  font-size: 1rem;
  font-family: inherit;
  box-sizing: border-box;
}

.travel-form textarea { 
  resize: vertical; 
  min-height: 60px; 
}

.travel-form button {
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--reunion-frog-green);
  border-radius: 8px;
  background: var(--reunion-frog-green);
  color: black;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.travel-form button:hover:not(:disabled) {
  background: transparent;
  color: var(--reunion-frog-green);
}

.travel-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.existing-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  text-align: left;
}

.info-item {
  margin-bottom: 0.5rem;
  color: #ccc;
  font-size: 0.9rem;
}

.info-item:last-child {
  margin-bottom: 0;
}
</style>
