import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useAppData } from '../../lib/data'
import { useAuth } from '../../lib/auth'
import { EventManagePanel } from '../../components/events/EventManagePanel'

export function EventManage() {
  const { id } = useParams<{ id: string }>()
  const { getEvent, ticketsForEvent } = useAppData()
  const { user, loading } = useAuth()
  const location = useLocation()
  const event = id ? getEvent(id) : undefined

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!event || event.organizerId !== user.id) {
    return <Navigate to="/organizer" replace />
  }

  return (
    <EventManagePanel
      event={event}
      attendees={ticketsForEvent(event.id)}
      backTo="/organizer"
      backLabel="Back to dashboard"
    />
  )
}
