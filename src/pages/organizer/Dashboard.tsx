import { Link, Navigate, useLocation } from 'react-router-dom'
import { CalendarPlus, CurrencyCircleDollar, Plus, Ticket, TrendUp } from '@phosphor-icons/react'
import { useAppData } from '../../lib/data'
import { useAuth } from '../../lib/auth'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { buttonClasses } from '../../components/ui/Button'
import { bannerStyle, formatCapacity, formatCurrency, formatDate } from '../../lib/format'

export function Dashboard() {
  const { events, tickets } = useAppData()
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  const myEvents = events.filter((e) => e.organizerId === user.id)
  const myEventIds = new Set(myEvents.map((e) => e.id))
  const myTickets = tickets.filter((t) => myEventIds.has(t.eventId))

  const totalRevenue = myTickets.reduce((sum, ticket) => sum + ticket.amountPaid, 0)
  const totalScanned = myTickets.filter((t) => t.status === 'used').length

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Organizer Dashboard</h1>
          <p className="mt-1 text-sm text-foreground-muted">Manage your events and track ticket sales.</p>
        </div>
        <Link to="/organizer/events/new" className={buttonClasses({ size: 'md' })}>
          <Plus size={18} weight="bold" />
          Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-5">
          <span className="flex size-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Ticket size={22} weight="fill" />
          </span>
          <div>
            <p className="text-xs text-foreground-muted">Tickets sold</p>
            <p className="text-xl font-bold text-foreground">{myTickets.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-5">
          <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground">
            <CurrencyCircleDollar size={22} weight="fill" />
          </span>
          <div>
            <p className="text-xs text-foreground-muted">Total revenue</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalRevenue, 'CFA')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-5">
          <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground">
            <TrendUp size={22} weight="fill" />
          </span>
          <div>
            <p className="text-xs text-foreground-muted">Checked in</p>
            <p className="text-xl font-bold text-foreground">{totalScanned}</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-foreground">Your events</h2>

        {myEvents.length === 0 ? (
          <EmptyState
            icon={<CalendarPlus size={24} />}
            title="You haven't created any events yet"
            description="Events you publish will show up here, along with who registered and paid for them."
            action={
              <Link to="/organizer/events/new" className={buttonClasses({ size: 'md' })}>
                Create your first event
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {myEvents.map((event) => {
              const sold = tickets.filter((t) => t.eventId === event.id).length
              return (
                <Card key={event.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className="size-12 shrink-0 rounded-xl"
                      style={bannerStyle(event)}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{event.title}</p>
                      <p className="text-sm text-foreground-muted">
                        {formatDate(event.dateISO)} · {event.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {sold} / {formatCapacity(event.capacity)}
                      </p>
                      <p className="text-xs text-foreground-muted">sold</p>
                    </div>
                    <Link
                      to={`/organizer/events/${event.id}`}
                      className={buttonClasses({ variant: 'secondary', size: 'md' })}
                    >
                      Manage
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
