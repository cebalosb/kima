// Kima: sends a ticket-confirmation email via Resend once payment
// succeeds, and logs every attempt (sent or failed) to public.email_log
// so the admin panel can track usage against Resend's monthly cap.
//
// Callable by guests (no login required) — ticket registration doesn't
// require an account, so this can't gate on the caller being an admin.
// Abuse is limited by ticketId being an unguessable uuid, and by the
// idempotency check below (won't re-send once a ticket's confirmation
// has gone out).
//
// Deploy with: supabase functions deploy send-ticket-confirmation
// Requires these secrets to be set beforehand:
//   supabase secrets set RESEND_API_KEY=your_key_here
//   supabase secrets set SITE_URL=https://your-domain.com   (optional)
//   supabase secrets set RESEND_FROM_EMAIL=tickets@your-domain.com   (optional —
//     defaults to Resend's shared testing address until you verify your own domain)

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  let body: { ticketId?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 })
  }

  const { ticketId } = body
  if (!ticketId) {
    return new Response(JSON.stringify({ error: 'ticketId is required' }), { status: 400 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev'
  const siteUrl = Deno.env.get('SITE_URL')

  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: 'Email sending is not configured yet.' }), { status: 500 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  // Idempotent: don't send (or count) the same ticket's confirmation twice.
  const { data: existing } = await adminClient
    .from('email_log')
    .select('id')
    .eq('ticket_id', ticketId)
    .eq('status', 'sent')
    .maybeSingle()

  if (existing) {
    return new Response(JSON.stringify({ success: true, alreadySent: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data: ticket, error: ticketError } = await adminClient
    .from('tickets')
    .select('id, attendee_name, attendee_email, qr_value, event_id')
    .eq('id', ticketId)
    .maybeSingle()

  if (ticketError || !ticket) {
    return new Response(JSON.stringify({ error: 'Ticket not found' }), { status: 404 })
  }

  const { data: event } = await adminClient
    .from('events')
    .select('title, starts_at, location')
    .eq('id', ticket.event_id)
    .maybeSingle()

  const ticketUrl = siteUrl ? `${siteUrl}/tickets/${ticket.id}` : null
  const eventDate = event?.starts_at
    ? new Date(event.starts_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : ''

  // Generated up front (rather than left to email_log's default) so the
  // same id can be quoted back to the customer as a support reference
  // *and* used as the row's own primary key when we log this send below.
  const emailLogId = crypto.randomUUID()

  const html = `
    <p>Hi ${ticket.attendee_name},</p>
    <p>Your ticket for <strong>${event?.title ?? 'your event'}</strong> is confirmed.</p>
    <p>${eventDate}${event?.location ? ` &middot; ${event.location}` : ''}</p>
    <p>Ticket code: <strong>${ticket.qr_value}</strong></p>
    ${ticketUrl ? `<p><a href="${ticketUrl}">View your ticket</a></p>` : ''}
    <p style="color:#666;font-size:13px">Reference number: ${emailLogId}<br>Quote this if you contact us about this email.</p>
  `

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: ticket.attendee_email,
      subject: `Your ticket for ${event?.title ?? 'your event'} is confirmed`,
      html,
    }),
  })

  if (!resendRes.ok) {
    const errorText = await resendRes.text()
    const { error: logError } = await adminClient.from('email_log').insert({
      id: emailLogId,
      email_type: 'ticket_confirmation',
      recipient_email: ticket.attendee_email,
      ticket_id: ticket.id,
      status: 'failed',
      error_message: errorText.slice(0, 500),
    })
    if (logError) console.error('email_log insert failed:', logError.message)
    return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 502 })
  }

  const { error: logError } = await adminClient.from('email_log').insert({
    id: emailLogId,
    email_type: 'ticket_confirmation',
    recipient_email: ticket.attendee_email,
    ticket_id: ticket.id,
    status: 'sent',
  })
  if (logError) console.error('email_log insert failed:', logError.message)

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
