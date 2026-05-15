import { defineConfig } from 'oxlint'

export default defineConfig({
  categories: {
    correctness: 'error',
  },
  options: {
    typeAware: true,
    typeCheck: true,
  },
  ignorePatterns: ['templates/**'],
})
