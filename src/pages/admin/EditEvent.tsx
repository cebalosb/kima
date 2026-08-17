import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { useAppData } from '../../lib/data'
import { useAuth, isAdminRole } from '../../lib/auth'
import { EventForm } from '../../components/events/EventForm'

export function EditEvent() {
  const { id } = useParams<{ id: string }>()
  const { getEvent, updateEvent } = useAppData()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const event = id ? getEvent(id) : undefined

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!isAdminRole(user.role)) return <Navigate to="/organizer" replace />
  if (!event) return <Navigate to="/admin" replace />

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        to={`/admin/events/${event.id}`}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to event overview
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Edit event</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Amending "{event.title}" as an admin — changes apply immediately for the organizer and attendees.
        </p>
      </div>

      <EventForm
        initialEvent={event}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          await updateEvent(event.id, values)
          navigate(`/admin/events/${event.id}`)
        }}
      />
    </div>
  )
}
