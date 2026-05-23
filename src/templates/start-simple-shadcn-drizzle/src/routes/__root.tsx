import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { ThemeProvider } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { getErrorMessage } from '../errors'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  errorComponent: RootErrorComponent,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
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

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
