<template>
  <div ref="pageRef" class="gm-page">
    <div class="gm-starfield" aria-hidden="true"></div>

    <!-- ── Top bar ── -->
    <div class="gm-bar">
      <RouterLink to="/" class="gm-back">←</RouterLink>
      <span class="gm-title">The Sound of Reunion {{ REUNION_FESTIVAL.year }}</span>

      <!-- Search -->
      <div class="gm-search-wrap">
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          class="gm-search"
          placeholder="Search artist or genre…"
          autocomplete="off"
          @input="onSearch"
          @blur="onSearchBlur"
        />
      </div>

      <!-- Day filter -->
      <div class="gm-days">
        <button :class="['gm-day', { active: activeDay === null }]" @click="setDay(null)">All</button>
        <button
          v-for="d in availableDays"
          :key="d.key"
          :class="['gm-day', { active: activeDay === d.key }]"
          @click="setDay(d.key)"
        >{{ d.label }}</button>
      </div>

      <!-- Label toggles -->
      <div class="gm-label-toggles">
        <button
          :class="['gm-label-toggle', { active: showGenreLabels }]"
          @click="showGenreLabels = !showGenreLabels"
          title="Toggle genre / subgenre labels"
        >Genres</button>
        <button
          :class="['gm-label-toggle', { active: showArtistLabels }]"
          @click="showArtistLabels = !showArtistLabels"
          title="Toggle artist name labels"
        >Artists</button>
      </div>

      <button class="gm-intro-open" title="Open intro slides" @click="openIntroModal">Intro</button>

      <!-- Action buttons -->
      <div class="gm-actions">
        <button class="gm-icon-btn gm-help-btn" title="How this map works" @click="openIntroModal">?</button>
        <button class="gm-icon-btn" title="Screenshot" @click="doScreenshot">📸</button>
        <button class="gm-icon-btn" title="Reset camera" @click="doReset">⟳</button>
      </div>
    </div>

    <!-- ── Search dropdown (Teleported to escape bar overflow clipping) ── -->
    <Teleport to="body">
      <div
        v-if="searchResults.length && searchQuery.trim()"
        class="gm-dropdown-portal"
        :style="dropdownStyle"
      >
        <div
          v-for="r in searchResults"
          :key="r.id"
          class="gm-dropdown-item"
          @mousedown.prevent="selectResult(r)"
        >
          <span class="gm-dropdown-icon">{{ r.tier === 'artist' ? '👤' : r.tier === 'pillar' ? '⬟' : '◆' }}</span>
          {{ r.label }}
          <span v-if="r.tier === 'artist' && r.artist?.genre" class="gm-dropdown-sub">{{ r.artist.genre }}</span>
        </div>
      </div>
    </Teleport>

    <!-- ── Canvas ── -->
    <div ref="graphContainer" class="gm-canvas">

      <!-- Stats overlay (top-right of canvas) -->
      <div class="gm-stats" v-if="!loading && graphData.nodes.length">
        {{ artistCount }} artists ·
        {{ subgenreCount }} subgenres ·
        {{ PILLARS.length }} families
        <span v-if="activeDay"> · {{ activeDayLabel }}</span>
      </div>

    </div>

    <!-- ── Legend — outside canvas so WebGL stacking context can't bury it ── -->
    <div class="gm-legend" v-if="!loading && !error">
      <div v-for="p in PILLARS" :key="p.id" class="gm-legend-row">
        <span class="gm-dot" :style="{ background: p.color }"></span>
        <span>{{ p.label }}</span>
      </div>
      <div class="gm-legend-row">
        <span class="gm-dot" style="background:#636E72"></span>
        <span>Other</span>
      </div>
      <div class="gm-legend-tiers">
        <span class="gm-tier"><span class="gm-tier-dot gm-td-pillar"></span> Family</span>
        <span class="gm-tier"><span class="gm-tier-dot gm-td-sub"></span> Subgenre</span>
        <span class="gm-tier"><span class="gm-tier-dot gm-td-artist"></span> Artist</span>
      </div>
    </div>

    <!-- ── Physics — outside canvas so WebGL stacking context can't bury it ── -->
    <div class="gm-physics">
      <button class="gm-physics-toggle" @click="showPhysics = !showPhysics">
        ⚙ {{ showPhysics ? '▲' : '▼' }}
      </button>
      <div v-if="showPhysics" class="gm-physics-body">
        <label class="gm-slider-row">
          <span class="gm-slider-label">Repulsion</span>
          <input type="range" v-model.number="chargeStrength" min="-600" max="-10" step="10" @input="applyPhysics" />
          <span class="gm-slider-val">{{ chargeStrength }}</span>
        </label>
        <label class="gm-slider-row">
          <span class="gm-slider-label">Link dist</span>
          <input type="range" v-model.number="linkDistance" min="10" max="300" step="5" @input="applyPhysics" />
          <span class="gm-slider-val">{{ linkDistance }}</span>
        </label>
        <label class="gm-slider-row">
          <span class="gm-slider-label">Link pull</span>
          <input type="range" v-model.number="linkStrength" min="0" max="2" step="0.05" @input="applyPhysics" />
          <span class="gm-slider-val">{{ linkStrength.toFixed(2) }}</span>
        </label>
        <label class="gm-slider-row">
          <span class="gm-slider-label">Friction</span>
          <input type="range" v-model.number="velocityDecay" min="0.05" max="0.95" step="0.05" @input="applyPhysics" />
          <span class="gm-slider-val">{{ velocityDecay.toFixed(2) }}</span>
        </label>
        <label class="gm-slider-row">
          <span class="gm-slider-label">Gravity</span>
          <input type="range" v-model.number="gravityStrength" min="0" max="0.5" step="0.01" @input="applyPhysics" />
          <span class="gm-slider-val">{{ gravityStrength.toFixed(2) }}</span>
        </label>
        <div class="gm-physics-actions">
          <button class="gm-reset-physics" @click="resetPhysics">Reset</button>
          <button class="gm-reheat" @click="reheat">↺ Reheat</button>
        </div>
      </div>
    </div>

    <!-- ── Loading overlay ── -->
    <div v-if="loading" class="gm-loading">
      <div class="gm-spinner"></div>
      <p>Loading genre map…</p>
    </div>

    <!-- ── Error overlay ── -->
    <div v-if="error && !loading" class="gm-error">
      <p>⚠ {{ error }}</p>
      <button @click="reload">Retry</button>
    </div>

    <!-- ── Hover tooltip (Teleported so it clears all z-index stacks) ── -->
    <Teleport to="body">
      <div
        v-if="hoveredNode && !focusedNode"
        class="gm-tooltip"
        :style="{ left: tipX + 'px', top: tipY + 'px' }"
      >
        <div class="gm-tip-name">{{ hoveredNode.label }}</div>
        <div class="gm-tip-sub">
          <template v-if="hoveredNode.tier === 'artist'">
            {{ hoveredNode.artist?.genre || '—' }}
            <span v-if="hoveredNode.artist?.act_type"> · {{ hoveredNode.artist.act_type }}</span>
          </template>
          <template v-else-if="hoveredNode.tier === 'pillar'">Genre Family</template>
          <template v-else>Subgenre</template>
        </div>
      </div>
    </Teleport>

    <!-- ── Focus panel ── -->
    <Transition name="gm-panel-slide">
      <div v-if="focusedNode" class="gm-panel">
        <button class="gm-panel-close" @click="doClose">×</button>

        <!-- Artist -->
        <template v-if="focusedNode.tier === 'artist'">
          <p class="gm-panel-eyebrow">Artist</p>
          <h2 class="gm-panel-name">{{ focusedNode.label }}</h2>
          <p v-if="focusedNode.artist?.act_type" class="gm-panel-meta">{{ focusedNode.artist.act_type }}</p>
          <button
            v-if="focusedNode.artist?.genre"
            class="gm-panel-tag gm-panel-tag-btn"
            :style="{ borderColor: focusedNode.color, color: focusedNode.color }"
            @click="focusArtistGenre(focusedNode.artist.genre)"
          >
            {{ focusedNode.artist.genre }}
          </button>
          <p v-if="focusedNode.artist?.act_description" class="gm-panel-bio">
            {{ truncate(focusedNode.artist.act_description, 240) }}
          </p>
          <div class="gm-panel-links">
            <a v-if="focusedNode.artist?.mix_track_url" :href="focusedNode.artist.mix_track_url" target="_blank" rel="noopener" class="gm-panel-link">🎧 Listen</a>
            <a v-if="focusedNode.artist?.social_url"    :href="focusedNode.artist.social_url"    target="_blank" rel="noopener" class="gm-panel-link">🔗 Socials</a>
          </div>
        </template>

        <!-- Pillar -->
        <template v-else-if="focusedNode.tier === 'pillar'">
          <p class="gm-panel-eyebrow">Genre Family</p>
          <h2 class="gm-panel-name" :style="{ color: focusedNode.color }">{{ focusedNode.label }}</h2>
          <div class="gm-panel-origin" v-if="focusedNode.origin">
            <span>📍 {{ focusedNode.origin }}</span>
            <span v-if="focusedNode.era"> · {{ focusedNode.era }}</span>
          </div>
          <div class="gm-panel-bpm" v-if="focusedNode.bpm">
            <span class="gm-panel-bpm-label">BPM</span> {{ focusedNode.bpm }}
          </div>
          <p v-if="focusedNode.description" class="gm-panel-bio">{{ focusedNode.description }}</p>
          <div v-if="focusedNode.dna" class="gm-panel-dna">
            <span class="gm-panel-dna-label">DNA</span> {{ focusedNode.dna }}
          </div>
          <div v-if="pillarConnections(focusedNode.id).length" class="gm-panel-connections">
            <div class="gm-panel-conn-title">Connected Genres</div>
            <div v-for="conn in pillarConnections(focusedNode.id)" :key="conn.otherId" class="gm-panel-conn-row">
              <span class="gm-panel-conn-dot" :style="{ background: conn.color }"></span>
              <button class="gm-panel-conn-link" @click="focusNodeById(conn.otherId)">{{ conn.label }}</button>
              <span class="gm-panel-conn-dna">{{ conn.dna }}</span>
            </div>
          </div>
          <div v-if="focusedPillarArtists.length" class="gm-panel-connections">
            <div class="gm-panel-conn-title">Connected Artists ({{ focusedPillarArtists.length }})</div>
            <div v-for="artistNode in focusedPillarArtists" :key="artistNode.id" class="gm-panel-conn-row">
              <span class="gm-panel-conn-dot" :style="{ background: artistNode.color || '#7adfff' }"></span>
              <button class="gm-panel-conn-link" @click="focusNodeById(artistNode.id)">{{ artistNode.label }}</button>
              <span v-if="artistNode.artist?.act_type" class="gm-panel-conn-dna">{{ artistNode.artist.act_type }}</span>
            </div>
          </div>
        </template>

        <!-- Subgenre -->
        <template v-else-if="focusedNode.tier === 'subgenre'">
          <p class="gm-panel-eyebrow">Subgenre</p>
          <h2 class="gm-panel-name" :style="{ color: focusedNode.color }">{{ focusedNode.label }}</h2>
          <div v-if="focusedNode.pillar" class="gm-panel-origin">
            <span class="gm-panel-conn-dot" :style="{ background: focusedNode.color }"></span>
            <span>Part of</span>
            <button class="gm-panel-conn-link" @click="focusNodeById(focusedNode.pillar)">
              {{ PILLAR_MAP[focusedNode.pillar]?.label || focusedNode.pillar }}
            </button>
          </div>
          <div class="gm-panel-bpm" v-if="focusedNode.bpm">
            <span class="gm-panel-bpm-label">BPM</span> {{ focusedNode.bpm }}
          </div>
          <p v-if="focusedNode.description" class="gm-panel-bio">{{ focusedNode.description }}</p>
          <div v-if="focusedSubgenreArtists.length" class="gm-panel-connections">
            <div class="gm-panel-conn-title">Connected Artists ({{ focusedSubgenreArtists.length }})</div>
            <div v-for="artistNode in focusedSubgenreArtists" :key="artistNode.id" class="gm-panel-conn-row">
              <span class="gm-panel-conn-dot" :style="{ background: artistNode.color || '#7adfff' }"></span>
              <button class="gm-panel-conn-link" @click="focusNodeById(artistNode.id)">{{ artistNode.label }}</button>
              <span v-if="artistNode.artist?.act_type" class="gm-panel-conn-dna">{{ artistNode.artist.act_type }}</span>
            </div>
          </div>
        </template>
      </div>
    </Transition>

    <!-- ── Intro Slides ── -->
    <Teleport to="body">
      <Transition name="gm-intro-fade">
        <div v-if="showIntroModal" class="gm-intro-overlay" @click.self="closeIntroModal">
          <div class="gm-intro-card">
            <button class="gm-intro-close" @click="closeIntroModal">×</button>

            <div class="gm-intro-icon" aria-hidden="true">{{ INTRO_SLIDES[introStep].icon }}</div>
            <h2 class="gm-intro-title">{{ INTRO_SLIDES[introStep].title }}</h2>
            <p class="gm-intro-body">{{ INTRO_SLIDES[introStep].body }}</p>

            <div class="gm-intro-dots">
              <button
                v-for="(_, i) in INTRO_SLIDES"
                :key="i"
                class="gm-intro-dot"
                :class="{ 'active': i === introStep }"
                @click="introStep = i"
              ></button>
            </div>

            <div class="gm-intro-actions">
              <button
                v-if="introStep > 0"
                class="gm-intro-btn gm-intro-btn-ghost"
                @click="introPrev"
              >← Back</button>
              <span v-else></span>

              <button class="gm-intro-btn gm-intro-btn-primary" @click="introNext">
                {{ introStep < INTRO_SLIDES.length - 1 ? 'Next →' : 'Launch Map' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useReunionGenreGraphData } from '@/composables/useReunionGenreGraphData'
import { useReunionGenreGraph3D }    from '@/composables/useReunionGenreGraph3D'
import { PILLARS, PILLAR_MAP, PILLAR_BRIDGES, resolveGenreToNodeId } from '@/config/reunionGenreTaxonomy'
import { REUNION_FESTIVAL } from '@/config/festivalConfig'

const route = useRoute()
const INTRO_STORAGE_KEY = 'reunion_genre_map_intro_seen_2026'
const INTRO_SLIDES = [
  {
    icon: '✦',
    title: 'Welcome to the Genre Map',
    body: 'Explore how artists connect across genre families, subgenres, and shared musical DNA.',
  },
  {
    icon: '◌',
    title: 'Move Through The Galaxy',
    body: 'Drag to orbit, scroll to zoom, and click any node to focus details in the panel below.',
  },
  {
    icon: '⟐',
    title: 'Tune What You See',
    body: 'Filter by day, search artists or genres, and toggle label layers for cleaner exploration.',
  },
  {
    icon: '⚙',
    title: 'Shape The Physics',
    body: 'Use the physics controls to rebalance cluster spacing, then reset anytime with one click.',
  },
]

const pageRef         = ref(null)
const graphContainer  = ref(null)
const searchInputRef  = ref(null)
const searchQuery     = ref('')
const searchResults   = ref([])
const dropdownStyle   = ref({})
const activeDay       = ref(null)
const showPhysics     = ref(true)
const DEFAULT_PHYSICS = Object.freeze({
  chargeStrength: -150,
  linkDistance: 60,
  linkStrength: 1,
  velocityDecay: 0.4,
  gravityStrength: 0.05,
})

const chargeStrength  = ref(DEFAULT_PHYSICS.chargeStrength)
const linkDistance    = ref(DEFAULT_PHYSICS.linkDistance)
const linkStrength    = ref(DEFAULT_PHYSICS.linkStrength)
const velocityDecay   = ref(DEFAULT_PHYSICS.velocityDecay)
const gravityStrength = ref(DEFAULT_PHYSICS.gravityStrength)
const tipX            = ref(0)
const tipY            = ref(0)
const showIntroModal  = ref(false)
const introStep       = ref(0)
let starParallaxRaf   = null

// ── Composables ────────────────────────────────────────────────────────────────
const {
  loading, error, graphData, fetchArtists, getAvailableDays, filterByDay,
} = useReunionGenreGraphData()

const {
  graphInstance, hoveredNode, focusedNode,
  showGenreLabels, showArtistLabels,
  initGraph, updateGraphData, updatePhysics,
  focusNodeById, clearFocus, takeScreenshot, resize, destroy,
} = useReunionGenreGraph3D()

// ── Computed ───────────────────────────────────────────────────────────────────
const availableDays  = computed(() => getAvailableDays())
const activeDayLabel = computed(() => availableDays.value.find(d => d.key === activeDay.value)?.label)
const artistCount    = computed(() => graphData.value.nodes.filter(n => n.tier === 'artist').length)
const subgenreCount  = computed(() => graphData.value.nodes.filter(n => n.tier === 'subgenre').length)

// ── Helpers ─────────────────────────────────────────────────────────────────────
const truncate = (str, max) =>
  str && str.length > max ? str.slice(0, max) + '…' : str

// ── Search ──────────────────────────────────────────────────────────────────────
const computeDropdownPos = () => {
  if (!searchInputRef.value) return
  const rect = searchInputRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top:      rect.bottom + 4 + 'px',
    left:     rect.left   + 'px',
    width:    rect.width  + 'px',
    zIndex:   9998,
  }
}

