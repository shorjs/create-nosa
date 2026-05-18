import { authClient } from '@/auth/auth.client'
import { Welcome } from '@/welcome/welcome'
import { createFileRoute } from '@tanstack/react-router'
import { usersTable } from '@/data/db/schema'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: RouteComponent })

function RouteComponent() {
  const [activeExample, setActiveExample] = useState<'welcome' | 'drizzle' | 'betterauth'>(
    'welcome',
  )

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>Verticals live in their own directories so you can remove them when you start.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveExample('welcome')}
              className={
                activeExample === 'welcome'
                  ? 'cursor-pointer underline underline-offset-2'
                  : 'cursor-pointer hover:underline hover:underline-offset-2'
              }
            >
              Welcome
            </button>
            <button
              type="button"
              onClick={() => setActiveExample('drizzle')}
              className={
                activeExample === 'drizzle'
                  ? 'cursor-pointer underline underline-offset-2'
                  : 'cursor-pointer hover:underline hover:underline-offset-2'
              }
            >
              Drizzle
            </button>
            <button
              type="button"
              onClick={() => setActiveExample('betterauth')}
              className={
                activeExample === 'betterauth'
                  ? 'cursor-pointer underline underline-offset-2'
                  : 'cursor-pointer hover:underline hover:underline-offset-2'
              }
            >
              Better Auth
            </button>
          </div>
        </div>
        {activeExample === 'welcome' && <Welcome />}
        {activeExample === 'drizzle' && (
          <div>
            <h2 className="font-medium">Drizzle example</h2>
            <p>Schema ready: {usersTable.email.name}</p>
          </div>
        )}
        {activeExample === 'betterauth' && <BetterAuthExample />}
      </div>
    </div>
  )
}

function BetterAuthExample() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div>
        <h2 className="font-medium">Better Auth example</h2>
        <p>Loading...</p>
      </div>
    )
  }

  if (session) {
    return (
      <div>
        <h2 className="font-medium">Better Auth example</h2>
        <p>Signed in as {session.user.email}</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-medium">Better Auth example</h2>
      <p>You are not signed in.</p>
    </div>
  )
}
