import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    // Fail fast instead of silently jumping to 5174+ when the port is taken.
    // A silent port bump changes the browser's Origin on every request, which
    // breaks the backend's CORS allowlist without any obvious error message.
    strictPort: true,
  },
  plugins: [
    react(),tailwindcss(),
    checker({
      typescript: true, // Esto asegura que si hay un error de tipos, la build falle de inmediato
    }),
  ],
});