import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHtmlPlugin } from 'vite-plugin-html'
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
    }),
    createHtmlPlugin({
      minify: true
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
        manualChunks: {
          // React 관련 라이브러리를 별도 청크로 분리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Three.js 관련 라이브러리를 별도 청크로 분리
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei', 'three-stdlib'],
          // 상태 관리 및 기타 유틸리티
          'utils-vendor': ['zustand', 'framer-motion']
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    // 청크 사이즈 경고 임계값 증가 (Three.js는 본질적으로 큼)
    chunkSizeWarningLimit: 1000
  }
})
