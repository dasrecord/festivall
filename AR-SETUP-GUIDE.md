# Festival AR Experience - Setup Guide

## Architecture: Marker-Based AR (No GPS Required)

This experience uses **physical QR anchor markers** placed on-site instead of GPS. When a phone camera sees a marker, it computes its exact position and orientation relative to that marker using pose estimation — this gives **centimeter-level accuracy** vs the 3–10 meter error typical of phone GPS.

### How It Works (Conceptually)

Each physical marker on the ground defines a known point in a **local world coordinate system**. One marker is designated the **origin** (0, 0, 0). All other markers are measured from it in meters (e.g., "the food court marker is 22 meters east and 8 meters north → [22, 0, 8]"). Every 3D object in the scene is positioned in that same XYZ world space. When the camera sees any marker, it knows exactly where it is in the world and renders all visible objects accordingly.

This is not technically "triangulation" (which requires seeing two points simultaneously to compute position). It is **single-marker pose anchoring** — one visible marker is enough to fully localize the phone. However you can and should place multiple markers across the festival so the experience works from many vantage points without requiring the attendee to hunt for one specific QR code.

---

## Quick Start

### 1. Physical Marker Setup

**The origin marker (0, 0, 0):**
- Choose a fixed, prominent, permanently visible location (main stage front, main entrance arch, etc.)
- Print this marker large (minimum 30×30cm, weatherproof laminate or banner)
- This becomes world position `[0, 0, 0]`

**Supporting zone markers:**
- Place additional markers at key zones (food court, art installations, secondary stages)
- Physically measure their distance and direction from the origin using a tape measure or surveying app
- Record each marker's `[x, y, z]` offset from origin in meters
- `x` = east (+) / west (−), `z` = north (+) / south (−), `y` = elevation (usually 0)

