<template>
  <div class="basic">
    <div class="content">
      <img
        :src="reunion_emblem"
        alt="Reunion Emblem"
        class="header-emblem"
        @click="$router.push('/reunion')"
      />
      <h1 class="highlight">Admin • Volunteer Shifts</h1>

      <div class="toolbar">
        <label>Team</label>
        <select v-model="teamFilter">
          <option value="all">All</option>
          <option v-for="(label, key) in teamLabels" :key="key" :value="key">{{ label }}</option>
        </select>

        <label style="margin-left: 0.5rem">Group by</label>
        <select v-model="groupBy">
          <option value="day">Day</option>
          <option value="team">Team</option>
          <option value="status">Filled Status</option>
          <option value="none">Chronological</option>
        </select>

        <label style="margin-left: 0.5rem">Status</label>
        <select v-model="statusFilter">
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="partial">Partial</option>
          <option value="full">Full</option>
        </select>

        <label class="checkbox">
          <input type="checkbox" v-model="hideInactive" /> Hide inactive
        </label>
        <button class="btn" @click="reload">Reload</button>
      </div>

      <div class="form">
        <h3>Create / Edit Slot</h3>
        <div class="grid">
          <label>Team</label>
          <select v-model="form.team">
            <option disabled value="">-- select team --</option>
            <option v-for="(label, key) in teamLabels" :key="key" :value="key">{{ label }}</option>
          </select>

          <label>Date</label>
          <input type="date" v-model="form.date" />

          <label>Start</label>
          <input type="time" v-model="form.start" />

          <label>End</label>
          <input type="time" v-model="form.end" />

          <label>Capacity</label>
          <input type="number" min="1" v-model.number="form.capacity" />

          <label>Notes</label>
          <input type="text" v-model="form.notes" />
        </div>

        <div class="actions">
          <button class="btn primary" :disabled="!canSave" @click="saveSlot">
            {{ form.id ? 'Update' : 'Create' }} Slot
          </button>
          <button v-if="form.id" class="btn outline" @click="resetForm">Clear</button>
        </div>
      </div>

      <div class="generator">
        <h3 class="gen-title">Generate Default Schedule</h3>
        <p class="gen-desc">
          Create a baseline set of shifts for all teams, based on our standard festival schedule.
          You can edit or disable any slot after generation.
        </p>
        <div class="grid gen">
          <label>Year</label>
          <input type="number" v-model.number="gen.year" min="2024" />

          <label>Setup Crew capacity</label>
          <input type="number" v-model.number="gen.capacity.setup" min="1" />

          <label>Front Gate capacity</label>
          <input type="number" v-model.number="gen.capacity.frontgate" min="1" />

          <label>Food Team capacity</label>
          <input type="number" v-model.number="gen.capacity.food" min="1" />

          <label>Stage Crew capacity</label>
          <input type="number" v-model.number="gen.capacity.stage" min="1" />

          <label>Cleanup Crew capacity</label>
          <input type="number" v-model.number="gen.capacity.cleanup" min="1" />
        </div>
        <div class="actions">
          <button class="btn primary" @click="generateAll" :disabled="generating">
            {{ generating ? 'Generating…' : 'Generate All Slots' }}
          </button>
        </div>
        <small class="hint"
          >Rules: Setup 8h (10–18) Aug 24–Sep 4; Front Gate 2h (10–24) Sep 4–6; Food 4h (11–15,
          17–21) Sep 4–6; Stage 4h blocks 08–24 and 00–04 (next day) Sep 4–6; Cleanup 8h (10–18) Sep
          7.</small
        >
      </div>

      <div class="slots">
        <h3>Slots</h3>
        <div v-for="group in groupedSlots" :key="group.key" class="slot-group">
          <h4 class="group-title">
            {{ group.label }} <small v-if="group.items.length">• {{ group.items.length }}</small>
          </h4>
          <div class="slot-row" v-for="s in group.items" :key="s.id">
            <div class="meta">
              <strong>{{ teamLabels[s.team] || s.team }}</strong>
              <div>{{ s.date }} • {{ s.start }}–{{ s.end }}</div>
              <small v-if="s.notes">{{ s.notes }}</small>
            </div>
            <div class="capacity">
              {{ s.claimed?.length || 0 }} / {{ s.capacity }} filled
              <span class="status-badge" :class="statusOf(s)">{{ statusOf(s) }}</span>
              <span v-if="s.active === false" class="inactive-badge">inactive</span>
            </div>
            <div class="controls">
              <button class="btn outline" @click="editSlot(s)">Edit</button>
              <button class="btn" @click="toggleActive(s)">
                {{ s.active !== false ? 'Disable' : 'Enable' }}
              </button>
              <button class="btn danger" @click="deleteSlot(s)">Delete</button>
            </div>
          </div>
        </div>
        <div v-if="!groupedSlots.length || !groupedSlots.some((g) => g.items.length)" class="empty">
          No slots found.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reunion_db } from '@/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp
} from 'firebase/firestore'
import reunion_emblem from '@/assets/images/reunion_emblem_white.png'

