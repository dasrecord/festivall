<template>
  <div class="ar-root">

    <!-- ① Validating -->
    <div v-if="appState === 'validating'" class="overlay center">
      <div class="spinner"></div>
      <p>Verifying your ticket...</p>
    </div>

    <!-- ② Invalid -->
    <div v-else-if="appState === 'invalid'" class="overlay center error">
      <h2>Access Required</h2>
      <p>{{ authError }}</p>
      <router-link to="/reunionticket" class="pill-link">Go to ticket entry</router-link>
    </div>

    <!-- ③ Calibrating + ④ Active — A-Frame runs in both states -->
    <template v-else>

      <!-- Calibration overlay (shown over the live camera) -->
      <div v-if="appState === 'calibrating'" class="overlay calibration">
        <div class="cal-card">
          <h2>Point at an AR Marker</h2>
          <p class="hint">Print AR.js 3x3 barcode markers 0-2 and place them around the space.</p>
          <div class="dots">
            <span
              v-for="i in 2"
              :key="i"
              :class="['dot', markersDetected.size >= i ? 'dot--on' : '']"
            />
          </div>
          <p class="cal-status">
            <template v-if="markersDetected.size === 0">Searching for markers...</template>
            <template v-else-if="markersDetected.size === 1">
              First marker found! Scan one more to calibrate.
            </template>
            <template v-else>Calibrated — Ready to explore.</template>
          </p>
          <button v-if="markersDetected.size >= 2" class="btn-go" @click="appState = 'active'">
            Begin Experience
          </button>
          <button v-if="markersDetected.size >= 1" class="btn-skip" @click="appState = 'active'">
            Skip (single marker)
          </button>
        </div>
      </div>

      <!-- Active AR UI overlay -->
      <div v-if="appState === 'active'" class="ar-ui">
        <div class="top-bar">
          <span class="name">{{ participantName }}</span>
          <span v-if="cameraHeight > 0" class="cam-h">{{ cameraHeight.toFixed(2) }}m</span>
          <button class="btn-icon" @click="showInfo = !showInfo">?</button>
        </div>

        <!-- Object info panel -->
        <div v-if="selectedObject" class="bottom-panel">
          <h3>{{ selectedObject.content.title }}</h3>
          <p>{{ selectedObject.content.text }}</p>
          <button @click="selectedObject = null" class="btn-close">Close</button>
        </div>

        <!-- Quest panel -->
        <div v-else-if="selectedQuest" class="bottom-panel">
          <h3>{{ selectedQuest.title }}</h3>
          <p>{{ selectedQuest.description }}</p>
          <div class="row">
            <button
              @click="completeQuest(selectedQuest)"
              class="btn-complete"
              :disabled="isSaving"
            >
              {{ isSaving ? 'Saving...' : 'Complete Quest' }}
            </button>
            <button @click="selectedQuest = null" class="btn-close">Close</button>
          </div>
        </div>

        <!-- Info guide panel -->
        <div v-else-if="showInfo" class="bottom-panel">
          <h3>AR Guide</h3>
          <ul>
            <li>Scan AR markers to reveal 3D objects</li>
            <li>Tap glowing orbs to start quests</li>
            <li>Complete quests to earn rewards</li>
          </ul>
          <button @click="showInfo = false" class="btn-close">Close</button>
        </div>

        <div class="progress-wrap">
          <div class="progress-fill" :style="{ width: questProgress + '%' }" />
          <span class="progress-label">
            {{ completedQuestIds.size }} / {{ allQuests.length }} Quests
          </span>
        </div>
      </div>

      <!-- AR scene is built via raw DOM in buildARScene() — not managed by Vue -->

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore'
import { reunion_db } from '@/firebase'

const route = useRoute()

// ─── App state ────────────────────────────────────────────────────────────────
// validating → (invalid | calibrating) → active
const appState = ref('validating')
const authError = ref('')
const aframeLoaded = ref(false)

// ─── Participant ──────────────────────────────────────────────────────────────
const participantDocId = ref(null)
const participantName = ref('')

// ─── AR config ────────────────────────────────────────────────────────────────
const configMarkers = ref([])
const allObjects = ref([])
const allQuests = ref([])

// ─── Calibration ─────────────────────────────────────────────────────────────
const markersDetected = ref(new Set())
const cameraHeightSamples = []
const cameraHeight = ref(0)

// ─── Interaction ─────────────────────────────────────────────────────────────
const selectedObject = ref(null)
const selectedQuest = ref(null)
const showInfo = ref(false)
const completedQuestIds = ref(new Set())
const isSaving = ref(false)

