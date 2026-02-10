// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    // Make sure Vite server listens on all interfaces (already done via CLI flag)
    host: true,

    proxy: {
      // Proxy all requests starting with /super_admin to Flask on port 5000
      '/super_admin': {
        target: 'http://127.0.0.1:5000',   // or 'http://localhost:5000'
        changeOrigin: true,
        secure: false,
        // Do NOT rewrite — keep the /super_admin prefix
        // rewrite: (path) => path.replace(/^\/super_admin/, '')  ← commented out on purpose
      },

      // Optional: proxy any future API calls (you can expand later)
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})