export default {
  name: 'AdminVolunteerSlotsView',
  data() {
    return {
      db: reunion_db,
      reunion_emblem,
      teamLabels: {
        frontgate: 'Front Gate',
        foodteam: 'Food Team',
        setupcrew: 'Setup Crew',
        stagecrew: 'Stage Crew',
        cleanupcrew: 'Cleanup Crew'
      },
      teamFilter: 'all',
      groupBy: 'day',
      statusFilter: 'all', // all | open | partial | full
      hideInactive: true,
      slots: [],
      unsub: null,
      form: {
        id: '',
        team: '',
        date: '',
        start: '',
        end: '',
        capacity: 1,
        notes: ''
      },
      gen: {
        year: 2026,
        capacity: { setup: 3, frontgate: 1, food: 2, stage: 2, cleanup: 3 }
      },
      generating: false
    }
  },
  computed: {
    canSave() {
      return !!(
        this.form.team &&
        this.form.date &&
        this.form.start &&
        this.form.end &&
        this.form.capacity > 0
      )
    },
    filteredSlots() {
      let list = this.slots.slice()
      // clean/normalize
      list = list.map((s) => ({ ...s, claimed: Array.isArray(s.claimed) ? s.claimed : [] }))

      // inactive filter
      if (this.hideInactive) list = list.filter((s) => s.active !== false)

      // team filter
      if (this.teamFilter !== 'all') list = list.filter((s) => s.team === this.teamFilter)

      // status filter
      if (this.statusFilter !== 'all') {
        list = list.filter((s) => this.statusOf(s) === this.statusFilter)
      }

      // sort chronologically
      list.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
      return list
    },
    groupedSlots() {
      const list = this.filteredSlots
      if (this.groupBy === 'none') {
        return [
          {
            key: 'all',
            label: 'All Slots',
            items: list
          }
        ]
      }

      if (this.groupBy === 'team') {
        const byTeam = {}
        for (const s of list) {
          const key = s.team
          if (!byTeam[key]) byTeam[key] = []
          byTeam[key].push(s)
        }
        return Object.keys(byTeam)
          .sort((a, b) => (this.teamLabels[a] || a).localeCompare(this.teamLabels[b] || b))
          .map((key) => ({ key, label: this.teamLabels[key] || key, items: byTeam[key] }))
      }

      if (this.groupBy === 'status') {
        const buckets = { open: [], partial: [], full: [] }
        for (const s of list) buckets[this.statusOf(s)].push(s)
        const order = ['open', 'partial', 'full']
        const labels = { open: 'Open', partial: 'Partial', full: 'Full' }
        return order.map((k) => ({ key: k, label: labels[k], items: buckets[k] }))
      }

      // default: group by day
      const byDay = {}
      for (const s of list) {
        const key = s.date
        if (!byDay[key]) byDay[key] = []
        byDay[key].push(s)
      }
      return Object.keys(byDay)
        .sort()
        .map((key) => ({ key, label: this.prettyDay(key), items: byDay[key] }))
    }
  },
  created() {
    this.reload()
  },
  beforeUnmount() {
    if (this.unsub) this.unsub()
  },
  methods: {
    reload() {
      if (this.unsub) this.unsub()
      const base = collection(this.db, 'volunteer_slots_2026')
      const q = query(base)
      this.unsub = onSnapshot(q, (snap) => {
        this.slots = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      })
    },
    resetForm() {
      this.form = { id: '', team: '', date: '', start: '', end: '', capacity: 1, notes: '' }
    },
    editSlot(s) {
      this.form = {
        id: s.id,
        team: s.team,
        date: s.date,
        start: s.start,
        end: s.end,
        capacity: s.capacity || 1,
        notes: s.notes || ''
      }
    },
    async saveSlot() {
      const payload = {
        team: this.form.team,
        date: this.form.date,
        start: this.form.start,
        end: this.form.end,
        capacity: Number(this.form.capacity) || 1,
        notes: this.form.notes || '',
        active: true,
        updated_at: serverTimestamp()
      }
      if (this.form.id) {
        await updateDoc(doc(this.db, 'volunteer_slots_2026', this.form.id), payload)
      } else {
        await addDoc(collection(this.db, 'volunteer_slots_2026'), {
          ...payload,
          created_at: serverTimestamp(),
          claimed: []
        })
      }
      this.resetForm()
    },
    async toggleActive(s) {
      await updateDoc(doc(this.db, 'volunteer_slots_2026', s.id), {
        active: !(s.active !== false),
        updated_at: serverTimestamp()
      })
    },
    async deleteSlot(s) {
      if (!confirm('Delete this slot? This cannot be undone.')) return
      await deleteDoc(doc(this.db, 'volunteer_slots_2026', s.id))
      if (this.form.id === s.id) this.resetForm()
    },
    // Generator utilities
    pad(n) {
      return n.toString().padStart(2, '0')
    },
    prettyDay(yyyy_mm_dd) {
      // yyyy-mm-dd -> Fri Sep 05, 2025
      try {
        const [Y, M, D] = yyyy_mm_dd.split('-').map(Number)
        const d = new Date(Y, (M || 1) - 1, D || 1)
        return d.toLocaleDateString([], {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        })
      } catch (e) {
        return yyyy_mm_dd
      }
    },
    statusOf(s) {
      const claimed = Array.isArray(s.claimed) ? s.claimed.length : 0
      if (claimed <= 0) return 'open'
      if (claimed < (Number(s.capacity) || 0)) return 'partial'
      return 'full'
    },
    toDateStr(year, month, day) {
      return `${year}-${this.pad(month)}-${this.pad(day)}`
    },
    dateRange(start, end) {
      const out = []
      let d = new Date(start)
      const endD = new Date(end)
      while (d <= endD) {
        out.push(`${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`)
        d.setDate(d.getDate() + 1)
      }
      return out
    },
    timeAdd(hhmm, minutes) {
      const [h, m] = hhmm.split(':').map(Number)
      const total = h * 60 + m + minutes
      const hh = Math.floor((((total % (24 * 60)) + 24 * 60) % (24 * 60)) / 60)
      const mm = ((total % 60) + 60) % 60
      return `${this.pad(hh)}:${this.pad(mm)}`
    },
    // Generators per rules
    async generateAll() {
      this.generating = true
      try {
        const year = this.gen.year
        const add = async (slot) =>
          addDoc(collection(this.db, 'volunteer_slots_2026'), {
            ...slot,
            active: true,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            claimed: []
          })

        // Setup Crew A/B/C mentioned; rule says setupcrew overall 8h 10–18 daily Aug 24–Sep 4
        const setupDates = this.dateRange(new Date(year, 7, 24), new Date(year, 8, 4)) // Aug=7, Sep=8
        for (const date of setupDates) {
          await add({
            team: 'setupcrew',
            date,
            start: '10:00',
            end: '18:00',
            capacity: this.gen.capacity.setup,
            notes: 'Setup (8h)'
          })
        }

        // Front Gate 2h shifts 10:00–24:00 on Sep 4–6
        const fgDates = this.dateRange(new Date(year, 8, 4), new Date(year, 8, 6))
        for (const date of fgDates) {
          let t = '10:00'
          while (t !== '00:00') {
            const end = this.timeAdd(t, 120)
            await add({
              team: 'frontgate',
              date,
              start: t,
              end: end === '00:00' ? '24:00' : end,
              capacity: this.gen.capacity.frontgate,
              notes: 'Front Gate (2h)'
            })
            t = end
            if (t === '00:00') break
            if (t === '24:00') {
              t = '00:00'
            }
          }
        }

        // Food Team: 11–15 and 17–21 on Sep 4–6
        const foodDates = fgDates
        for (const date of foodDates) {
          await add({
            team: 'foodteam',
            date,
            start: '11:00',
            end: '15:00',
            capacity: this.gen.capacity.food,
            notes: 'Food Team (Lunch)'
          })
          await add({
            team: 'foodteam',
            date,
            start: '17:00',
            end: '21:00',
            capacity: this.gen.capacity.food,
            notes: 'Food Team (Supper)'
          })
        }

        // Stage Crew: 4h blocks from 08:00–24:00, plus 00:00–04:00 (next day) on Sep 4–6
        const stageDates = fgDates
        for (const date of stageDates) {
          // 08–24 blocks
          let t = '08:00'
          while (t !== '00:00') {
            const end = this.timeAdd(t, 240)
            if (end === '00:00') break // stop at midnight (will handle post-midnight next)
            await add({
              team: 'stagecrew',
              date,
              start: t,
              end,
              capacity: this.gen.capacity.stage,
              notes: 'Stage Crew (4h)'
            })
            t = end
            if (t === '24:00') {
              t = '00:00'
            }
          }

          // Cleanup Crew: single 8h shift on Sep 7 from 10:00–18:00
          const cleanupDate = this.toDateStr(year, 9, 7) // Sep = 9
          await add({
            team: 'cleanupcrew',
            date: cleanupDate,
            start: '10:00',
            end: '18:00',
            capacity: this.gen.capacity.cleanup,
            notes: 'Cleanup (8h)'
          })
          // 00–04 next-day block
          const [Y, M, D] = date.split('-').map(Number)
          const nextDate = this.dateRange(new Date(Y, M - 1, D + 1), new Date(Y, M - 1, D + 1))[0]
          await add({
            team: 'stagecrew',
            date: nextDate,
            start: '00:00',
            end: '04:00',
            capacity: this.gen.capacity.stage,
            notes: 'Stage Crew (overnight 4h)'
          })
        }

        alert('Default schedule generated.')
      } catch (e) {
        console.error('Generation failed', e)
        alert('Failed to generate. See console for details.')
      } finally {
        this.generating = false
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
  margin: 0 0 0.75rem;
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0.5rem 0 1rem;
}
.form {
  border: 1px solid #444;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}
.form .grid {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 0.5rem 1rem;
  align-items: center;
}
.form input,
.form select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #444;
  background: #1e1e1e;
  color: #fff;
}
.actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}
.generator {
  border: 1px solid #444;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #1a1a1a;
}
.gen-title {
  margin: 0 0 0.25rem;
}
.gen-desc {
  margin: 0 0 0.75rem;
  color: #ccc;
}
.gen {
  grid-template-columns: 180px 1fr !important;
}
.hint {
  display: block;
  margin-top: 0.5rem;
  opacity: 0.8;
}
.slots {
  border: 1px solid #444;
  border-radius: 10px;
  padding: 1rem;
}
.slot-group {
  margin-bottom: 0.75rem;
}
.group-title {
  margin: 0.25rem 0 0.5rem;
  color: #ddd;
}
.slot-row {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #333;
}
.slot-row:last-child {
  border-bottom: none;
}
.status-badge {
  margin-left: 0.5rem;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 12px;
  text-transform: uppercase;
  background: #2a2a2a;
  border: 1px solid #555;
}
.status-badge.open {
  border-color: #4caf50;
  color: #4caf50;
}
.status-badge.partial {
  border-color: #ffc107;
  color: #ffc107;
}
.status-badge.full {
  border-color: #f44336;
  color: #f44336;
}
.inactive-badge {
  margin-left: 0.5rem;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 12px;
  text-transform: uppercase;
  background: #3a3a3a;
  border: 1px solid #666;
  color: #aaa;
}
.controls button {
  margin-left: 0.25rem;
}

/* Buttons */
.btn {
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #666;
  background: #2a2a2a;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn:hover {
  filter: brightness(1.1);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn.primary {
  border-color: var(--reunion-frog-green, #4caf50);
  background: rgba(76, 175, 80, 0.12);
}
.btn.outline {
  background: transparent;
  border-color: #888;
}
.btn.danger {
  background: #8b0000;
  border-color: #c00;
}
</style>