// ─── Computed ─────────────────────────────────────────────────────────────────
const questProgress = computed(() =>
  allQuests.value.length ? (completedQuestIds.value.size / allQuests.value.length) * 100 : 0
)

// ─── Config helpers ───────────────────────────────────────────────────────────
const getObjectsForMarker = (val) => allObjects.value.filter((o) => o.markerValue === val)
const getQuestsForMarker = (val) =>
  allQuests.value.filter((q) => q.markerValue === val && !completedQuestIds.value.has(q.id))

// ─── A-Frame dynamic loader ───────────────────────────────────────────────────
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    const timeout = setTimeout(() => reject(new Error(`Timeout loading: ${src}`)), 20000)
    s.onload = () => { clearTimeout(timeout); resolve() }
    document.head.appendChild(s)
  })

const loadAFrame = async () => {
  if (!window.AFRAME) {
    console.log('[AR] Loading A-Frame...')
    await loadScript('https://aframe.io/releases/1.4.0/aframe.min.js')
    console.log('[AR] A-Frame loaded, AFRAME:', !!window.AFRAME)
  } else {
    console.log('[AR] A-Frame already present')
  }
  console.log('[AR] Loading AR.js...')
  await loadScript('https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/aframe/build/aframe-ar.min.js')
  console.log('[AR] AR.js loaded, setting aframeLoaded=true')
  aframeLoaded.value = true
}

// ─── AR config loader ─────────────────────────────────────────────────────────
const loadARConfig = async () => {
  const config = await fetch('/ar-config.json').then((r) => r.json())
  const active = config.configs[config.activeConfig]
  configMarkers.value = active.markers || []
  allObjects.value = active.arObjects || []
  allQuests.value = config.quests || []
}

// ─── Firebase validation + bootstrap ─────────────────────────────────────────
const validateAndLoad = async () => {
  const idCode = route.params.id_code?.toLowerCase?.()
  if (!idCode) {
    authError.value = 'No ID code provided.'
    appState.value = 'invalid'
    return
  }

  // Admin bypass — skip ticket validation when running locally or logged in as admin
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.devtunnels.ms')
  const adminUser = localStorage.getItem('user')
  if (isLocalhost || adminUser) {
    if (adminUser) {
      try {
        const parsed = JSON.parse(adminUser)
        participantName.value = parsed.displayName || parsed.email || 'Admin'
      } catch {
        participantName.value = 'Admin (dev)'
      }
    } else {
      participantName.value = 'Dev Preview'
    }
    await Promise.all([loadARConfig(), loadAFrame()])
    buildARScene()
    appState.value = 'calibrating'
    setupMarkerListeners()
    return
  }

  try {
    const snap = await getDocs(
      query(collection(reunion_db, 'participants_2026'), where('id_code', '==', idCode))
    )
    if (snap.empty) {
      authError.value = 'Invalid ID code. Check your ticket email.'
      appState.value = 'invalid'
      return
    }
    const docSnap = snap.docs[0]
    participantDocId.value = docSnap.id
    const data = docSnap.data()
    participantName.value = data.fullname || 'Guest'

    // Restore saved AR progress
    if (data.ar_progress?.completedQuests) {
      completedQuestIds.value = new Set(data.ar_progress.completedQuests)
    }

    // Load config and A-Frame libraries in parallel
    await Promise.all([loadARConfig(), loadAFrame()])
    buildARScene()
    appState.value = 'calibrating'
    setupMarkerListeners()
  } catch (err) {
    console.error('AR init error:', err)
    authError.value = err?.message || 'Something went wrong. Please try again.'
    appState.value = 'invalid'
  }
}

const saveProgress = async () => {
  if (!participantDocId.value) return
  isSaving.value = true
  try {
    await updateDoc(doc(reunion_db, 'participants_2026', participantDocId.value), {
      ar_progress: {
        completedQuests: Array.from(completedQuestIds.value),
        lastUpdated: serverTimestamp()
      }
    })
  } catch (err) {
    console.error('Failed to save AR progress:', err)
  } finally {
    isSaving.value = false
  }
}

// ─── AR scene (DOM-based, bypasses Vue rendering to fix markersAreaEnabled) ─────
let arSceneEl = null

