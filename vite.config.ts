import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),tailwindcss(),
    checker({
      typescript: true, // Esto asegura que si hay un error de tipos, la build falle de inmediato
    }),
  ],
});