import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          timeout: 60000,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: {
            'anthropic-version': '2023-06-01',
            'x-api-key': env.VITE_ANTHROPIC_KEY,
          }
        }
      }
    }
  }
})