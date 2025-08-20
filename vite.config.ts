import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import { fileURLToPath, URL } from 'node:url'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({path: resolve(__dirname, '.env.festivall')})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`
          
          const info = assetInfo.name.split('.')
          const extType = info[info.length - 1]
          // Add hash to video files for better caching
          if (/mp4|webm|avi|mov|mkv/i.test(extType)) {
            return `videos/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      }
    }
  },
  server: {
    headers: {
      // Cache video files for 1 week in development
      'Cache-Control': 'public, max-age=604800'
    }
  }
});