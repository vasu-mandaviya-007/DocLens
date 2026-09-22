import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'; // Ye import karna jaruri hai


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: { 
      'styles': path.resolve(import.meta.dirname, './src/styles'),
      "@": path.resolve(__dirname, "./src"),
    }
  }
})
