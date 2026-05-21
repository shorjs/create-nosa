import { defineConfig } from 'oxlint'

export default defineConfig({
  categories: {
    correctness: 'error',
  },
  plugins: [
    'eslint',
    'typescript',
    'oxc',
    'unicorn',

    'react',
    'react-perf',
  ],
  options: {
    typeAware: true,
    typeCheck: true,
  },
  ignorePatterns: ['routeTree.gen.ts'],
})
