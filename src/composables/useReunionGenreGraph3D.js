import { ref, watch, onUnmounted } from 'vue'

export function useReunionGenreGraph3D() {
  const graphInstance    = ref(null)
  const hoveredNode      = ref(null)
  const focusedNode      = ref(null)
  const showGenreLabels  = ref(true)
  const showArtistLabels = ref(true)

  // Persisted after first dynamic import
  let SpriteTextClass  = null
  let ThreeObject3D    = null  // THREE.Object3D — used as invisible placeholder for label toggles

  // ─── Label helpers ──────────────────────────────────────────────────────────

  /** Build a nodeThreeObject function that reads the current toggle refs */
  const makeLabelFn = () => (node) => {
    // Always return an Object3D so previous sprites are properly evicted on refresh.
    // Three.Sprite has a live raycast() — disable it so it never intercepts
    // hover/click events that belong to the underlying sphere.
    const placeholder = () => ThreeObject3D ? new ThreeObject3D() : undefined
    if (!SpriteTextClass) return placeholder()

    const showGenre  = showGenreLabels.value
    const showArtist = showArtistLabels.value

    if ((node.tier === 'pillar' || node.tier === 'subgenre') && showGenre) {
      const sprite = new SpriteTextClass(node.label)
      if (node.tier === 'pillar') {
        sprite.color           = node.color
        sprite.textHeight      = 9
        sprite.backgroundColor = 'rgba(8,8,16,0.65)'
        sprite.padding         = 2
        sprite.borderWidth     = 0.5
        sprite.borderColor     = node.color
        sprite.borderRadius    = 3
        sprite.position.y      = 22
      } else {
        sprite.color           = 'rgba(220,220,220,0.9)'
        sprite.textHeight      = 4.5
        sprite.backgroundColor = 'rgba(8,8,16,0.5)'
        sprite.padding         = 1.5
        sprite.borderRadius    = 2
        sprite.position.y      = 14
      }
      sprite.raycast = () => {}   // ← prevent sprite from absorbing mouse events
      return sprite
    }
    if (node.tier === 'artist' && showArtist) {
      const sprite = new SpriteTextClass(node.label)
      sprite.color           = 'rgba(200,200,200,0.65)'
      sprite.textHeight      = 3.5
      sprite.backgroundColor = 'rgba(8,8,16,0.4)'
      sprite.padding         = 1
      sprite.borderRadius    = 1.5
      sprite.position.y      = 7
      sprite.raycast = () => {}   // ← prevent sprite from absorbing mouse events
      return sprite
    }
    // Invisible placeholder — replaces previous sprite so it's removed from the scene
    return placeholder()
  }

  /** Rebuild nodeThreeObject and force a full node refresh */
  const applyLabels = () => {
    if (!graphInstance.value || !SpriteTextClass) return
    graphInstance.value.nodeThreeObject(makeLabelFn()).refresh()
  }

  // React to toggle changes
  watch(showGenreLabels,  applyLabels)
  watch(showArtistLabels, applyLabels)

  // ─── Camera helper ───────────────────────────────────────────────────────────

  const zoomToNode = (graph, node) => {
    const x = node.x || 1
    const y = node.y || 1
    const z = node.z || 1
    const mag = Math.hypot(x, y, z) || 100
    const distance = node.tier === 'pillar' ? 260 : node.tier === 'subgenre' ? 140 : 100
    graph.cameraPosition(
      { x: x * (1 + distance / mag), y: y * (1 + distance / mag), z: z * (1 + distance / mag) },
      { x, y, z },
      1000
    )
  }

  // ─── Public API ───────────────────────────────────────────────────────────────

  const initGraph = async (container, initialData, options = {}) => {
    if (graphInstance.value) {
      graphInstance.value._destructor()
      graphInstance.value = null
    }

    const [fgMod, stMod, threeMod] = await Promise.all([
      import('3d-force-graph'),
      import('three-spritetext'),
      import('three'),
    ])
    const ForceGraph3D = fgMod.default  || fgMod
    SpriteTextClass    = stMod.default  || stMod
    ThreeObject3D      = threeMod.Object3D

    const Graph = ForceGraph3D({
      controlType: 'orbit',
      rendererConfig: { antialias: true, preserveDrawingBuffer: true },
    })(container)
      .backgroundColor('#0a0a12')
      .width(container.clientWidth  || window.innerWidth)
      .height(container.clientHeight || window.innerHeight - 52)
      .graphData(initialData)
      .nodeLabel(() => '')            // disable built-in DOM tooltip
      .nodeColor(node => node.color || '#4a90d9')
      .nodeVal(node => node.tier === 'pillar' ? 50 : node.tier === 'subgenre' ? 12 : 2)
      .nodeOpacity(0.9)
      .nodeResolution(16)
      .nodeThreeObjectExtend(true)    // labels alongside spheres
      .nodeThreeObject(makeLabelFn())
      .linkColor(link => link.isBridge
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(120,180,255,0.14)')
      .linkWidth(link => link.isBridge ? 0.3 : link.value || 0.5)
      .linkOpacity(1)             // opacity is encoded in linkColor's alpha channel
      .onNodeHover(node => {
        hoveredNode.value      = node || null
        container.style.cursor = node ? 'pointer' : 'default'
      })
      .onNodeClick(node => {
        if (focusedNode.value && focusedNode.value.id === node.id) {
          focusedNode.value = null
          Graph.cameraPosition({ x: 0, y: 0, z: 600 }, { x: 0, y: 0, z: 0 }, 800)
          return
        }
        focusedNode.value = node
        zoomToNode(Graph, node)
      })

    const chargeForce = Graph.d3Force('charge')
    if (chargeForce) chargeForce.strength(options.chargeStrength ?? -150)
    const linkForce = Graph.d3Force('link')
    if (linkForce)   linkForce.distance(options.linkDistance ?? 60)

    graphInstance.value = Graph
    return Graph
  }

  const updateGraphData = (newData) => {
    if (graphInstance.value) graphInstance.value.graphData(newData)
  }

  const updatePhysics = ({ chargeStrength, linkDistance } = {}) => {
    if (!graphInstance.value) return
    const cf = graphInstance.value.d3Force('charge')
    if (cf && chargeStrength !== undefined) cf.strength(chargeStrength)
    const lf = graphInstance.value.d3Force('link')
    if (lf && linkDistance  !== undefined) lf.distance(linkDistance)
    graphInstance.value.d3ReheatSimulation()
  }

  const focusNodeById = (nodeId) => {
    if (!graphInstance.value) return
    const { nodes } = graphInstance.value.graphData()
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    focusedNode.value = node
    zoomToNode(graphInstance.value, node)
  }

  const clearFocus = () => {
    focusedNode.value = null
    if (graphInstance.value)
      graphInstance.value.cameraPosition({ x: 0, y: 0, z: 600 }, { x: 0, y: 0, z: 0 }, 800)
  }

  const takeScreenshot = () => {
    if (!graphInstance.value) return
    try {
      const renderer = graphInstance.value.renderer()
      renderer.render(graphInstance.value.scene(), graphInstance.value.camera())
      const link    = document.createElement('a')
      link.href     = renderer.domElement.toDataURL('image/png')
      link.download = `reunion-genre-map-${new Date().toISOString().split('T')[0]}.png`
      link.click()
    } catch (e) { console.error('[useReunionGenreGraph3D] screenshot error:', e) }
  }

  const resize = (width, height) => {
    if (graphInstance.value) graphInstance.value.width(width).height(height)
  }

  const destroy = () => {
    if (graphInstance.value) {
      graphInstance.value._destructor()
      graphInstance.value = null
    }
    hoveredNode.value = null
    focusedNode.value = null
  }

  onUnmounted(destroy)

  return {
    graphInstance,
    hoveredNode,
    focusedNode,
    showGenreLabels,
    showArtistLabels,
    initGraph,
    updateGraphData,
    updatePhysics,
    focusNodeById,
    clearFocus,
    takeScreenshot,
    resize,
    destroy,
  }
}
