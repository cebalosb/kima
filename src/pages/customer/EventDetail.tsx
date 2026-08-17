import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarBlank, Envelope, MapPin, Phone, UsersThree } from '@phosphor-icons/react'
import { useAppData } from '../../lib/data'
import { buttonClasses } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { bannerStyle, formatCurrency, formatDate, formatTime } from '../../lib/format'

export function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const { getEvent, getOrganizer, ticketsForEvent } = useAppData()
  const event = id ? getEvent(id) : undefined

  if (!event) return <Navigate to="/" replace />

  const organizer = getOrganizer(event.organizerId)
  const sold = ticketsForEvent(event.id).length
  const isUnlimited = event.capacity === 0
  const remaining = isUnlimited ? Infinity : Math.max(event.capacity - sold, 0)

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to events
      </Link>

      <div className="flex h-56 items-end rounded-2xl p-6 sm:h-72" style={bannerStyle(event)}>
        <h1 className="font-display max-w-2xl text-3xl font-extrabold text-white drop-shadow sm:text-4xl">
          {event.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-3 text-lg font-semibold text-foreground">About this event</h2>
            <p className="text-base leading-relaxed text-foreground-muted">{event.description}</p>
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                <CalendarBlank size={20} />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(event.dateISO)} · {formatTime(event.dateISO)}
                </p>
                <p className="text-sm text-foreground-muted">Doors open at listed time</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                  <MapPin size={20} />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{event.location}</p>
                  <p className="text-sm text-foreground-muted">Hosted by {organizer?.name ?? 'Unknown organizer'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {event.contactPhone && (
                  <a
                    href={`tel:${event.contactPhone}`}
                    aria-label={`Call ${organizer?.name ?? 'the organizer'}`}
                    className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground-muted transition-colors duration-150 hover:border-accent hover:text-accent"
                  >
                    <Phone size={18} />
                  </a>
                )}
                {organizer?.email && (
                  <a
                    href={`mailto:${organizer.email}`}
                    aria-label={`Email ${organizer.name}`}
                    className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground-muted transition-colors duration-150 hover:border-accent hover:text-accent"
                  >
                    <Envelope size={18} />
                  </a>
                )}
              </div>
            </div>
          </Card>
        </div>

        <Card className="flex h-fit flex-col gap-5 p-6">
          <div>
            <p className="text-sm text-foreground-muted">Ticket price</p>
            <p className="font-display text-3xl font-extrabold text-foreground">
              {formatCurrency(event.priceAmount, event.priceCurrency)}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <UsersThree size={18} />
            {isUnlimited ? 'Unlimited spots' : remaining > 0 ? `${remaining} spots left` : 'Sold out'}
          </div>

          {remaining > 0 ? (
            <Link
              to={`/events/${event.id}/register`}
              className={buttonClasses({ size: 'lg', fullWidth: true, className: 'mt-1' })}
            >
              Get Ticket
            </Link>
          ) : (
            <span className={buttonClasses({ size: 'lg', fullWidth: true, disabled: true, className: 'mt-1' })}>
              Sold Out
            </span>
          )}
        </Card>
      </div>
    </div>
  )
}
