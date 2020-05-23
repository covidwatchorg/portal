module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true,
    },
  },
  plugins: ['prettier', 'react'],
  extends: ['prettier', 'eslint:recommended', 'plugin:react/recommended'],
  rules: {
    'prettier/prettier': 'error',
    'react/prop-types': 0,
    'no-console': 0,
  },
  settings: {
    react: {
      version: 'detetect',
    },
  },
}