const onSearch = () => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) { searchResults.value = []; return }
  searchResults.value = graphData.value.nodes
    .filter(n => n.label?.toLowerCase().includes(q))
    .slice(0, 8)
  computeDropdownPos()
}

const onSearchBlur = () => {
  // Small delay to let mousedown fire on dropdown items first
  setTimeout(() => { searchResults.value = [] }, 150)
}

// ── Genre connections helper (for pillar focus panel) ───────────────────────────
const pillarConnections = (pillarId) => {
  return PILLAR_BRIDGES
    .filter(b => b.source === pillarId || b.target === pillarId)
    .map(b => {
      const otherId = b.source === pillarId ? b.target : b.source
      const other   = PILLAR_MAP[otherId]
      return { otherId, label: other?.label || otherId, color: other?.color || '#888', dna: b.dna }
    })
}

const readNodeId = (nodeRef) => (typeof nodeRef === 'object' && nodeRef !== null ? nodeRef.id : nodeRef)

const linkedArtistsForTargets = (targetIds) => {
  const targets = new Set(targetIds)
  const artistIds = new Set()

  graphData.value.links.forEach(link => {
    const src = readNodeId(link.source)
    const dst = readNodeId(link.target)
    if (targets.has(dst) && typeof src === 'string' && src.startsWith('artist_')) artistIds.add(src)
    if (targets.has(src) && typeof dst === 'string' && dst.startsWith('artist_')) artistIds.add(dst)
  })

  const byId = new Map(graphData.value.nodes.map(n => [n.id, n]))
  return [...artistIds]
    .map(id => byId.get(id))
    .filter(Boolean)
    .sort((a, b) => (a.label || '').localeCompare(b.label || ''))
}

