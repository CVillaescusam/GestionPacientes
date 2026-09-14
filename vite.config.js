import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración estándar de Vite para un proyecto React.
// No necesita nada especial: Supabase se usa como cliente HTTP normal,
// no requiere plugins ni configuración extra.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
