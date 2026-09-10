const expo = require('eslint-config-expo/flat');
const tseslint = require('typescript-eslint');

module.exports = [
  { ignores: ['dist/**', '.expo/**', 'coverage/**'] },
  {
    files: ['**/__tests__/**/*'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
  },
  ...expo,
  {
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      // The TS resolver inside eslint-plugin-import cannot load under
      // TypeScript 6; tsc already covers unresolved imports.
      'import/namespace': 'off',
      'import/no-unresolved': 'off',
      'import/no-cycle': 'off',
      'import/no-duplicates': 'off',
    },
  },
  {
    // process.env may only be touched in one place: src/lib/env.ts.
    // Everywhere else must import from '@/lib/env'.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/env.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: 'Import env values from @/lib/env instead of reading process.env directly.',
        },
      ],
    },
  },
];
