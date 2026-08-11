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

      <!-- User's Claimed Shifts Summary -->
      <div v-if="participant && myClaimedShifts.length > 0" class="my-shifts-summary">
        <h3>✅ Your Claimed Shifts ({{ myClaimedShifts.length }})</h3>
        <div class="mini-shifts">
          <div v-for="shift in myClaimedShifts" :key="shift.id" class="mini-shift">
            <img v-if="teamIcons[shift.team]" :src="teamIcons[shift.team]" class="mini-icon" :alt="shift.team" />
            <span>{{ teamLabels[shift.team] || shift.team }} • {{ shift.date }} {{ shift.start }}–{{ shift.end }}</span>
          </div>
        </div>
      </div>

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
              <option value="arcadeattendant">Arcade Attendant</option>
              <option value="artisttransportation">Artist Transportation</option>
            </select>
            <button class="refresh" @click="refreshSlots" :disabled="loadingSlots">
              {{ loadingSlots ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
        </div>

        <div class="filters-section">
          <div class="filter-group">
            <label for="dayFilter">Day</label>
            <select id="dayFilter" v-model="selectedDay">
              <option value="all">All Days</option>
              <option v-for="day in availableDays" :key="day" :value="day">{{ formatDate(day) }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="availabilityFilter">Show</label>
            <select id="availabilityFilter" v-model="availabilityFilter">
              <option value="all">All Shifts</option>
              <option value="open">Open Slots Only</option>
              <option value="full">Full Slots Only</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="sortBy">Sort By</label>
            <select id="sortBy" v-model="sortBy">
              <option value="date">Date & Time</option>
              <option value="availability">Availability</option>
              <option value="team">Team Name</option>
            </select>
          </div>

          <div v-if="hasActiveFilters" class="filter-group clear-filters">
            <label>&nbsp;</label>
            <button @click="clearFilters" class="clear-btn">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredSlots.length > 0 && slots.length > 0" class="results-count">
        Showing {{ filteredSlots.length }} shift{{ filteredSlots.length !== 1 ? 's' : '' }}
        <span v-if="filteredSlots.length !== slots.length"> of {{ slots.length }} total</span>
      </div>

      <div class="slot-grid">
        <div class="slot-card" v-for="slot in filteredSlots" :key="slot.id" :class="{ 'claimed-by-me': isClaimedByMe(slot) }">
          <div class="slot-left">
            <div class="slot-header">
              <img v-if="teamIcons[slot.team]" :src="teamIcons[slot.team]" class="team-icon" :alt="slot.team" />
              <div class="slot-team">{{ teamLabels[slot.team] || slot.team }}</div>
            </div>
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
            <div v-if="slot.claimed?.length" class="claimed-names">
              <div v-if="slot.claimed.length === 1" class="name-badge">
                👤 {{ slot.claimed[0].fullname }}
              </div>
              <div v-else-if="slot.claimed.length <= 3">
                <div v-for="(claim, idx) in slot.claimed" :key="idx" class="name-badge">
                  👤 {{ claim.fullname }}
                </div>
              </div>
              <div v-else class="expandable-names">
                <div v-for="(claim, idx) in slot.claimed.slice(0, 2)" :key="idx" class="name-badge">
                  👤 {{ claim.fullname }}
                </div>
                <details class="more-names">
                  <summary>+{{ slot.claimed.length - 2 }} more</summary>
                  <div v-for="(claim, idx) in slot.claimed.slice(2)" :key="idx" class="name-badge">
                    👤 {{ claim.fullname }}
                  </div>
                </details>
              </div>
            </div>
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
  setDoc,
  updateDoc,
  arrayUnion,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  runTransaction
} from 'firebase/firestore'
import reunion_emblem from '@/assets/images/reunion_emblem_white.png'
import frontgate_icon from '@/assets/images/icons/front_gate.png'
import foodteam_icon from '@/assets/images/icons/food.png'
import setupcrew_icon from '@/assets/images/icons/setup_crew.png'
import stagecrew_icon from '@/assets/images/icons/stage_crew.png'
import cleanupcrew_icon from '@/assets/images/icons/cleanup_crew.png'
import arcadeattendant_icon from '@/assets/images/icons/arcade.png'
import location_icon from '@/assets/images/icons/location.png'

export default {
  name: 'ReunionVolunteerSignupView',
  props: {
    teamKey: { type: String, default: '' }
  },
  data() {
    return {
      reunion_emblem,
      db: reunion_db,
      teamIcons: {
        frontgate: frontgate_icon,
        foodteam: foodteam_icon,
        setupcrew: setupcrew_icon,
        stagecrew: stagecrew_icon,
        cleanupcrew: cleanupcrew_icon,
        arcadeattendant: arcadeattendant_icon,
        artisttransportation: location_icon
      },
      idCode: localStorage.getItem('volunteer_id_code') || '',
      participant: null,
      teamKeyLocal: '',
      slots: [],
      loadingSlots: false,
      claimingId: '',
      resultMessage: '',
      selectedDay: 'all',
      availabilityFilter: 'all',
      sortBy: 'date',
      teamLabels: {
        frontgate: 'Front Gate',
        foodteam: 'Food Team',
        setupcrew: 'Setup Crew',
        stagecrew: 'Stage Crew',
        cleanupcrew: 'Cleanup Crew',
        arcadeattendant: 'Arcade Attendant',
        artisttransportation: 'Artist Transportation'
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
    myClaimedShifts() {
      if (!this.participant) return []
      return this.slots.filter(slot => this.isClaimedByMe(slot))
    },
    availableDays() {
      const days = [...new Set(this.slots.map(s => s.date))]
      return days.sort()
    },
    hasActiveFilters() {
      return this.selectedDay !== 'all' || 
             this.availabilityFilter !== 'all' || 
             (this.effectiveTeamKey !== 'multi' && this.effectiveTeamKey !== '')
    },
    filteredSlots() {
      console.log('Filtering slots. effectiveTeamKey:', this.effectiveTeamKey)
      console.log('Total slots:', this.slots.length)
      console.log('Available teams in slots:', [...new Set(this.slots.map((s) => s.team))])

      let filtered = this.slots

      // Filter by team
      if (this.effectiveTeamKey && this.effectiveTeamKey !== 'multi') {
        const key = this.effectiveTeamKey
        filtered = filtered.filter((s) => {
          if (key === 'stagecrew') return s.team === 'stagecrew' || s.team?.startsWith('stagecrew_')
          if (key === 'setupcrew') return s.team === 'setupcrew' || s.team?.startsWith('setupcrew_')
          return s.team === key
        })
      }

      // Filter by day
      if (this.selectedDay !== 'all') {
        filtered = filtered.filter(s => s.date === this.selectedDay)
      }

      // Filter by availability
      if (this.availabilityFilter === 'open') {
        filtered = filtered.filter(s => s.remaining > 0)
      } else if (this.availabilityFilter === 'full') {
        filtered = filtered.filter(s => s.remaining <= 0)
      }

      // Sort
      if (this.sortBy === 'date') {
        filtered = filtered.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
      } else if (this.sortBy === 'availability') {
        filtered = filtered.sort((a, b) => b.remaining - a.remaining)
      } else if (this.sortBy === 'team') {
        filtered = filtered.sort((a, b) => a.team.localeCompare(b.team))
      }

      console.log(`Filtered to ${filtered.length} slots`)
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
      try {
        // Use query to find participant by id_code field (like other views do)
        const q = query(
          collection(this.db, 'participants_2026'),
          where('id_code', '==', this.idCode.toLowerCase().trim())
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const p = querySnapshot.docs[0].data()
          this.participant = {
            id_code: p.id_code,
            fullname: p.contact?.fullname || p.fullname || '(no name)'
          }
          localStorage.setItem('volunteer_id_code', this.idCode)
        } else {
          this.participant = null
        }
      } catch (error) {
        console.error('Error looking up participant:', error)
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
        
        // Build filter description
        const filters = []
        if (this.effectiveTeamKey !== 'multi') {
          filters.push(this.teamLabels[this.effectiveTeamKey] || this.effectiveTeamKey)
        }
        if (this.selectedDay !== 'all') {
          filters.push(this.formatDate(this.selectedDay))
        }
        if (this.availabilityFilter === 'open') {
          filters.push('open slots')
        } else if (this.availabilityFilter === 'full') {
          filters.push('full slots')
        }
        
        const filterDesc = filters.length > 0 ? filters.join(', ') : 'all filters'
        this.resultMessage = `Refreshed! Showing ${filteredCount} of ${totalCount} slots (${filterDesc})`
        setTimeout(() => {
          this.resultMessage = ''
        }, 3000)
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr + 'T00:00:00')
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    },
    clearFilters() {
      this.selectedDay = 'all'
      this.availabilityFilter = 'all'
      this.teamKeyLocal = 'multi'
      this.sortBy = 'date'
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
            claimed_at: new Date()
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
          created_at: new Date()
        }

        await updateDoc(
          doc(this.db, 'participants_2026', this.participant.id_code),
          { 'volunteer.claimed_slots': arrayUnion(claimSummary) }
        )

        // Also record in central collection (optional audit trail)
        await addDoc(collection(this.db, 'volunteer_signups_2026'), {
          id_code: this.participant.id_code,
          fullname: this.participant.fullname,
          team: slot.team,
          slot_id: slot.id,
          date: slot.date,
          start: slot.start,
          end: slot.end,
          created_at: new Date()
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
@media (max-width: 600px) {
  .content {
    padding: 0.5rem;
  }
  .header-emblem {
    width: 80px;
    margin: 0.25rem auto 0.5rem;
  }
  .highlight {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  .subtitle {
    font-size: 0.9rem;
    margin: 0.25rem 0 0.75rem;
  }
  .form-wrap {
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .form-section {
    padding: 0.5rem;
  }
  .filters-section {
    padding: 0.5rem;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .my-shifts-summary {
    padding: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .my-shifts-summary h3 {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }
  .mini-shift {
    font-size: 0.85rem;
  }
  .results-count {
    padding: 0.25rem;
    margin: 0.5rem 0 0.25rem;
    font-size: 0.85rem;
  }
  .slot-grid {
    gap: 0.5rem;
  }
  .slot-card {
    padding: 0.5rem;
    gap: 0.5rem;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  .slot-right {
    justify-self: stretch;
  }
  .claim-btn {
    width: 100%;
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  .slot-time,
  .slot-notes {
    margin-left: 38px;
  }
  .team-icon {
    width: 28px;
    height: 28px;
  }
  .name-badge {
    font-size: 0.8rem;
    padding: 0.15rem 0.4rem;
  }
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

.filters-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  background: #1e1e1e;
  border: 1px solid #444;
  border-radius: 10px;
  padding: 0.75rem;
  margin-top: 0.75rem;
}
@media (max-width: 600px) {
  .filters-section {
    grid-template-columns: 1fr;
  }
}
.filter-group {
  display: flex;
  flex-direction: column;
}
.filter-group label {
  font-size: 0.85rem;
  margin-bottom: 0.35rem;
  font-weight: 600;
  opacity: 0.9;
}
.filter-group select {
  padding: 0.5rem 0.6rem;
  font-size: 0.9rem;
}
.clear-filters {
  display: flex;
  align-items: flex-end;
}
.clear-btn {
  width: 100%;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #ff6666;
  background: transparent;
  color: #ff6666;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}
.clear-btn:hover {
  background: rgba(255, 102, 102, 0.1);
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

.results-count {
  text-align: center;
  padding: 0.5rem;
  margin: 0.75rem 0 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
  color: var(--reunion-frog-green, #4caf50);
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
  transition: all 0.2s ease;
}
.slot-card.claimed-by-me {
  border-color: var(--reunion-frog-green, #4caf50);
  background: rgba(76, 175, 80, 0.05);
}
.slot-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.team-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.slot-team {
  font-weight: 700;
}
.slot-time {
  opacity: 0.9;
  margin-left: 42px;
}
.slot-notes {
  color: #ccc;
  font-size: 0.9rem;
  margin-top: 0.2rem;
  margin-left: 42px;
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

.my-shifts-summary {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid var(--reunion-frog-green, #4caf50);
  border-radius: 10px;
  padding: 0.75rem;
  margin-bottom: 1rem;
}
.my-shifts-summary h3 {
  margin: 0 0 0.5rem 0;
  color: var(--reunion-frog-green, #4caf50);
  font-size: 1rem;
}
.mini-shifts {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.mini-shift {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  opacity: 0.95;
}
.mini-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.claimed-names {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.35rem;
}
.name-badge {
  font-size: 0.85rem;
  color: #aaa;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  display: inline-block;
}
.expandable-names {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.more-names {
  margin-top: 0.25rem;
}
.more-names summary {
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--reunion-frog-green, #4caf50);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  background: rgba(76, 175, 80, 0.1);
  display: inline-block;
  user-select: none;
}
.more-names summary:hover {
  background: rgba(76, 175, 80, 0.2);
}
.more-names[open] summary {
  margin-bottom: 0.25rem;
}
</style>