**Marker IDs:**
- Each physical marker encodes a unique ID (not a URL — the app reads the ID and looks up the marker's world position internally)
- Generate marker images from `/scripts/generate-qrs.js` or a dedicated ArUco marker generator
- The app URL is separate — print it once at entrances for first-time launch

**Recommended minimum placement:**
```
Origin marker         → main entrance or center stage
Zone marker A         → food court
Zone marker B         → secondary stage / art area
Zone marker C         → far end of festival grounds
```

---

### 2. Configure Markers in ar-config.json

Replace the GPS `location` block with a `markers` block. All coordinates are in **meters from origin**:

```json
{
  "coordinateSystem": "local",
  "origin": {
    "description": "Main Stage Front — this is world 0,0,0",
    "markerID": "MARKER_0"
  },
  "markers": [
    {
      "id": "MARKER_0",
      "name": "Origin / Main Stage",
      "worldPosition": [0, 0, 0]
    },
    {
      "id": "MARKER_A",
      "name": "Food Court Zone",
      "worldPosition": [22, 0, 8]
    },
    {
      "id": "MARKER_B",
      "name": "Art Installation Zone",
      "worldPosition": [-15, 0, 30]
    },
    {
      "id": "MARKER_C",
      "name": "Back Field",
      "worldPosition": [5, 0, 55]
    }
  ]
}
```

---

### 3. Position 3D Objects in World Space

Objects now use `worldPosition` instead of lat/lng. Units are **meters from origin**:

```json
{
  "arObjects": [
    {
      "id": "main-stage-info",
      "name": "Main Stage Information",
      "worldPosition": [0, 2, -3],
      "visual": {
        "geometry": "primitive: box; width: 3; height: 4; depth: 0.2",
        "material": "color: #4CC3D9; opacity: 0.8",
        "scale": "1 1 1"
      },
      "content": {
        "title": "Main Stage",
        "text": "Next show: 8:00 PM"
      }
    },
    {
      "id": "food-court-sign",
      "name": "Food Court",
      "worldPosition": [22, 2, 8],
      "visual": {
        "geometry": "primitive: cylinder; radius: 1.5; height: 3",
        "material": "color: #FF6B35"
      }
    }
  ]
}
```

---

### 4. Placing Objects — Three Approaches

#### Option A: Blender Layout (recommended for art pieces and complex scenes)

This works well. The coordinate system maps directly:

- **1 Blender unit = 1 real-world meter**
- The Blender world origin = the physical origin marker location
- Model your entire festival layout in Blender at real scale — reference photos, satellite imagery, or a hand-drawn site map help
- Position objects where they should appear in the real world
- Export each object (or the full scene) as `.glb`
- The object's Blender XYZ position becomes its `worldPosition` in `ar-config.json`

Best for: sculptures, art installations, decorative floating objects, anything you want to model carefully in 3D first.

Limitation: You're guessing real-world positions from a map. Expect to iterate — place in Blender, test on-site, adjust.

#### Option B: Admin Walk-and-Drop (recommended for info panels, stage markers, interactive objects)

This is the most accurate method and the right long-term workflow. The idea:

1. Admin opens the app in **admin mode** (behind a PIN or admin route)
2. Admin walks to the desired object location on-site
3. App shows camera — admin scans the nearest zone marker
4. App computes admin's current world position from the marker pose
5. Admin taps "Drop Object Here" — the app records the current world position + orientation
6. Object config is saved back to `ar-config.json` (or staged for review)

This is how Apple Reality Composer, Adobe Aero, and Snap AR authoring tools work. Building this admin mode is a separate development task but is worth doing if you plan to place many objects or want non-developers to manage content.

#### Option C: Manual Measurement + Config

For simple/rectangular festival layouts:
- Walk the site with a tape measure or a good GPS survey app (e.g., SW Maps)
- Record distances and directions to each object location from the origin marker
- Enter them directly as `worldPosition: [x, y, z]` in the config

---

### 5. Add Media Assets

```
public/
├── models/ar/          ← 3D models (.glb format, exported from Blender)
│   ├── crystal-garden.glb
│   └── quest-orb.glb
├── textures/ar/        ← Textures (.jpg format)
│   └── info-panel.jpg
└── sounds/ar/          ← Audio files (.mp3 format)
    ├── treasure-found.mp3
    └── quest-complete.mp3
```

**Blender export settings for AR:**
- Format: glTF 2.0 (.glb)
- Apply transforms before export (`Ctrl+A` → All Transforms in Blender)
- Include: Mesh, Materials, Textures (packed)
- Exclude: Cameras, Lights, Armatures (unless animated)
- Keep under 1MB per model; under 10k triangles per object

---

### 6. Quests

Quest targets reference object IDs, which now position themselves via `worldPosition` — no change to quest config format:

```json
{
  "id": "find-hidden-treasure",
  "title": "Find the Hidden Treasure",
  "description": "Search for the golden orb hidden near the art zone!",
  "targetObjects": ["hidden-treasure"],
  "rewards": [
    {
      "type": "physical",
      "item": "Festival Coin",
      "location": "Info Booth"
    }
  ]
}
```

---

### 7. Deploy the Experience

- App URL (for first launch): `https://yourfestival.com/ar-standalone.html`
- Print this URL as a QR code **once** at entrances — this is the **launch QR**, not an anchor marker
- Once the app is open, anchor markers around the site are what the camera tracks

**Signage distinction:**
```
Launch QR (entrances only)   → opens the web app
Anchor Markers (throughout)  → tracked by the running app to localize position
```

---

### 8. On-Site Setup Checklist

- [ ] Identify and mark the origin point (permanent, highly visible)
- [ ] Print origin marker (≥30cm × 30cm, weatherproof)
- [ ] Print zone markers for each area
- [ ] Measure and record each marker's offset from origin in meters
- [ ] Enter all marker positions into `ar-config.json`
- [ ] Place 3D objects via Blender or walk-and-drop
- [ ] Walk through the site and verify all objects appear at correct positions
- [ ] Print launch QR codes for entrances

---

### 9. Performance Tips

- Keep models under 1MB each, under 10k triangles
- Only render objects within 30–50m of the detected marker
- Limit to 8–10 simultaneous visible objects
- Use `.glb` (binary GLTF) not `.gltf` — smaller and single-file

---

### 10. User Progress Tracking

- Quest progress saves to browser `localStorage`
- Users can close/reopen the app and resume
- Completed quests persist between sessions

---

### 11. Integration with Festival App

```javascript
{
  path: '/ar-experience',
  name: 'ARExperience',
  component: () => import('@/views/ARExperienceView.vue')
}
```

---

## Technical Features

- **WebAR**: No app download required
- **Marker-based pose anchoring**: cm-level accuracy, no GPS dependency, works indoors and in crowds
- **Local world coordinate system**: all objects in meters from a defined origin
- **Cross-platform**: iOS Safari 13+, Android Chrome 81+
- **Blender-compatible**: model at real scale, export GLB, coordinates transfer directly
- **Interactive**: tap objects, complete quests, track progress
- **Offline-capable**: once loaded, works without network

## Support

**Browser Requirements:**
- iOS: Safari 13+
- Android: Chrome 81+
- Requires: Camera, WebGL (no GPS needed)

**Troubleshooting:**
- Marker must be well-lit and flat — avoid glare, creases, and partial occlusion
- Larger printed markers track from farther away and at more angles
- If objects appear in wrong positions, re-measure marker offsets from origin
- Blender Z-axis = depth in AR (forward/back from camera); Blender Y = up

---

**Your AR festival experience is ready to deploy.**
