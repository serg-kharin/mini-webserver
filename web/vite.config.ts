import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8'))

// relative asset paths so the bundle works from any host/port; output goes to dist
export default defineConfig({
  plugins: [react()],
  base: './',
  // bake the UI version into the bundle so it can be shown in the footer
  define: { __UI_VERSION__: JSON.stringify(pkg.version) },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // dev only: proxy API calls to the stub server
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/polyfills.ts', './src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/test/**'],
      thresholds: { statements: 90, functions: 90, lines: 90, branches: 90 },
    },
  },
})
