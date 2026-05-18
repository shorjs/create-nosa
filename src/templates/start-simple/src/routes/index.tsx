import { BaseExample } from '@/examples/base'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: RouteComponent })

function RouteComponent() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>Examples live in `src/examples` so you can remove them when you start.</p>
        </div>
        <BaseExample />
      </div>
    </div>
  )
}
