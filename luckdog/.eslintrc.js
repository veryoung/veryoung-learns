module.exports = {
  root: true,
  parser: 'babel-eslint',
  plugins: ['react', 'react-native'],
  extends: ['plugin:react/recommended', '@tencent/eslint-config-tencent'],
  ignorePatterns: ['.eslintrc.js'],
  env: {
    node: true,
    browser: true,
    es6: true,
    'react-native/react-native': true,
    jest: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  settings: {
    react: {
      createClass: 'createReactClass', // Regex for Component Factory to use,
      pragma: 'React', // Pragma to use, default to "React"
      version: 'detect', // React version. "detect" automatically picks the version you have installed.
    },
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      env: { browser: true, es6: true, node: true },
      extends: ['plugin:@typescript-eslint/recommended', '@tencent/eslint-config-tencent/ts'],
      globals: { Atomics: 'readonly', SharedArrayBuffer: 'readonly' },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: { jsx: false },
        ecmaVersion: 2018,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        indent: ['error', 2, { SwitchCase: 1 }],
        quotes: ['error', 'single'],
        'linebreak-style': ['error', 'unix'],
        'comma-dangle': ['error', 'always-multiline'],
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0,
        'operator-linebreak': 0,
        '@typescript-eslint/explicit-member-accessibility': ['error'],
      },
    },
  ],
  globals: {
    assert: true,
  },
  rules: {
    camelcase: 'off',
    'react/no-string-refs': 'off',
    'react/prop-types': 'off',
    'func-style': 'error',
    'no-console': ['error', { allow: ['error'] }],
    'no-mixed-operators': [
      'error',
      {
        groups: [
          ['+', '-', '*', '/', '%'],
          ['&&', '||'],
        ],
        allowSamePrecedence: false,
      },
    ],
    'react-native/no-unused-styles': 2,
  },
};
