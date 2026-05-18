import { usersTable } from '@/data/db/schema'

export function DrizzleExample() {
  return (
    <div>
      <h2 className="font-medium">Drizzle example</h2>
      <p>Schema ready: {usersTable.email.name}</p>
    </div>
  )
}
