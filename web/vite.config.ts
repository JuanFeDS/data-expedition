import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/pruebas/preparar.ts'],
    coverage: { provider: 'v8', include: ['src/**/*.{ts,tsx}'], exclude: ['src/**/*.test.*', 'src/pruebas/**', 'src/demo/**', 'src/app/registro.ts', 'src/app/main.tsx'],
      // Mínimos que no pueden bajar: la lógica y el acceso a datos son lo que más duele si falla.
      thresholds: { 'src/dominio/**': { lines: 90, functions: 90, branches: 80 }, 'src/servicios/**': { lines: 80, functions: 75, branches: 55 } },
    },
  },
});
