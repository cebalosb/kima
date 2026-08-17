import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from './supabaseClient'
import { useAuth, type PlatformRole } from './auth'
import { applyDiscount, formatCapacity, formatCurrency, formatDate, generateId } from './format'
import type { Category } from './categories'

export type PaymentMethod = 'airtel' | 'mtn'
export type TicketStatus = 'valid' | 'used'

export type EmployeeRole = 'sales' | 'admin' | 'super_admin'

export type Organizer = {
  id: string
  name: string
  email: string
  role: PlatformRole
}

export type EventItem = {
  id: string
  title: string
  description: string
  dateISO: string
  location: string
  contactPhone: string
  priceAmount: number
  priceCurrency: string
  bannerFrom: string
  bannerTo: string
  imageUrl?: string
  organizerId: string
  capacity: number
  category: Category
  subcategory?: string
  isTop: boolean
}

export type Ticket = {
  id: string
  eventId: string
  userId?: string
  attendeeName: string
  attendeeEmail: string
  attendeePhone: string
  paymentMethod: PaymentMethod
  status: TicketStatus
  qrValue: string
  createdAt: string
  amountPaid: number
  voucherCode?: string
}

export type DiscountType = 'percentage' | 'fixed'

export type VoucherDiscount = {
  discountType: DiscountType
  discountValue: number
}

export type Voucher = VoucherDiscount & {
  id: string
  eventId: string
  code: string
  usedAt?: string
  createdAt: string
}

export type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
}

export type Employee = {
  id: string
  firstName: string
  lastName: string
  email: string
  contractType: string
  contractStartDate: string
  contractEndDate?: string
  role: EmployeeRole
  userId?: string
  createdAt: string
}

export type ScanResult =
  | { outcome: 'valid'; ticket: Ticket; event: EventItem }
  | { outcome: 'used'; ticket: Ticket; event: EventItem }
  | { outcome: 'invalid' }

export type ActivityType =
  | 'event_created'
  | 'event_updated'
  | 'payment_confirmed'
  | 'scan_valid'
  | 'scan_used'
  | 'scan_invalid'

export type ActivityLogEntry = {
  id: string
  type: ActivityType
  actor: 'customer' | 'organizer' | 'admin'
  message: string
  detail: string
  timestamp: string
}

type EventRow = {
  id: string
  title: string
  description: string
  starts_at: string
  location: string
  contact_phone: string
  price_amount: number | string
  price_currency: string
  banner_from: string
  banner_to: string
  image_url: string | null
  organizer_id: string
  capacity: number
  category: string
  subcategory: string | null
  is_top: boolean
}

type TicketRow = {
  id: string
  event_id: string
  user_id: string | null
  attendee_name: string
  attendee_email: string
  attendee_phone: string
  payment_method: string
  status: string
  qr_value: string
  created_at: string
  amount_paid: number | string | null
  voucher_code: string | null
}

type UserRow = {
  id: string
  full_name: string | null
  email: string
  role: string
}

type ContactMessageRow = {
  id: string
  name: string
  email: string
  message: string
  created_at: string
}

type EmployeeRow = {
  id: string
  first_name: string
  last_name: string
  email: string
  contract_type: string
  contract_start_date: string
  contract_end_date: string | null
  role: string
  user_id: string | null
  created_at: string
}

type VoucherRow = {
  id: string
  event_id: string
  code: string
  discount_type: string
  discount_value: number | string
  used_at: string | null
  created_at: string
}

function mapEvent(row: EventRow): EventItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dateISO: row.starts_at,
    location: row.location,
    contactPhone: row.contact_phone,
    priceAmount: Number(row.price_amount),
    priceCurrency: row.price_currency,
    bannerFrom: row.banner_from,
    bannerTo: row.banner_to,
    imageUrl: row.image_url ?? undefined,
    organizerId: row.organizer_id,
    capacity: row.capacity,
    category: row.category as Category,
    subcategory: row.subcategory ?? undefined,
    isTop: row.is_top,
  }
}

