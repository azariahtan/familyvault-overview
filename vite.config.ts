import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/familyvault-overview/',
  plugins: [
    tanstackStart({
      spa: {
        enabled: true,
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
