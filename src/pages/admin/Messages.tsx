import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Envelope, Trash } from '@phosphor-icons/react'
import { useAppData, type ContactMessage } from '../../lib/data'
import { useAuth, isAdminRole } from '../../lib/auth'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { formatDate, formatTime } from '../../lib/format'

export function Messages() {
  const { listContactMessages, deleteContactMessage } = useAppData()
  const { user, loading } = useAuth()
  const location = useLocation()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !isAdminRole(user.role)) return
    let cancelled = false
    listContactMessages()
      .then((data) => {
        if (!cancelled) setMessages(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Could not load messages.')
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, listContactMessages])

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!isAdminRole(user.role)) return <Navigate to="/organizer" replace />

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this message? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await deleteContactMessage(id)
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not delete the message.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Messages</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Submissions from the public Contact page. Messages are automatically removed 14 days after they're
          received.
        </p>
      </div>

      {loadError && <p className="text-sm font-medium text-destructive">{loadError}</p>}

      {messagesLoading ? null : messages.length === 0 ? (
        <EmptyState
          icon={<Envelope size={24} />}
          title="No messages yet"
          description="Submissions from the Contact page will show up here."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-foreground-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Message</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">From</th>
                  <th className="px-5 py-3 font-medium text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {messages.map((msg) => (
                  <tr key={msg.id}>
                    <td className="max-w-xs px-5 py-4 text-foreground">
                      <p className="line-clamp-2">{msg.message}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-foreground-muted">
                      {formatDate(msg.createdAt)} · {formatTime(msg.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{msg.name}</p>
                      <p className="text-xs text-foreground-muted">{msg.email}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="destructive"
                        size="md"
                        loading={deletingId === msg.id}
                        onClick={() => handleDelete(msg.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