function mapTicket(row: TicketRow, fallbackAmountPaid: number): Ticket {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id ?? undefined,
    attendeeName: row.attendee_name,
    attendeeEmail: row.attendee_email,
    attendeePhone: row.attendee_phone,
    paymentMethod: row.payment_method as PaymentMethod,
    status: row.status as TicketStatus,
    qrValue: row.qr_value,
    createdAt: row.created_at,
    amountPaid: row.amount_paid != null ? Number(row.amount_paid) : fallbackAmountPaid,
    voucherCode: row.voucher_code ?? undefined,
  }
}

function mapVoucher(row: VoucherRow): Voucher {
  return {
    id: row.id,
    eventId: row.event_id,
    code: row.code,
    discountType: row.discount_type as DiscountType,
    discountValue: Number(row.discount_value),
    usedAt: row.used_at ?? undefined,
    createdAt: row.created_at,
  }
}

function mapContactMessage(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: row.created_at,
  }
}

function mapEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    contractType: row.contract_type,
    contractStartDate: row.contract_start_date,
    contractEndDate: row.contract_end_date ?? undefined,
    role: (['sales', 'admin', 'super_admin'] as const).includes(row.role as EmployeeRole)
      ? (row.role as EmployeeRole)
      : 'sales',
    userId: row.user_id ?? undefined,
    createdAt: row.created_at,
  }
}

function mapOrganizer(row: UserRow): Organizer {
  return {
    id: row.id,
    name: row.full_name || row.email,
    email: row.email,
    role: (['organizer', 'sales', 'admin', 'super_admin'] as const).includes(row.role as PlatformRole)
      ? (row.role as PlatformRole)
      : 'organizer',
  }
}

