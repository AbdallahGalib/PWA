import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: 'index.html',
        'service-worker': 'public/service-worker.js'
      }
    }
  },
  server: {
    headers: {
      'Service-Worker-Allowed': '/'
    }
  }
})
