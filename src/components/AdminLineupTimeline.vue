<template>
  <div class="alt-wrapper">
    <div class="alt-header">
      <span class="alt-day-label">{{ day }}</span>
      <div class="alt-actions">
        <!-- Selection mode -->
        <template v-if="selectedIds.size > 0">
          <button class="alt-delete-sel-btn" @click="deleteSelected">
            Delete {{ selectedIds.size === 1 ? '1 set' : selectedIds.size + ' sets' }}
          </button>
          <button class="alt-cancel-sel-btn" @click="selectedIds.clear()">Cancel</button>
        </template>
        <!-- Edit mode -->
        <template v-else>
          <span v-if="unsavedCount > 0" class="unsaved-badge">{{ unsavedCount }} unsaved</span>
          <button v-if="unsavedCount > 0" class="alt-discard-btn" @click="resetChanges">Discard</button>
          <button
            class="alt-save-btn"
            :disabled="saving || unsavedCount === 0"
            @click="handleSave"
          >
            <span v-if="saving">Saving…</span>
            <span v-else>Save Changes</span>
          </button>
          <span v-if="saveError" class="save-error">{{ saveError }}</span>
        </template>
      </div>
    </div>

    <!-- ── Act chips ── -->
    <div class="alt-chips">
      <div class="alt-chips-wrap">
        <div
          v-for="act in chipActs"
          :key="act.id"
          class="alt-chip"
          :class="{ 'chip-pending': pendingChipId === act.id }"
          draggable="true"
          @dragstart="onChipDragStart($event, act.id)"
          @click="onChipTap(act.id)"
        >
          {{ act.act_name }}
          <span v-if="act.daySetCount > 0" class="alt-chip-badge">×{{ act.daySetCount }}</span>
        </div>
      </div>
      <span v-if="pendingChipId" class="chip-pending-hint">↓ tap timeline to place</span>
      <p class="alt-instructions">Tap or drag a chip onto the timeline to add a set</p>
    </div>

    <div class="alt-scroll" ref="scrollRef">
      <div class="alt-timeline" :style="{ height: timelineHeight + 'px' }">
        <div class="alt-time-labels">
          <div
            v-for="label in timeLabels"
            :key="label.label"
            class="alt-time-label"
            :style="{ top: label.top + 'px' }"
          >
            {{ label.label }}
          </div>
        </div>

        <!-- Dropzone wraps both grid and acts -->
        <div
          class="alt-acts-wrapper"
          ref="actsAreaRef"
          @dragover.prevent="onChipDragOver"
          @dragleave="onChipDragLeave"
          @drop="onChipDrop"
          @click="onTimelineClick"
        >
          <div class="alt-grid">
            <div
              v-for="line in majorGridLines"
              :key="'maj-' + line.top"
              class="alt-grid-line alt-grid-major"
              :style="{ top: line.top + 'px' }"
            />
            <div
              v-for="line in minorGridLines"
              :key="'min-' + line.top"
              class="alt-grid-line alt-grid-minor"
              :style="{ top: line.top + 'px' }"
            />
          </div>

          <div class="alt-acts">
            <div
              v-for="block in localBlocks"
              :key="block.blockId"
              :ref="(el) => setBlockRef(el, block.blockId)"
              class="alt-block"
              :class="{
                unsaved:  unsavedIds.has(block.blockId),
                'is-new': block.isNew,
                selected: selectedIds.has(block.blockId)
              }"
              :style="blockStyle(block)"
              @click.self="toggleSelect(block.blockId)"
            >
              <div class="resize-top" />
              <div class="alt-block-content" @click="toggleSelect(block.blockId)">
                <div class="alt-block-time">{{ formatBlockTime(block) }}</div>
                <div class="alt-block-name">{{ block.act_name }}</div>
                <div v-if="block.genre" class="alt-block-genre">{{ block.genre }}</div>
              </div>
              <button class="alt-block-delete" @click.stop="deleteBlock(block.blockId)" title="Remove set">×</button>
              <div class="resize-bottom" />
            </div>
            <!-- Snap guide: direct DOM, non-reactive so it never triggers re-render during drag -->
            <div ref="snapGuideEl" class="alt-snap-guide" style="display:none" />
            <!-- Ghost snap line shown while dragging a chip over the timeline -->
            <div
              v-if="chipGhostTop !== null"
              class="alt-ghost-line"
              :style="{ top: chipGhostTop + 'px' }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import interact from 'interactjs'
