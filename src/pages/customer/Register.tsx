import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { useAppData } from '../../lib/data'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { formatCurrency } from '../../lib/format'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Register() {
  const { id } = useParams<{ id: string }>()
  const { getEvent } = useAppData()
  const navigate = useNavigate()
  const event = id ? getEvent(id) : undefined

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; phone?: boolean }>({})

  if (!event) return <Navigate to="/" replace />

  const nameError = touched.name && name.trim().length < 2 ? 'Enter your full name' : undefined
  const emailError = touched.email && !EMAIL_PATTERN.test(email.trim()) ? 'Enter a valid email address' : undefined
  const phoneError =
    touched.phone && !/^\+?[0-9\s]{8,15}$/.test(phone.trim())
      ? 'Enter a valid phone number'
      : undefined

  const isValid =
    name.trim().length >= 2 && EMAIL_PATTERN.test(email.trim()) && /^\+?[0-9\s]{8,15}$/.test(phone.trim())

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true, phone: true })
    if (!isValid) return
    navigate(`/events/${event!.id}/pay`, {
      state: { name: name.trim(), email: email.trim(), phone: phone.trim() },
    })
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        to={`/events/${event.id}`}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to event
      </Link>

      <div>
        <p className="text-sm font-medium text-accent">Step 1 of 2 — Registration</p>
        <h1 className="font-display mt-1 text-2xl font-bold text-foreground sm:text-3xl">
          Register for {event.title}
        </h1>
        <p className="mt-2 text-sm text-foreground-muted">
          {formatCurrency(event.priceAmount, event.priceCurrency)} · We'll use these details to
          create your ticket and email you a confirmation once payment succeeds.
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
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            error={nameError}
          />
          <Input
            label="Email"
            required
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            helperText="We'll send your ticket confirmation here."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            error={emailError}
          />
          <Input
            label="Phone number"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="e.g. 07 00 00 00 00"
            helperText="This is also the number you'll pay with in the next step."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            error={phoneError}
          />
          <Button type="submit" size="lg" fullWidth>
            Continue to Payment
          </Button>
        </form>
      </Card>
    </div>
  )
}