const buildARScene = () => {
  const existing = document.getElementById('ar-main-scene')
  if (existing) existing.remove()

  const scene = document.createElement('a-scene')
  scene.id = 'ar-main-scene'
  // Use screen dimensions (not window.inner*) so the canvas covers the full screen
  // including any area hidden by the browser address bar or safe-area insets.
  const W = window.screen.width
  const H = window.screen.height
  scene.setAttribute('arjs', `sourceType: webcam; detectionMode: mono_and_matrix; matrixCodeType: 3x3_HAMMING63; debugUIEnabled: false; displayWidth: ${W}; displayHeight: ${H};`)
  scene.setAttribute('vr-mode-ui', 'enabled: false')
  scene.setAttribute('renderer', 'logarithmicDepthBuffer: true; antialias: false')
  scene.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:1;'

  // ── Hiro test marker ──────────────────────────────────────────────────────
  const hiro = document.createElement('a-marker')
  hiro.setAttribute('preset', 'hiro')
  hiro.setAttribute('emitevents', 'true')
  const hiroBox = document.createElement('a-box')
  hiroBox.setAttribute('position', '0 0.5 0')
  hiroBox.setAttribute('scale', '0.5 0.5 0.5')
  hiroBox.setAttribute('material', 'color: #ff0000')
  hiroBox.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 2000')
  hiro.appendChild(hiroBox)
  const hiroText = document.createElement('a-text')
  hiroText.setAttribute('value', 'HIRO WORKS!')
  hiroText.setAttribute('position', '0 1 0')
  hiroText.setAttribute('align', 'center')
  hiroText.setAttribute('color', '#fff')
  hiroText.setAttribute('width', '4')
  hiro.appendChild(hiroText)
  scene.appendChild(hiro)

  // ── Barcode markers ───────────────────────────────────────────────────────
  configMarkers.value.forEach((marker) => {
    const el = document.createElement('a-marker')
    el.id = `ar-marker-${marker.value}`
    el.setAttribute('type', 'barcode')
    el.setAttribute('value', String(marker.value))
    el.setAttribute('emitevents', 'true')

    getObjectsForMarker(marker.value).forEach((obj) => {
      const entity = document.createElement('a-entity')
      entity.setAttribute('position', obj.localPosition || '0 0.5 0')
      if (obj.scale) entity.setAttribute('scale', obj.scale)
      if (obj.geometry) entity.setAttribute('geometry', obj.geometry)
      if (obj.material) entity.setAttribute('material', obj.material)
      if (obj.animation) entity.setAttribute('animation__rot', obj.animation)
      entity.addEventListener('click', () => onObjectClick(obj))
      el.appendChild(entity)
    })

    getQuestsForMarker(marker.value).forEach((quest) => {
      const entity = document.createElement('a-entity')
      entity.setAttribute('position', quest.localPosition || '0 0.8 0')
      entity.setAttribute('geometry', 'primitive: sphere; radius: 0.3')
      entity.setAttribute('material', 'color: #ff6b35; emissive: #ff6b35; emissiveIntensity: 0.5')
      entity.addEventListener('click', () => onQuestClick(quest))
      el.appendChild(entity)
    })

    scene.appendChild(el)
  })

  // ── Camera ─────────────────────────────────────────────────────────────────
  const camera = document.createElement('a-entity')
  camera.setAttribute('camera', '')
  scene.appendChild(camera)

  document.body.appendChild(scene)
  arSceneEl = scene
  console.log('[AR] Scene appended to body, markers:', configMarkers.value.length)

  // A-Frame's Three.js renderer and AR.js both call setSize() with camera/video dimensions,
  // overriding CSS. Use a MutationObserver to re-enforce screen dimensions any time
  // the canvas style is changed.
  const fixCanvas = () => {
    const canvas = scene.querySelector('canvas')
    if (!canvas) return
    const applySize = () => {
      canvas.style.setProperty('position', 'fixed', 'important')
      canvas.style.setProperty('top', '0', 'important')
      canvas.style.setProperty('left', '0', 'important')
      canvas.style.setProperty('width', W + 'px', 'important')
      canvas.style.setProperty('height', H + 'px', 'important')
      canvas.style.setProperty('max-width', W + 'px', 'important')
      canvas.style.setProperty('max-height', H + 'px', 'important')
    }
    applySize()
    const observer = new MutationObserver(applySize)
    observer.observe(canvas, { attributes: true, attributeFilter: ['style'] })
    setTimeout(() => observer.disconnect(), 10000)
    console.log('[AR] Canvas size enforced at', W, 'x', H)
  }
  scene.addEventListener('loaded', fixCanvas, { once: true })
}

const removeARScene = () => {
  if (arSceneEl) {
    arSceneEl.remove()
    arSceneEl = null
  }
}

// ─── Marker event listeners ───────────────────────────────────────────────────
let listeners = []

