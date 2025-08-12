<template>
  <div class="ar-experience">
    <!-- Loading screen -->
    <div v-if="isLoading" class="loading-screen">
      <div class="loading-content">
        <div class="spinner"></div>
        <h2>Loading AR Experience...</h2>
        <p>Please allow camera and location permissions</p>
      </div>
    </div>

    <!-- AR Scene -->
    <div v-else class="ar-container">
      <!-- AR.js + A-Frame Scene -->
      <a-scene
        ref="arScene"
        vr-mode-ui="enabled: false"
        renderer="logarithmicDepthBuffer: true; colorManagement: true"
        arjs="sourceType: webcam; trackingMethod: best; debugUIEnabled: false;"
        embedded
        @arjs-video-loaded="onARReady"
      >
        <!-- Assets -->
        <a-assets>
          <!-- 3D Models -->
          <a-asset-item id="festival-marker" :src="assets.festivalMarker"></a-asset-item>
          <a-asset-item id="quest-orb" :src="assets.questOrb"></a-asset-item>

          <!-- Textures -->
          <img id="info-panel-texture" :src="assets.infoPanelTexture" />
        </a-assets>

        <!-- Camera with GPS -->
        <a-camera
          id="ar-camera"
          gps-camera="simulateLatitude: {{ userLocation.lat }}; simulateLongitude: {{ userLocation.lng }}; simulateAltitude: 0"
          rotation-reader
        ></a-camera>

        <!-- Dynamic AR Objects -->
        <a-entity
          v-for="object in arObjects"
          :key="object.id"
          :id="`ar-object-${object.id}`"
          :gps-entity-place="`latitude: ${object.location.lat}; longitude: ${object.location.lng}`"
          :geometry="object.geometry"
          :material="object.material"
          :animation="object.animation"
          :scale="object.scale"
          :rotation="object.rotation"
          @click="onObjectClick(object)"
          cursor="rayOrigin: mouse"
        >
          <!-- Info overlay for each object -->
          <a-text
            v-if="object.showInfo"
            :value="object.infoText"
            position="0 2 0"
            align="center"
            color="#ffffff"
            background-color="#000000"
            background-opacity="0.7"
            width="8"
          ></a-text>
        </a-entity>

        <!-- Quest markers -->
        <a-entity
          v-for="quest in activeQuests"
          :key="`quest-${quest.id}`"
          :gps-entity-place="`latitude: ${quest.location.lat}; longitude: ${quest.location.lng}`"
          geometry="primitive: sphere; radius: 0.5"
          material="color: #ff6b35; emissive: #ff6b35; emissiveIntensity: 0.3"
          animation="property: rotation; to: 0 360 0; loop: true; dur: 3000"
          @click="onQuestClick(quest)"
          cursor="rayOrigin: mouse"
        >
          <!-- Quest info -->
          <a-text
            :value="quest.title"
            position="0 1 0"
            align="center"
            color="#ffffff"
            width="6"
          ></a-text>
        </a-entity>
      </a-scene>

      <!-- UI Overlay -->
      <div class="ar-ui-overlay">
        <!-- Top bar -->
        <div class="top-bar">
          <button @click="toggleInfo" class="info-btn">
            <i class="fas fa-info-circle"></i>
          </button>
          <div class="location-info">
            <span>{{ userLocation.lat.toFixed(6) }}, {{ userLocation.lng.toFixed(6) }}</span>
          </div>
          <button @click="exitAR" class="exit-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Quest panel -->
        <div v-if="selectedQuest" class="quest-panel">
          <h3>{{ selectedQuest.title }}</h3>
          <p>{{ selectedQuest.description }}</p>
          <div class="quest-actions">
            <button @click="completeQuest(selectedQuest)" class="complete-btn">
              Complete Quest
            </button>
            <button @click="selectedQuest = null" class="close-btn">Close</button>
          </div>
        </div>

        <!-- Info panel -->
        <div v-if="showInfo" class="info-panel">
          <h3>Festival AR Guide</h3>
          <p>Look around to discover hidden objects and complete quests!</p>
          <ul>
            <li>Tap on glowing orbs to start quests</li>
            <li>Find 3D objects placed around the festival</li>
            <li>Complete all quests to unlock special rewards</li>
          </ul>
          <button @click="showInfo = false" class="close-btn">Close</button>
        </div>

        <!-- Progress indicator -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: questProgress + '%' }"></div>
          <span class="progress-text">{{ completedQuests.length }}/{{ totalQuests }} Quests</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ARExperienceView',
  setup() {
    // Reactive data
    const isLoading = ref(true)
    const showInfo = ref(false)
    const selectedQuest = ref(null)
    const userLocation = reactive({ lat: 0, lng: 0 })
    const arObjects = ref([])
    const activeQuests = ref([])
    const completedQuests = ref([])

    // Assets configuration
    const assets = reactive({
      festivalMarker: '/models/festival-marker.glb',
      questOrb: '/models/quest-orb.glb',
      infoPanelTexture: '/textures/info-panel.jpg'
    })

    // Computed properties
    const totalQuests = computed(() => activeQuests.value.length + completedQuests.value.length)
    const questProgress = computed(() =>
      totalQuests.value > 0 ? (completedQuests.value.length / totalQuests.value) * 100 : 0
    )

    // Location tracking
    let watchId = null

    const startLocationTracking = () => {
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            userLocation.lat = position.coords.latitude
            userLocation.lng = position.coords.longitude
            updateNearbyContent()
          },
          (error) => {
            console.error('Geolocation error:', error)
            // Fallback to default festival coordinates
            userLocation.lat = 40.7589 // Example coordinates
            userLocation.lng = -111.8883
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 1000
          }
        )
      }
    }

    const stopLocationTracking = () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
        watchId = null
      }
    }

    // AR Content Management
    const loadARContent = async () => {
      try {
        // This would normally fetch from your backend/JSON config
        const contentConfig = {
          objects: [
            {
              id: 'main-stage-info',
              location: { lat: 40.7589, lng: -111.8883 },
              geometry: 'primitive: box; width: 2; height: 3; depth: 0.1',
              material: 'color: #4CC3D9; opacity: 0.8',
              scale: '1 1 1',
              rotation: '0 0 0',
              infoText: 'Main Stage\nNext show: 8:00 PM',
              showInfo: true,
              animation: 'property: rotation; to: 0 360 0; loop: true; dur: 10000'
            },
            {
              id: 'food-court-marker',
              location: { lat: 40.759, lng: -111.8884 },
              geometry: 'primitive: cylinder; radius: 1; height: 2',
              material: 'color: #FF6B35; emissive: #FF6B35; emissiveIntensity: 0.2',
              scale: '1 1 1',
              rotation: '0 0 0',
              infoText: 'Food Court\nOpen until 10 PM',
              showInfo: true
            }
          ],
          quests: [
            {
              id: 'find-hidden-treasure',
              title: 'Find the Hidden Treasure',
              description: 'Look for the golden orb near the main stage!',
              location: { lat: 40.7588, lng: -111.8882 },
              reward: 'Festival coin',
              completed: false
            },
            {
              id: 'scavenger-hunt-ar',
              title: 'AR Scavenger Hunt',
              description: 'Find all 5 AR markers around the festival!',
              location: { lat: 40.7591, lng: -111.8885 },
              reward: 'Special badge',
              completed: false
            }
          ]
        }

        arObjects.value = contentConfig.objects
        activeQuests.value = contentConfig.quests

        // Load completed quests from localStorage
        const saved = localStorage.getItem('festival-ar-progress')
        if (saved) {
          const progress = JSON.parse(saved)
          completedQuests.value = progress.completed || []
        }
      } catch (error) {
        console.error('Failed to load AR content:', error)
      }
    }

    const updateNearbyContent = () => {
      // Filter and show only nearby objects (within 100 meters)
      const maxDistance = 100 // meters

      arObjects.value = arObjects.value.map((obj) => ({
        ...obj,
        visible: calculateDistance(userLocation, obj.location) <= maxDistance
      }))
    }

    const calculateDistance = (point1, point2) => {
      const R = 6371e3 // Earth's radius in meters
      const φ1 = (point1.lat * Math.PI) / 180
      const φ2 = (point2.lat * Math.PI) / 180
      const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180
      const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      return R * c
    }

    // Event handlers
    const onARReady = () => {
      console.log('AR is ready!')
      isLoading.value = false
    }

    const onObjectClick = (object) => {
      console.log('Object clicked:', object.id)
      // Handle object interaction
      object.showInfo = !object.showInfo
    }

    const onQuestClick = (quest) => {
      selectedQuest.value = quest
    }

    const completeQuest = (quest) => {
      const index = activeQuests.value.findIndex((q) => q.id === quest.id)
      if (index !== -1) {
        const completed = activeQuests.value.splice(index, 1)[0]
        completed.completed = true
        completedQuests.value.push(completed)

        // Save progress
        const progress = {
          completed: completedQuests.value,
          timestamp: Date.now()
        }
        localStorage.setItem('festival-ar-progress', JSON.stringify(progress))

        selectedQuest.value = null

        // Show completion feedback
        alert(`Quest completed: ${quest.title}!`)
      }
    }

    const toggleInfo = () => {
      showInfo.value = !showInfo.value
    }

    const exitAR = () => {
      // Return to main app
      window.history.back()
    }

    // Lifecycle
    onMounted(async () => {
      try {
        await loadARContent()
        startLocationTracking()

        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach((track) => track.stop()) // Stop immediately, AR.js will handle it
      } catch (error) {
        console.error('Failed to initialize AR:', error)
        alert('Camera permission is required for AR experience')
      }
    })

    onUnmounted(() => {
      stopLocationTracking()
    })

    return {
      isLoading,
      showInfo,
      selectedQuest,
      userLocation,
      arObjects,
      activeQuests,
      completedQuests,
      assets,
      questProgress,
      totalQuests,
      onARReady,
      onObjectClick,
      onQuestClick,
      completeQuest,
      toggleInfo,
      exitAR
    }
  }
}
</script>

