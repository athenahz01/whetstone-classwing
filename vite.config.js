import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Increase the chunk size warning limit — the base64 faculty photos
    // make the bundle large by design; this is expected behavior.
    chunkSizeWarningLimit: 4000,
  },
})
