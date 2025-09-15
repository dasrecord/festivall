<template>
  <div class="basic">
    <div class="content">
      <img
        :src="reunion_emblem"
        alt="Reunion Emblem"
        class="header-emblem"
        @click="$router.push('/reunion')"
      />
      <h1 class="highlight">Volunteer Signup</h1>
      <h2 class="subtitle">Pick a shift</h2>

      <div class="form-wrap">
        <div class="form-section">
          <label for="idCode">Your ID Code</label>
          <input
            id="idCode"
            v-model.trim="idCode"
            placeholder="Enter your ID Code"
            @blur="lookupParticipant"
          />
          <p class="id-status" :class="{ ok: participant, bad: idCode && !participant }">
            <span v-if="participant">✓ {{ participant.fullname }} ({{ idCode }})</span>
            <span v-else-if="idCode">ID not found. Double-check your code.</span>
          </p>
        </div>

        <div class="form-section">
          <label for="team">Choose Team</label>
          <div class="team-row">
            <select id="team" v-model="teamKeyLocal" @change="onTeamChange">
              <option value="multi">All Teams</option>
              <option value="frontgate">Front Gate</option>
              <option value="foodteam">Food Team</option>
              <option value="setupcrew">Setup Crew</option>
              <option value="stagecrew">Stage Crew</option>
              <option value="cleanupcrew">Cleanup Crew</option>
            </select>
            <button class="refresh" @click="refreshSlots" :disabled="loadingSlots">
              {{ loadingSlots ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
        </div>
      </div>

      <div class="slot-grid">
        <div class="slot-card" v-for="slot in filteredSlots" :key="slot.id">
          <div class="slot-left">
            <div class="slot-team">{{ teamLabels[slot.team] || slot.team }}</div>
            <div class="slot-time">{{ slot.date }} • {{ slot.start }}–{{ slot.end }}</div>
            <div class="slot-notes" v-if="slot.notes">{{ slot.notes }}</div>
          </div>
          <div class="slot-mid">
            <span
              class="remaining"
              :class="{ full: slot.remaining <= 0, open: slot.remaining > 0 }"
            >
              {{ Math.max(slot.remaining, 0) }} of {{ slot.capacity || 1 }} left
            </span>
            <small v-if="slot.claimed?.length" class="claimed"
              >Claimed by {{ slot.claimed.length }}</small
            >
          </div>
          <div class="slot-right">
            <button
              class="claim-btn"
              :disabled="
                !participant || slot.remaining <= 0 || isClaimedByMe(slot) || claimingId === slot.id
              "
              @click="claimSlot(slot)"
            >
              {{
                isClaimedByMe(slot)
                  ? 'Already Claimed'
                  : slot.remaining <= 0
                    ? 'Full'
                    : claimingId === slot.id
                      ? 'Claiming...'
                      : 'Claim Slot'
              }}
            </button>
          </div>
        </div>
        <div v-if="!loadingSlots && !filteredSlots.length" class="empty">
          No slots available for the selected team.
        </div>
        <div v-if="loadingSlots" class="loading">Loading slots…</div>
      </div>

      <div class="result" v-if="resultMessage">{{ resultMessage }}</div>
    </div>
  </div>
</template>

<script>
import { reunion_db } from '@/firebase'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  runTransaction
} from 'firebase/firestore'
import reunion_emblem from '@/assets/images/reunion_emblem_white.png'

export default {
  name: 'ReunionVolunteerSignupView',
  props: {
    teamKey: { type: String, default: '' }
  },
  data() {
    return {
      reunion_emblem,
      db: reunion_db,
      idCode: localStorage.getItem('volunteer_id_code') || '',
      participant: null,
      teamKeyLocal: '',
      slots: [],
      loadingSlots: false,
      claimingId: '',
      resultMessage: '',
      teamLabels: {
        frontgate: 'Front Gate',
        foodteam: 'Food Team',
        setupcrew: 'Setup Crew',
        stagecrew: 'Stage Crew',
        cleanupcrew: 'Cleanup Crew'
      }
    }
  },
  computed: {
    effectiveTeamKey() {
      // If teamKey prop is 'multi', use the local selection instead
      const result =
        this.teamKey === 'multi' ? this.teamKeyLocal : this.teamKey || this.teamKeyLocal
      console.log('effectiveTeamKey computed:', {
        teamKey: this.teamKey,
        teamKeyLocal: this.teamKeyLocal,
        result: result
      })
      return result
    },
    filteredSlots() {
      console.log('Filtering slots. effectiveTeamKey:', this.effectiveTeamKey)
      console.log('Total slots:', this.slots.length)
      console.log('Available teams in slots:', [...new Set(this.slots.map((s) => s.team))])

      if (!this.effectiveTeamKey || this.effectiveTeamKey === 'multi') return this.slots
      const key = this.effectiveTeamKey
      const filtered = this.slots.filter((s) => {
        if (key === 'stagecrew') return s.team === 'stagecrew' || s.team?.startsWith('stagecrew_')
        if (key === 'setupcrew') return s.team === 'setupcrew' || s.team?.startsWith('setupcrew_')
        return s.team === key
      })

      console.log(`Filtered to ${filtered.length} slots for team "${key}"`)
      return filtered
    }
  },
  watch: {
    teamKey: {
      immediate: true,
      handler(v) {
        if (v) {
          this.teamKeyLocal = v
        } else if (!this.teamKeyLocal) {
          this.teamKeyLocal = 'multi'
        }
        this.loadSlots()
      }
    }
  },
  created() {
    if (this.idCode) {
      this.lookupParticipant()
    }
    if (!this.teamKeyLocal) this.teamKeyLocal = this.teamKey || 'multi'
    this.loadSlots()
  },
  methods: {
    async lookupParticipant() {
      if (!this.idCode) return
      const ref = doc(this.db, 'participants_2026', this.idCode)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const p = snap.data()
        this.participant = {
          id_code: p.id_code,
          fullname: p.contact?.fullname || p.fullname || '(no name)'
        }
        localStorage.setItem('volunteer_id_code', this.idCode)
      } else {
        this.participant = null
      }
    },
    async loadSlots() {
      try {
        this.loadingSlots = true
        const base = collection(this.db, 'volunteer_slots_2026')
        const qy = query(base, where('active', '==', true))
        const snap = await getDocs(qy)
        this.slots = snap.docs
          .map((d) => {
            const s = d.data()
            const claimed = s.claimed || []
            return {
              id: d.id,
              team: s.team,
              title: s.title || '',
              date: s.date,
              start: s.start,
              end: s.end,
              capacity: s.capacity || 1,
              claimed,
              remaining: (s.capacity || 1) - claimed.length,
              notes: s.notes || '',
              active: s.active !== false
            }
          })
          .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
      } catch (e) {
        console.error('Failed to load slots', e)
      } finally {
        this.loadingSlots = false
      }
    },
    onTeamChange() {
      console.log('Team changed to:', this.teamKeyLocal)
      this.loadSlots()
    },
    async refreshSlots() {
      this.resultMessage = '' // Clear any previous messages
      console.log('Refreshing slots...')
      await this.loadSlots()
      if (!this.loadingSlots) {
        const filteredCount = this.filteredSlots.length
        const totalCount = this.slots.length
        const teamName =
          this.effectiveTeamKey === 'multi'
            ? 'All Teams'
            : this.teamLabels[this.effectiveTeamKey] || this.effectiveTeamKey
        this.resultMessage = `Refreshed! Showing ${filteredCount} of ${totalCount} slots for ${teamName}.`
        setTimeout(() => {
          this.resultMessage = ''
        }, 3000)
      }
    },
    isClaimedByMe(slot) {
      if (!this.participant) return false
      return (slot.claimed || []).some((c) => c.id_code === this.participant.id_code)
    },
    async claimSlot(slot) {
      if (!this.participant) {
        this.resultMessage = 'Please enter your ID Code first.'
        return
      }
      this.claimingId = slot.id
      try {
        const slotRef = doc(this.db, 'volunteer_slots_2026', slot.id)
        await runTransaction(this.db, async (tx) => {
          const snap = await tx.get(slotRef)
          if (!snap.exists()) throw new Error('Slot no longer exists.')
          const s = snap.data()
          const capacity = s.capacity || 1
          const claimed = s.claimed || []
          if ((claimed || []).some((c) => c.id_code === this.participant.id_code)) {
            throw new Error('You already claimed this slot.')
          }
          if (claimed.length >= capacity) {
            throw new Error('This slot is full.')
          }
          const newClaim = {
            id_code: this.participant.id_code,
            fullname: this.participant.fullname,
            claimed_at: serverTimestamp()
          }
          tx.update(slotRef, { claimed: [...claimed, newClaim] })
        })

        // Mirror on participant document
        const claimSummary = {
          slot_id: slot.id,
          team: slot.team,
          date: slot.date,
          start: slot.start,
          end: slot.end,
          title: slot.title || '',
          created_at: serverTimestamp()
        }
        await updateDoc(doc(this.db, 'participants_2026', this.participant.id_code), {
          'volunteer.claimed_slots': arrayUnion(claimSummary)
        }).catch(async () => {
          await setDoc(
            doc(this.db, 'participants_2026', this.participant.id_code),
            {
              volunteer: { claimed_slots: [claimSummary] }
            },
            { merge: true }
          )
        })

        // Also record in central collection (optional audit trail)
        await addDoc(collection(this.db, 'volunteer_signups_2026'), {
          id_code: this.participant.id_code,
          fullname: this.participant.fullname,
          team: slot.team,
          slot_id: slot.id,
          date: slot.date,
          start: slot.start,
          end: slot.end,
          created_at: serverTimestamp()
        })

        this.resultMessage = 'Slot claimed! Thank you.'
        await this.loadSlots()
      } catch (e) {
        console.error('Claim failed', e)
        this.resultMessage = e?.message || 'Sorry, claim failed. Please try again.'
      } finally {
        this.claimingId = ''
      }
    }
  }
}
</script>

