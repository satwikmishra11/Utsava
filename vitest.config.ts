import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/domain/**/*.ts', 'src/services/**/*.ts'],
      exclude: [
        '**/__tests__/**',
        'src/domain/types.ts',
        'src/domain/db/schema.ts',
        'src/services/**/types.ts',
        'src/services/repositories/eventRepository.ts',
        'src/services/index.ts',
        'src/services/**/index.ts',
      ],
      thresholds: {
        lines: 85,
        functions: 80,
        branches: 80,
        statements: 85,
        'src/domain/**': {
          lines: 90,
          statements: 90,
        },
        'src/services/**': {
          lines: 90,
          statements: 90,
        },
      },
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
