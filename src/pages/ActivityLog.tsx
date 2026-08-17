import {
  CheckCircle,
  ClockCounterClockwise,
  PencilSimple,
  Sparkle,
  Trash,
  Wallet,
  WarningCircle,
  XCircle,
  type Icon,
} from '@phosphor-icons/react'
import { useAppData, type ActivityType } from '../lib/data'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { formatTime } from '../lib/format'

const activityConfig: Record<ActivityType, { icon: Icon; iconBg: string; iconColor: string }> = {
  event_created: { icon: Sparkle, iconBg: 'bg-accent-soft', iconColor: 'text-accent' },
  event_updated: { icon: PencilSimple, iconBg: 'bg-accent-soft', iconColor: 'text-accent' },
  payment_confirmed: { icon: Wallet, iconBg: 'bg-success-soft', iconColor: 'text-success' },
  scan_valid: { icon: CheckCircle, iconBg: 'bg-success-soft', iconColor: 'text-success' },
  scan_used: { icon: WarningCircle, iconBg: 'bg-warning-soft', iconColor: 'text-warning' },
  scan_invalid: { icon: XCircle, iconBg: 'bg-destructive-soft', iconColor: 'text-destructive' },
}

const actorLabel: Record<'customer' | 'organizer' | 'admin', string> = {
  customer: 'Customer',
  organizer: 'Organizer',
  admin: 'Admin',
}

export function ActivityLog() {
  const { logs, clearLogs } = useAppData()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Activity Log</h1>
          <p className="mt-1 max-w-xl text-sm text-foreground-muted">
            A live, timestamped trail of everything that's happened in this session — events
            published, payments confirmed, and tickets scanned at the door.
          </p>
        </div>
        {logs.length > 0 && (
          <Button variant="secondary" size="md" onClick={clearLogs}>
            <Trash size={18} />
            Clear log
          </Button>
        )}
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<ClockCounterClockwise size={24} />}
          title="No activity yet"
          description="Create an event, register and pay for a ticket, or scan one at the door — every action will show up here."
        />
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {logs.map((entry) => {
            const config = activityConfig[entry.type]
            const Icon = config.icon
            return (
              <div key={entry.id} className="flex items-start gap-4 p-5">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${config.iconBg} ${config.iconColor}`}
                >
                  <Icon size={20} weight="fill" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{entry.message}</p>
                    <Badge tone="neutral">{actorLabel[entry.actor]}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-foreground-muted">{entry.detail}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-foreground-muted">
                  {formatTime(entry.timestamp)}
                </span>
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}