const linkedArtistsForPillar = (pillarId) => {
  const subgenreIds = graphData.value.nodes
    .filter(n => n.tier === 'subgenre' && n.pillar === pillarId)
    .map(n => n.id)
  return linkedArtistsForTargets([pillarId, ...subgenreIds])
}

const linkedArtistsForSubgenre = (subgenreId) => linkedArtistsForTargets([subgenreId])

const focusArtistGenre = (genreLabel) => {
  const targetId = resolveGenreToNodeId(genreLabel)
  if (targetId) focusNodeById(targetId)
}

const focusedPillarArtists = computed(() => {
  if (focusedNode.value?.tier !== 'pillar') return []
  return linkedArtistsForPillar(focusedNode.value.id)
})

const focusedSubgenreArtists = computed(() => {
  if (focusedNode.value?.tier !== 'subgenre') return []
  return linkedArtistsForSubgenre(focusedNode.value.id)
})

const selectResult = (node) => {
  searchQuery.value   = ''
  searchResults.value = []
  focusNodeById(node.id)
}

// ── Day filter ──────────────────────────────────────────────────────────────────
const setDay = (key) => {
  activeDay.value = key
  filterByDay(key)
}

// ── Physics ─────────────────────────────────────────────────────────────────────
const applyPhysics = () =>
  updatePhysics({
    chargeStrength: chargeStrength.value,
    linkDistance:   linkDistance.value,
    linkStrength:   linkStrength.value,
    velocityDecay:  velocityDecay.value,
    gravityStrength: gravityStrength.value,
  })