import { useLineupAdmin } from '@/composables/useLineupAdmin'

const props = defineProps({
  events:    { type: Array, required: true },   // day-filtered events
  allEvents: { type: Array, required: true },   // all signed acts (chip panel + smart save)
  date:      { type: [Date, String], required: true },
  day:       { type: String, required: true }
})

// ── Layout constants ─────────────────────────────────────────────────
const PX_PER_MIN  = 2
const SNAP_MIN    = 15
const SNAP_PX     = SNAP_MIN * PX_PER_MIN
const DAY_START_H = 12   // noon
const DAY_END_H   = 28   // 4 AM next day
const TOTAL_HOURS = DAY_END_H - DAY_START_H
const timelineHeight = TOTAL_HOURS * 60 * PX_PER_MIN  // 1920px

// ── Time helpers ──────────────────────────────────────────────────────
function adjustedHour(date) {
  const h = date.getHours()
  return h < DAY_START_H ? h + 24 : h
}

function timeToPixel(iso) {
  const d = new Date(iso)
  return (adjustedHour(d) - DAY_START_H) * 60 * PX_PER_MIN + d.getMinutes() * PX_PER_MIN
}

function pixelToTime(px) {
  const totalMins  = Math.round(px / PX_PER_MIN)
  const targetMins = DAY_START_H * 60 + totalMins
  const hAbs       = Math.floor(targetMins / 60)
  const min        = targetMins % 60
  const base       = new Date(props.date)
  if (hAbs >= 24) {
    base.setDate(base.getDate() + 1)
    base.setHours(hAbs - 24, min, 0, 0)
  } else {
    base.setHours(hAbs, min, 0, 0)
  }
  return base.toISOString()
}

// ── Labels & grid ─────────────────────────────────────────────────────
const timeLabels = computed(() => {
  const labels = []
  for (let h = DAY_START_H; h <= DAY_END_H; h += 0.5) {
    const hour   = Math.floor(h)
    const min    = (h % 1) * 60
    const hDisp  = hour >= 24 ? hour - 24 : hour
    const period = hour < 24 ? (hour < 12 ? 'AM' : 'PM') : 'AM'
    const h12    = hDisp === 0 ? 12 : hDisp > 12 ? hDisp - 12 : hDisp
    labels.push({
      label: `${h12}:${min === 0 ? '00' : '30'} ${period}`,
      top:   (h - DAY_START_H) * 60 * PX_PER_MIN
    })
  }
  return labels
})

const majorGridLines = computed(() => {
  const lines = []
  for (let h = DAY_START_H; h <= DAY_END_H; h++) {
    lines.push({ top: (h - DAY_START_H) * 60 * PX_PER_MIN })
  }
  return lines
})

const minorGridLines = computed(() => {
  const lines = []
  for (let h = DAY_START_H; h < DAY_END_H; h++) {
    for (const frac of [0.25, 0.5, 0.75]) {
      lines.push({ top: ((h - DAY_START_H) + frac) * 60 * PX_PER_MIN })
    }
  }
  return lines
})

// ── Snap guide ref (non-reactive — direct DOM avoids re-renders during drag) ──────────
const snapGuideEl = ref(null)

// ── Blocks: one per settime slot (flattened) ─────────────────────────────────
const localBlocks  = ref([])
const unsavedIds   = ref(new Set())
const unsavedCount = computed(() => unsavedIds.value.size)
const blockRefs    = {}
let   nextNewId    = 0

function setBlockRef(el, blockId) {
  if (el) blockRefs[blockId] = el
  else    delete blockRefs[blockId]
}

function buildBlocks(events) {
  const blocks = []
  for (const ev of events) {
    const durations = Array.isArray(ev.set_durations)
      ? ev.set_durations
      : ev.settimes.map(() => 60)
    for (let i = 0; i < ev.settimes.length; i++) {
      blocks.push({
        blockId:  `${ev.id}::${ev.settimes[i]}`,
        eventId:  ev.id,
        settime:  ev.settimes[i],
        duration: durations[i] || 60,
        act_name: ev.act_name,
        genre:    ev.genre,
        isNew:    false
      })
    }
  }
  return blocks
}

watch(
  () => props.events,
  (incoming) => {
    localBlocks.value = buildBlocks(incoming)
    unsavedIds.value  = new Set()
    nextTick(bindInteract)
  },
  { immediate: true }
)

