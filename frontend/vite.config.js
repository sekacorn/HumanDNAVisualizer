import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `__MOCK_API__` is inlined as a literal `true`/`false` at build time so the
// bundler can dead-code-eliminate the entire demo-mode layer. Without a literal
// the fixtures (including the demo credentials) get shipped in production.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    __MOCK_API__: JSON.stringify(mode === 'demo'),
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true
  }
}))