<style scoped>
.basic {
  background: #121212;
  color: #fff;
  min-height: 100vh;
}
.content {
  width: 92vw;
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}
.header-emblem {
  width: 120px;
  display: block;
  margin: 0.5rem auto 0.75rem;
  cursor: pointer;
}
.highlight {
  text-align: center;
  color: var(--reunion-frog-green, #4caf50);
  margin: 0;
}
.subtitle {
  text-align: center;
  margin: 0.25rem 0 1rem;
  font-weight: 500;
  opacity: 0.9;
}

.form-wrap {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.form-section {
  background: #1e1e1e;
  border: 1px solid #444;
  border-radius: 10px;
  padding: 0.75rem;
}
.form-section label {
  display: block;
  margin-bottom: 0.35rem;
  font-weight: 600;
}
input,
select {
  width: 100%;
  padding: 0.6rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #444;
  background: #161616;
  color: #fff;
}
.team-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  align-items: center;
}
.refresh {
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #666;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.refresh:hover:not(:disabled) {
  border-color: var(--reunion-frog-green, #4caf50);
  background: rgba(76, 175, 80, 0.1);
}
.refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.id-status {
  margin-top: 0.35rem;
  font-size: 0.95rem;
}
.id-status.ok {
  color: #4caf50;
}
.id-status.bad {
  color: #ff6666;
}

.slot-grid {
  display: grid;
  gap: 0.6rem;
}
.slot-card {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 0.75rem;
  align-items: center;
  background: #1e1e1e;
  border: 1px solid #444;
  border-radius: 10px;
  padding: 0.75rem;
}
.slot-team {
  font-weight: 700;
}
.slot-time {
  opacity: 0.9;
}
.slot-notes {
  color: #ccc;
  font-size: 0.9rem;
  margin-top: 0.2rem;
}
.remaining.full {
  color: #ff6666;
}
.remaining.open {
  color: #4caf50;
}
.claim-btn {
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #4caf50;
  background: rgba(76, 175, 80, 0.1);
  color: #fff;
  cursor: pointer;
}
.claim-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.loading {
  opacity: 0.7;
}
.empty {
  opacity: 0.8;
  text-align: center;
  padding: 0.5rem 0;
}
.result {
  margin-top: 1rem;
  color: var(--reunion-frog-green, #4caf50);
  text-align: center;
}
</style>
