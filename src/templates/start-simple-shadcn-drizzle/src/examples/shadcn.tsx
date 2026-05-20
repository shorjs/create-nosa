import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

export function ShadcnExample() {
  return (
    <div className="flex flex-col items-start gap-2">
      <h2 className="font-medium">shadcn/ui example</h2>
      <Button
        onClick={() =>
          toast('shadcn/ui toast', {
            description: 'Sonner follows your system theme.',
          })
        }
      >
        Show toast
      </Button>
    </div>
  )
}
