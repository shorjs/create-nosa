import { Welcome } from '@/welcome/welcome'
import { ShadcnExample } from '@/examples/shadcn-example'
import { TanstackFormExample } from '@/examples/tanstack-form-example'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: RouteComponent })

type ActiveExample = 'welcome' | 'shadcn' | 'tanstack-form'

function RouteComponent() {
  const [activeExample, setActiveExample] = useState<ActiveExample>('welcome')

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
              onClick={() => setActiveExample('shadcn')}
              className={
                activeExample === 'shadcn'
                  ? 'cursor-pointer underline underline-offset-2'
                  : 'cursor-pointer hover:underline hover:underline-offset-2'
              }
            >
              shadcn/ui
            </button>
            <button
              type="button"
              onClick={() => setActiveExample('tanstack-form')}
              className={
                activeExample === 'tanstack-form'
                  ? 'cursor-pointer underline underline-offset-2'
                  : 'cursor-pointer hover:underline hover:underline-offset-2'
              }
            >
              TanStack Form
            </button>
          </div>
        </div>
        {activeExample === 'welcome' && <Welcome />}
        {activeExample === 'shadcn' && <ShadcnExample />}
        {activeExample === 'tanstack-form' && <TanstackFormExample />}
      </div>
    </div>
  )
}
