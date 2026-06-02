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
      <img :src="dj_icon" style="height: 64px; width: auto; margin: 0" alt="Artist Icon" />
      <h2>Edit Your Artist Info</h2>

      <h3 v-if="cutoffReached" style="color: orange;">
        ✋ Editing is closed.<br />
        The cutoff for self-service edits was
        <strong>{{ cutoffDate.toLocaleDateString() }}</strong>.<br />
        Email
        <a href="mailto:reunion@festivall.ca" style="color: orange;">reunion@festivall.ca</a>
        for any urgent changes.
      </h3>

      <form v-else @submit.prevent="onSave" class="edit-form">
        <!-- Submission mix -->
        <label>Submission Mix URL</label>
        <small>SoundCloud / Mixcloud / Spotify / YouTube link preferred. Direct file links also OK.</small>
        <input type="url" v-model.trim="form.mix_track_url" placeholder="https://soundcloud.com/..." />

        <!-- Act description / Bio (single canonical field) -->
        <label>Artist Bio / Description <span class="char-count">({{ form.act_description.length }}/1000)</span></label>
        <small>Shown on the lineup page and the map's Now Playing card. The stage announcer also reads this — keep the opening punchy.</small>
        <textarea v-model="form.act_description" maxlength="1000" rows="5" />

        <!-- Genre -->
        <label>Genre</label>
        <small>Shown on the lineup page and the Now Playing card.</small>
        <select v-model="form.genre">
          <option value="" disabled>Select your genre</option>
          <option value="House">House</option>
          <option value="Techno">Techno</option>
          <option value="Trance">Trance</option>
          <option value="Drum and Bass">Drum and Bass</option>
          <option value="Hip Hop">Hip Hop</option>
          <option value="Garage">Garage</option>
          <option value="Dubstep">Dubstep</option>
          <option value="Ambient">Ambient</option>
          <option value="Electro">Electro</option>
          <option value="Synthwave">Synthwave</option>
          <option value="Future Bass">Future Bass</option>
          <option value="Trap">Trap</option>
          <option value="Hardstyle">Hardstyle</option>
          <option value="Progressive">Progressive</option>
          <option value="Chillout">Chillout</option>
        </select>

        <!-- Social / Website / Press kit -->
        <label>Social URL</label>
        <small>Instagram, TikTok, Facebook, Bandcamp, etc.</small>
        <input type="url" v-model.trim="form.social_url" placeholder="https://instagram.com/..." />

        <label>Act Website</label>
        <input type="url" v-model.trim="form.act_website" placeholder="https://..." />

        <label>Press Kit URL</label>
        <small>Google Drive / Dropbox link to your EPK.</small>
        <input type="url" v-model.trim="form.press_kit_url" placeholder="https://drive.google.com/..." />

        <!-- Logo -->
        <label>Logo / Artwork</label>
        <small>
          <img :src="vectors_icon" alt="" class="inline-icon" />
          <strong>Vector (SVG) preferred.</strong> Otherwise a high-resolution PNG
          (≥1500&nbsp;px) with a <strong>transparent alpha channel</strong>.
          Avoid JPG for logos — alpha is lost. Max {{ maxLogoMB }} MB.
        </small>
        <input
          type="file"
          ref="fileInput"
          :accept="acceptAttr"
          @change="onFileChange"
          class="file-input"
        />
        <small v-if="selectedFileName" style="color: var(--reunion-frog-green);">
          Selected: {{ selectedFileName }}
        </small>

        <label style="margin-top: 0.5rem;">…or paste a logo URL</label>
        <input
          type="url"
          v-model.trim="form.logo_url"
          placeholder="https://..."
          @input="logoPreviewError = false"
        />
        <div v-if="form.logo_url && !logoPreviewError" class="logo-preview">
          <img
            :src="form.logo_url"
            alt="Logo preview"
            @error="logoPreviewError = true"
          />
        </div>
        <small v-if="form.logo_url && logoPreviewError" style="color: orange;">
          ⚠️ Couldn't load that URL as an image. Make sure it's a <strong>direct image link</strong>
          (ending in .png / .svg / .jpg / .webp) — not a share page from Google Drive, Dropbox,
          OneDrive, etc. Use the file picker above instead if easier.
        </small>

        <h3 v-if="errorMessage" style="color: red;">{{ errorMessage }}</h3>

        <button type="submit" :disabled="saving">
          {{ saving ? 'Saving…' : '💾 Save Changes' }}
        </button>
        <button
          type="button"
          @click="$emit('close')"
          style="background: transparent; color: white; border-color: white; margin-top: 0.5rem;"
        >
          Cancel
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { reunion_db, reunion_storage } from '@/firebase'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'
import { sendReunionApplications } from '/scripts/notifications.js'
import festivall_emblem_white from '@/assets/images/festivall_emblem_white.png'
import dj_icon from '@/assets/images/icons/dj.png'
import vectors_icon from '@/assets/images/icons/vectors.png'

