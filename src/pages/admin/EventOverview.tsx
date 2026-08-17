import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useAppData } from '../../lib/data'
import { useAuth, isAdminRole } from '../../lib/auth'
import { EventManagePanel } from '../../components/events/EventManagePanel'
import { VoucherPanel } from '../../components/events/VoucherPanel'

export function EventOverview() {
  const { id } = useParams<{ id: string }>()
  const { getEvent, getOrganizer, ticketsForEvent, deleteEvent, updateEvent } = useAppData()
  const { user, loading } = useAuth()
  const location = useLocation()
  const event = id ? getEvent(id) : undefined

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!isAdminRole(user.role)) return <Navigate to="/organizer" replace />
  if (!event) return <Navigate to="/admin" replace />

  return (
    <div className="flex flex-col gap-8">
      <EventManagePanel
        event={event}
        attendees={ticketsForEvent(event.id)}
        backTo="/admin"
        backLabel="Back to admin overview"
        organizerName={getOrganizer(event.organizerId)?.name ?? 'Unknown organizer'}
        editTo={`/admin/events/${event.id}/edit`}
        onDelete={() => deleteEvent(event.id)}
        onTogglePromote={() => {
          const { id: _id, organizerId: _organizerId, ...values } = event
          return updateEvent(event.id, { ...values, isTop: !event.isTop })
        }}
      />
      <VoucherPanel eventId={event.id} currency={event.priceCurrency} />
    </div>
  )
}