const reheat = () => {
  if (graphInstance.value) graphInstance.value.d3ReheatSimulation()
}

const openIntroModal = () => {
  introStep.value = 0
  showIntroModal.value = true
}

const closeIntroModal = () => {
  showIntroModal.value = false
  localStorage.setItem(INTRO_STORAGE_KEY, '1')
}

const introNext = () => {
  if (introStep.value < INTRO_SLIDES.length - 1) {
    introStep.value += 1
  } else {
    closeIntroModal()
  }
}

const introPrev = () => {
  if (introStep.value > 0) introStep.value -= 1
}

const resetPhysics = () => {
  chargeStrength.value  = DEFAULT_PHYSICS.chargeStrength
  linkDistance.value    = DEFAULT_PHYSICS.linkDistance
  linkStrength.value    = DEFAULT_PHYSICS.linkStrength
  velocityDecay.value   = DEFAULT_PHYSICS.velocityDecay
  gravityStrength.value = DEFAULT_PHYSICS.gravityStrength
  applyPhysics()
}

// ── Actions ──────────────────────────────────────────────────────────────────────
const doScreenshot = () => takeScreenshot()
const doReset      = () => clearFocus({ resetCamera: true })
const doClose      = () => clearFocus()
const reload       = () => fetchArtists()

// ── Mouse tracking (for tooltip position) ────────────────────────────────────────
const onMouseMove = (e) => {
  tipX.value = e.clientX + 15
  tipY.value = e.clientY + 12

  if (!pageRef.value) return
  const nx = (e.clientX / window.innerWidth - 0.5) * 2
  const ny = (e.clientY / window.innerHeight - 0.5) * 2
  pageRef.value.style.setProperty('--gm-parallax-x', `${(nx * 18).toFixed(2)}px`)
  pageRef.value.style.setProperty('--gm-parallax-y', `${(ny * 14).toFixed(2)}px`)
}

const updateStarParallaxFromCamera = () => {
  const page = pageRef.value
  const graph = graphInstance.value
  if (page && graph && typeof graph.camera === 'function') {
    const camera = graph.camera()
    const pos = camera?.position
    if (pos) {
      // Move stars opposite camera XY so they feel anchored to the same 3D world.
      const worldX = (-pos.x * 0.055).toFixed(2)
      const worldY = (-pos.y * 0.055).toFixed(2)
      const zoom = Math.max(0.9, Math.min(1.15, 600 / Math.max(300, pos.z || 600))).toFixed(3)
      page.style.setProperty('--gm-star-world-x', `${worldX}px`)
      page.style.setProperty('--gm-star-world-y', `${worldY}px`)
      page.style.setProperty('--gm-star-zoom', zoom)
    }
  }
  starParallaxRaf = requestAnimationFrame(updateStarParallaxFromCamera)
}

// ── Window resize ────────────────────────────────────────────────────────────────
const onResize = () => {
  if (graphContainer.value) {
    resize(graphContainer.value.clientWidth, graphContainer.value.clientHeight)
  }
}

// ── Graph init/update ─────────────────────────────────────────────────────────────
// Track whether the graph has been initialized so we know to call init vs update
let graphReady = false

watch(graphData, async (newData) => {
  if (!newData.nodes.length || !graphContainer.value) return

  if (!graphReady) {
    graphReady = true
    await initGraph(graphContainer.value, newData, {
      chargeStrength: chargeStrength.value,
      linkDistance:   linkDistance.value,
    })
    // Auto-focus artist if ?id=<id_code> is in the URL
    const idCode = route.query.id_code
    if (idCode) {
      setTimeout(() => focusNodeById(`artist_${idCode}`), 1200)
    }
  } else {
    updateGraphData(newData)
  }
})

// ── Lifecycle ────────────────────────────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('resize',    onResize)
  await fetchArtists()
  updateStarParallaxFromCamera()
  if (!localStorage.getItem(INTRO_STORAGE_KEY)) openIntroModal()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize',    onResize)
  if (starParallaxRaf) cancelAnimationFrame(starParallaxRaf)
  destroy()
})
</script>

<style scoped>
/* ─── Root ──────────────────────────────────────────────────────────────────── */
.gm-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #02040b;
  color: #eaf3ff;
  font-family: 'Space Grotesk', 'Avenir Next', 'Segoe UI', sans-serif;
  overflow: hidden;
  --gm-bar-h: 52px;   /* updated at mobile breakpoint */
  --gm-accent: #61d5ff;
  --gm-accent-soft: #8ce6ff;
  --gm-ink: #eaf3ff;
  --gm-muted: #9bb2c9;
  --gm-panel-bg: rgba(7, 14, 29, 0.88);
  --gm-parallax-x: 0px;
  --gm-parallax-y: 0px;
  --gm-star-world-x: 0px;
  --gm-star-world-y: 0px;
  --gm-star-zoom: 1;
  isolation: isolate;
}

.gm-starfield {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  opacity: 0.96;
  mix-blend-mode: normal;
  overflow: hidden;
}

.gm-starfield::before,
.gm-starfield::after {
  content: '';
  position: absolute;
  inset: -12%;
  pointer-events: none;
  will-change: transform;
}