type AppDataContextValue = {
  events: EventItem[]
  tickets: Ticket[]
  logs: ActivityLogEntry[]
  organizers: Organizer[]
  getEvent: (id: string) => EventItem | undefined
  getTicket: (id: string) => Ticket | undefined
  getOrganizer: (id: string) => Organizer | undefined
  ticketsForEvent: (eventId: string) => Ticket[]
  createEvent: (input: Omit<EventItem, 'id' | 'organizerId'>) => Promise<EventItem>
  updateEvent: (id: string, input: Omit<EventItem, 'id' | 'organizerId'>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  setUserRole: (userId: string, role: PlatformRole) => Promise<void>
  registerAndPay: (input: {
    eventId: string
    attendeeName: string
    attendeeEmail: string
    attendeePhone: string
    paymentMethod: PaymentMethod
    voucherCode?: string
  }) => Promise<Ticket>
  scanTicket: (code: string) => Promise<ScanResult>
  clearLogs: () => void
  validateVoucher: (eventId: string, code: string) => Promise<VoucherDiscount | null>
  issueVoucher: (input: { eventId: string; code: string } & VoucherDiscount) => Promise<Voucher>
  listVouchers: (eventId: string) => Promise<Voucher[]>
  submitContactMessage: (input: { name: string; email: string; message: string }) => Promise<void>
  listContactMessages: () => Promise<ContactMessage[]>
  deleteContactMessage: (id: string) => Promise<void>
  listEmployees: () => Promise<Employee[]>
  addEmployee: (input: {
    firstName: string
    lastName: string
    email: string
    contractType: string
    contractStartDate: string
    contractEndDate?: string
    role: EmployeeRole
  }) => Promise<Employee>
  promoteEmployee: (employee: Employee, role: EmployeeRole) => Promise<void>
  deleteEmployee: (employee: Employee) => Promise<void>
  sendTicketConfirmation: (ticketId: string) => Promise<void>
  getEmailUsage: () => Promise<{ sentThisMonth: number }>
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventItem[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [logs, setLogs] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [eventsRes, ticketsRes, usersRes] = await Promise.all([
        supabase.from('events').select('*').order('starts_at', { ascending: true }),
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('id, full_name, email, role'),
      ])
      if (cancelled) return
      const mappedEvents = ((eventsRes.data as EventRow[] | null) ?? []).map(mapEvent)
      const eventsById = new Map(mappedEvents.map((e) => [e.id, e]))
      setEvents(mappedEvents)
      setTickets(
        ((ticketsRes.data as TicketRow[] | null) ?? []).map((row) =>
          mapTicket(row, eventsById.get(row.event_id)?.priceAmount ?? 0),
        ),
      )
      setOrganizers(((usersRes.data as UserRow[] | null) ?? []).map(mapOrganizer))
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AppDataContextValue>(() => {
    const getEvent = (id: string) => events.find((e) => e.id === id)
    const getTicket = (id: string) => tickets.find((t) => t.id === id)
    const getOrganizer = (id: string) => organizers.find((o) => o.id === id)
    const ticketsForEvent = (eventId: string) => tickets.filter((t) => t.eventId === eventId)

    const pushLog = (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
      setLogs((prev) => [
        { ...entry, id: generateId('log'), timestamp: new Date().toISOString() },
        ...prev,
      ])
    }

    const createEvent: AppDataContextValue['createEvent'] = async (input) => {
      if (!user) throw new Error('You must be signed in to create an event.')

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: input.title,
          description: input.description,
          starts_at: input.dateISO,
          location: input.location,
          contact_phone: input.contactPhone,
          price_amount: input.priceAmount,
          price_currency: input.priceCurrency,
          banner_from: input.bannerFrom,
          banner_to: input.bannerTo,
          image_url: input.imageUrl ?? null,
          organizer_id: user.id,
          capacity: input.capacity,
          category: input.category,
          subcategory: input.subcategory ?? null,
          is_top: input.isTop,
        })
        .select()
        .single()

      if (error || !data) throw new Error(error?.message ?? 'Could not create the event.')

      const event = mapEvent(data as EventRow)
      setEvents((prev) => [event, ...prev])
      pushLog({
        type: 'event_created',
        actor: 'organizer',
        message: `Event published: "${event.title}"`,
        detail: `${formatCurrency(event.priceAmount, event.priceCurrency)} · ${formatCapacity(event.capacity)} capacity · ${event.location}`,
      })
      return event
    }

    const updateEvent: AppDataContextValue['updateEvent'] = async (id, input) => {
      const { error } = await supabase
        .from('events')
        .update({
          title: input.title,
          description: input.description,
          starts_at: input.dateISO,
          location: input.location,
          contact_phone: input.contactPhone,
          price_amount: input.priceAmount,
          price_currency: input.priceCurrency,
          banner_from: input.bannerFrom,
          banner_to: input.bannerTo,
          image_url: input.imageUrl ?? null,
          capacity: input.capacity,
          category: input.category,
          subcategory: input.subcategory ?? null,
          is_top: input.isTop,
        })
        .eq('id', id)

      if (error) throw new Error(error.message)

      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...input } : e)))
      pushLog({
        type: 'event_updated',
        actor: 'admin',
        message: `Event updated: "${input.title}"`,
        detail: `${formatCurrency(input.priceAmount, input.priceCurrency)} · ${formatCapacity(input.capacity)} capacity · ${input.location}`,
      })
    }

    const deleteEvent: AppDataContextValue['deleteEvent'] = async (id) => {
      const event = getEvent(id)
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw new Error(error.message)

      setEvents((prev) => prev.filter((e) => e.id !== id))
      if (event) {
        pushLog({
          type: 'event_updated',
          actor: 'admin',
          message: `Event deleted: "${event.title}"`,
          detail: `${event.location} · ${formatDate(event.dateISO)}`,
        })
      }
    }

    const setUserRole: AppDataContextValue['setUserRole'] = async (userId, role) => {
      const { error } = await supabase.rpc('set_user_role', { p_user_id: userId, p_role: role })
      if (error) throw new Error(error.message)
      setOrganizers((prev) => prev.map((o) => (o.id === userId ? { ...o, role } : o)))
    }

    const registerAndPay: AppDataContextValue['registerAndPay'] = async (input) => {
      const event = getEvent(input.eventId)
      if (!event) throw new Error('Event not found.')

      const code = input.voucherCode?.trim().toUpperCase()
      let amountPaid = event.priceAmount
      let ticketId: string | undefined

      if (code) {
        ticketId = crypto.randomUUID()
        const { data: redeemed, error: redeemError } = await supabase.rpc('redeem_voucher', {
          p_event_id: input.eventId,
          p_code: code,
          p_ticket_id: ticketId,
        })
        if (redeemError) throw new Error(redeemError.message)
        const row = (redeemed as { discount_type: string; discount_value: number }[] | null)?.[0]
        if (!row) throw new Error('This voucher code is invalid or has already been used.')
        amountPaid = applyDiscount(event.priceAmount, {
          discountType: row.discount_type as DiscountType,
          discountValue: Number(row.discount_value),
        })
      }

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...(ticketId ? { id: ticketId } : {}),
          event_id: input.eventId,
          user_id: user?.id ?? null,
          attendee_name: input.attendeeName,
          attendee_email: input.attendeeEmail,
          attendee_phone: input.attendeePhone,
          payment_method: input.paymentMethod,
          status: 'valid',
          qr_value: generateId('kima'),
          amount_paid: amountPaid,
          voucher_code: code ?? null,
        })
        .select()
        .single()

      if (error || !data) throw new Error(error?.message ?? 'Could not register your ticket.')

      const ticket = mapTicket(data as TicketRow, event.priceAmount)
      setTickets((prev) => [ticket, ...prev])
      const methodLabel = input.paymentMethod === 'airtel' ? 'Airtel Money' : 'MTN Mobile Money'
      pushLog({
        type: 'payment_confirmed',
        actor: 'customer',
        message: `${ticket.attendeeName} paid via ${methodLabel}`,
        detail: `${formatCurrency(ticket.amountPaid, event.priceCurrency)} for "${event.title}"${code ? ` · voucher ${code}` : ''} · ticket ${ticket.qrValue}`,
      })
      return ticket
    }

    const validateVoucher: AppDataContextValue['validateVoucher'] = async (eventId, code) => {
      const { data, error } = await supabase.rpc('validate_voucher', {
        p_event_id: eventId,
        p_code: code.trim().toUpperCase(),
      })
      if (error) throw new Error(error.message)
      const row = (data as { discount_type: string; discount_value: number }[] | null)?.[0]
      if (!row) return null
      return { discountType: row.discount_type as DiscountType, discountValue: Number(row.discount_value) }
    }

    const issueVoucher: AppDataContextValue['issueVoucher'] = async (input) => {
      if (!user) throw new Error('You must be signed in to issue a voucher.')
      const { data, error } = await supabase
        .from('vouchers')
        .insert({
          event_id: input.eventId,
          code: input.code.trim().toUpperCase(),
          discount_type: input.discountType,
          discount_value: input.discountValue,
          created_by: user.id,
        })
        .select()
        .single()

      if (error || !data) throw new Error(error?.message ?? 'Could not issue the voucher.')
      return mapVoucher(data as VoucherRow)
    }

    const listVouchers: AppDataContextValue['listVouchers'] = async (eventId) => {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return ((data as VoucherRow[] | null) ?? []).map(mapVoucher)
    }

    const submitContactMessage: AppDataContextValue['submitContactMessage'] = async (input) => {
      // Generated client-side (rather than read back after insert) because
      // contact_messages has no public SELECT policy — an anonymous
      // submitter can't read back their own inserted row.
      const id = crypto.randomUUID()
      const { error } = await supabase.from('contact_messages').insert({
        id,
        name: input.name,
        email: input.email,
        message: input.message,
      })
      if (error) throw new Error(error.message)
      // Best-effort: the message is already saved, so an acknowledgement-
      // email failure shouldn't block the user from seeing "message sent".
      supabase.functions
        .invoke('send-contact-confirmation', { body: { contactMessageId: id } })
        .catch((err) => console.error('Contact confirmation email failed:', err))
    }

    const listContactMessages: AppDataContextValue['listContactMessages'] = async () => {
      const purgeBefore = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      await supabase.from('contact_messages').delete().lt('created_at', purgeBefore)

      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return ((data as ContactMessageRow[] | null) ?? []).map(mapContactMessage)
    }

    const deleteContactMessage: AppDataContextValue['deleteContactMessage'] = async (id) => {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id)
      if (error) throw new Error(error.message)
    }

    const listEmployees: AppDataContextValue['listEmployees'] = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return ((data as EmployeeRow[] | null) ?? []).map(mapEmployee)
    }

    const addEmployee: AppDataContextValue['addEmployee'] = async (input) => {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          first_name: input.firstName,
          last_name: input.lastName,
          email: input.email,
          contract_type: input.contractType,
          contract_start_date: input.contractStartDate,
          contract_end_date: input.contractEndDate ?? null,
          role: input.role,
        })
        .select()
        .single()

      if (error || !data) throw new Error(error?.message ?? 'Could not add this employee.')
      return mapEmployee(data as EmployeeRow)
    }

    const promoteEmployee: AppDataContextValue['promoteEmployee'] = async (employee, role) => {
      const { error } = await supabase.from('employees').update({ role }).eq('id', employee.id)
      if (error) throw new Error(error.message)
      if (employee.userId) {
        await setUserRole(employee.userId, role)
      }
    }

    const deleteEmployee: AppDataContextValue['deleteEmployee'] = async (employee) => {
      const { data, error } = await supabase.functions.invoke('delete-employee', {
        body: { employeeId: employee.id, userId: employee.userId },
      })
      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)
    }

    const sendTicketConfirmation: AppDataContextValue['sendTicketConfirmation'] = async (ticketId) => {
      const { data, error } = await supabase.functions.invoke('send-ticket-confirmation', {
        body: { ticketId },
      })
      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)
    }

    const getEmailUsage: AppDataContextValue['getEmailUsage'] = async () => {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count, error } = await supabase
        .from('email_log')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'sent')
        .gte('created_at', startOfMonth.toISOString())

      if (error) throw new Error(error.message)
      return { sentThisMonth: count ?? 0 }
    }

    const scanTicket: AppDataContextValue['scanTicket'] = async (code) => {
      const trimmed = code.trim()
      const ticket = tickets.find((t) => t.qrValue === trimmed || t.id === trimmed)
      if (!ticket) {
        pushLog({
          type: 'scan_invalid',
          actor: 'organizer',
          message: 'Scan rejected: invalid code',
          detail: `Code "${trimmed}" does not match any ticket`,
        })
        return { outcome: 'invalid' }
      }
      const event = getEvent(ticket.eventId)
      if (!event) return { outcome: 'invalid' }
      if (ticket.status === 'used') {
        pushLog({
          type: 'scan_used',
          actor: 'organizer',
          message: `Scan rejected: ${ticket.attendeeName}'s ticket was already used`,
          detail: `"${event.title}" · ticket ${ticket.qrValue}`,
        })
        return { outcome: 'used', ticket, event }
      }

      const { error } = await supabase.from('tickets').update({ status: 'used' }).eq('id', ticket.id)
      if (error) throw new Error(error.message)

      setTickets((prev) => prev.map((t) => (t.id === ticket.id ? { ...t, status: 'used' } : t)))
      pushLog({
        type: 'scan_valid',
        actor: 'organizer',
        message: `${ticket.attendeeName} checked in — entry granted`,
        detail: `"${event.title}" · ticket ${ticket.qrValue}`,
      })
      return { outcome: 'valid', ticket: { ...ticket, status: 'used' }, event }
    }

    const clearLogs = () => setLogs([])

    return {
      events,
      tickets,
      logs,
      organizers,
      getEvent,
      getTicket,
      getOrganizer,
      ticketsForEvent,
      createEvent,
      updateEvent,
      deleteEvent,
      setUserRole,
      registerAndPay,
      scanTicket,
      clearLogs,
      validateVoucher,
      issueVoucher,
      listVouchers,
      submitContactMessage,
      listContactMessages,
      deleteContactMessage,
      listEmployees,
      addEmployee,
      promoteEmployee,
      deleteEmployee,
      sendTicketConfirmation,
      getEmailUsage,
    }
  }, [events, tickets, organizers, logs, user])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
