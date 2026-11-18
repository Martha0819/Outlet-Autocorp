import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Las pruebas de integración nunca tocan la base de datos real: usan su propia
// base (.env.test), separada de la que usa `npm run dev`.
process.loadEnvFile(path.resolve(__dirname, '.env.test'));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.mjs'],
    // Varios archivos de prueba comparten la misma base de datos de prueba
    // (outlet_db_test); correrlos en paralelo produce condiciones de carrera
    // entre el beforeEach de un archivo y el test de otro.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