.gm-starfield::before {
  width: 2px;
  height: 2px;
  background: transparent;
  box-shadow:
    2vw 7vh 0 0 rgba(228, 243, 255, 0.65), 8vw 81vh 0 0 rgba(212, 231, 250, 0.55),
    11vw 34vh 0 0 rgba(234, 247, 255, 0.58), 15vw 58vh 0 0 rgba(205, 225, 246, 0.52),
    19vw 13vh 0 0 rgba(231, 244, 255, 0.64), 23vw 91vh 0 0 rgba(199, 221, 244, 0.48),
    27vw 43vh 0 0 rgba(220, 238, 255, 0.57), 31vw 22vh 0 0 rgba(234, 247, 255, 0.63),
    34vw 69vh 0 0 rgba(205, 224, 246, 0.5), 38vw 9vh 0 0 rgba(229, 242, 255, 0.62),
    41vw 52vh 0 0 rgba(196, 219, 242, 0.49), 45vw 87vh 0 0 rgba(224, 240, 255, 0.59),
    49vw 28vh 0 0 rgba(212, 231, 251, 0.53), 53vw 75vh 0 0 rgba(236, 248, 255, 0.61),
    56vw 17vh 0 0 rgba(207, 227, 247, 0.5), 59vw 39vh 0 0 rgba(225, 241, 255, 0.6),
    63vw 95vh 0 0 rgba(198, 220, 243, 0.48), 67vw 61vh 0 0 rgba(233, 246, 255, 0.62),
    71vw 6vh 0 0 rgba(214, 232, 251, 0.55), 74vw 47vh 0 0 rgba(229, 243, 255, 0.58),
    78vw 83vh 0 0 rgba(201, 223, 245, 0.5), 82vw 25vh 0 0 rgba(236, 249, 255, 0.62),
    85vw 56vh 0 0 rgba(210, 229, 249, 0.53), 89vw 14vh 0 0 rgba(225, 241, 255, 0.6),
    93vw 72vh 0 0 rgba(198, 220, 243, 0.47), 97vw 38vh 0 0 rgba(231, 244, 255, 0.63),
    5vw 49vh 0 0 rgba(213, 232, 252, 0.56), 13vw 67vh 0 0 rgba(226, 241, 255, 0.57),
    22vw 4vh 0 0 rgba(198, 222, 246, 0.46), 29vw 88vh 0 0 rgba(232, 246, 255, 0.61),
    36vw 30vh 0 0 rgba(207, 227, 248, 0.52), 44vw 63vh 0 0 rgba(228, 242, 255, 0.59),
    52vw 11vh 0 0 rgba(216, 234, 252, 0.56), 61vw 78vh 0 0 rgba(235, 248, 255, 0.63),
    69vw 33vh 0 0 rgba(202, 224, 246, 0.49), 76vw 54vh 0 0 rgba(227, 242, 255, 0.58),
    84vw 2vh 0 0 rgba(214, 232, 251, 0.54), 91vw 66vh 0 0 rgba(233, 247, 255, 0.62),
    96vw 19vh 0 0 rgba(205, 226, 248, 0.5), 14vw 96vh 0 0 rgba(223, 239, 255, 0.57),
    26vw 73vh 0 0 rgba(210, 230, 250, 0.53), 37vw 85vh 0 0 rgba(234, 247, 255, 0.62),
    48vw 97vh 0 0 rgba(197, 220, 244, 0.48), 58vw 90vh 0 0 rgba(226, 241, 255, 0.58),
    68vw 99vh 0 0 rgba(212, 231, 251, 0.54), 79vw 94vh 0 0 rgba(233, 246, 255, 0.62),
    88vw 92vh 0 0 rgba(201, 223, 246, 0.49), 95vw 97vh 0 0 rgba(228, 242, 255, 0.59);
  animation: gmStarDriftNear 220s linear infinite;
}

.gm-starfield::after {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  opacity: 0.72;
  background: transparent;
  filter: none;
  box-shadow:
    4vw 18vh 0 0 rgba(240, 250, 255, 0.48), 17vw 45vh 0 0 rgba(221, 238, 255, 0.42),
    25vw 79vh 0 0 rgba(245, 252, 255, 0.45), 33vw 12vh 0 0 rgba(215, 234, 252, 0.38),
    42vw 66vh 0 0 rgba(238, 249, 255, 0.44), 51vw 37vh 0 0 rgba(222, 239, 255, 0.4),
    57vw 84vh 0 0 rgba(244, 252, 255, 0.46), 65vw 21vh 0 0 rgba(217, 235, 253, 0.38),
    73vw 58vh 0 0 rgba(240, 250, 255, 0.45), 81vw 8vh 0 0 rgba(220, 237, 255, 0.4),
    90vw 49vh 0 0 rgba(246, 253, 255, 0.46), 12vw 28vh 0 0 rgba(214, 233, 252, 0.38),
    20vw 62vh 0 0 rgba(238, 249, 255, 0.44), 30vw 95vh 0 0 rgba(221, 239, 255, 0.4),
    39vw 41vh 0 0 rgba(245, 252, 255, 0.47), 47vw 72vh 0 0 rgba(216, 235, 253, 0.39),
    55vw 5vh 0 0 rgba(239, 250, 255, 0.44), 64vw 93vh 0 0 rgba(223, 239, 255, 0.41),
    72vw 31vh 0 0 rgba(246, 253, 255, 0.47), 80vw 74vh 0 0 rgba(218, 236, 253, 0.39),
    87vw 15vh 0 0 rgba(240, 250, 255, 0.44), 94vw 82vh 0 0 rgba(221, 238, 255, 0.4);
  animation: gmStarDriftFar 320s linear infinite;
}

@keyframes gmStarDriftNear {
  from {
    transform: translate3d(var(--gm-star-world-x), var(--gm-star-world-y), 0) scale(var(--gm-star-zoom));
  }
  to {
    transform: translate3d(calc(var(--gm-star-world-x) - 42px), calc(var(--gm-star-world-y) - 28px), 0) scale(var(--gm-star-zoom));
  }
}

@keyframes gmStarDriftFar {
  from {
    transform: translate3d(calc(var(--gm-star-world-x) * 0.7), calc(var(--gm-star-world-y) * 0.7), 0) scale(calc(var(--gm-star-zoom) * 0.96));
  }
  to {
    transform: translate3d(calc(var(--gm-star-world-x) * 0.7 + 30px), calc(var(--gm-star-world-y) * 0.7 - 22px), 0) scale(calc(var(--gm-star-zoom) * 0.96));
  }
}