const setupMarkerListeners = () => {
  configMarkers.value.forEach((marker) => {
    const el = document.getElementById(`ar-marker-${marker.value}`)
    if (!el) return

    const onFound = () => {
      markersDetected.value = new Set([...markersDetected.value, marker.value])

      // When a floor marker is flat on the ground, its Y position in camera
      // space is negative and its absolute value equals the camera height.
      if (marker.floorMarker) {
        const y = el.object3D?.position?.y
        if (y && y < 0) {
          cameraHeightSamples.push(Math.abs(y))
          cameraHeight.value =
            cameraHeightSamples.reduce((a, b) => a + b, 0) / cameraHeightSamples.length
        }
      }
    }

    el.addEventListener('markerFound', onFound)
    listeners.push({ el, onFound })
  })
}

// ─── Interaction handlers ─────────────────────────────────────────────────────
const onObjectClick = (obj) => {
  selectedObject.value = obj
}
const onQuestClick = (quest) => {
  selectedQuest.value = quest
}
const completeQuest = async (quest) => {
  completedQuestIds.value = new Set([...completedQuestIds.value, quest.id])
  selectedQuest.value = null
  await saveProgress()
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(validateAndLoad)

onUnmounted(() => {
  listeners.forEach(({ el, onFound }) => el?.removeEventListener('markerFound', onFound))
  listeners = []
  removeARScene()
})
</script>

<style scoped>
.ar-root {
  position: fixed;
  inset: 0;
  background: transparent;
  overflow: hidden;
  font-family: Arial, sans-serif;
  z-index: 2; /* above a-scene (z-index: 1) so overlays render on top of camera */
}

/* ── Shared overlay ── */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 24px;
  text-align: center;
}
.overlay.center { background: rgba(0, 0, 0, 0.92); }
.overlay.error h2 { color: #ff6b35; margin-bottom: 8px; }
.overlay.calibration { background: rgba(0, 0, 0, 0.72); backdrop-filter: blur(6px); }

.pill-link {
  margin-top: 20px;
  padding: 10px 28px;
  background: #4cc3d9;
  color: #fff;
  border-radius: 24px;
  text-decoration: none;
  font-weight: bold;
}

/* ── Calibration card ── */
.cal-card {
  text-align: center;
  padding: 28px 24px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  max-width: 300px;
  width: 100%;
}
.cal-card h2 { margin: 0 0 6px; font-size: 1.5rem; }
.hint { font-size: 0.8rem; opacity: 0.6; margin: 0 0 16px; }

.dots { display: flex; justify-content: center; gap: 12px; margin: 12px 0; }
.dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s;
}
.dot--on { background: #4caf50; border-color: #4caf50; box-shadow: 0 0 10px #4caf50; }
.cal-status { font-size: 0.88rem; opacity: 0.8; min-height: 1.3em; }

.btn-go {
  margin-top: 16px;
  width: 100%;
  padding: 12px;
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  cursor: pointer;
}
.btn-skip {
  margin-top: 8px;
  width: 100%;
  padding: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  font-size: 0.8rem;
  cursor: pointer;
}

/* ── Active AR UI ── */
.ar-ui {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
}
.ar-ui > * { pointer-events: auto; }

.top-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 16px;
  border-radius: 24px;
  color: #fff;
  backdrop-filter: blur(8px);
}
.name { font-size: 0.9rem; font-weight: bold; }
.cam-h { font-size: 0.72rem; opacity: 0.5; }
.btn-icon {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  color: #fff;
  cursor: pointer;
  font-size: 0.95rem;
}

.bottom-panel {
  position: absolute;
  bottom: 80px;
  left: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 20px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.bottom-panel h3 { margin-top: 0; color: #4cc3d9; }

.row { display: flex; gap: 10px; margin-top: 12px; }
.btn-complete {
  flex: 1;
  padding: 10px;
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}
.btn-complete:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-close {
  flex: 1;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.progress-wrap {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  height: 36px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #4cc3d9, #4caf50);
  transition: width 0.5s ease;
  border-radius: 18px;
}
.progress-label {
  position: relative;
  width: 100%;
  text-align: center;
  color: #fff;
  font-size: 0.85rem;
  font-weight: bold;
}

/* A-Frame scene lives outside Vue's scope — canvas rules are in global <style> below */

/* ── Spinner ── */
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>

<!-- Global overrides: A-Frame scene + AR.js video injected into document.body, outside Vue's scope -->
<style>
html, body {
  overflow: hidden !important;
  touch-action: none !important;
}
a-scene {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  overflow: hidden !important;
}
.a-canvas {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  display: block !important;
}
#arjs-video,
video.a-src-video {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  object-fit: cover !important;
  z-index: 0 !important;
}
</style>
