/* eslint-env node */

// ESLint 8 (eslintrc format). This file must stay .cjs because package.json
// sets "type": "module" and eslintrc configs are loaded as CommonJS.
module.exports = {
  root: true,

  env: {
    browser: true,
    es2022: true,
  },

  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    // React 17+ automatic runtime: JSX does not require React in scope.
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },

  settings: {
    react: { version: 'detect' },
  },

  plugins: ['react-refresh'],

  globals: {
    // Injected as a literal by Vite's `define` (see vite.config.js).
    __MOCK_API__: 'readonly',
  },

  ignorePatterns: ['dist', 'coverage', 'node_modules', '.eslintrc.cjs'],

  rules: {
    // Fast Refresh only works when a module exports components alone;
    // constants are safe to export alongside them.
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    // This is a plain JS codebase without a runtime prop-validation policy:
    // some components declare propTypes, most do not. Enforcing it here would
    // flag ~25 existing components without making anything safer. Revisit if
    // the project adopts TypeScript or commits to propTypes everywhere.
    'react/prop-types': 'off',

    // Allow deliberately discarded bindings, e.g. stripping a password field
    // via `const { password: _password, ...user } = match`.
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],

    // Unescaped quotes and apostrophes in copy are legible and intentional.
    'react/no-unescaped-entities': 'off',
  },

  overrides: [
    {
      // react-three-fiber renders three.js objects (<mesh>, <ambientLight>,
      // <sphereGeometry>) whose props are not DOM attributes, so
      // react/no-unknown-property reports every one as unknown. Scoped to the
      // 3D components so genuine DOM attribute typos are still caught elsewhere.
      files: ['src/components/AnatomyScene.jsx', 'src/components/DNAViewer.jsx'],
      rules: {
        'react/no-unknown-property': 'off',
      },
    },
    {
      // Vitest supplies these as globals (`globals: true` in vite.config.js).
      files: ['**/__tests__/**/*.{js,jsx}', '**/*.{test,spec}.{js,jsx}'],
      env: { node: true },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
      },
    },
    {
      // Test bootstrap runs in Node and assigns browser globals.
      files: ['src/test/**/*.js'],
      env: { node: true },
    },
  ],
}