<style scoped>
.ar-experience {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 1000;
}

.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.loading-content {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.ar-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.ar-ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.ar-ui-overlay > * {
  pointer-events: auto;
}

.top-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 15px;
  border-radius: 25px;
  color: white;
}

.info-btn,
.exit-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.3s;
}

.info-btn:hover,
.exit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.location-info {
  font-size: 12px;
  opacity: 0.8;
}

.quest-panel,
.info-panel {
  position: absolute;
  bottom: 100px;
  left: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 20px;
  border-radius: 15px;
  max-height: 60vh;
  overflow-y: auto;
}

.quest-panel h3,
.info-panel h3 {
  margin-top: 0;
  color: #ff6b35;
}

.quest-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.complete-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
}

.close-btn {
  background: #666;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
}

.progress-bar {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  height: 30px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.3s ease;
}

.progress-text {
  position: relative;
  color: white;
  font-weight: bold;
  font-size: 14px;
  z-index: 1;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .top-bar {
    top: 10px;
    left: 10px;
    right: 10px;
    padding: 8px 12px;
  }

  .quest-panel,
  .info-panel {
    bottom: 80px;
    left: 10px;
    right: 10px;
    padding: 15px;
  }

  .progress-bar {
    bottom: 10px;
    left: 10px;
    right: 10px;
    height: 25px;
  }
}
</style>