// ── Chip panel ───────────────────────────────────────────────────────────────
const pendingChipId = ref(null)  // for tap-to-place on touch

const chipActs = computed(() =>
  [...props.allEvents]
    .filter(ev => ev.act_name && ev.act_name.trim())
    .map(ev => ({
      ...ev,
      daySetCount: localBlocks.value.filter(b => b.eventId === ev.id).length
    }))
    .sort((a, b) => a.act_name.localeCompare(b.act_name))
)

// ── Block styles & display ──────────────────────────────────────────────────
function blockStyle(block) {
  if (!block.settime) return {}
  return {
    top:    `${timeToPixel(block.settime)}px`,
    height: `${block.duration * PX_PER_MIN}px`
  }
}

function formatBlockTime(block) {
  if (!block.settime) return ''
  const start = new Date(block.settime)
  const end   = new Date(start.getTime() + block.duration * 60_000)
  const fmt = (d) => {
    let h = d.getHours()
    const m = d.getMinutes()
    const s = h < 12 ? 'AM' : 'PM'
    if (h === 0)      h = 12
    else if (h > 12)  h -= 12
    return `${h}:${m.toString().padStart(2, '0')} ${s}`
  }
  return `${fmt(start)} – ${fmt(end)}`
}

// Direct DOM update for the time label during live drag/resize
function updateTimeLabel(el, topPx, heightPx) {
  const labelEl = el.querySelector('.alt-block-time')
  if (!labelEl) return
  const snappedTop = Math.max(0, Math.round(topPx / SNAP_PX) * SNAP_PX)
  const durMin     = Math.max(SNAP_MIN, Math.round(heightPx / PX_PER_MIN / SNAP_MIN) * SNAP_MIN)
  const start      = new Date(pixelToTime(snappedTop))
  const end        = new Date(start.getTime() + durMin * 60_000)
  const fmt = (d) => {
    let h = d.getHours()
    const m = d.getMinutes()
    const s = h < 12 ? 'AM' : 'PM'
    if (h === 0)      h = 12
    else if (h > 12)  h -= 12
    return `${h}:${m.toString().padStart(2, '0')} ${s}`
  }
  labelEl.textContent = `${fmt(start)} – ${fmt(end)}`
}

// ── State updaters ─────────────────────────────────────────────────────────────
function markUnsaved(blockId) {
  unsavedIds.value = new Set([...unsavedIds.value, blockId])
}

function updateBlockSettime(blockId, newSettime, newDuration) {
  const block = localBlocks.value.find(b => b.blockId === blockId)
  if (!block) return
  block.settime = newSettime
  if (newDuration !== undefined) block.duration = newDuration
  markUnsaved(blockId)
  cascadeOverlaps(blockId)
}

function updateBlockDuration(blockId, newDuration) {
  const block = localBlocks.value.find(b => b.blockId === blockId)
  if (!block) return
  block.duration = newDuration
  markUnsaved(blockId)
  cascadeOverlaps(blockId)
}

function cascadeOverlaps(draggedBlockId = null) {
  const snapMs = SNAP_MIN * 60_000
  const sorted = () =>
    [...localBlocks.value].sort((a, b) => new Date(a.settime) - new Date(b.settime))

  // Forward pass — push later blocks DOWN
  const fwd = sorted()
  for (let i = 0; i < fwd.length - 1; i++) {
    const curr = localBlocks.value.find(b => b.blockId === fwd[i].blockId)
    const next = localBlocks.value.find(b => b.blockId === fwd[i + 1].blockId)
    if (!curr || !next) continue
    if (draggedBlockId && next.blockId === draggedBlockId) continue
    const currEnd = new Date(curr.settime).getTime() + curr.duration * 60_000
    if (new Date(next.settime).getTime() < currEnd) {
      next.settime = new Date(Math.ceil(currEnd / snapMs) * snapMs).toISOString()
      markUnsaved(next.blockId)
    }
  }

  // Backward pass — push earlier blocks UP
  const bwd = sorted()
  for (let i = bwd.length - 1; i > 0; i--) {
    const later   = localBlocks.value.find(b => b.blockId === bwd[i].blockId)
    const earlier = localBlocks.value.find(b => b.blockId === bwd[i - 1].blockId)
    if (!later || !earlier) continue
    if (draggedBlockId && earlier.blockId === draggedBlockId) continue
    const prevEnd = new Date(earlier.settime).getTime() + earlier.duration * 60_000
    if (new Date(later.settime).getTime() < prevEnd) {
      const newStart = Math.floor((new Date(later.settime).getTime() - earlier.duration * 60_000) / snapMs) * snapMs
      earlier.settime = new Date(newStart).toISOString()
      markUnsaved(earlier.blockId)
    }
  }

  // Sync DOM positions for all non-dragged blocks
  nextTick(() => {
    for (const block of localBlocks.value) {
      if (block.blockId === draggedBlockId) continue
      const el = blockRefs[block.blockId]
      if (el) el.style.top = `${timeToPixel(block.settime)}px`
    }
  })
}

