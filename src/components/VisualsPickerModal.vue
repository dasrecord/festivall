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
      <img :src="dj_icon" style="height: 64px; width: auto; margin: 0" alt="Visuals Icon" />
      <h2>Choose Your Visuals</h2>

      <h3 v-if="cutoffReached" style="color: orange;">
        ✋ Selection is closed.<br />
        The cutoff for self-service selections was
        <strong>{{ cutoffDate.toLocaleDateString() }}</strong>.<br />
        Email
        <a href="mailto:reunion@festivall.ca" style="color: orange;">reunion@festivall.ca</a>
        if you still need to make changes.
      </h3>

      <template v-else>
        <h3 style="text-align: left;">
          🎨 You've been scheduled during a nighttime visuals slot. Pick the clips and masks
          you'd like our VJ to project during your set.
        </h3>

        <!-- Sticky selection summary -->
        <div class="selection-bar">
          <div class="sel-group">
            <span class="sel-label">🎞️ {{ selected.video.length }}/{{ limits.video.max }}</span>
            <div class="sel-thumbs">
              <button
                v-for="id in selected.video"
                :key="`sv-${id}`"
                type="button"
                class="sel-thumb"
                :title="`Remove ${id}`"
                @click="toggle('video', id)"
              >
                <img :src="thumbFor('video', id)" :alt="id" />
                <span class="sel-x">✕</span>
              </button>
              <span v-if="selected.video.length === 0" class="sel-empty">none</span>
            </div>
          </div>
          <div class="sel-group">
            <span class="sel-label">🎭 {{ selected.mask.length }}/{{ limits.mask.max }}</span>
            <div class="sel-thumbs">
              <button
                v-for="id in selected.mask"
                :key="`sm-${id}`"
                type="button"
                class="sel-thumb"
                :title="`Remove ${id}`"
                @click="toggle('mask', id)"
              >
                <img :src="thumbFor('mask', id)" :alt="id" />
                <span class="sel-x">✕</span>
              </button>
              <span v-if="selected.mask.length === 0" class="sel-empty">none</span>
            </div>
          </div>
        </div>

        <!-- Video Clips -->
        <section class="library-section">
          <button type="button" class="section-header-btn" @click="open.video = !open.video">
            <span class="chevron" :class="{ collapsed: !open.video }">▾</span>
            <h3>
              🎞️ Video Clips
              <span class="counter">{{ selected.video.length }} / {{ limits.video.max }} selected</span>
            </h3>
          </button>
          <div v-if="open.video" class="section-body">
            <small>Pick {{ limits.video.min }}–{{ limits.video.max }} clips. These are the main looping visuals.</small>
            <div class="thumb-grid">
              <button
                v-for="item in catalog.video"
                :key="item.id"
                type="button"
                class="thumb"
                :class="{ selected: selected.video.includes(item.id), disabled: !canPick('video', item.id) }"
                :disabled="!canPick('video', item.id)"
                @click="toggle('video', item.id)"
              >
                <img :src="item.thumb" :alt="item.id" loading="lazy" />
                <span v-if="selected.video.includes(item.id)" class="check">✓</span>
                <span
                  class="zoom"
                  @click.stop="lightboxSrc = item.thumb"
                  title="View larger"
                >🔍</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Masks -->
        <section class="library-section">
          <button type="button" class="section-header-btn" @click="open.mask = !open.mask">
            <span class="chevron" :class="{ collapsed: !open.mask }">▾</span>
            <h3>
              🎭 Masks
              <span class="counter">{{ selected.mask.length }} / {{ limits.mask.max }} selected</span>
            </h3>
          </button>
          <div v-if="open.mask" class="section-body">
            <small>
              Pick {{ limits.mask.min }}–{{ limits.mask.max }} masks. Masks are alpha/cutout
              overlays the VJ layers on top of your video clips.
            </small>
            <div class="thumb-grid">
              <button
                v-for="item in catalog.mask"
                :key="item.id"
                type="button"
                class="thumb"
                :class="{ selected: selected.mask.includes(item.id), disabled: !canPick('mask', item.id) }"
                :disabled="!canPick('mask', item.id)"
                @click="toggle('mask', item.id)"
              >
                <img :src="item.thumb" :alt="item.id" loading="lazy" />
                <span v-if="selected.mask.includes(item.id)" class="check">✓</span>
                <span
                  class="zoom"
                  @click.stop="lightboxSrc = item.thumb"
                  title="View larger"
                >🔍</span>
              </button>
            </div>
          </div>
        </section>

        <h3 v-if="errorMessage" style="color: red;">{{ errorMessage }}</h3>

        <button type="button" :disabled="saving || !canSave" @click="onSave">
          {{ saving ? 'Saving…' : '💾 Save Selection' }}
        </button>
        <button
          type="button"
          @click="$emit('close')"
          style="background: transparent; color: white; border-color: white; margin-top: 0.5rem;"
        >
          Cancel
        </button>
      </template>

      <!-- Lightbox -->
      <div v-if="lightboxSrc" class="lightbox" @click.self="lightboxSrc = null">
        <img :src="lightboxSrc" alt="Full size preview" />
        <div class="lightbox-close" @click="lightboxSrc = null">✕</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'
