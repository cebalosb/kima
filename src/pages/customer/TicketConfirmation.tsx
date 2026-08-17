import { Link, Navigate, useParams } from 'react-router-dom'
import { Confetti, House, Ticket as TicketIcon } from '@phosphor-icons/react'
import { useAppData } from '../../lib/data'
import { TicketCard } from '../../components/tickets/TicketCard'
import { buttonClasses } from '../../components/ui/Button'

export function TicketConfirmation() {
  const { id } = useParams<{ id: string }>()
  const { getTicket, getEvent } = useAppData()
  const ticket = id ? getTicket(id) : undefined
  const event = ticket ? getEvent(ticket.eventId) : undefined

  if (!ticket || !event) return <Navigate to="/" replace />

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
        <Confetti size={32} weight="fill" />
      </div>
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">You're going!</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Your payment was confirmed and your ticket is ready. Show this QR code at the entrance.
        </p>
      </div>

      <div className="w-full text-left">
        <TicketCard ticket={ticket} event={event} />
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Link to="/my-tickets" className={buttonClasses({ variant: 'primary', size: 'lg', fullWidth: true })}>
          <TicketIcon size={18} />
          View my tickets
        </Link>
        <Link to="/" className={buttonClasses({ variant: 'secondary', size: 'lg', fullWidth: true })}>
          <House size={18} />
          Browse more events
        </Link>
      </div>
    </div>
  )
}
