import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "http://localhost:3001" // Redirect back to web app
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Login to TaskManager</h1>
      <Button onClick={handleLogin}>
        Sign in with Google
      </Button>
    </div>
  )
}