// ── Chip drag-to-timeline (HTML5 DnD) + tap-to-place (touch) ───────────────────
const scrollRef    = ref(null)
const actsAreaRef  = ref(null)
const chipGhostTop = ref(null)

// Tap a chip to arm it, then tap the timeline to place it
function onChipTap(eventId) {
  if (pendingChipId.value === eventId) {
    pendingChipId.value = null  // deselect if tapping same chip
  } else {
    pendingChipId.value = eventId
  }
}

function onTimelineClick(e) {
  if (!pendingChipId.value || !actsAreaRef.value) return
  // Ignore clicks on existing blocks
  if (e.target.closest('.alt-block')) return
  const rect = actsAreaRef.value.getBoundingClientRect()
  addBlockFromChip(pendingChipId.value, e.clientY - rect.top)
  pendingChipId.value = null
}

function onChipDragStart(e, eventId) {
  e.dataTransfer.setData('eventId', eventId)
  e.dataTransfer.effectAllowed = 'copy'
}

function onChipDragOver(e) {
  e.preventDefault()
  if (!actsAreaRef.value) return
  const rect = actsAreaRef.value.getBoundingClientRect()
  chipGhostTop.value = Math.round((e.clientY - rect.top) / SNAP_PX) * SNAP_PX
}

function onChipDragLeave(e) {
  if (!actsAreaRef.value?.contains(e.relatedTarget)) {
    chipGhostTop.value = null
  }
}

function onChipDrop(e) {
  e.preventDefault()
  const eventId = e.dataTransfer.getData('eventId')
  if (!eventId || !actsAreaRef.value) return
  const rect = actsAreaRef.value.getBoundingClientRect()
  addBlockFromChip(eventId, e.clientY - rect.top)
  chipGhostTop.value = null
}

function addBlockFromChip(eventId, dropPx) {
  const ev = props.allEvents.find(e => e.id === eventId)
  if (!ev) return
  const snapped = Math.max(0, Math.round(dropPx / SNAP_PX) * SNAP_PX)
  const blockId = `${eventId}::new::${++nextNewId}`
  localBlocks.value.push({
    blockId,
    eventId,
    settime:  pixelToTime(snapped),
    duration: 60,
    act_name: ev.act_name,
    genre:    ev.genre,
    isNew:    true
  })
  markUnsaved(blockId)
  cascadeOverlaps(blockId)
  nextTick(bindInteract)
}

// ── Selection & deletion ────────────────────────────────────────────────────
const selectedIds = ref(new Set())

function toggleSelect(blockId) {
  const s = new Set(selectedIds.value)
  if (s.has(blockId)) s.delete(blockId)
  else                s.add(blockId)
  selectedIds.value = s
}

function deleteBlock(blockId) {
  selectedIds.value = new Set([...selectedIds.value].filter(id => id !== blockId))
  const block = localBlocks.value.find(b => b.blockId === blockId)
  if (!block) return
  if (blockId.includes('::new::')) {
    // Never persisted — just remove from unsaved tracking entirely
    const next = new Set(unsavedIds.value)
    next.delete(blockId)
    unsavedIds.value = next
  } else {
    // Existed in Firestore — mark so handleSave removes the settime
    markUnsaved(blockId)
  }
  localBlocks.value = localBlocks.value.filter(b => b.blockId !== blockId)
  nextTick(bindInteract)
}

function deleteSelected() {
  const next = new Set(unsavedIds.value)
  for (const blockId of selectedIds.value) {
    if (blockId.includes('::new::')) {
      // Never persisted — just drop from tracking
      next.delete(blockId)
    } else {
      // Existed in Firestore — mark for removal on save
      next.add(blockId)
    }
  }
  unsavedIds.value = next
  localBlocks.value = localBlocks.value.filter(b => !selectedIds.value.has(b.blockId))
  selectedIds.value = new Set()
  nextTick(bindInteract)
}

