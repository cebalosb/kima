import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/customer/Home'
import { TopEvents } from './pages/customer/TopEvents'
import { EventDetail } from './pages/customer/EventDetail'
import { Register } from './pages/customer/Register'
import { Payment } from './pages/customer/Payment'
import { TicketConfirmation } from './pages/customer/TicketConfirmation'
import { MyTickets } from './pages/customer/MyTickets'
import { Dashboard } from './pages/organizer/Dashboard'
import { CreateEvent } from './pages/organizer/CreateEvent'
import { EventManage } from './pages/organizer/EventManage'
import { ScanTicket } from './pages/organizer/ScanTicket'
import { ActivityLog } from './pages/ActivityLog'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { EventOverview } from './pages/admin/EventOverview'
import { EditEvent } from './pages/admin/EditEvent'
import { CreateEvent as AdminCreateEvent } from './pages/admin/CreateEvent'
import { Team } from './pages/admin/Team'
import { Messages } from './pages/admin/Messages'
import { SignUp } from './pages/auth/SignUp'
import { LogIn } from './pages/auth/LogIn'
import { Contact } from './pages/Contact'
import { CreateEventRedirect } from './pages/CreateEventRedirect'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/top-events" element={<TopEvents />} />
        <Route path="/create-event" element={<CreateEventRedirect />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/events/:id/register" element={<Register />} />
        <Route path="/events/:id/pay" element={<Payment />} />
        <Route path="/tickets/:id" element={<TicketConfirmation />} />
        <Route path="/my-tickets" element={<MyTickets />} />

        <Route path="/organizer" element={<Dashboard />} />
        <Route path="/organizer/events/new" element={<CreateEvent />} />
        <Route path="/organizer/events/:id" element={<EventManage />} />
        <Route path="/organizer/scan" element={<ScanTicket />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/events/new" element={<AdminCreateEvent />} />
        <Route path="/admin/events/:id" element={<EventOverview />} />
        <Route path="/admin/events/:id/edit" element={<EditEvent />} />
        <Route path="/admin/team" element={<Team />} />
        <Route path="/admin/messages" element={<Messages />} />

        <Route path="/activity" element={<ActivityLog />} />
      </Route>
    </Routes>
  )
}
