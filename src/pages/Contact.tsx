import { useState, type FormEvent } from 'react'
import { FacebookLogo, InstagramLogo, LinkedinLogo } from '@phosphor-icons/react'
import { useAppData } from '../lib/data'
import { Card } from '../components/ui/Card'
import { Input, Textarea } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const socialLinks = [
  { label: 'Facebook', href: '#', icon: FacebookLogo },
  { label: 'Instagram', href: '#', icon: InstagramLogo },
  { label: 'LinkedIn', href: '#', icon: LinkedinLogo },
]

export function Contact() {
  const { submitContactMessage } = useAppData()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | undefined>(undefined)
  const [sent, setSent] = useState(false)

  const isValid = name.trim().length >= 2 && EMAIL_PATTERN.test(email.trim()) && message.trim().length >= 10

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setFormError(undefined)
    if (!isValid) return

    setSubmitting(true)
    try {
      await submitContactMessage({ name: name.trim(), email: email.trim(), message: message.trim() })
      setSent(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Contact us</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Questions, feedback, or partnership ideas — send us a message and we'll get back to you.
        </p>
      </div>

      <Card className="p-6">
        {sent ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <h2 className="font-display text-xl font-bold text-foreground">Message sent</h2>
            <p className="text-sm text-foreground-muted">Thanks for reaching out — we'll be in touch soon.</p>
          </div>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            <Input
              label="Your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={submitted && name.trim().length < 2 ? 'Enter your name' : undefined}
            />
            <Input
              label="Email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={submitted && !EMAIL_PATTERN.test(email.trim()) ? 'Enter a valid email address' : undefined}
            />
            <Textarea
              label="Message"
              required
              placeholder="How can we help?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              error={submitted && message.trim().length < 10 ? 'Enter a message (min 10 characters)' : undefined}
            />

            {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}

            <Button type="submit" size="lg" fullWidth className="mt-1" loading={submitting}>
              Send message
            </Button>
          </form>
        )}
      </Card>

      <div className="flex items-center justify-center gap-4">
        {socialLinks.map((social) => {
          const Icon = social.icon
          return (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              className="flex size-11 items-center justify-center rounded-full border border-border bg-surface text-foreground-muted transition-colors duration-150 hover:border-accent hover:text-accent"
            >
              <Icon size={20} />
            </a>
          )
        })}
      </div>
    </div>
  )
}
