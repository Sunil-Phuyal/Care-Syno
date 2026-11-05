import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Fail the build early instead of shipping a bundle that quietly calls localhost.
  if (mode === 'production') {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    if (!env.VITE_API_BASE_URL) {
      throw new Error(
        'VITE_API_BASE_URL is missing. Set it in .env.production (or in the host settings) before a production build.'
      )
    }
  }

  return {
    plugins: [react()],
  }
})