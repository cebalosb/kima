import { Link, Navigate, useLocation } from 'react-router-dom'
import { Ticket } from '@phosphor-icons/react'
import { useAppData } from '../../lib/data'
import { useAuth } from '../../lib/auth'
import { TicketCard } from '../../components/tickets/TicketCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { buttonClasses } from '../../components/ui/Button'

export function MyTickets() {
  const { tickets, getEvent } = useAppData()
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  const myTickets = tickets.filter((t) => t.userId === user.id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">My Tickets</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Tickets you've purchased with this account, with their QR code for entry.
        </p>
      </div>

      {myTickets.length === 0 ? (
        <EmptyState
          icon={<Ticket size={24} />}
          title="No tickets yet"
          description="Once you register and pay for an event, your ticket will show up here."
          action={
            <Link to="/" className={buttonClasses({ size: 'md' })}>
              Browse events
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {myTickets.map((ticket) => {
            const event = getEvent(ticket.eventId)
            if (!event) return null
            return <TicketCard key={ticket.id} ticket={ticket} event={event} />
          })}
        </div>
      )}
    </div>
  )
}
