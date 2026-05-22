<template>
  <div class="page">
    <div class="banner">
      <RouterLink :to="`/wedding-dj/invoice/${lead_id}`" class="back-link">← Contract</RouterLink>
      <h1>PLAYLIST BUILDER</h1>
      <span></span>
    </div>

    <div class="content">
      <div v-if="loading" class="state-msg">Loading playlist...</div>
      <div v-else-if="error" class="state-msg error">{{ error }}</div>

      <!-- GATE: Contract must be signed first -->
      <div v-else-if="!data.person1_signature" class="budget-card gate-card">
        <div class="card-header"><span class="card-title">Contract Required</span></div>
        <p class="muted">Please sign the contract before submitting your playlist.</p>
        <RouterLink :to="`/wedding-dj/invoice/${lead_id}`" class="btn-primary inline-btn">Go to Contract →</RouterLink>
      </div>

      <!-- LOCKED: Past 2-week cutoff -->
      <div v-else-if="isLocked && !submitted" class="budget-card">
        <div class="card-header"><span class="card-title">Playlist Locked</span></div>
        <p class="muted">Your event is within 2 weeks. The playlist has been locked. Please contact us directly if you need changes.</p>
        <div class="moments-grid">
          <div class="budget-card moment-card" v-for="moment in moments" :key="moment.key">
            <div class="card-header"><span class="card-title">{{ moment.label }}</span></div>
            <p class="readonly-val">{{ data[`${moment.key}_artist`] || '—' }} – {{ data[`${moment.key}_track`] || '—' }}</p>
          </div>
        </div>
      </div>

      <!-- SUCCESS STATE -->
      <div v-else-if="submitted" class="budget-card success-card">
        <div class="card-header"><span class="card-title">Playlist Saved!</span></div>
        <p class="muted">Your playlist has been submitted. Editable until 2 weeks before your event.</p>
      </div>

      <!-- EDITABLE STATE -->
      <template v-else>
        <div class="budget-card intro-card">
          <div class="card-header"><span class="card-title">Event: {{ data.event_date }}</span></div>
          <p class="muted">Fill in as many or as few moments as you'd like. All fields are optional. Submit when ready.</p>
          <p class="muted" v-if="daysUntilEvent !== null">Days until event: <strong>{{ daysUntilEvent }}</strong></p>
        </div>

        <div class="section-label">Song Moments</div>
        <div class="moments-grid">
          <div class="budget-card moment-card" v-for="moment in moments" :key="moment.key">
            <div class="card-header"><span class="card-title">{{ moment.label }}</span></div>
            <div class="form-section">
              <label>Artist</label>
              <input type="text" v-model="playlist[`${moment.key}_artist`]" placeholder="Artist name" />
            </div>
            <div class="form-section">
              <label>Track &amp; Version</label>
              <input type="text" v-model="playlist[`${moment.key}_track`]" placeholder="Song name (e.g. Radio Edit)" />
            </div>
            <div class="form-section">
              <label>Link</label>
              <input type="url" v-model="playlist[`${moment.key}_link`]" placeholder="Spotify or YouTube URL" />
            </div>
          </div>
        </div>

        <div class="budget-card submit-card">
          <p v-if="submitError" class="field-error">{{ submitError }}</p>
          <button class="btn-primary" @click="submitPlaylist" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'SAVE PLAYLIST' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { festivall_db } from '@/firebase'
import { sendFestivallDJSlack } from '/scripts/notifications.js'

const route = useRoute()
const lead_id = route.params.lead_id

const loading = ref(true)
const error = ref('')
const data = ref({})
const submitted = ref(false)
const submitting = ref(false)
const submitError = ref('')

const moments = [
  { key: 'bridal_party_entrance', label: 'Bridal Party Entrance' },
  { key: 'grooms_party_entrance', label: "Groom's Party Entrance" },
  { key: 'extended_family_entrance', label: 'Extended Family Entrance' },
  { key: 'bride_groom_entrance', label: 'Bride & Groom Entrance' },
  { key: 'first_dance', label: 'First Dance' },
  { key: 'father_daughter', label: 'Father-Daughter Dance' },
  { key: 'mother_son', label: 'Mother-Son Dance' },
  { key: 'dance_floor_opener', label: 'Dance Floor Opener' },
  { key: 'bouquet_toss', label: 'Bouquet Toss' },
  { key: 'garter_toss', label: 'Garter Toss' },
  { key: 'special_request_1', label: 'Special Request #1' },
  { key: 'special_request_2', label: 'Special Request #2' },
  { key: 'special_request_3', label: 'Special Request #3' },
  { key: 'closing_song', label: 'Closing Song' }
]

