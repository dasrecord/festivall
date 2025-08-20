import { ref, onMounted, onUnmounted } from 'vue'

export function useLazyVideo() {
  const videoRef = ref(null)
  const shouldLoad = ref(false)
  const isLoaded = ref(false)
  
  let observer = null

  const initIntersectionObserver = () => {
    if (typeof window === 'undefined') return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoad.value) {
            shouldLoad.value = true
            // Stop observing once we've triggered loading
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '100px', // Start loading 100px before video comes into view
        threshold: 0.1
      }
    )

    if (videoRef.value) {
      observer.observe(videoRef.value)
    }
  }

  const onVideoLoaded = () => {
    isLoaded.value = true
  }

  onMounted(() => {
    initIntersectionObserver()
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    videoRef,
    shouldLoad,
    isLoaded,
    onVideoLoaded
  }
}