const MIME_TO_EXT = {
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

export default {
  name: 'EditArtistInfoModal',
  props: {
    order: { type: Object, required: true },
    applicationData: { type: Object, default: () => ({}) },
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const cfg = REUNION_FESTIVAL.artistEditing
    const cutoffDate = cfg.editCutoff
    const cutoffReached = computed(() => new Date() >= cutoffDate)

    // Snapshot initial values so we can compute a diff on save.
    const initial = {
      mix_track_url:   props.applicationData.mix_track_url   || '',
      act_description: props.applicationData.act_description || '',
      genre:           props.applicationData.genre           || '',
      social_url:      props.applicationData.social_url      || '',
      act_website:     props.applicationData.act_website     || '',
      press_kit_url:   props.applicationData.press_kit_url   || '',
      logo_url:        props.applicationData.logo_url        || '',
    }
    const form = reactive({ ...initial })

    const fileInput = ref(null)
    const selectedFile = ref(null)
    const selectedFileName = computed(() => selectedFile.value?.name || '')
    const logoPreviewError = ref(false)

    const saving = ref(false)
    const errorMessage = ref('')

    const acceptAttr = cfg.allowedLogoMimes.join(',')
    const maxLogoMB = cfg.maxLogoMB
    const maxLogoBytes = cfg.maxLogoMB * 1024 * 1024

    const onFileChange = (e) => {
      errorMessage.value = ''
      const file = e.target.files?.[0] || null
      if (!file) { selectedFile.value = null; return }
      if (!cfg.allowedLogoMimes.includes(file.type)) {
        errorMessage.value = `Unsupported file type (${file.type || 'unknown'}). Allowed: SVG, PNG, JPG, WebP.`
        if (fileInput.value) fileInput.value.value = ''
        selectedFile.value = null
        return
      }
      if (file.size > maxLogoBytes) {
        errorMessage.value = `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max ${maxLogoMB} MB.`
        if (fileInput.value) fileInput.value.value = ''
        selectedFile.value = null
        return
      }
      selectedFile.value = file
    }

    const uploadLogo = async () => {
      const file = selectedFile.value
      const ext = MIME_TO_EXT[file.type] || file.name.split('.').pop()
      const path = `logos/${props.order.id_code}.${ext}`
      const sRef = storageRef(reunion_storage, path)
      await uploadBytes(sRef, file)
      return getDownloadURL(sRef)
    }

    const onSave = async () => {
      if (saving.value || cutoffReached.value) return
      errorMessage.value = ''
      saving.value = true
      try {
        // Upload first if a file was chosen — replaces form.logo_url
        if (selectedFile.value) {
          form.logo_url = await uploadLogo()
        }

        // Build a diff patch with only changed fields, using nested dotted paths.
        const patch = {}
        const changedFields = []
        for (const key of cfg.editableFields) {
          if (form[key] !== initial[key]) {
            patch[`application.data.${key}`] = form[key]
            changedFields.push(key)
          }
        }

        if (changedFields.length === 0) {
          emit('close')
          return
        }

        const participantRef = doc(reunion_db, REUNION_FESTIVAL.participantsCollection, props.order.id_code)
        await updateDoc(participantRef, patch)

        // Fire-and-forget Slack ping so organizers notice (esp. logo changes that risk reprints).
        sendReunionApplications(
          `:art: *Artist self-edit*\n` +
          `:bust_in_silhouette: ${props.order.fullname}\n` +
          `:id: ${props.order.id_code}\n` +
          `:pencil2: Updated: ${changedFields.join(', ')}`
        ).catch(() => { /* non-blocking */ })

        emit('saved', { changedFields, values: { ...form } })
        emit('close')
      } catch (err) {
        console.error('Edit artist save error:', err)
        errorMessage.value = err.message || 'Could not save. Please try again.'
      } finally {
        saving.value = false
      }
    }

    return {
      festivall_emblem_white,
      dj_icon,
      vectors_icon,
      form,
      fileInput,
      selectedFileName,
      onFileChange,
      onSave,
      saving,
      errorMessage,
      acceptAttr,
      maxLogoMB,
      cutoffReached,
      cutoffDate,
      logoPreviewError,
    }
  },
}
</script>

<style scoped>
/* Reuse the same modal chrome variables/colors as TicketPageView */
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
  max-width: 500px;
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
.modal-content img { margin: 0 0 0.5rem 0; }

.edit-form {
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.edit-form label {
  color: white;
  font-size: 0.95rem;
  font-weight: bold;
  margin-top: 0.75rem;
  display: block;
}

.edit-form small {
  color: #bbb;
  font-size: 0.8rem;
  display: block;
  margin-bottom: 4px;
}

.edit-form small .inline-icon {
  height: 1.6em;
  width: auto;
  vertical-align: -5px;
  margin: 0 6px 0 0;
}

.edit-form input[type='url'],
.edit-form input[type='text'],
.edit-form textarea,
.edit-form select {
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

.edit-form select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.edit-form textarea { resize: vertical; min-height: 60px; }

.file-input {
  color: #bbb;
  font-size: 0.85rem;
  padding: 0.4rem;
  border-radius: 8px;
  border: 1px dashed var(--reunion-frog-green);
  background: #111;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}

.file-input::file-selector-button {
  margin-right: 0.75rem;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--reunion-frog-green);
  border-radius: 6px;
  background: var(--reunion-frog-green);
  color: white;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.file-input::file-selector-button:hover {
  background: transparent;
  color: var(--reunion-frog-green);
}

.char-count {
  color: #888;
  font-weight: normal;
  font-size: 0.8rem;
}

.logo-preview {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  display: flex;
  justify-content: center;
}

.logo-preview img {
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
  margin: 0;
}

.modal-content button {
  width: 70%;
  max-width: 250px;
  min-height: 48px;
  border: 2px solid var(--reunion-frog-green);
  border-radius: 25px;
  padding: 0 1.5rem;
  background-color: var(--reunion-frog-green);
  color: white;
  font-size: 16px;
  font-weight: bold;
  margin: 1.5rem auto 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-content button:hover:not(:disabled) {
  background-color: transparent;
  color: var(--reunion-frog-green);
}

.modal-content button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
