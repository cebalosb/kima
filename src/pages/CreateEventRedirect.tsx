import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, isAdminRole } from '../lib/auth'

export function CreateEventRedirect() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <Navigate to={isAdminRole(user.role) ? '/admin/events/new' : '/organizer/events/new'} replace />
}
