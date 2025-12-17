import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import { fileWriterPlugin } from './vite-plugin-file-writer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), fileWriterPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    cors: true,
  },
})

