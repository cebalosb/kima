import { Link } from 'react-router-dom'
import { CalendarBlank, MapPin, Star } from '@phosphor-icons/react'
import type { EventItem } from '../../lib/data'
import { categoryMeta } from '../../lib/categories'
import { Card } from '../ui/Card'
import { bannerStyle, formatCurrency, formatDate } from '../../lib/format'

export function EventCard({
  event,
  to,
  footer,
}: {
  event: EventItem
  to: string
  footer?: React.ReactNode
}) {
  const meta = categoryMeta[event.category]
  const CategoryIcon = meta.icon

  return (
    <Card className="group flex flex-col overflow-hidden transition-transform duration-200 ease-out hover:-translate-y-1">
      <Link to={to} className="flex flex-col focus:outline-none">
        <div className="relative flex h-36 flex-col justify-between p-4" style={bannerStyle(event)}>
          {event.isTop && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
              <Star size={12} weight="fill" className="text-accent" />
              Top
            </span>
          )}
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
            <CategoryIcon size={14} weight="fill" style={{ color: meta.color }} />
            {event.subcategory ? `${meta.label} · ${event.subcategory}` : meta.label}
          </span>
          <span className="w-fit rounded-full bg-black/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {formatCurrency(event.priceAmount, event.priceCurrency)}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="font-display text-lg font-bold leading-snug text-foreground group-hover:text-accent transition-colors duration-150">
            {event.title}
          </h3>
          <div className="flex flex-col gap-1.5 text-sm text-foreground-muted">
            <span className="flex items-center gap-2">
              <CalendarBlank size={16} />
              {formatDate(event.dateISO)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} />
              {event.location}
            </span>
          </div>
        </div>
      </Link>
      {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
    </Card>
  )
}
