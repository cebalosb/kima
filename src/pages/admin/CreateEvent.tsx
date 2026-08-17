import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { useAppData } from '../../lib/data'
import { useAuth, isAdminRole } from '../../lib/auth'
import { EventForm } from '../../components/events/EventForm'

export function CreateEvent() {
  const { createEvent } = useAppData()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!isAdminRole(user.role)) return <Navigate to="/organizer" replace />

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        to="/admin"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to admin overview
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Create a campaign</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Publish a new event directly as an admin — attendees pay with mobile money.
        </p>
      </div>

      <EventForm
        submitLabel="Publish campaign"
        onSubmit={async (values) => {
          const event = await createEvent(values)
          navigate(`/admin/events/${event.id}`)
        }}
      />
    </div>
  )
}
