import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React runtime — cached independently from app code
          'vendor-react': ['react', 'react-dom'],
          // Recharts is large (~300 kB); isolate so chart updates don't bust React cache
          'vendor-charts': ['recharts'],
          // Firebase SDK
          'vendor-firebase': ['firebase/app', 'firebase/database'],
          // Lucide icons (~80 kB)
          'vendor-icons': ['lucide-react'],
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js'
  }
})