// Kima: sends an acknowledgement email via Resend when someone submits
// the Contact Us form, and logs every attempt (sent or failed) to
// public.email_log so the admin panel can track usage against Resend's
// monthly cap.
//
// Callable by guests (no login required) — the contact form doesn't
// require an account. Abuse is limited by contactMessageId being an
// unguessable uuid, and by the idempotency check below (won't re-send
// once a message's acknowledgement has gone out).
//
// Deploy with: supabase functions deploy send-contact-confirmation
// Requires these secrets to be set beforehand (shared with
// send-ticket-confirmation):
//   supabase secrets set RESEND_API_KEY=your_key_here
//   supabase secrets set RESEND_FROM_EMAIL=hello@your-domain.com   (optional —
//     defaults to Resend's shared testing address until you verify your own domain)

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  let body: { contactMessageId?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 })
  }

  const { contactMessageId } = body
  if (!contactMessageId) {
    return new Response(JSON.stringify({ error: 'contactMessageId is required' }), { status: 400 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev'

  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: 'Email sending is not configured yet.' }), { status: 500 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  // Idempotent: don't send (or count) the same message's acknowledgement twice.
  const { data: existing } = await adminClient
    .from('email_log')
    .select('id')
    .eq('contact_message_id', contactMessageId)
    .eq('status', 'sent')
    .maybeSingle()

  if (existing) {
    return new Response(JSON.stringify({ success: true, alreadySent: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data: message, error: messageError } = await adminClient
    .from('contact_messages')
    .select('id, name, email, message')
    .eq('id', contactMessageId)
    .maybeSingle()

  if (messageError || !message) {
    return new Response(JSON.stringify({ error: 'Message not found' }), { status: 404 })
  }

  // Generated up front (rather than left to email_log's default) so the
  // same id can be quoted back to the customer as a support reference
  // *and* used as the row's own primary key when we log this send below.
  const emailLogId = crypto.randomUUID()

  const html = `
    <p>Hi ${message.name},</p>
    <p>Thanks for reaching out — we've received your message and will get back to you soon.</p>
    <p style="color:#666">Your message:</p>
    <blockquote style="margin:0;padding-left:12px;border-left:2px solid #ccc;color:#444">${message.message}</blockquote>
    <p style="color:#666;font-size:13px">Reference number: ${emailLogId}<br>Quote this if you contact us about this message.</p>
  `

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: message.email,
      subject: `We've received your message`,
      html,
    }),
  })

  if (!resendRes.ok) {
    const errorText = await resendRes.text()
    const { error: logError } = await adminClient.from('email_log').insert({
      id: emailLogId,
      email_type: 'contact_confirmation',
      recipient_email: message.email,
      contact_message_id: message.id,
      status: 'failed',
      error_message: errorText.slice(0, 500),
    })
    if (logError) console.error('email_log insert failed:', logError.message)
    return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 502 })
  }

  const { error: logError } = await adminClient.from('email_log').insert({
    id: emailLogId,
    email_type: 'contact_confirmation',
    recipient_email: message.email,
    contact_message_id: message.id,
    status: 'sent',
  })
  if (logError) console.error('email_log insert failed:', logError.message)

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
