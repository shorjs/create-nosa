import { authClient } from '@/auth/auth.client'

export function BetterAuthExample() {
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