// ── interact.js ───────────────────────────────────────────────────────────────
const interactInstances = []

function bindInteract() {
  interactInstances.forEach(i => { try { i.unset() } catch (_) {} })
  interactInstances.length = 0

  for (const block of localBlocks.value) {
    const el = blockRefs[block.blockId]
    if (!el) continue
    const bid = block.blockId  // capture in closure

    const instance = interact(el)
      .draggable({
        ignoreFrom: '.resize-top, .resize-bottom',
        listeners: {
          start() {},
          move(e) {
            const t = parseFloat(el.style.top) || 0
            const newTop = Math.max(0, t + e.dy)
            el.style.top = `${newTop}px`
            const snappedGuide = Math.max(0, Math.round(newTop / SNAP_PX) * SNAP_PX)
            if (snapGuideEl.value) {
              snapGuideEl.value.style.top = `${snappedGuide}px`
              snapGuideEl.value.style.display = 'block'
            }
            updateTimeLabel(el, newTop, parseFloat(el.style.height) || 60 * PX_PER_MIN)
          },
          end() {
            const raw     = parseFloat(el.style.top) || 0
            const snapped = Math.max(0, Math.round(raw / SNAP_PX) * SNAP_PX)
            if (snapGuideEl.value) snapGuideEl.value.style.display = 'none'
            updateBlockSettime(bid, pixelToTime(snapped))
            nextTick(() => { el.style.top = `${timeToPixel(localBlocks.value.find(b => b.blockId === bid)?.settime)}px` })
          }
        }
      })
      .resizable({
        edges: { top: '.resize-top', bottom: '.resize-bottom' },
        listeners: {
          start() {},
          move(e) {
            const curH = parseFloat(el.style.height) || 60 * PX_PER_MIN
            const curT = parseFloat(el.style.top)    || 0
            if (e.edges.bottom) {
              const newH = Math.max(SNAP_PX, curH + e.deltaRect.bottom)
              el.style.height = `${newH}px`
              const snappedH = Math.round(newH / SNAP_PX) * SNAP_PX
              if (snapGuideEl.value) {
                snapGuideEl.value.style.top = `${curT + snappedH}px`
                snapGuideEl.value.style.display = 'block'
              }
              updateTimeLabel(el, curT, newH)
            }
            if (e.edges.top) {
              const newH = curH - e.deltaRect.top
              const newT = curT + e.deltaRect.top
              if (newH >= SNAP_PX && newT >= 0) {
                el.style.height = `${newH}px`
                el.style.top    = `${newT}px`
                const snappedT = Math.max(0, Math.round(newT / SNAP_PX) * SNAP_PX)
                if (snapGuideEl.value) {
                  snapGuideEl.value.style.top = `${snappedT}px`
                  snapGuideEl.value.style.display = 'block'
                }
                updateTimeLabel(el, newT, newH)
              }
            }
          },
          end(e) {
            const rawH      = parseFloat(el.style.height) || SNAP_PX
            const snappedH  = Math.max(SNAP_PX, Math.round(rawH / SNAP_PX) * SNAP_PX)
            const newDur    = Math.round(snappedH / PX_PER_MIN)
            if (e.edges.top) {
              const rawT     = parseFloat(el.style.top) || 0
              const snappedT = Math.max(0, Math.round(rawT / SNAP_PX) * SNAP_PX)
              updateBlockSettime(bid, pixelToTime(snappedT), newDur)
            } else {
              updateBlockDuration(bid, newDur)
            }
            if (snapGuideEl.value) snapGuideEl.value.style.display = 'none'
            nextTick(() => {
              const b = localBlocks.value.find(x => x.blockId === bid)
              if (b) {
                el.style.top    = `${timeToPixel(b.settime)}px`
                el.style.height = `${b.duration * PX_PER_MIN}px`
              }
            })
          }
        }
      })

    interactInstances.push(instance)
  }
}

// ── Save: smart merge — preserve settimes outside this day's window ─────────────
const { saving, saveError, batchUpdateSettimes } = useLineupAdmin()

function resetChanges() {
  localBlocks.value = buildBlocks(props.events)
  unsavedIds.value  = new Set()
  selectedIds.value = new Set()
  nextTick(bindInteract)
}

