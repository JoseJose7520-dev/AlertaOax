import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, las peticiones a /api se reenvían al backend (Express, puerto 3000).
// En producción, Nginx hace ese mismo proxy inverso (ver figura de arquitectura).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
