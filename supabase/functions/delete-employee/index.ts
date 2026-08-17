// Kima: deletes an employee's login entirely (not just their platform
// role). This needs the service-role key, which must never live in the
// browser app — that's why this runs as a Supabase Edge Function
// instead of a client-side call.
//
// Deploy with: supabase functions deploy delete-employee
// (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are
// injected automatically by Supabase — nothing to configure by hand.)

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Verify the caller is a signed-in admin, using their own JWT (not
  // the service role) — this is what stops anyone but an admin from
  // calling this function and deleting arbitrary accounts.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user: caller },
    error: authError,
  } = await callerClient.auth.getUser()

  if (authError || !caller) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 })
  }

  const { data: callerProfile } = await callerClient
    .from('users')
    .select('role')
    .eq('id', caller.id)
    .maybeSingle()

  if (callerProfile?.role !== 'admin' && callerProfile?.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Only admins can delete employees' }), { status: 403 })
  }

  let body: { employeeId?: string; userId?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 })
  }

  const { employeeId, userId } = body
  if (!employeeId && !userId) {
    return new Response(JSON.stringify({ error: 'employeeId or userId is required' }), { status: 400 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  // Deleting the auth user cascades to public.users (and from there to
  // their events/tickets, per the existing foreign keys).
  if (userId) {
    const { error } = await adminClient.auth.admin.deleteUser(userId)
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
  }

  if (employeeId) {
    await adminClient.from('employees').delete().eq('id', employeeId)
  } else if (userId) {
    await adminClient.from('employees').delete().eq('user_id', userId)
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
