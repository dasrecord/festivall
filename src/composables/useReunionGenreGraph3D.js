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
  let ThreeGroup       = null
  let ThreeMesh        = null
  let ThreeSphereGeometry = null
  let ThreeMeshBasicMaterial = null
  let ThreeAdditiveBlending = null

  const hexToRgb = (hex) => {
    if (!hex || typeof hex !== 'string') return { r: 97, g: 213, b: 255 }
    const clean = hex.replace('#', '').trim()
    if (clean.length !== 6) return { r: 97, g: 213, b: 255 }
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    }
  }

  const rgbaFromHex = (hex, alpha = 1) => {
    const { r, g, b } = hexToRgb(hex)
    return `rgba(${r},${g},${b},${alpha})`
  }

  const makeArtistAura = (color) => {
    if (!ThreeMesh || !ThreeSphereGeometry || !ThreeMeshBasicMaterial) return null
    const group = ThreeGroup ? new ThreeGroup() : null
    if (!group) return null

    const innerAura = new ThreeMesh(
      new ThreeSphereGeometry(4.8, 16, 16),
      new ThreeMeshBasicMaterial({
        color: color || '#7adfff',
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        depthTest: false,
        blending: ThreeAdditiveBlending,
      })
    )

    const outerAura = new ThreeMesh(
      new ThreeSphereGeometry(8.2, 14, 14),
      new ThreeMeshBasicMaterial({
        color: color || '#7adfff',
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
        depthTest: false,
        blending: ThreeAdditiveBlending,
      })
    )

    innerAura.raycast = () => {}
    outerAura.raycast = () => {}
    innerAura.renderOrder = 997
    outerAura.renderOrder = 996
    group.add(outerAura)
    group.add(innerAura)
    return group
  }

  const placeLabelBetweenCameraAndNode = (nodeObj, node, graph) => {
    if (!nodeObj || !node || !graph) return

    const camera = graph.camera && graph.camera()
    if (!camera || !camera.position) return

    // For artist nodes, the label is nested in the custom group.
    // For pillar/subgenre nodes, the node object itself is the label sprite.
    const labelSprite = nodeObj.userData?.labelSprite || nodeObj
    if (!labelSprite || !labelSprite.position || typeof labelSprite.position.set !== 'function') return

    const nx = node.x || 0
    const ny = node.y || 0
    const nz = node.z || 0
    const dx = camera.position.x - nx
    const dy = camera.position.y - ny
    const dz = camera.position.z - nz
    const mag = Math.hypot(dx, dy, dz) || 1

    const frontOffset = node.tier === 'pillar' ? 28 : node.tier === 'subgenre' ? 16 : 9
    const lift = node.tier === 'pillar' ? 5.5 : node.tier === 'subgenre' ? 3.2 : 1.8

    labelSprite.position.set(
      (dx / mag) * frontOffset,
      (dy / mag) * frontOffset + lift,
      (dz / mag) * frontOffset
    )
  }

  // ─── Label helpers ──────────────────────────────────────────────────────────

  /** Build a nodeThreeObject function that reads the current toggle refs */
  const makeLabelFn = () => (node) => {
    // Always return an Object3D so previous sprites are properly evicted on refresh.
    // Three.Sprite has a live raycast() — disable it so it never intercepts
    // hover/click events that belong to the underlying sphere.
    const placeholder = () => ThreeObject3D ? new ThreeObject3D() : undefined

    const showGenre  = showGenreLabels.value
    const showArtist = showArtistLabels.value

    if ((node.tier === 'pillar' || node.tier === 'subgenre') && showGenre && SpriteTextClass) {
      const sprite = new SpriteTextClass(node.label)
      if (node.tier === 'pillar') {
        sprite.color           = '#f2fbff'
        sprite.textHeight      = 8.6
        sprite.backgroundColor = 'rgba(7,13,26,0.84)'
        sprite.padding         = 2
        sprite.borderWidth     = 0.9
        sprite.borderColor     = rgbaFromHex(node.color, 0.9)
        sprite.borderRadius    = 3
      } else {
        sprite.color           = 'rgba(226,240,255,0.95)'
        sprite.textHeight      = 4.5
        sprite.backgroundColor = 'rgba(7,13,26,0.72)'
        sprite.padding         = 1.5
        sprite.borderWidth     = 0.55
        sprite.borderColor     = rgbaFromHex(node.color || '#61d5ff', 0.7)
        sprite.borderRadius    = 2
      }
      sprite.raycast = () => {}                   // ← prevent sprite from absorbing mouse events
      sprite.material.depthTest = true             // ← respect depth so labels don't float over unrelated nodes
      sprite.material.depthWrite = false           // ← avoid labels occluding each other or other geometry
      return sprite
    }
    if (node.tier === 'artist') {
      const group = ThreeGroup ? new ThreeGroup() : placeholder()
      if (!group) return placeholder()

      const aura = makeArtistAura(node.color || '#7adfff')
      if (aura && group.add) group.add(aura)

      if (showArtist && SpriteTextClass) {
        const sprite = new SpriteTextClass(node.label)
        sprite.color           = 'rgba(222,236,250,0.9)'
        sprite.textHeight      = 3.5
        sprite.backgroundColor = 'rgba(7,13,26,0.66)'
        sprite.padding         = 1
        sprite.borderWidth     = 0.45
        sprite.borderColor     = rgbaFromHex(node.color || '#7adfff', 0.56)
        sprite.borderRadius    = 1.5
        sprite.raycast = () => {}                    // ← prevent sprite from absorbing mouse events
        sprite.material.depthTest = true             // ← respect depth so labels don't float over unrelated nodes
        sprite.material.depthWrite = false           // ← avoid labels occluding each other or other geometry
        group.userData.labelSprite = sprite
        group.add(sprite)
      }

      return group
    }
    // Invisible placeholder — replaces previous sprite so it's removed from the scene
    return placeholder()
  }

  /** Rebuild nodeThreeObject and force a full node refresh */
  const applyLabels = () => {
    if (!graphInstance.value) return
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
    ThreeGroup         = threeMod.Group
    ThreeMesh          = threeMod.Mesh
    ThreeSphereGeometry = threeMod.SphereGeometry
    ThreeMeshBasicMaterial = threeMod.MeshBasicMaterial
    ThreeAdditiveBlending = threeMod.AdditiveBlending

    const Graph = ForceGraph3D({
      controlType: 'orbit',
      rendererConfig: { antialias: true, preserveDrawingBuffer: true, alpha: true },
    })(container)
      .backgroundColor('rgba(0,0,0,0)')
      .width(container.clientWidth  || window.innerWidth)
      .height(container.clientHeight || window.innerHeight - 52)
      .graphData(initialData)
      .nodeLabel(() => '')            // disable built-in DOM tooltip
      .nodeColor(node => node.color || '#61d5ff')
      .nodeVal(node => node.tier === 'pillar' ? 50 : node.tier === 'subgenre' ? 12 : 2.8)
      .nodeOpacity(0.95)
      .nodeResolution(20)
      .nodeThreeObjectExtend(true)    // labels alongside spheres
      .nodeThreeObject(makeLabelFn())
      .nodePositionUpdate((nodeObj, coords, node) => {
        placeLabelBetweenCameraAndNode(nodeObj, node, Graph)
      })
      .linkColor(link => {
        if (link.isBridge) return 'rgba(130,208,255,0.12)'
        const sourceColor = typeof link.source === 'object' ? link.source?.color : null
        const targetColor = typeof link.target === 'object' ? link.target?.color : null
        const base = sourceColor || targetColor || '#7adfff'
        return rgbaFromHex(base, 0.24)
      })
      .linkWidth(link => {
        if (link.isBridge) return 0.45
        return link.value ? Math.min(1.4, 0.45 + link.value * 0.9) : 0.7
      })
      .linkOpacity(1)             // opacity is encoded in linkColor's alpha channel
      .linkDirectionalParticles(link => (link.isBridge ? 0 : 1))
      .linkDirectionalParticleWidth(0.8)
      .linkDirectionalParticleSpeed(0.003)
      .linkDirectionalParticleColor(link => {
        if (link.isBridge) return 'rgba(130,208,255,0.28)'
        const sourceColor = typeof link.source === 'object' ? link.source?.color : null
        return rgbaFromHex(sourceColor || '#95e6ff', 0.52)
      })
      .onNodeHover(node => {
        hoveredNode.value      = node || null
        container.style.cursor = node ? 'pointer' : 'default'
      })
      .onNodeClick(node => {
        if (focusedNode.value && focusedNode.value.id === node.id) {
          focusedNode.value = null
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

  const updatePhysics = ({ chargeStrength, linkDistance, linkStrength, velocityDecay, gravityStrength } = {}) => {
    if (!graphInstance.value) return
    const g = graphInstance.value
    const cf = g.d3Force('charge')
    if (cf && chargeStrength  !== undefined) cf.strength(chargeStrength)
    const lf = g.d3Force('link')
    if (lf && linkDistance    !== undefined) lf.distance(linkDistance)
    if (lf && linkStrength    !== undefined) lf.strength(linkStrength)
    if (velocityDecay         !== undefined) g.d3VelocityDecay(velocityDecay)
    const xf = g.d3Force('x'); const yf = g.d3Force('y'); const zf = g.d3Force('z')
    if (gravityStrength !== undefined) {
      if (xf) xf.strength(gravityStrength)
      if (yf) yf.strength(gravityStrength)
      if (zf) zf.strength(gravityStrength)
    }
    g.d3ReheatSimulation()
  }

  const focusNodeById = (nodeId) => {
    if (!graphInstance.value) return
    const { nodes } = graphInstance.value.graphData()
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    focusedNode.value = node
    zoomToNode(graphInstance.value, node)
  }

  const clearFocus = ({ resetCamera = false } = {}) => {
    focusedNode.value = null
    if (resetCamera && graphInstance.value)
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
