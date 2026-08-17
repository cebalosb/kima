import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { useAuth, isAdminRole } from '../../lib/auth'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function LogIn() {
  const { logIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | undefined>(undefined)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setFormError(undefined)
    if (!email.trim() || !password) return

    setSubmitting(true)
    const result = await logIn({ email: email.trim(), password })
    setSubmitting(false)

    if (result.error) {
      setFormError(result.error)
      return
    }
    navigate(from ?? (result.role && isAdminRole(result.role) ? '/admin' : '/organizer'), { replace: true })
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        to="/"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to events
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Log in</h1>
        <p className="mt-1 text-sm text-foreground-muted">Welcome back — log in to manage your tickets.</p>
      </div>

      <Card className="p-6">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            required
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={submitted && !email.trim() ? 'Enter your email' : undefined}
          />
          <Input
            label="Password"
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={submitted && !password ? 'Enter your password' : undefined}
          />

          {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}

          <Button type="submit" size="lg" fullWidth className="mt-1" loading={submitting}>
            Log In
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-foreground-muted">
        Don't have an account?{' '}
        <Link to="/signup" state={{ from }} className="font-medium text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
