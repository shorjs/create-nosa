import { defineConfig } from 'oxlint'

export default defineConfig({
  categories: {
    correctness: 'error',
  },
  plugins: [
    // default enabled in built-in plugins https://oxc.rs/docs/guide/usage/linter/plugins.html#supported-plugins
    'eslint',
    'typescript',
    'oxc',
    'unicorn',

    // default disabled in built-in plugins
    'react',
    'react-perf',
  ],
  options: {
    typeAware: true,
    typeCheck: true,
  },
  ignorePatterns: ['routeTree.gen.ts'],
})