import { sendReunionApplications } from '/scripts/notifications.js'
import catalog from '@/data/visuals_catalog.json'
import festivall_emblem_white from '@/assets/images/festivall_emblem_white.png'
import dj_icon from '@/assets/images/icons/dj.png'

export default {
  name: 'VisualsPickerModal',
  props: {
    order: { type: Object, required: true },
    applicationData: { type: Object, default: () => ({}) },
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const limits = REUNION_FESTIVAL.visuals.selectionLimits
    const cutoffDate = REUNION_FESTIVAL.artistEditing.editCutoff
    const cutoffReached = computed(() => new Date() >= cutoffDate)

    // Hydrate selection from existing participant data, filtered to ids still in catalog.
    const existing = props.applicationData.visuals_selection || {}
    const validIds = {
      video: new Set(catalog.video.map((i) => i.id)),
      mask:  new Set(catalog.mask.map((i) => i.id)),
    }
    const selected = reactive({
      video: (existing.video || []).filter((id) => validIds.video.has(id)),
      mask:  (existing.mask  || []).filter((id) => validIds.mask.has(id)),
    })

    const lightboxSrc = ref(null)
    const saving = ref(false)
    const errorMessage = ref('')
    const open = reactive({ video: false, mask: false })

    const canPick = (lib, id) => {
      if (selected[lib].includes(id)) return true
      return selected[lib].length < limits[lib].max
    }

    const thumbIndex = {
      video: Object.fromEntries(catalog.video.map((i) => [i.id, i.thumb])),
      mask:  Object.fromEntries(catalog.mask.map((i) => [i.id, i.thumb])),
    }
    const thumbFor = (lib, id) => thumbIndex[lib][id]

    const toggle = (lib, id) => {
      const idx = selected[lib].indexOf(id)
      if (idx >= 0) {
        selected[lib].splice(idx, 1)
      } else if (selected[lib].length < limits[lib].max) {
        selected[lib].push(id)
      }
    }

    const canSave = computed(() =>
      selected.video.length >= limits.video.min &&
      selected.mask.length  >= limits.mask.min
    )

    const onSave = async () => {
      if (saving.value || cutoffReached.value) return
      if (!canSave.value) {
        errorMessage.value = `Please pick at least ${limits.video.min} video clip(s) and ${limits.mask.min} mask(s).`
        return
      }
      saving.value = true
      errorMessage.value = ''
      try {
        const visuals_selection = {
          video: [...selected.video],
          mask:  [...selected.mask],
          updated_at: new Date().toISOString(),
        }
        const participantRef = doc(reunion_db, REUNION_FESTIVAL.participantsCollection, props.order.id_code)
        await updateDoc(participantRef, {
          'application.data.visuals_selection': visuals_selection,
        })

        sendReunionApplications(
          `:movie_camera: *Artist visuals selection*\n` +
          `:bust_in_silhouette: ${props.order.fullname}\n` +
          `:id: ${props.order.id_code}\n` +
          `:film_frames: video: ${visuals_selection.video.join(', ') || '—'}\n` +
          `:performing_arts: mask: ${visuals_selection.mask.join(', ') || '—'}`
        ).catch(() => { /* non-blocking */ })

        emit('saved', visuals_selection)
        emit('close')
      } catch (err) {
        console.error('Visuals save error:', err)
        errorMessage.value = err.message || 'Could not save. Please try again.'
      } finally {
        saving.value = false
      }
    }

    return {
      festivall_emblem_white,
      dj_icon,
      catalog,
      limits,
      selected,
      open,
      lightboxSrc,
      canPick,
      thumbFor,
      toggle,
      canSave,
      onSave,
      saving,
      errorMessage,
      cutoffReached,
      cutoffDate,
    }
  },
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0; left: 0; right: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex; flex-direction: column;
  justify-content: flex-start; align-items: center;
  z-index: 10; padding: 0.5rem;
}

.modal-content {
  width: 100%;
  max-width: 820px;
  max-height: 95vh;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
  border: 2px solid var(--reunion-frog-green);
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.85);
  font-size: 16px;
  position: relative;
  margin-top: 0.5rem;
}