.gm-bar,
.gm-loading,
.gm-error,
.gm-legend,
.gm-physics,
.gm-panel {
  position: relative;
  z-index: 6;
}

/* ─── Top bar ────────────────────────────────────────────────────────────────── */
.gm-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.75rem;
  height: 52px;
  background: linear-gradient(90deg, rgba(7, 13, 26, 0.9), rgba(8, 20, 35, 0.92));
  border-bottom: 1px solid rgba(97, 213, 255, 0.35);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  z-index: 20;
  flex-shrink: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}
.gm-bar::-webkit-scrollbar { display: none; }

.gm-back {
  color: var(--gm-accent);
  text-decoration: none;
  font-size: 1.1rem;
  flex-shrink: 0;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
}
.gm-back:hover { background: rgba(97, 213, 255, 0.14); color: #d6f3ff; }

.gm-title {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gm-accent-soft);
  text-shadow: 0 0 10px rgba(97, 213, 255, 0.22);
  flex-shrink: 0;
  margin: 0;
}

/* Search */
.gm-search-wrap {
  position: relative;
  flex: 1;
  min-width: 120px;
  max-width: 260px;
}
.gm-search {
  width: 100%;
  padding: 0.32rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(97, 213, 255, 0.45);
  background: rgba(8, 19, 35, 0.82);
  color: var(--gm-ink);
  font-size: 0.78rem;
  box-sizing: border-box;
  outline: none;
}
.gm-search:focus {
  border-color: var(--gm-accent-soft);
  box-shadow: 0 0 0 2px rgba(97, 213, 255, 0.2);
}
.gm-search::placeholder { color: #6f88a1; }

/* Day strip */
.gm-days { display: flex; gap: 0.25rem; flex-shrink: 0; }
.gm-day {
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  border-radius: 20px;
  border: 1px solid rgba(97, 213, 255, 0.35);
  background: rgba(12, 25, 41, 0.7);
  color: var(--gm-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.gm-day:hover { color: var(--gm-ink); border-color: var(--gm-accent-soft); }
.gm-day.active {
  background: linear-gradient(135deg, rgba(64, 188, 255, 0.92), rgba(88, 255, 235, 0.86));
  color: #04111f;
  border-color: transparent;
  font-weight: 700;
}

/* Label toggles */
.gm-label-toggles { display: flex; gap: 0.2rem; flex-shrink: 0; }
.gm-label-toggle {
  padding: 0.18rem 0.45rem;
  font-size: 0.65rem;
  border-radius: 20px;
  border: 1px solid rgba(138, 199, 232, 0.35);
  background: rgba(12, 25, 41, 0.66);
  color: #8ea8c0;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.gm-label-toggle:hover { color: #d3e7fb; border-color: rgba(130, 220, 255, 0.72); }
.gm-label-toggle.active {
  background: rgba(97, 213, 255, 0.2);
  color: #dff4ff;
  border-color: rgba(130, 220, 255, 0.85);
}

.gm-intro-open {
  padding: 0.2rem 0.62rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  border-radius: 999px;
  border: 1px solid rgba(130, 220, 255, 0.82);
  background: linear-gradient(135deg, rgba(97, 213, 255, 0.28), rgba(88, 255, 235, 0.24));
  color: #dcf4ff;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  height: 30px;
  display: inline-flex;
  align-items: center;
}

.gm-intro-open:hover {
  background: linear-gradient(135deg, rgba(97, 213, 255, 0.4), rgba(88, 255, 235, 0.34));
}

/* Action buttons */
.gm-actions { display: flex; gap: 0.25rem; flex-shrink: 0; }
.gm-icon-btn {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(97, 213, 255, 0.45);
  background: rgba(9, 24, 39, 0.7);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d8f2ff;
  transition: background 0.15s;
}
.gm-icon-btn:hover { background: rgba(97, 213, 255, 0.24); }

.gm-help-btn {
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* ─── Canvas ──────────────────────────────────────────────────────────────────── */
.gm-canvas {
  position: relative;
  flex: 1;
  overflow: hidden;
  z-index: 1;
}

/* Stats overlay */
.gm-stats {
  position: absolute;
  top: 0.6rem;
  right: 0.75rem;
  font-size: 0.62rem;
  color: rgba(205, 233, 255, 0.75);
  background: rgba(8, 18, 34, 0.62);
  border: 1px solid rgba(97, 213, 255, 0.22);
  border-radius: 999px;
  padding: 0.14rem 0.5rem;
  backdrop-filter: blur(8px);
  pointer-events: none;
  z-index: 5;
  white-space: nowrap;
}

/* ─── Legend ──────────────────────────────────────────────────────────────────── */
.gm-legend {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  background: var(--gm-panel-bg);
  border: 1px solid rgba(97, 213, 255, 0.28);
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  z-index: 50;
  backdrop-filter: blur(12px);
  user-select: none;
}
.gm-legend-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.68rem;
  color: #d5e6f6;
  padding: 0.08rem 0;
}
.gm-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.gm-legend-tiers {
  display: flex;
  gap: 0.65rem;
  margin-top: 0.45rem;
  padding-top: 0.4rem;
  border-top: 1px solid rgba(255,255,255,0.07);
  font-size: 0.62rem;
  color: #8ea6be;
}
.gm-tier { display: flex; align-items: center; gap: 0.25rem; }
.gm-tier-dot { border-radius: 50%; display: inline-block; flex-shrink: 0; background: rgba(255,255,255,0.6); }
.gm-td-pillar { width: 13px; height: 13px; }
.gm-td-sub    { width: 8px;  height: 8px; }
.gm-td-artist { width: 5px;  height: 5px; background: rgba(255,255,255,0.35); }

/* ─── Physics controls ──────────────────────────────────────────────────────────── */
.gm-physics {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: var(--gm-panel-bg);
  border: 1px solid rgba(97, 213, 255, 0.28);
  border-radius: 10px;
  padding: 0.45rem 0.7rem;
  z-index: 50;
  backdrop-filter: blur(13px);
  min-width: 170px;
}
.gm-physics-toggle {
  font-size: 0.68rem;
  color: #a8bfd5;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 100%;
  text-align: right;
}
.gm-physics-toggle:hover { color: white; }
.gm-physics-body { margin-top: 0.4rem; display: flex; flex-direction: column; gap: 0.45rem; }
.gm-slider-row {
  display: grid;
  grid-template-columns: 56px 1fr 30px;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.64rem;
  color: #abc0d5;
  cursor: default;
}
.gm-slider-label { font-size: 0.64rem; }
.gm-slider-val   { text-align: right; font-size: 0.62rem; color: #7ca1c1; }
.gm-slider-row input[type="range"] {
  accent-color: var(--gm-accent);
  margin: 0; padding: 0;
  border: none;
  background: transparent;
  width: 100%;
}
.gm-reheat {
  font-size: 0.65rem;
  background: rgba(97, 213, 255, 0.14);
  border: 1px solid rgba(97, 213, 255, 0.45);
  color: #d5f1ff;
  border-radius: 4px;
  padding: 0.18rem 0.5rem;
  cursor: pointer;
}
.gm-reheat:hover { background: rgba(97, 213, 255, 0.27); }

.gm-physics-actions {
  display: flex;
  gap: 0.35rem;
  justify-content: flex-end;
}

.gm-reset-physics {
  font-size: 0.65rem;
  background: rgba(160, 184, 212, 0.13);
  border: 1px solid rgba(160, 184, 212, 0.45);
  color: #d7e7f8;
  border-radius: 4px;
  padding: 0.18rem 0.5rem;
  cursor: pointer;
}

.gm-reset-physics:hover {
  background: rgba(160, 184, 212, 0.24);
}

/* ─── Loading ─────────────────────────────────────────────────────────────────── */
.gm-loading {
  position: absolute;
  inset: var(--gm-bar-h) 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgba(10,10,18,0.9);
  z-index: 30;
  color: #888;
}
.gm-spinner {
  width: 38px; height: 38px;
  border: 3px solid rgba(97, 213, 255, 0.2);
  border-top-color: var(--gm-accent);
  border-radius: 50%;
  animation: gmSpin 0.7s linear infinite;
}
@keyframes gmSpin { to { transform: rotate(360deg); } }

/* ─── Error ───────────────────────────────────────────────────────────────────── */
.gm-error {
  position: absolute;
  inset: var(--gm-bar-h) 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  z-index: 30;
  color: #ef5350;
  font-size: 0.85rem;
}
.gm-error button {
  padding: 0.35rem 1rem;
  border-radius: 8px;
  border: 1px solid #ef5350;
  background: transparent;
  color: #ef5350;
  cursor: pointer;
  font-size: 0.8rem;
}

/* ─── Tooltip ──────────────────────────────────────────────────────────────────── */
.gm-tooltip {
  position: fixed;
  pointer-events: none;
  background: rgba(7, 14, 29, 0.95);
  border: 1px solid rgba(97, 213, 255, 0.45);
  border-radius: 8px;
  padding: 0.4rem 0.65rem;
  z-index: 9999;
  backdrop-filter: blur(12px);
  max-width: 220px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
}
.gm-tip-name { font-size: 0.82rem; font-weight: 600; color: #e7f7ff; margin-bottom: 0.12rem; }
.gm-tip-sub  { font-size: 0.68rem; color: #a7bfd5; }

/* ─── Focus panel ───────────────────────────────────────────────────────────────── */
.gm-panel {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(380px, calc(100% - 2rem));
  background: rgba(7, 14, 29, 0.96);
  border: 1px solid rgba(97, 213, 255, 0.34);
  border-radius: 14px;
  padding: 1rem 1.1rem 0.9rem;
  z-index: 20;
  backdrop-filter: blur(16px);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.45);
}
.gm-panel-close {
  position: absolute;
  top: 0.55rem; right: 0.6rem;
  width: 24px; height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.07);
  color: #aaa;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gm-panel-close:hover { background: rgba(255,255,255,0.14); color: white; }
.gm-panel-eyebrow {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #666;
  margin: 0 0 0.2rem;
}
.gm-panel-name {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: #b9ecff;
  text-shadow: 0 0 8px rgba(97, 213, 255, 0.24);
  padding-right: 1.5rem;
}
.gm-panel-meta { font-size: 0.72rem; color: #777; margin: 0 0 0.3rem; }
.gm-panel-tag {
  display: inline-block;
  font-size: 0.68rem;
  padding: 0.14rem 0.48rem;
  border-radius: 20px;
  border: 1px solid;
  margin-bottom: 0.5rem;
}
.gm-panel-tag-btn {
  appearance: none;
  background: transparent;
  cursor: pointer;
}
.gm-panel-tag-btn:hover {
  background: rgba(97, 213, 255, 0.12);
}
.gm-panel-bio {
  font-size: 0.76rem;
  color: #ccc;
  margin: 0 0 0.45rem;
  line-height: 1.55;
}
.gm-panel-origin {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.68rem;
  color: #999;
  margin: 0 0 0.35rem;
}
.gm-panel-bpm {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: #bbb;
  margin-bottom: 0.4rem;
}
.gm-panel-bpm-label {
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #555;
}
.gm-panel-dna {
  font-size: 0.68rem;
  color: #888;
  font-style: italic;
  margin-bottom: 0.5rem;
  padding-left: 0.4rem;
  border-left: 2px solid rgba(255,255,255,0.1);
}
.gm-panel-dna-label {
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #555;
  font-style: normal;
  margin-right: 0.3rem;
}
.gm-panel-connections {
  margin-top: 0.55rem;
  padding-top: 0.45rem;
  border-top: 1px solid rgba(255,255,255,0.07);
}
.gm-panel-conn-title {
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #555;
  margin-bottom: 0.3rem;
}
.gm-panel-conn-row {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-size: 0.68rem;
  color: #aaa;
  padding: 0.12rem 0;
}
.gm-panel-conn-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
  position: relative;
  top: -0.05em;
}
.gm-panel-conn-name { color: #ccc; font-weight: 500; flex-shrink: 0; }
.gm-panel-conn-dna  { color: #555; font-size: 0.62rem; font-style: italic; }
.gm-panel-conn-link {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  color: #d7ecff;
  font-size: 0.68rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}
.gm-panel-conn-link:hover { color: #9fdaff; }
.gm-panel-links { display: flex; gap: 0.45rem; flex-wrap: wrap; }
.gm-panel-link {
  font-size: 0.72rem;
  padding: 0.22rem 0.6rem;
  border-radius: 20px;
  border: 1px solid rgba(97, 213, 255, 0.5);
  color: #c8eeff;
  text-decoration: none;
  transition: all 0.15s;
}
.gm-panel-link:hover {
  background: rgba(97, 213, 255, 0.9);
  color: #05111c;
}

/* ─── Panel transition ────────────────────────────────────────────────────────── */
.gm-panel-slide-enter-active,
.gm-panel-slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.gm-panel-slide-enter-from,
.gm-panel-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

/* ─── Intro modal ───────────────────────────────────────────────────────────── */
.gm-intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(4, 9, 19, 0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(6px);
}

.gm-intro-card {
  position: relative;
  width: min(92vw, 420px);
  padding: 1.65rem 1.2rem 1.1rem;
  border-radius: 16px;
  border: 1px solid rgba(97, 213, 255, 0.42);
  background:
    radial-gradient(circle at 18% 15%, rgba(97, 213, 255, 0.16), transparent 46%),
    rgba(7, 14, 29, 0.95);
  box-shadow: 0 22px 56px rgba(0, 0, 0, 0.58);
  color: #eaf3ff;
  text-align: center;
}

.gm-intro-close {
  position: absolute;
  top: 0.52rem;
  right: 0.58rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #c7dcee;
  font-size: 1rem;
  cursor: pointer;
}

.gm-intro-close:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.gm-intro-icon {
  font-size: 1.55rem;
  color: #b6ecff;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 12px rgba(97, 213, 255, 0.35);
}

.gm-intro-title {
  margin: 0 0 0.45rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #dcf4ff;
}

.gm-intro-body {
  margin: 0 0 1rem;
  color: #b8cde0;
  font-size: 0.88rem;
  line-height: 1.58;
  min-height: 2.8rem;
}

.gm-intro-dots {
  display: flex;
  justify-content: center;
  gap: 0.38rem;
  margin-bottom: 1rem;
}

.gm-intro-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: none;
  background: rgba(196, 223, 244, 0.34);
  cursor: pointer;
  padding: 0;
}

.gm-intro-dot.active {
  background: #8ce6ff;
  transform: scale(1.3);
}

.gm-intro-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.gm-intro-btn {
  border-radius: 999px;
  border: 1px solid rgba(97, 213, 255, 0.45);
  padding: 0.3rem 0.72rem;
  font-size: 0.74rem;
  cursor: pointer;
}

.gm-intro-btn-ghost {
  background: rgba(11, 24, 39, 0.72);
  color: #cae8ff;
}

.gm-intro-btn-primary {
  background: linear-gradient(135deg, rgba(97, 213, 255, 0.95), rgba(88, 255, 235, 0.9));
  color: #04111f;
  border-color: transparent;
  font-weight: 700;
}

.gm-intro-fade-enter-active,
.gm-intro-fade-leave-active {
  transition: opacity 0.22s ease;
}

.gm-intro-fade-enter-from,
.gm-intro-fade-leave-to {
  opacity: 0;
}

/* ─── Mobile ────────────────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .gm-page { --gm-bar-h: 88px; }

  /* Grid bar: 3 cols, 2 rows — explicit placement, no flex-wrap trickery */
  .gm-bar {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    grid-template-rows: auto auto;
    height: auto;
    padding: 0.35rem 0.55rem;
    gap: 0.3rem 0.45rem;
    align-items: center;
  }
  /* Row 1 */
  .gm-title         { display: none; }
  .gm-back          { grid-column: 1; grid-row: 1; }
  .gm-search-wrap   { grid-column: 2; grid-row: 1; max-width: none; }
  .gm-intro-open    { grid-column: 3; grid-row: 1; justify-self: end; margin-top: 0; }
  .gm-actions       { grid-column: 4; grid-row: 1; }
  /* Row 2 */
  .gm-days          { grid-column: 1 / 4; grid-row: 2; flex-wrap: nowrap; overflow-x: auto; }
  .gm-label-toggles { grid-column: 4;     grid-row: 2; display: flex; justify-self: end; }

  .gm-actions { gap: 0.18rem; }
  .gm-help-btn { display: none; }

  .gm-legend  { display: none; }
  /* Physics: move to top-right on mobile so focus panel can't cover it */
  .gm-physics {
    min-width: 0;
    max-width: calc(100vw - 1rem);
    right: 0.5rem;
    bottom: auto;
    top: calc(var(--gm-bar-h) + env(safe-area-inset-top) + 0.45rem);
    padding: 0.36rem 0.52rem;
    border-radius: 12px;
  }

  .gm-physics-toggle {
    text-align: center;
    font-size: 0.72rem;
    border: 1px solid rgba(130, 220, 255, 0.35);
    border-radius: 8px;
    padding: 0.12rem 0.28rem;
    background: rgba(10, 25, 42, 0.72);
  }

  .gm-physics-body {
    gap: 0.35rem;
    margin-top: 0.34rem;
  }

  .gm-slider-row {
    grid-template-columns: 52px 1fr 32px;
    font-size: 0.62rem;
  }

  .gm-physics-actions {
    gap: 0.28rem;
  }

  .gm-reset-physics,
  .gm-reheat {
    flex: 1;
    text-align: center;
    padding: 0.22rem 0.42rem;
    font-size: 0.64rem;
  }

  /* Uniform button sizing across the bar */
  .gm-day,
  .gm-label-toggle {
    padding: 0 0.55rem;
    font-size: 0.72rem;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
  }
  .gm-icon-btn {
    width: 30px;
    height: 30px;
    font-size: 0.85rem;
  }

  .gm-intro-open {
    padding: 0 0.55rem;
    height: 30px;
    font-size: 0.68rem;
  }

  .gm-panel {
    left: 0.5rem; right: 0.5rem; bottom: 0.5rem;
    width: auto;
    transform: none;
  }
  .gm-panel-slide-enter-from,
  .gm-panel-slide-leave-to { transform: translateY(10px); }
}
</style>

<!-- Non-scoped: styles for elements Teleported outside this component -->
<style>
.gm-dropdown-portal {
  background: rgba(7, 14, 29, 0.96);
  border: 1px solid rgba(97, 213, 255, 0.45);
  border-radius: 8px;
  overflow: hidden;
  max-height: 280px;
  overflow-y: auto;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.58);
}
.gm-dropdown-portal .gm-dropdown-item {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding: 0.44rem 0.7rem;
  font-size: 0.8rem;
  color: #e2f3ff;
  cursor: pointer;
  transition: background 0.12s;
}
.gm-dropdown-portal .gm-dropdown-item:hover { background: rgba(97, 213, 255, 0.22); }
.gm-dropdown-portal .gm-dropdown-icon { font-size: 0.65rem; color: #8eb7d4; flex-shrink: 0; }
.gm-dropdown-portal .gm-dropdown-sub  { font-size: 0.65rem; color: #87a4bc; margin-left: auto; }
</style>
