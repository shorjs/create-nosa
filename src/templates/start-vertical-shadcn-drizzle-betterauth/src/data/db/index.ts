import { drizzle } from 'drizzle-orm/node-postgres'
import { usersTable } from './schema'
import { user, session, account, verification } from '@/auth/auth-schema'

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { usersTable, user, session, account, verification },
})
