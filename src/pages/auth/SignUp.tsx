import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { useAuth } from '../../lib/auth'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9\s]{8,15}$/

export function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | undefined>(undefined)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const isValid =
    name.trim().length >= 2 &&
    EMAIL_PATTERN.test(email.trim()) &&
    PHONE_PATTERN.test(phone.trim()) &&
    password.length >= 6 &&
    confirmPassword === password

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setFormError(undefined)
    if (!isValid) return

    setSubmitting(true)
    const result = await signUp({ name: name.trim(), email: email.trim(), phone: phone.trim(), password })
    setSubmitting(false)

    if (result.error) {
      setFormError(result.error)
      return
    }
    if (result.needsEmailConfirmation) {
      setConfirmationSent(true)
      return
    }
    navigate(from ?? '/organizer', { replace: true })
  }

  if (confirmationSent) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <Card className="p-6 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Check your email</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            We sent a confirmation link to <span className="font-medium text-foreground">{email.trim()}</span>.
            Click it, then come back and log in.
          </p>
          <Link to="/login" state={{ from }} className="mt-4 inline-block font-medium text-accent hover:underline">
            Go to log in
          </Link>
        </Card>
      </div>
    )
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
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Create your account</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Sign up to register for events and manage your tickets.
        </p>
      </div>

      <Card className="p-6">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <Input
            label="Full name"
            required
            autoComplete="name"
            placeholder="e.g. Aïcha Koné"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={submitted && name.trim().length < 2 ? 'Enter your full name' : undefined}
          />
          <Input
            label="Email"
            required
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={submitted && !EMAIL_PATTERN.test(email.trim()) ? 'Enter a valid email address' : undefined}
          />
          <Input
            label="Phone number"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="e.g. 07 00 00 00 00"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={submitted && !PHONE_PATTERN.test(phone.trim()) ? 'Enter a valid phone number' : undefined}
          />
          <Input
            label="Password"
            required
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={submitted && password.length < 6 ? 'Password must be at least 6 characters' : undefined}
          />
          <Input
            label="Confirm password"
            required
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={submitted && confirmPassword !== password ? 'Passwords do not match' : undefined}
          />

          {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}

          <Button type="submit" size="lg" fullWidth className="mt-1" loading={submitting}>
            Sign Up
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-foreground-muted">
        Already have an account?{' '}
        <Link to="/login" state={{ from }} className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
