import {type FlatXoConfig} from 'xo';

const xoConfig: FlatXoConfig = [
  {
    files: ['**/*'],
    ignores: ['docs-site/**', '**/node_modules/**', '**/dist/**', '**/build/**'],
    rules: {},
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    rules: {
      // special rules we want to set differently than xo defaults
      indent: ['warn', 2],
      '@typescript-eslint/indent': 'off',
      '@stylistic/indent': 'off',
      'import-x/extensions': 'off',
      'capitalized-comments': 'off',
      'no-warning-comments': ['off', {terms: ['todo', 'fixme', 'hack'], location: 'anywhere'}],
      'unicorn/filename-case': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'unicorn/prevent-abbreviations': 'off',
      '@stylistic/object-curly-spacing': 'off',

      // // todo: rules i want to turn off but can't yet
      // '@typescript-eslint/no-unsafe-assignment': 'off',
      // '@typescript-eslint/no-unsafe-call': 'off',
      // // '@typescript-eslint/no-unsafe-return': 'off',
      // complexity: 'off',
    },
  },
  {
    // non-typeScript files
    files: ['**/*.{js,mjs,cjs,jsx}'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    rules: {
      'unicorn/filename-case': 'off',
      'unicorn/prefer-module': 'off',
    },
  },
];

export default xoConfig;