async function handleSave() {
  const modified = localBlocks.value.filter(b => unsavedIds.value.has(b.blockId))
  // Also include events where blocks were deleted (they have unsaved blockIds no longer in localBlocks)
  const deletedEventIds = [...unsavedIds.value]
    .filter(bid => !localBlocks.value.find(b => b.blockId === bid))
    .map(bid => bid.split('::')[0])
  const allAffectedEventIds = [...new Set([
    ...modified.map(b => b.eventId),
    ...deletedEventIds
  ])]
  if (!allAffectedEventIds.length) return

  const eventIds = allAffectedEventIds
  const dayStart = new Date(props.date)
  dayStart.setHours(DAY_START_H, 0, 0, 0)
  const dayEnd = new Date(props.date)
  dayEnd.setDate(dayEnd.getDate() + 1)
  dayEnd.setHours(DAY_END_H - 24, 0, 0, 0)  // 4 AM next day

  const updates = []
  for (const eid of eventIds) {
    const orig = props.allEvents.find(e => e.id === eid)
    if (!orig) continue
    const origDurs = Array.isArray(orig.set_durations)
      ? orig.set_durations
      : orig.settimes.map(() => 60)
    // Keep settimes that belong to OTHER days
    const outside = orig.settimes
      .map((t, i) => ({ settime: t, duration: origDurs[i] || 60 }))
      .filter(({ settime }) => {
        const d = new Date(settime)
        return d < dayStart || d >= dayEnd
      })
    // All blocks for this event currently on this day
    const dayBlocks = localBlocks.value
      .filter(b => b.eventId === eid)
      .map(b => ({ settime: b.settime, duration: b.duration }))
    const combined = [...outside, ...dayBlocks]
      .sort((a, b) => new Date(a.settime) - new Date(b.settime))
    updates.push({
      id:            eid,
      settimes:      combined.map(p => p.settime),
      set_durations: combined.map(p => p.duration)
    })
  }

  await batchUpdateSettimes(updates)
  if (!saveError.value) {
    for (const block of localBlocks.value) block.isNew = false
    unsavedIds.value = new Set()
  }
}

onUnmounted(() => {
  interactInstances.forEach(i => { try { i.unset() } catch (_) {} })
})
</script>
<style scoped>
.alt-wrapper {
  width: 100%;
  border: 1px solid var(--reunion-frog-green);
  border-radius: 10px;
  overflow: hidden;
  background: var(--reunion-light-gray);
  margin-bottom: 1rem;
}

.alt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: #111;
  border-bottom: 1px solid var(--reunion-frog-green);
}

.alt-day-label {
  font-weight: 700;
  color: var(--reunion-frog-green);
  letter-spacing: 0.12em;
  font-size: 0.85rem;
}

.alt-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.unsaved-badge {
  background: #f5c518;
  color: #000;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.18rem 0.5rem;
  border-radius: 12px;
}

.alt-discard-btn {
  padding: 0.35rem 0.9rem;
  background: transparent;
  color: #f66;
  border: 1px solid #f66;
  border-radius: 5px;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.alt-discard-btn:hover {
  background: #f66;
  color: #fff;
}

.alt-save-btn {
  padding: 0.35rem 0.9rem;
  background: var(--reunion-frog-green);
  color: #fff;
  border: none;
  border-radius: 5px;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s;
}

.alt-save-btn:not(:disabled):hover {
  background: #fff;
  color: #000;
}

.alt-save-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.save-error {
  color: #f66;
  font-size: 0.8rem;
}

.alt-scroll {
  overflow-y: auto;
  max-height: 72vh;
}

.alt-timeline {
  position: relative;
}

.alt-time-labels {
  position: absolute;
  left: 0;
  top: 0;
  width: 72px;
  height: 100%;
  border-right: 1px solid #333;
  pointer-events: none;
}

.alt-time-label {
  position: absolute;
  right: 6px;
  font-size: 0.68rem;
  color: #888;
  transform: translateY(-50%);
  white-space: nowrap;
}

.alt-acts-wrapper {
  position: absolute;
  left: 72px;
  right: 0;
  top: 0;
  bottom: 0;
}

.alt-grid {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 100%;
  pointer-events: none;
}

.alt-grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  pointer-events: none;
}

.alt-grid-major {
  background: #2e2e2e;
}

