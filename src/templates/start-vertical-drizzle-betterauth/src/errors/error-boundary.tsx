import { getErrorMessage } from './errors'

type ErrorBoundaryProps = {
  error: unknown
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-4 px-6 py-12">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-neutral-500">Something went wrong</p>
        <h1 className="text-2xl font-semibold">We couldn't load this page.</h1>
        <p className="text-neutral-600">{getErrorMessage(error)}</p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="w-fit cursor-pointer rounded-sm border px-3 py-1 text-sm hover:bg-neutral-100"
      >
        Try again
      </button>
    </main>
  )
}
