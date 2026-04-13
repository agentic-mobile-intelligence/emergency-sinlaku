import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  cacheDir: './.vite',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Ensure a single React instance across all deps (fixes react-leaflet v5 + Vite)
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  optimizeDeps: {
    // Pre-bundle leaflet deps together so they share the same React instance
    include: ['leaflet', 'react-leaflet'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
})
