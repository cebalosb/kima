import QRCode from 'react-qr-code'
import { CalendarBlank, MapPin, Ticket as TicketIcon } from '@phosphor-icons/react'
import type { EventItem, Ticket } from '../../lib/data'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatDate, formatTime } from '../../lib/format'

const paymentLabel: Record<Ticket['paymentMethod'], string> = {
  airtel: 'Airtel Money',
  mtn: 'MTN Mobile Money',
}

export function TicketCard({ ticket, event }: { ticket: Ticket; event: EventItem }) {
  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{
          backgroundImage: `linear-gradient(135deg, ${event.bannerFrom}, ${event.bannerTo})`,
        }}
      >
        <div className="flex items-center gap-2 text-white">
          <TicketIcon size={18} weight="fill" />
          <span className="text-sm font-semibold">Kima E-Ticket</span>
        </div>
        <Badge tone={ticket.status === 'valid' ? 'success' : 'neutral'}>
          {ticket.status === 'valid' ? 'Valid' : 'Used'}
        </Badge>
      </div>

      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center">
        <div className="flex shrink-0 justify-center rounded-xl border border-border bg-white p-3">
          <QRCode value={ticket.qrValue} size={128} />
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <h3 className="font-display text-xl font-bold text-foreground">{event.title}</h3>
          <div className="flex flex-col gap-1.5 text-sm text-foreground-muted">
            <span className="flex items-center gap-2">
              <CalendarBlank size={16} />
              {formatDate(event.dateISO)} · {formatTime(event.dateISO)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} />
              {event.location}
            </span>
          </div>

          <div className="mt-1 grid grid-cols-2 gap-4 border-t border-border pt-3 text-sm">
            <div>
              <p className="text-foreground-muted">Attendee</p>
              <p className="font-medium text-foreground">{ticket.attendeeName}</p>
            </div>
            <div>
              <p className="text-foreground-muted">Paid via</p>
              <p className="font-medium text-foreground">{paymentLabel[ticket.paymentMethod]}</p>
            </div>
          </div>
          <p className="font-mono text-xs text-foreground-muted">Ticket ID: {ticket.qrValue}</p>
        </div>
      </div>
    </Card>
  )
}