.festivall-emblem { position: absolute; top: 8px; left: 8px; height: 40px !important; }
.modal-content h2 { font-size: 1.25rem; margin: 0.5rem 0; color: white; }
.modal-content h3 { font-size: 0.95rem; line-height: 1.35; margin: 0.4rem 0; }
.modal-content img { margin: 0; }
.modal-content > img { height: 40px !important; }

.modal-close {
  position: sticky;
  top: 0; right: 0;
  font-size: 20px;
  color: white; cursor: pointer;
  z-index: 12;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  align-self: flex-end;
  margin-bottom: -28px;
  transition: background-color 0.2s ease;
}
.modal-close::before { content: '✕'; }
.modal-close:hover { background-color: rgba(255, 255, 255, 0.3); }

/* Sticky selection summary */
.selection-bar {
  position: sticky;
  top: -1px;
  z-index: 5;
  width: 100%;
  margin: 0.4rem 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid var(--reunion-frog-green);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.sel-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 24px;
}

.sel-label {
  flex: 0 0 auto;
  font-size: 0.8rem;
  color: orange;
  font-weight: bold;
  white-space: nowrap;
}

.sel-thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  flex: 1;
  align-items: center;
}

.sel-empty {
  font-size: 0.75rem;
  color: #888;
  font-style: italic;
}

.sel-thumb {
  position: relative;
  width: 44px;
  aspect-ratio: 16 / 9;
  padding: 0;
  margin: 0;
  border: 1px solid var(--reunion-frog-green);
  border-radius: 2px;
  background: transparent;
  overflow: hidden;
  cursor: pointer;
}

.sel-thumb img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  margin: 0;
}

.sel-thumb .sel-x {
  position: absolute;
  top: 0; right: 0;
  width: 14px; height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.55rem;
  font-weight: bold;
  border-bottom-left-radius: 3px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.sel-thumb:hover .sel-x { opacity: 1; }

.library-section {
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 6px;
  text-align: left;
}

.section-header h3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 0.15rem;
  color: orange;
  font-size: 0.95rem;
}

.section-header-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  color: orange;
  cursor: pointer;
  text-align: left;
}

.section-header-btn h3 {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  color: orange;
  font-size: 0.95rem;
}

.chevron {
  display: inline-block;
  font-size: 0.85rem;
  color: orange;
  transition: transform 0.15s ease;
}

.chevron.collapsed { transform: rotate(-90deg); }

.section-body { margin-top: 0.35rem; }

.section-header small {
  display: block;
  color: #ccc;
  font-size: 0.75rem;
  margin-bottom: 0.4rem;
  line-height: 1.3;
}

.section-body small {
  display: block;
  color: #ccc;
  font-size: 0.75rem;
  margin-bottom: 0.4rem;
  line-height: 1.3;
}

.counter {
  font-size: 0.8rem;
  color: white;
  font-weight: normal;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

.thumb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 0.3rem;
}

@media (min-width: 600px) {
  .thumb-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.4rem; }
  .sel-thumb { width: 56px; }
  .modal-content { padding: 1rem; }
  .selection-bar { padding: 0.6rem; }
}

.thumb {
  position: relative;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  background: transparent;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 16 / 9;
  margin: 0;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.thumb img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  margin: 0;
}

.thumb:hover:not(.disabled) {
  border-color: white;
  transform: scale(1.02);
}

.thumb.selected {
  border-color: var(--reunion-frog-green);
  outline: 2px solid var(--reunion-frog-green);
  outline-offset: -2px;
}

.thumb.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.thumb .check {
  position: absolute;
  top: 2px; left: 2px;
  background: var(--reunion-frog-green);
  color: white;
  width: 18px; height: 18px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
}

.thumb .zoom {
  position: absolute;
  top: 2px; right: 2px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  width: 18px; height: 18px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem;
  cursor: zoom-in;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.thumb:hover .zoom { opacity: 1; }

/* On touch devices, zoom always visible so users can tap it */
@media (hover: none) {
  .thumb .zoom { opacity: 1; background: rgba(0, 0, 0, 0.7); }
  .sel-thumb .sel-x { opacity: 1; }
}

.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 2rem;
}

.lightbox img {
  max-width: 95vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  margin: 0;
}

.lightbox-close {
  position: absolute;
  top: 1rem; right: 1rem;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.25rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}

.modal-content > button {
  width: 100%;
  max-width: 280px;
  min-height: 44px;
  border: 2px solid var(--reunion-frog-green);
  border-radius: 25px;
  padding: 0 1.25rem;
  background-color: var(--reunion-frog-green);
  color: white;
  font-size: 15px;
  font-weight: bold;
  margin: 0.75rem auto 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-content > button:hover:not(:disabled) {
  background-color: transparent;
  color: var(--reunion-frog-green);
}

.modal-content > button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
