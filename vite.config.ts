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
    vue({
      template: {
        compilerOptions: {
          // Treat all a-* tags as native custom elements (A-Frame)
          isCustomElement: (tag) => tag.startsWith('a-')
        }
      }
    }),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: 'localhost'
  }
});