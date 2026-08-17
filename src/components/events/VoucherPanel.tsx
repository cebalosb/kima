import { useEffect, useState, type FormEvent } from 'react'
import { Copy, TagSimple } from '@phosphor-icons/react'
import { useAppData, type DiscountType, type Voucher } from '../../lib/data'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatCurrency, generateVoucherCode } from '../../lib/format'

export function VoucherPanel({ eventId, currency }: { eventId: string; currency: string }) {
  const { listVouchers, issueVoucher } = useAppData()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState(generateVoucherCode)
  const [discountType, setDiscountType] = useState<DiscountType>('percentage')
  const [discountValue, setDiscountValue] = useState('10')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    listVouchers(eventId).then((v) => {
      if (!cancelled) {
        setVouchers(v)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [eventId, listVouchers])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(undefined)
    const value = Number(discountValue)
    if (!code.trim() || !(value > 0)) {
      setFormError('Enter a code and a discount greater than 0.')
      return
    }
    if (discountType === 'percentage' && value > 100) {
      setFormError('Percentage discount cannot exceed 100.')
      return
    }

    setSubmitting(true)
    try {
      const voucher = await issueVoucher({ eventId, code: code.trim(), discountType, discountValue: value })
      setVouchers((prev) => [voucher, ...prev])
      setCode(generateVoucherCode())
      setDiscountValue('10')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not issue the voucher.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="flex items-center gap-2">
        <TagSimple size={20} className="text-accent" />
        <h2 className="font-display text-xl font-bold text-foreground">Vouchers</h2>
      </div>
      <p className="text-sm text-foreground-muted">
        Issue a single-use discount code attendees can apply on the payment page for this event.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-border bg-muted p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div className="flex min-w-40 flex-1 flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="h-11 rounded-lg border border-border bg-surface px-3 text-sm uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-focus"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Type</label>
          <div className="flex rounded-lg border border-border bg-surface p-1">
            {(['percentage', 'fixed'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDiscountType(t)}
                aria-pressed={discountType === t}
                className={[
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                  discountType === t
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground-muted hover:text-foreground',
                ].join(' ')}
              >
                {t === 'percentage' ? '%' : currency}
              </button>
            ))}
          </div>
        </div>

        <div className="flex w-28 flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">
            {discountType === 'percentage' ? 'Percent off' : `${currency} off`}
          </label>
          <input
            type="number"
            min={0}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className="h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-focus"
          />
        </div>

        <Button type="submit" size="md" loading={submitting}>
          Issue voucher
        </Button>
      </form>

      {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}

      {!loading && vouchers.length > 0 && (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
          {vouchers.map((v) => (
            <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-foreground">{v.code}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(v.code)}
                  aria-label={`Copy ${v.code}`}
                  className="text-foreground-muted transition-colors duration-150 hover:text-foreground"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground-muted">
                  {v.discountType === 'percentage'
                    ? `${v.discountValue}% off`
                    : `${formatCurrency(v.discountValue, currency)} off`}
                </span>
                <Badge tone={v.usedAt ? 'neutral' : 'success'}>{v.usedAt ? 'Used' : 'Active'}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
