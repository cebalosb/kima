import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Buildings, CurrencyCircleDollar, EnvelopeSimple, Plus, Ticket, UsersThree } from '@phosphor-icons/react'
import { useAppData } from '../../lib/data'
import { useAuth, isAdminRole } from '../../lib/auth'
import { categoryMeta } from '../../lib/categories'
import { Card } from '../../components/ui/Card'
import { buttonClasses } from '../../components/ui/Button'
import { bannerStyle, formatCurrency } from '../../lib/format'

// Resend free-tier cap. Bump this to 50000 if/when the account is
// upgraded to the Pro plan ($20/mo) — see supabase/email_log.sql.
const EMAIL_MONTHLY_LIMIT = 3000

export function AdminDashboard() {
  const { events, tickets, organizers, getEmailUsage } = useAppData()
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [emailsSent, setEmailsSent] = useState<number | null>(null)

  useEffect(() => {
    if (!user || !isAdminRole(user.role)) return
    getEmailUsage()
      .then(({ sentThisMonth }) => setEmailsSent(sentThisMonth))
      .catch(() => setEmailsSent(null))
  }, [user, getEmailUsage])

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!isAdminRole(user.role)) return <Navigate to="/organizer" replace />

  const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.amountPaid, 0)
  const emailUsagePercent = emailsSent != null ? Math.min(100, (emailsSent / EMAIL_MONTHLY_LIMIT) * 100) : 0

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Event Manager</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Full visibility across every organizer, event, and payment on the platform.
          </p>
        </div>
        <Link to="/admin/events/new" className={buttonClasses({ size: 'md' })}>
          <Plus size={18} weight="bold" />
          New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="flex items-center gap-3 p-5">
          <span className="flex size-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Buildings size={22} weight="fill" />
          </span>
          <div>
            <p className="text-xs text-foreground-muted">Organizers</p>
            <p className="text-xl font-bold text-foreground">{organizers.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-5">
          <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground">
            <Ticket size={22} weight="fill" />
          </span>
          <div>
            <p className="text-xs text-foreground-muted">Events</p>
            <p className="text-xl font-bold text-foreground">{events.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-5">
          <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground">
            <UsersThree size={22} weight="fill" />
          </span>
          <div>
            <p className="text-xs text-foreground-muted">Tickets sold</p>
            <p className="text-xl font-bold text-foreground">{tickets.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-5">
          <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground">
            <CurrencyCircleDollar size={22} weight="fill" />
          </span>
          <div>
            <p className="text-xs text-foreground-muted">Total revenue</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalRevenue, 'CFA')}</p>
          </div>
        </Card>
      </div>

      <Card className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground">
              <EnvelopeSimple size={22} weight="fill" />
            </span>
            <div>
              <p className="text-xs text-foreground-muted">Emails sent this month</p>
              <p className="text-xl font-bold text-foreground">
                {emailsSent != null ? emailsSent.toLocaleString('en-US') : '—'}
                <span className="text-sm font-normal text-foreground-muted">
                  {' '}
                  / {EMAIL_MONTHLY_LIMIT.toLocaleString('en-US')}
                </span>
              </p>
            </div>
          </div>
          {emailsSent != null && emailUsagePercent >= 80 && (
            <p className="text-xs font-medium text-warning">Approaching the free-tier limit</p>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={['h-full rounded-full transition-all duration-300', emailUsagePercent >= 80 ? 'bg-warning' : 'bg-accent'].join(' ')}
            style={{ width: `${emailUsagePercent}%` }}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-foreground">All campaigns</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-foreground-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((event) => {
                  const sold = tickets.filter((t) => t.eventId === event.id).length
                  const meta = categoryMeta[event.category]
                  return (
                    <tr
                      key={event.id}
                      tabIndex={0}
                      onClick={() => navigate(`/admin/events/${event.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/admin/events/${event.id}`)
                        }
                      }}
                      className="cursor-pointer transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:bg-muted"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="size-9 shrink-0 rounded-lg" style={bannerStyle(event)} aria-hidden="true" />
                          <span className="font-semibold text-foreground">{event.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-medium"
                          style={{ backgroundColor: meta.soft, color: meta.fg }}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-foreground">{sold}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