.alt-grid-minor {
  background: #1e1e1e;
}

/* Snap guide — shows where the dragged edge will land */
.alt-snap-guide {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(245, 197, 24, 0.7);
  pointer-events: none;
  z-index: 20;
}

.alt-snap-guide::before {
  content: '';
  position: absolute;
  left: 0;
  top: -3px;
  width: 6px;
  height: 8px;
  background: #f5c518;
  border-radius: 1px;
}

.alt-acts {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 100%;
}

.alt-block {
  position: absolute;
  left: 6px;
  right: 6px;
  background: #1a3520;
  border: 1px solid var(--reunion-frog-green);
  border-radius: 6px;
  box-sizing: border-box;
  cursor: grab;
  user-select: none;
  touch-action: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.1s;
}

.alt-block:active {
  cursor: grabbing;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

.alt-block.unsaved {
  border-color: #f5c518;
  box-shadow: 0 0 0 1px rgba(245, 197, 24, 0.4);
}

.resize-top,
.resize-bottom {
  height: 8px;
  background: transparent;
  cursor: ns-resize;
  flex-shrink: 0;
}

.resize-top:hover,
.resize-bottom:hover {
  background: rgba(255, 255, 255, 0.15);
}

.alt-block-content {
  flex: 1;
  padding: 0.15rem 0.4rem;
  overflow: hidden;
  min-height: 0;
  cursor: pointer;
}

.alt-block-time {
  font-size: 0.62rem;
  color: #bbb;
  line-height: 1.2;
  white-space: nowrap;
}

.alt-block-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alt-block-genre {
  font-size: 0.62rem;
  color: var(--reunion-frog-green);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Chip panel ─────────────────────────────────────────────────────────────── */
.alt-chips {
  background: #0d0d0d;
  border-bottom: 1px solid #2a2a2a;
  padding: 0.4rem 0.75rem;
}

.chip-pending-hint {
  display: block;
  font-size: 0.65rem;
  color: #f5c518;
  padding: 0.2rem 0;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.alt-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0 0 0.4rem;
}

.alt-instructions {
  margin: 0.25rem 0 0;
  font-size: 0.62rem;
  color: #777;
  line-height: 1.4;
}

.alt-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.6rem;
  background: #1a2f1a;
  border: 1px solid var(--reunion-frog-green);
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #ddd;
  white-space: nowrap;
  cursor: grab;
  user-select: none;
  transition: background 0.12s, border-color 0.12s;
}

.alt-chip.chip-pending {
  background: #2a4a0a;
  border-color: #f5c518;
  color: #f5c518;
  outline: 1px dashed #f5c518;
  outline-offset: 2px;
}

.alt-chip:hover {
  background: #253f25;
  border-color: #fff;
  color: #fff;
}

.alt-chip:active {
  cursor: grabbing;
}

.alt-chip-badge {
  background: var(--reunion-frog-green);
  color: #000;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0 0.28rem;
  border-radius: 8px;
}

/* ── Ghost snap line ────────────────────────────────────────────────────────── */
.alt-ghost-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #f5c518;
  pointer-events: none;
  z-index: 10;
}

.alt-ghost-line::before {
  content: '';
  position: absolute;
  left: 0;
  top: -4px;
  width: 8px;
  height: 10px;
  background: #f5c518;
  border-radius: 2px;
}

.alt-block.is-new {
  border-style: dashed;
}

.alt-block.selected {
  outline: 2px solid #f5c518;
  outline-offset: 1px;
}

/* ── Per-block delete button ───────────────────────────────────────────────── */
.alt-block-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  padding: 0;
  background: rgba(200, 50, 50, 0.7);
  color: #fff;
  border: none;
  border-radius: 3px;
  font-size: 0.75rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.1s;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alt-block:hover .alt-block-delete {
  opacity: 1;
}

/* ── Delete selected header button ────────────────────────────────────────── */
.alt-delete-sel-btn {
  padding: 0.35rem 0.9rem;
  background: #c03030;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s;
}

.alt-delete-sel-btn:hover {
  background: #e04040;
}

.alt-cancel-sel-btn {
  padding: 0.35rem 0.75rem;
  background: transparent;
  color: #888;
  border: 1px solid #444;
  border-radius: 5px;
  font-size: 0.82rem;
  cursor: pointer;
}

.alt-cancel-sel-btn:hover {
  color: #ccc;
  border-color: #666;
}
</style>
