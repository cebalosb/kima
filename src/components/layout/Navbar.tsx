import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { UserCircle } from '@phosphor-icons/react'
import { roleFromPath } from '../../lib/role'
import { useAuth, isAdminRole } from '../../lib/auth'

const customerLinks = [
  { to: '/top-events', label: 'Top Events', end: false },
  { to: '/', label: 'Browse Events', end: true },
  { to: '/create-event', label: 'Create an Event', end: false },
  { to: '/contact', label: 'Contact us', end: false },
]

const organizerLinks = [
  { to: '/organizer', label: 'Dashboard', end: true },
  { to: '/organizer/events/new', label: 'Create Event', end: false },
  { to: '/organizer/scan', label: 'Scan', end: false },
  { to: '/activity', label: 'Activity Log', end: false },
]

const adminLinks = [
  { to: '/admin', label: 'Event Manager', end: true },
  { to: '/admin/events/new', label: 'New Campaign', end: false },
  { to: '/admin/team', label: 'Emp Manager', end: false },
  { to: '/admin/messages', label: 'Messages', end: false },
  { to: '/activity', label: 'Activity Log', end: false },
]

export function Navbar() {
  const { pathname } = useLocation()
  const { user, logOut } = useAuth()
  const role = roleFromPath(pathname)
  const isHome = pathname === '/'
  const baseLinks = role === 'organizer' ? organizerLinks : role === 'admin' ? adminLinks : customerLinks
  const links =
    role === 'customer' && !!user && isAdminRole(user.role)
      ? baseLinks.map((link) =>
          link.to === '/contact' ? { to: '/admin/messages', label: 'Messages', end: false } : link,
        )
      : baseLinks
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header
      className={[
        'z-40',
        isHome ? 'absolute inset-x-0 top-0' : 'sticky top-0 border-b border-border bg-background/85 backdrop-blur',
      ].join(' ')}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className={[
            'font-display text-lg font-extrabold transition-colors duration-150',
            isHome ? 'text-white' : 'text-foreground',
          ].join(' ')}
        >
          Kima
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                [
                  'font-agency-mono shrink-0 rounded-full px-3.5 py-2 text-xs transition-colors duration-150',
                  isActive
                    ? isHome
                      ? 'bg-focus/30 text-white'
                      : 'bg-muted text-foreground'
                    : isHome
                      ? 'text-white/80 hover:bg-focus/20 hover:text-white'
                      : 'text-foreground-muted hover:text-foreground',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-label="Account menu"
              aria-expanded={profileOpen}
              className={[
                'flex size-10 items-center justify-center rounded-full border transition-colors duration-150',
                isHome
                  ? 'border-white/40 bg-white/10 text-white backdrop-blur-sm hover:border-focus hover:bg-focus/30'
                  : 'border-border bg-surface text-foreground-muted hover:text-foreground',
              ].join(' ')}
            >
              <UserCircle size={24} />
            </button>

          {profileOpen && (
            <>
              <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-lg shadow-black/[0.08]">
                {user ? (
                  <>
                    <div className="px-4 py-3">
                      <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-foreground-muted">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logOut()
                        setProfileOpen(false)
                      }}
                      className="font-agency-mono block w-full border-t border-border px-4 py-2.5 text-left text-xs text-foreground transition-colors duration-150 hover:bg-muted"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setProfileOpen(false)}
                      className="font-agency-mono block w-full px-4 py-2.5 text-left text-xs text-foreground transition-colors duration-150 hover:bg-muted"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setProfileOpen(false)}
                      className="font-agency-mono block w-full px-4 py-2.5 text-left text-xs text-foreground transition-colors duration-150 hover:bg-muted"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </header>
  )
}