// Build reactive playlist object with empty defaults
const playlist = reactive(
  Object.fromEntries(
    moments.flatMap((m) => [
      [`${m.key}_artist`, ''],
      [`${m.key}_track`, ''],
      [`${m.key}_link`, '']
    ])
  )
)

const daysUntilEvent = computed(() => {
  if (!data.value.event_date) return null
  const diff = new Date(data.value.event_date) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const isLocked = computed(() => {
  if (daysUntilEvent.value === null) return false
  return daysUntilEvent.value <= 14
})

onMounted(async () => {
  try {
    const snap = await getDoc(doc(festivall_db, 'dj_inquiries', lead_id))
    if (!snap.exists()) {
      error.value = 'Playlist not found. Please check your lead ID.'
    } else {
      data.value = snap.data()
      // Pre-fill playlist from saved data
      moments.forEach((m) => {
        ['artist', 'track', 'link'].forEach((field) => {
          const key = `${m.key}_${field}`
          if (data.value[key]) playlist[key] = data.value[key]
        })
      })
    }
  } catch (err) {
    error.value = 'Failed to load playlist. Please try again.'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const submitPlaylist = async () => {
  submitError.value = ''
  submitting.value = true
  try {
    const playlistData = { ...playlist, playlist_updated_at: new Date().toISOString() }
    await updateDoc(doc(festivall_db, 'dj_inquiries', lead_id), playlistData)

    const lines = moments
      .filter((m) => playlist[`${m.key}_artist`] || playlist[`${m.key}_track`])
      .map((m) => `  *${m.label}:* ${playlist[`${m.key}_artist`] || '?'} – ${playlist[`${m.key}_track`] || '?'}${playlist[`${m.key}_link`] ? ' ' + playlist[`${m.key}_link`] : ''}`)
      .join('\n')

    await sendFestivallDJSlack(`🎵 *Playlist Updated*\nLead: ${lead_id} | Event: ${data.value.event_date}\n\n${lines || 'No tracks entered.'}`)
    submitted.value = true
  } catch (err) {
    console.error(err)
    submitError.value = 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #1f1e22;
  color: #e0e0e0;
  padding-bottom: 3rem;
}

.banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 0.75rem 1rem;
}

.back-link { font-size: 11px; color: var(--festivall-baby-blue); text-decoration: none; }
h1 { font-size: 13px; letter-spacing: 0.12em; color: var(--festivall-baby-blue); margin: 0; }

.content { max-width: 960px; margin: 0 auto; padding: 1rem; }

.state-msg { padding: 2rem; text-align: center; font-size: 14px; color: #888; }
.state-msg.error { color: #ef5350; }

.section-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #666; margin: 1rem 0 2px;
}

.moments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1px;
  background-color: #2a2a2e;
  margin-bottom: 1px;
}

.budget-card { background-color: #252528; padding: 0.75rem; margin-bottom: 1px; }
.moment-card { margin-bottom: 0; }

.card-header {
  border-bottom: 1px solid #333; padding-bottom: 0.35rem; margin-bottom: 0.5rem;
}
.card-title { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #ccc; }

.muted { font-size: 12px; color: #888; line-height: 1.6; margin: 0 0 0.25rem; }
.readonly-val { font-size: 12px; color: #aaa; margin: 0; }

.form-section {
  display: flex; flex-direction: row; align-items: stretch; margin-bottom: 4px;
}
.form-section label {
  width: 35%; min-width: 90px;
  font-size: 10px; padding: 6px 8px;
  background-color: var(--festivall-baby-blue); color: #000;
  border-radius: 3px 0 0 3px; display: flex; align-items: center;
}
.form-section input {
  flex: 1; font-size: 11px; padding: 6px 8px;
  background-color: #1a1a1d; color: #e0e0e0;
  border: 1px solid #444; border-left: none;
  border-radius: 0 3px 3px 0; outline: none;
}
.form-section input:focus { border-color: var(--festivall-baby-blue); }

.gate-card p { margin: 0.5rem 0 0.75rem; }
.success-card p { margin: 0.5rem 0; }
.submit-card { margin-top: 1px; }
.field-error { font-size: 11px; color: #ef5350; margin: 0 0 6px; }

.btn-primary {
  width: 100%; padding: 10px;
  background-color: var(--festivall-baby-blue); color: #000;
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  border: none; border-radius: 4px; cursor: pointer;
}
.btn-primary:hover:not(:disabled) { background-color: #fff; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }

.inline-btn {
  display: inline-block; padding: 8px 16px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
  text-decoration: none; border-radius: 4px;
}

@media (max-width: 600px) {
  .moments-grid { grid-template-columns: 1fr; }
  .form-section { flex-direction: column; }
  .form-section label { width: 100%; border-radius: 3px 3px 0 0; min-width: unset; }
  .form-section input { border-left: 1px solid #444; border-top: none; border-radius: 0 0 3px 3px; }
}
</style>
