import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { ThemeProvider } from '@/design-system/theme-provider'
import { Toaster } from '@/design-system/ui/sonner'
import { ErrorBoundary } from '@/errors/error-boundary'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  errorComponent: ErrorBoundary,
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
