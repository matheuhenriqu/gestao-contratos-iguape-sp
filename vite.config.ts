import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/gestao-contratos-iguape-sp/',
  define: {
    'import.meta.env.VITE_BUILD_DATE': JSON.stringify(new Date().toISOString()),
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ['recharts'],
        },
      },
    },
  },
});
