import { authClient } from '@/lib/auth-client'
import { useState } from 'react'

export function GoogleOAuthExample() {
  const { data: session, isPending } = authClient.useSession()
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  const signInWithGoogle = async () => {
    setIsGoogleSubmitting(true)
    setErrorMessage(undefined)

    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
      errorCallbackURL: '/',
    })

    if (error) {
      setErrorMessage(error.message || 'Could not start Google sign-in. Please try again.')
      setIsGoogleSubmitting(false)
    }
  }

  if (isPending) {
    return (
      <div>
        <h2 className="font-medium">Google OAuth example</h2>
        <p>Loading...</p>
      </div>
    )
  }

  if (session) {
    return (
      <div>
        <h2 className="font-medium">Google OAuth example</h2>
        <p>Signed in as {session.user.email}</p>
        <button
          type="button"
          className="cursor-pointer underline underline-offset-2"
          onClick={() => authClient.signOut()}
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-medium">Google OAuth example</h2>
      <p>Use Google OAuth to create or access an account.</p>
      <button
        type="button"
        className="cursor-pointer underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={signInWithGoogle}
        disabled={isGoogleSubmitting}
      >
        {isGoogleSubmitting ? 'Opening Google...' : 'Sign in with Google'}
      </button>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  )
}
