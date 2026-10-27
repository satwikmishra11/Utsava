import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ['.next/**', 'coverage/**', 'node_modules/**', 'next-env.d.ts'],
  },
  ...compat.extends(
    'next/core-web-vitals',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended'
  ),
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
    },
  },
  {
    files: ['scripts/**'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/__tests__/**', 'e2e/**'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    ignores: ['src/domain/**/__tests__/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/services',
                '@/services/**',
                '../services/**',
                '../../services/**',
                '@/components',
                '@/components/**',
                '../components/**',
                '../../components/**',
                '@/app',
                '@/app/**',
                '../app/**',
                '../../app/**',
              ],
              message: 'Domain layer cannot import from services, components, or app layers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/services/**/*.{ts,tsx}'],
    ignores: ['src/services/**/__tests__/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components', '@/components/**', '../components/**', '../../components/**'],
              message: 'Services layer cannot import from components layer.',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
