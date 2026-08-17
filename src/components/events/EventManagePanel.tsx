import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Circle, PencilSimple, QrCode, Star, Trash } from '@phosphor-icons/react'
import type { EventItem, Ticket } from '../../lib/data'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'
import { Button, buttonClasses } from '../ui/Button'
import { bannerStyle, formatCapacity, formatCurrency } from '../../lib/format'

export function EventManagePanel({
  event,
  attendees,
  backTo,
  backLabel,
  organizerName,
  editTo,
  onDelete,
  onTogglePromote,
}: {
  event: EventItem
  attendees: Ticket[]
  backTo: string
  backLabel: string
  organizerName?: string
  editTo?: string
  onDelete?: () => Promise<void>
  onTogglePromote?: () => Promise<void>
}) {
  const checkedIn = attendees.filter((t) => t.status === 'used').length
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [promoting, setPromoting] = useState(false)

  async function handleDelete() {
    if (!onDelete) return
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await onDelete()
      navigate(backTo, { replace: true })
    } catch (err) {
      setDeleting(false)
      window.alert(err instanceof Error ? err.message : 'Could not delete the event.')
    }
  }

  async function handleTogglePromote() {
    if (!onTogglePromote) return
    setPromoting(true)
    try {
      await onTogglePromote()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not update this event.')
    } finally {
      setPromoting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={backTo}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors duration-150 hover:text-foreground"
        >
          <ArrowLeft size={16} />
          {backLabel}
        </Link>
        <div className="flex items-center gap-3">
          {onTogglePromote && (
            <Button
              variant={event.isTop ? 'secondary' : 'primary'}
              size="md"
              loading={promoting}
              onClick={handleTogglePromote}
            >
              <Star size={16} weight={event.isTop ? 'fill' : 'regular'} />
              {event.isTop ? 'Remove from Top' : 'Promote to Top'}
            </Button>
          )}
          {editTo && (
            <Link to={editTo} className={buttonClasses({ variant: 'secondary', size: 'md' })}>
              <PencilSimple size={16} />
              Edit event
            </Link>
          )}
          {onDelete && (
            <Button variant="destructive" size="md" loading={deleting} onClick={handleDelete}>
              <Trash size={16} />
              Delete event
            </Button>
          )}
        </div>
      </div>

      <div className="relative flex h-40 flex-col justify-end rounded-2xl p-6" style={bannerStyle(event)}>
        {event.isTop && (
          <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
            <Star size={12} weight="fill" className="text-accent" />
            Top
          </span>
        )}
        <h1 className="font-display text-2xl font-extrabold text-white drop-shadow sm:text-3xl">
          {event.title}
        </h1>
        {organizerName && (
          <p className="mt-1 text-sm font-medium text-white/85 drop-shadow">Organized by {organizerName}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-foreground-muted">Ticket price</p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(event.priceAmount, event.priceCurrency)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-foreground-muted">Sold / Capacity</p>
          <p className="text-xl font-bold text-foreground">
            {attendees.length} / {formatCapacity(event.capacity)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-foreground-muted">Checked in</p>
          <p className="text-xl font-bold text-foreground">
            {checkedIn} / {attendees.length}
          </p>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Attendees</h2>
        <Link to="/organizer/scan" className={buttonClasses({ size: 'md' })}>
          <QrCode size={18} />
          Scan tickets
        </Link>
      </div>

      {attendees.length === 0 ? (
        <EmptyState
          icon={<QrCode size={24} />}
          title="No tickets sold yet"
          description="Once customers register and pay, they'll appear here with check-in status."
        />
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {attendees.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">{ticket.attendeeName}</p>
              </div>
              <Badge tone={ticket.status === 'used' ? 'success' : 'neutral'}>
                {ticket.status === 'used' ? (
                  <>
                    <CheckCircle size={14} weight="fill" /> Checked in
                  </>
                ) : (
                  <>
                    <Circle size={14} /> Not arrived
                  </>
                )}
              </Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
