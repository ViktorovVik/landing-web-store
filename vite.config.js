import { defineConfig } from 'vite'

export default defineConfig({
  base: '/landing-web-store/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})