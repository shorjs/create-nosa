import { Button } from '@/design-system/ui/button'
import { getErrorMessage } from './errors'

type ErrorBoundaryProps = {
  error: unknown
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-4 px-6 py-12">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">Something went wrong</p>
        <h1 className="text-2xl font-semibold">We couldn't load this page.</h1>
        <p className="text-muted-foreground">{getErrorMessage(error)}</p>
      </div>
      <Button type="button" className="w-fit" onClick={reset}>
        Try again
      </Button>
    </main>
  )
}
