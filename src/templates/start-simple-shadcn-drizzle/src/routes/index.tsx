import { BaseExample } from '@/examples/base'
import { DrizzleExample } from '@/examples/drizzle'
import { ShadcnExample } from '@/examples/shadcn'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: RouteComponent })

function RouteComponent() {
  const [activeExample, setActiveExample] = useState<'base' | 'shadcn' | 'drizzle'>('base')

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>Examples live in `src/examples` so you can remove them when you start.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => setActiveExample('base')}>
              Base
            </button>
            <button type="button" onClick={() => setActiveExample('shadcn')}>
              shadcn/ui
            </button>
            <button type="button" onClick={() => setActiveExample('drizzle')}>
              Drizzle
            </button>
          </div>
        </div>
        {activeExample === 'base' && <BaseExample />}
        {activeExample === 'shadcn' && <ShadcnExample />}
        {activeExample === 'drizzle' && <DrizzleExample />}
      </div>
    </div>
  )
}
