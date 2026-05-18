import { createServerFn } from '@tanstack/react-start'

export const getCount = createServerFn({ method: 'GET' }).handler(async () => {
  return { count: 42 }
})
