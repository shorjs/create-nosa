import { defineConfig } from 'oxfmt'

// Refer to https://oxc.rs/docs/guide/usage/formatter/config.html#configuration-file-format
export default defineConfig({
  semi: false,
  singleQuote: true,
  ignorePatterns: ['routeTree.gen.ts'],
})
