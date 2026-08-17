import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Camera, CheckCircle, Scan, ShuffleAngular, WarningCircle, XCircle } from '@phosphor-icons/react'
import { useAppData, type ScanResult } from '../../lib/data'
import { useAuth } from '../../lib/auth'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { formatDate } from '../../lib/format'

export function ScanTicket() {
  const { tickets, scanTicket } = useAppData()
  const { user, loading } = useAuth()
  const location = useLocation()
  const [code, setCode] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  async function runScan(value: string) {
    if (!value.trim()) return
    setResult(await scanTicket(value))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    runScan(code)
  }

  function handleSimulate() {
    const candidate = tickets.find((t) => t.status === 'valid') ?? tickets[0]
    if (!candidate) {
      setResult({ outcome: 'invalid' })
      return
    }
    setCode(candidate.qrValue)
    runScan(candidate.qrValue)
  }

  function reset() {
    setResult(null)
    setCode('')
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Scan tickets</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Point your camera at an attendee's QR code, or enter the ticket code manually.
        </p>
      </div>

      {result ? (
        <ScanResultPanel result={result} onReset={reset} />
      ) : (
        <>
          <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl bg-primary p-8 shadow-sm">
            <div className="relative flex size-48 items-center justify-center">
              <span className="absolute left-0 top-0 size-8 rounded-tl-2xl border-l-4 border-t-4 border-accent" />
              <span className="absolute right-0 top-0 size-8 rounded-tr-2xl border-r-4 border-t-4 border-accent" />
              <span className="absolute bottom-0 left-0 size-8 rounded-bl-2xl border-b-4 border-l-4 border-accent" />
              <span className="absolute bottom-0 right-0 size-8 rounded-br-2xl border-b-4 border-r-4 border-accent" />
              <Camera size={40} className="text-on-primary/50" />
            </div>
            <p className="text-sm text-on-primary/60">Camera preview appears here</p>
          </div>

          <Card className="flex flex-col gap-4 p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Ticket code"
                placeholder="e.g. kima_a1b2c3d4"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                helperText="Paste or type the code printed under the QR."
              />
              <Button type="submit" size="lg" fullWidth>
                <Scan size={18} />
                Check ticket
              </Button>
            </form>

            <div className="flex items-center gap-3 text-xs text-foreground-muted">
              <span className="h-px flex-1 bg-border" />
              or, for this demo
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button variant="secondary" size="md" fullWidth onClick={handleSimulate}>
              <ShuffleAngular size={18} />
              Simulate scanning a ticket
            </Button>
          </Card>
        </>
      )}
    </div>
  )
}

function ScanResultPanel({ result, onReset }: { result: ScanResult; onReset: () => void }) {
  const config = {
    valid: {
      tone: 'bg-success-soft text-success border-success/40',
      icon: <CheckCircle size={40} weight="fill" />,
      title: 'Valid — Entry granted',
    },
    used: {
      tone: 'bg-warning-soft text-warning border-warning/40',
      icon: <WarningCircle size={40} weight="fill" />,
      title: 'Already used',
    },
    invalid: {
      tone: 'bg-destructive-soft text-destructive border-destructive/40',
      icon: <XCircle size={40} weight="fill" />,
      title: 'Invalid code',
    },
  }[result.outcome]

  return (
    <div className={['flex flex-col items-center gap-4 rounded-2xl border p-8 text-center', config.tone].join(' ')}>
      {config.icon}
      <h2 className="text-xl font-bold">{config.title}</h2>
      {result.outcome !== 'invalid' ? (
        <div className="text-sm text-foreground">
          <p className="font-semibold">{result.ticket.attendeeName}</p>
          <p className="text-foreground-muted">{result.event.title}</p>
          <p className="text-foreground-muted">{formatDate(result.event.dateISO)}</p>
        </div>
      ) : (
        <p className="text-sm text-foreground-muted">This ticket code wasn't found. Ask the attendee to show their confirmation.</p>
      )}
      <Button variant="secondary" size="md" onClick={onReset} className="mt-2">
        Scan another ticket
      </Button>
    </div>
  )
}
