import { BaseExample } from '@/examples/base'
import { BetterAuthExample } from '@/examples/betterauth'
import { DrizzleExample } from '@/examples/drizzle'
import { ShadcnExample } from '@/examples/shadcn'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: RouteComponent })

function RouteComponent() {
  const [activeExample, setActiveExample] = useState<'base' | 'shadcn' | 'drizzle' | 'betterauth'>(
    'base',
  )

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>Examples live in `src/examples` so you can remove them when you start.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveExample('base')}
              className={
                activeExample === 'base'
                  ? 'cursor-pointer underline underline-offset-2'
                  : 'cursor-pointer hover:underline hover:underline-offset-2'
              }
            >
              Base
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
        {activeExample === 'base' && <BaseExample />}
        {activeExample === 'shadcn' && <ShadcnExample />}
        {activeExample === 'drizzle' && <DrizzleExample />}
        {activeExample === 'betterauth' && <BetterAuthExample />}
      </div>
    </div>
  )
}
