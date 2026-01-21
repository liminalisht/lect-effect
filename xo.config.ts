import {fileURLToPath} from 'node:url';
import {type FlatXoConfig} from 'xo';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

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
      // 'import-x/extensions': 'off',
      'capitalized-comments': 'off',
      'no-warning-comments': ['off', {terms: ['todo', 'fixme', 'hack'], location: 'anywhere'}],
      'unicorn/filename-case': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'unicorn/prevent-abbreviations': 'off',
      '@stylistic/object-curly-spacing': 'off',
      'unicorn/throw-new-error': 'off',
      'import-x/no-unassigned-import': 'off',
      'new-cap': 'off',
    },
  },
  {
    files: ['apps/web/**/*.ts', 'apps/web/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: [
          './apps/web/tsconfig.app.json',
          './apps/web/tsconfig.spec.json',
        ],
        tsconfigRootDir: rootDir,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['test/**', 'packages/domain/test/**'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      'max-nested-callbacks': 'off',
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
