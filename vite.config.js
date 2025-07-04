import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split external dependencies into separate chunks
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
