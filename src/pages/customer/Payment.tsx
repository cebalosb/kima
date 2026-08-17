import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, DeviceMobile } from '@phosphor-icons/react'
import { useAppData, type PaymentMethod, type VoucherDiscount } from '../../lib/data'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { applyDiscount, formatCurrency } from '../../lib/format'

type RegisterState = { name: string; email: string; phone: string }

const methods: { id: PaymentMethod; label: string; swatch: string; helper: string }[] = [
  { id: 'airtel', label: 'Airtel Money', swatch: 'bg-airtel', helper: 'Pay with your Airtel line' },
  { id: 'mtn', label: 'MTN Mobile Money', swatch: 'bg-mtn', helper: 'Pay with your MTN line' },
]

export function Payment() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { getEvent, registerAndPay, validateVoucher, sendTicketConfirmation } = useAppData()
  const event = id ? getEvent(id) : undefined
  const registration = location.state as RegisterState | null

  const [method, setMethod] = useState<PaymentMethod>('airtel')
  const [phone, setPhone] = useState(registration?.phone ?? '')
  const [status, setStatus] = useState<'idle' | 'pending' | 'success'>('idle')
  const [payError, setPayError] = useState<string | undefined>(undefined)

  const [voucherInput, setVoucherInput] = useState('')
  const [voucherChecking, setVoucherChecking] = useState(false)
  const [voucherApplied, setVoucherApplied] = useState<VoucherDiscount | null>(null)
  const [voucherMessage, setVoucherMessage] = useState<string | undefined>(undefined)

  if (!event) return <Navigate to="/" replace />
  if (!registration) return <Navigate to={`/events/${event.id}/register`} replace />

  const discountedTotal = voucherApplied ? applyDiscount(event.priceAmount, voucherApplied) : event.priceAmount

  async function handleApplyVoucher() {
    const code = voucherInput.trim()
    if (!code) return
    setVoucherChecking(true)
    setVoucherMessage(undefined)
    try {
      const result = await validateVoucher(event!.id, code)
      if (!result) {
        setVoucherApplied(null)
        setVoucherMessage('This voucher code is invalid or has already been used.')
      } else {
        setVoucherApplied(result)
        setVoucherMessage(
          result.discountType === 'percentage'
            ? `${result.discountValue}% off applied.`
            : `${formatCurrency(result.discountValue, event!.priceCurrency)} off applied.`,
        )
      }
    } catch (err) {
      setVoucherApplied(null)
      setVoucherMessage(err instanceof Error ? err.message : 'Could not check that code.')
    } finally {
      setVoucherChecking(false)
    }
  }

  function handleRemoveVoucher() {
    setVoucherApplied(null)
    setVoucherInput('')
    setVoucherMessage(undefined)
  }

  function handlePay() {
    setStatus('pending')
    setPayError(undefined)
    window.setTimeout(async () => {
      try {
        const ticket = await registerAndPay({
          eventId: event!.id,
          attendeeName: registration!.name,
          attendeeEmail: registration!.email,
          attendeePhone: phone.trim(),
          paymentMethod: method,
          voucherCode: voucherApplied ? voucherInput.trim() : undefined,
        })
        setStatus('success')
        // Best-effort: the ticket already exists and payment succeeded,
        // so a confirmation-email failure shouldn't block the user.
        sendTicketConfirmation(ticket.id).catch((err) => console.error('Confirmation email failed:', err))
        window.setTimeout(() => navigate(`/tickets/${ticket.id}`, { replace: true }), 700)
      } catch (err) {
        setStatus('idle')
        setPayError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
      }
    }, 1600)
  }

  if (status !== 'idle') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <div
          className={[
            'flex size-16 items-center justify-center rounded-full transition-colors duration-300',
            status === 'success' ? 'bg-success-soft text-success' : 'bg-muted text-foreground',
          ].join(' ')}
        >
          {status === 'success' ? (
            <CheckCircle size={32} weight="fill" />
          ) : (
            <DeviceMobile size={28} className="animate-pulse" />
          )}
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">
          {status === 'success' ? 'Payment confirmed' : 'Approve the payment on your phone'}
        </h2>
        <p className="text-sm text-foreground-muted">
          {status === 'success'
            ? 'Generating your ticket…'
            : `We sent a ${methods.find((m) => m.id === method)?.label} prompt to ${phone}. Enter your PIN to confirm.`}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        to={`/events/${event.id}/register`}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <div>
        <p className="text-sm font-medium text-accent">Step 2 of 2 — Payment</p>
        <h1 className="font-display mt-1 text-2xl font-bold text-foreground sm:text-3xl">
          Pay for your ticket
        </h1>
      </div>

      <Card className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-foreground-muted">{event.title}</p>
          <p className="text-sm text-foreground-muted">{registration.name}</p>
        </div>
        <div className="text-right">
          {voucherApplied && (
            <p className="text-sm text-foreground-muted line-through">
              {formatCurrency(event.priceAmount, event.priceCurrency)}
            </p>
          )}
          <p className="font-display text-2xl font-extrabold text-foreground">
            {formatCurrency(discountedTotal, event.priceCurrency)}
          </p>
        </div>
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-medium text-foreground">Have a voucher code?</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={voucherInput}
            onChange={(e) => setVoucherInput(e.target.value)}
            placeholder="Enter code"
            disabled={!!voucherApplied}
            className="h-11 flex-1 rounded-xl border border-border bg-muted px-4 text-sm uppercase text-foreground placeholder:text-foreground-muted/70 placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-focus disabled:opacity-60"
          />
          {voucherApplied ? (
            <Button type="button" variant="secondary" size="md" onClick={handleRemoveVoucher}>
              Remove
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleApplyVoucher}
              loading={voucherChecking}
              disabled={!voucherInput.trim()}
            >
              Apply
            </Button>
          )}
        </div>
        {voucherMessage && (
          <p className={`text-xs font-medium ${voucherApplied ? 'text-success' : 'text-destructive'}`}>
            {voucherMessage}
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-5 p-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium text-foreground">Choose payment method</legend>
          {methods.map((m) => (
            <label
              key={m.id}
              className={[
                'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors duration-150',
                method === m.id ? 'border-focus bg-focus/10' : 'border-border bg-muted hover:border-foreground-muted',
              ].join(' ')}
            >
              <input
                type="radio"
                name="payment-method"
                value={m.id}
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
                className="size-4 accent-[var(--color-focus)]"
              />
              <span className={['size-8 shrink-0 rounded-lg', m.swatch].join(' ')} aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold text-foreground">{m.label}</span>
                <span className="block text-xs text-foreground-muted">{m.helper}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <Input
          label="Mobile money number"
          required
          type="tel"
          inputMode="tel"
          helperText="The payment approval prompt will be sent to this number."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {payError && <p className="text-sm font-medium text-destructive">{payError}</p>}

        <Button size="lg" fullWidth onClick={handlePay} disabled={phone.trim().length < 8}>
          Pay {formatCurrency(discountedTotal, event.priceCurrency)}
        </Button>
      </Card>
    </div>
  )
}
