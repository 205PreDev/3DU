import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-styled-components',
            {
              displayName: true,
              fileName: true,
              ssr: false,
              minify: true,
              transpileTemplateLiterals: true,
              pure: true
            }
          ]
        ]
      }
    })
  ],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000
  },
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
