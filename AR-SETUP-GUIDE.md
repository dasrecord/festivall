# Festival AR Experience - Setup Guide

## Quick Start

Your festival AR experience is now ready! Here's what you need to do:

### 1. 🎯 Deploy the Experience

- The AR experience is accessible at: `https://yourfestival.com/ar-standalone.html`
- Generate QR codes that link to this URL
- Place QR codes at festival entrances and key locations

### 2. 📱 User Access Flow

1. Festival attendees scan QR code with phone camera
2. Opens web browser to AR experience
3. Browser requests camera and location permissions
4. AR experience loads and shows 3D objects at real-world locations

### 3. 🗺️ Configure Your Festival Location

Edit `/public/ar-config.json` and update these coordinates to match your festival:

```json
{
  "festival": {
    "location": {
      "center": {
        "lat": 40.7589, // ← Your festival center latitude
        "lng": -111.8883, // ← Your festival center longitude
        "name": "Festival Center"
      }
    }
  }
}
```

### 4. 🎨 Add Your 3D Content

#### AR Objects (Information panels, art pieces, markers)

In `ar-config.json`, add objects like this:

```json
{
  "id": "main-stage-info",
  "name": "Main Stage Information",
  "location": {
    "lat": 40.7589, // ← Exact GPS coordinates
    "lng": -111.8883
  },
  "visual": {
    "geometry": "primitive: box; width: 3; height: 4; depth: 0.2",
    "material": "color: #4CC3D9; opacity: 0.8",
    "scale": "1 1 1"
  },
  "content": {
    "title": "Main Stage",
    "text": "Next show: 8:00 PM"
  }
}
```

#### Quests (Interactive challenges)

```json
{
  "id": "find-hidden-treasure",
  "title": "Find the Hidden Treasure",
  "description": "Search for the golden orb!",
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

### 5. 🎵 Add Media Assets

Create these folders and add your content:

```
public/
├── models/ar/          ← 3D models (.glb format)
│   ├── crystal-garden.glb
│   └── quest-orb.glb
├── textures/ar/        ← Textures (.jpg format)
│   └── info-panel.jpg
└── sounds/ar/          ← Audio files (.mp3 format)
    ├── treasure-found.mp3
    └── quest-complete.mp3
```

### 6. 🎯 Real-World Setup Checklist

**Print QR Codes:**

- Generate QR codes pointing to: `https://yourfestival.com/ar-standalone.html`
- Print weatherproof QR codes
- Place at: entrances, info booths, key locations

**GPS Coordinates:**

- Walk around your festival with GPS app
- Record exact coordinates for each AR object location
- Update `ar-config.json` with precise lat/lng values

**Test Coverage:**

- Test GPS accuracy at your venue
- Verify 3D objects appear at correct real-world locations
- Check that all interactive elements work

### 7. 🚀 Performance Tips

**Optimize 3D Models:**

- Keep models under 1MB each
- Use compressed .glb format
- Limit polygon count (under 10k triangles)

**Limit Active Objects:**

- Only show objects within 100m of user
- Maximum 10 objects visible at once
- Objects auto-hide when user moves away

### 8. 🔧 Easy Updates

**Update Content:**

- Edit `/public/ar-config.json`
- Add new objects, quests, or change locations
- No code changes needed!

**Add New Features:**

- Edit `ARExperienceView.vue` for Vue integration
- Edit `ar-standalone.html` for standalone version

### 9. 📊 User Progress Tracking

- Quest progress saves to browser localStorage
- Users can resume progress if they close/reopen
- Completed quests persist between sessions

### 10. 🎪 Integration with Your Festival App

Add this to your main Vue router:

```javascript
{
  path: '/ar-experience',
  name: 'ARExperience',
  component: () => import('@/views/ARExperienceView.vue')
}
```

## Technical Features ✨

- **WebAR**: No app download required
- **GPS-based**: 3D objects anchored to real-world coordinates
- **Cross-platform**: Works on iOS Safari, Android Chrome
- **Performant**: Auto-LOD, distance culling, optimized rendering
- **Interactive**: Tap objects, complete quests, track progress
- **Responsive**: Adapts to phone orientation and screen size

## Support

**Browser Requirements:**

- iOS: Safari 13+
- Android: Chrome 81+
- Requires: Camera, GPS, WebGL

**Troubleshooting:**

- GPS accuracy varies (3-10 meters typical)
- Objects may not appear if GPS is inaccurate
- Requires good lighting for camera tracking

---

**Your AR festival experience is ready to deploy! 🎉**
