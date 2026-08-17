export type AppRole = 'customer' | 'organizer' | 'admin'

export function roleFromPath(pathname: string): AppRole {
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/organizer')) return 'organizer'
  return 'customer'
}
