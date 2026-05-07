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
        <div class="gen-form">
          <div class="gen-row">
            <label>Year</label>
            <input type="number" v-model.number="gen.year" min="2024" />
          </div>

          <div class="gen-section">
            <h4 class="gen-section-title">Select Shift Concurrency</h4>
            <div class="capacity-grid">
              <div class="capacity-item">
                <label>Setup Crew</label>
                <input type="number" v-model.number="gen.capacity.setup" min="1" />
              </div>

              <div class="capacity-item">
                <label>Front Gate</label>
                <input type="number" v-model.number="gen.capacity.frontgate" min="1" />
              </div>

              <div class="capacity-item">
                <label>Food Team</label>
                <input type="number" v-model.number="gen.capacity.food" min="1" />
              </div>

              <div class="capacity-item">
                <label>Stage Crew</label>
                <input type="number" v-model.number="gen.capacity.stage" min="1" />
              </div>

              <div class="capacity-item">
                <label>Cleanup Crew</label>
                <input type="number" v-model.number="gen.capacity.cleanup" min="1" />
              </div>

              <div class="capacity-item">
                <label>Arcade Attendant</label>
                <input type="number" v-model.number="gen.capacity.arcade" min="1" />
              </div>
            </div>
          </div>
        </div>
        <div class="actions">
          <button class="btn primary" @click="generateAll" :disabled="generating">
            {{ generating ? 'Generating…' : 'Generate All Slots' }}
          </button>
        </div>
        <small class="hint">
          <strong>Current Parameters:</strong><br />
          <ul>
            <li v-for="(params, key) in REUNION_FESTIVAL.volunteerShiftParams" :key="key">
              <strong>{{ params.label }}:</strong>
              <span v-if="params.shift">{{ params.shift[0] }}–{{ params.shift[1] }}</span>
              <span v-if="params.shifts">{{ params.shifts.map(s => s[0] + '–' + s[1]).join(', ') }}</span>
              <span v-if="params.overnight">, overnight {{ params.overnight[0] }}–{{ params.overnight[1] }}</span>
              <span v-if="params.duration">, {{ params.duration }}h</span>
              <span v-if="params.days">, {{ params.days.map(d => `(${d[0]}/${d[1]}–${d[2]}/${d[3]})`).join(', ') }}</span>
              <span v-if="params.day">, ({{ params.day[0] }}/{{ params.day[1] }})</span>
              <span v-if="params.repeat">, repeat</span>
            </li>
          </ul>
        </small>
      </div>

      <div class="toolbar">
        <label>Filter:</label>
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

      <div class="slots">
        <h3>Slots</h3>
        <div v-for="group in groupedSlots" :key="group.key" class="slot-group">
          <h4 class="group-title">
            {{ group.label }} <small v-if="group.items.length">• {{ group.items.length }}</small>
          </h4>
          <div class="slot-row" v-for="s in group.items" :key="s.id">
            <div class="meta">
              <strong>{{ teamLabels[s.team] || s.team }}</strong>
              <div>{{ s.date }} • {{ s.start }}-{{ s.end }}</div>
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
import { REUNION_FESTIVAL } from '@/config/festivalConfig'

export default {
  name: 'AdminVolunteerSlotsView',
  data() {
    return {
      db: reunion_db,
      reunion_emblem,
      REUNION_FESTIVAL,
      teamLabels: {
        frontgate: 'Front Gate',
        foodteam: 'Food Team',
        setupcrew: 'Setup Crew',
        stagecrew: 'Stage Crew',
        cleanupcrew: 'Cleanup Crew',
        arcadeattendant: 'Arcade Attendant'
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
        year: REUNION_FESTIVAL.year,
        capacity: { setup: 3, frontgate: 1, food: 2, stage: 2, cleanup: 3, arcade: 1 }
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

        // Iterate over all teams in config
        for (const [team, params] of Object.entries(this.REUNION_FESTIVAL.volunteerShiftParams)) {
          // Determine capacity field (camelCase to match gen)
          const capKey = Object.keys(this.gen.capacity).find(k => team.includes(k)) || team
          const capacity = this.gen.capacity[capKey] || 1

          // Handle multi-day ranges
          let daysArr = []
          if (params.days) {
            for (const d of params.days) {
              // d: [startMonth, startDay, endMonth, endDay]
              const start = new Date(year, d[0] - 1, d[1])
              const end = new Date(year, d[2] - 1, d[3])
              daysArr.push(...this.dateRange(start, end))
            }
          } else if (params.day) {
            // Single day: [month, day]
            daysArr.push(this.toDateStr(year, params.day[0], params.day[1]))
          }

          // Handle shifts
          if (params.shifts) {
            // Multiple shifts per day
            for (const date of daysArr) {
              for (const s of params.shifts) {
                await add({
                  team,
                  date,
                  start: s[0],
                  end: s[1],
                  capacity,
                  notes: `${params.label} (${params.duration}h)`
                })
              }
            }
          } else if (params.shift && params.repeat) {
            // Repeating shift blocks (e.g., 2h, 4h, etc.)
            for (const date of daysArr) {
              let t = params.shift[0]
              const endTime = params.shift[1]
              const durationMin = (params.duration || 2) * 60
              while (t !== '00:00') {
                let end = this.timeAdd(t, durationMin)
                if (end === '00:00' || end === endTime) end = endTime
                await add({
                  team,
                  date,
                  start: t,
                  end,
                  capacity,
                  notes: `${params.label} (${params.duration}h)`
                })
                if (end === endTime) break
                t = end
                if (t === '24:00') t = '00:00'
              }
            }
          } else if (params.shift) {
            // Single shift per day
            for (const date of daysArr) {
              await add({
                team,
                date,
                start: params.shift[0],
                end: params.shift[1],
                capacity,
                notes: `${params.label} (${params.duration}h)`
              })
            }
          }
          // Handle overnight (e.g., stagecrew)
          if (params.overnight && params.days) {
            for (const d of params.days) {
              const start = new Date(year, d[0] - 1, d[1])
              const end = new Date(year, d[2] - 1, d[3])
              const days = this.dateRange(start, end)
              for (const date of days) {
                // overnight goes to next day
                const [Y, M, D] = date.split('-').map(Number)
                const nextDate = this.toDateStr(Y, M, D + 1)
                await add({
                  team,
                  date: nextDate,
                  start: params.overnight[0],
                  end: params.overnight[1],
                  capacity,
                  notes: `${params.label} (overnight ${params.duration}h)`
                })
              }
            }
          }
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
.gen-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.gen-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 1rem;
  align-items: center;
}
.gen-section {
  margin-top: 0.5rem;
}
.gen-section-title {
  margin: 0 0 0.75rem;
  color: var(--reunion-frog-green, #4caf50);
  font-size: 1rem;
  font-weight: 600;
}
.capacity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
}
.capacity-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.capacity-item label {
  font-size: 0.9rem;
  color: #ddd;
  font-weight: 500;
}
.capacity-item input {
  width: 80px;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #444;
  background: #1e1e1e;
  color: #fff;
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
