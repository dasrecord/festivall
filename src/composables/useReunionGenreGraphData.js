import { ref } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import { PILLARS, SUBGENRES, PILLAR_BRIDGES, resolveGenreToNodeId } from '@/config/reunionGenreTaxonomy'
import { REUNION_FESTIVAL } from '@/config/festivalConfig'

export function useReunionGenreGraphData() {
  const loading = ref(false)
  const error = ref(null)
  const rawArtists = ref([])
  const graphData = ref({ nodes: [], links: [] })

  /**
   * Build force-graph { nodes, links } from an artist array.
   * Only adds subgenre nodes that are actually referenced.
   */
  const buildGraphData = (artists) => {
    const nodes = []
    const links = []
    const usedSubgenreIds = new Set()
    const artistEntries = []

    // Resolve each artist's genre and track needed subgenres
    artists.forEach(artist => {
      const targetId = resolveGenreToNodeId(artist.genre)
      const isPillar = PILLARS.some(p => p.id === targetId)
      if (!isPillar) usedSubgenreIds.add(targetId)
      artistEntries.push({ artist, targetId })
    })

    // Add all 8 pillar nodes (always present as anchors)
    PILLARS.forEach(p => nodes.push({ ...p }))

    // Add only used subgenre nodes + their pillar links
    SUBGENRES.forEach(sg => {
      if (!usedSubgenreIds.has(sg.id)) return
      nodes.push({ ...sg, tier: 'subgenre', size: 10 })
      if (sg.pillar) links.push({ source: sg.id, target: sg.pillar, value: 2 })
    })

    // Add artist nodes and their genre links
    artistEntries.forEach(({ artist, targetId }) => {
      const artistId = `artist_${artist.id_code}`
      const pillarNode  = PILLARS.find(p => p.id === targetId)
      const subNode     = SUBGENRES.find(s => s.id === targetId)
      const color       = (pillarNode || subNode)?.color ?? '#636E72'

      nodes.push({
        id: artistId,
        label: artist.act_name || artist.fullname || artist.id_code,
        tier: 'artist',
        size: 2,
        color,
        artist,
      })
      links.push({ source: artistId, target: targetId, value: 0.5 })
    })

    // Add pillar-to-pillar DNA bridge links (very faint, value 0)
    PILLAR_BRIDGES.forEach(b => {
      links.push({ source: b.source, target: b.target, value: 0.2, isBridge: true, dna: b.dna })
    })

    return { nodes, links }
  }

  /** Fetch signed artists from participants_2026 and build graph data */
  const fetchArtists = async () => {
    loading.value = true
    error.value = null
    try {
      const q = query(
        collection(reunion_db, REUNION_FESTIVAL.participantsCollection),
        where('contract.signed', '==', true)
      )
      const snapshot = await getDocs(q)
      const artists = []

      snapshot.docs.forEach(docSnap => {
        const data    = docSnap.data()
        const roles   = data.roles || {}
        const appData = (data.application && data.application.data) || {}

        if (!(roles.applicant_types || []).includes('Artist')) return

        artists.push({
          id:              docSnap.id,
          id_code:         data.id_code || docSnap.id,
          act_name:        roles.act_name || data.act_name || '',
          act_type:        roles.act_type || '',
          fullname:        (data.contact && data.contact.fullname) || '',
          genre:           appData.genre || data.genre || '',
          mix_track_url:   appData.mix_track_url || '',
          social_url:      appData.social_url || '',
          act_description: appData.act_description || '',
          settimes: Array.isArray(data.settimes)
            ? data.settimes.map(t => {
                if (t && typeof t.toDate === 'function') return t.toDate().toISOString()
                if (typeof t === 'string') return t.replace(/^"|"$/g, '')
                return String(t)
              })
            : [],
        })
      })

      rawArtists.value = artists
      graphData.value  = buildGraphData(artists)
    } catch (err) {
      error.value = err.message || 'Failed to load artist data'
      console.error('[useReunionGenreGraphData] fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Derive unique festival days from loaded artists' settimes.
   * Uses 3 am boundary (sets before 3am belong to the previous calendar day).
   * Returns [{ key: 'YYYY-MM-DD', label: 'Fri Sep 4' }] sorted ascending.
   */
  const getAvailableDays = () => {
    const daySet = new Set()
    rawArtists.value.forEach(a => {
      a.settimes.forEach(t => {
        const d = new Date(t)
        if (isNaN(d.getTime())) return
        // Sets ending before 3am count as the previous night's day
        if (d.getHours() < 3) d.setDate(d.getDate() - 1)
        d.setHours(0, 0, 0, 0)
        daySet.add(d.toISOString().split('T')[0])
      })
    })
    return [...daySet].sort().map(dateStr => {
      const d = new Date(dateStr + 'T12:00:00')
      return {
        key:   dateStr,
        label: d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' }),
      }
    })
  }

  /**
   * Filter graph to artists playing on a specific festival day (or null for all).
   * Day key is 'YYYY-MM-DD'; window is dayT03:00 → nextDayT03:00.
   */
  const filterByDay = (dayKey) => {
    if (!dayKey) {
      graphData.value = buildGraphData(rawArtists.value)
      return
    }
    const dayStart = new Date(dayKey + 'T03:00:00')
    const dayEnd   = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

    const filtered = rawArtists.value.filter(a =>
      a.settimes.some(t => {
        const d = new Date(t)
        return !isNaN(d.getTime()) && d >= dayStart && d < dayEnd
      })
    )
    graphData.value = buildGraphData(filtered)
  }

  return {
    loading,
    error,
    rawArtists,
    graphData,
    fetchArtists,
    getAvailableDays,
    filterByDay,
  }
}
