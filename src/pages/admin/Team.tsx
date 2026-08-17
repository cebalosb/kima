import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Plus, Trash, UserCirclePlus } from '@phosphor-icons/react'
import { useAppData, type Employee, type EmployeeRole } from '../../lib/data'
import { useAuth, isAdminRole } from '../../lib/auth'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button, buttonClasses } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate } from '../../lib/format'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPLOYEE_ROLES: EmployeeRole[] = ['sales', 'admin', 'super_admin']

const roleLabel: Record<EmployeeRole, string> = {
  sales: 'Sales',
  admin: 'Admin',
  super_admin: 'Super Admin',
}

const roleTone: Record<EmployeeRole, 'neutral' | 'success' | 'warning'> = {
  sales: 'neutral',
  admin: 'success',
  super_admin: 'warning',
}

export function Team() {
  const { listEmployees, addEmployee, promoteEmployee, deleteEmployee } = useAppData()
  const { user, loading } = useAuth()
  const location = useLocation()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeesLoading, setEmployeesLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | undefined>(undefined)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (!user || !isAdminRole(user.role)) return
    let cancelled = false
    listEmployees()
      .then((data) => {
        if (!cancelled) setEmployees(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Could not load employees.')
      })
      .finally(() => {
        if (!cancelled) setEmployeesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, listEmployees])

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!isAdminRole(user.role)) return <Navigate to="/organizer" replace />

  async function handleRoleChange(employee: Employee, nextRole: EmployeeRole) {
    setPendingId(employee.id)
    try {
      await promoteEmployee(employee, nextRole)
      setEmployees((prev) => prev.map((e) => (e.id === employee.id ? { ...e, role: nextRole } : e)))
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not update this employee.')
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete(employee: Employee) {
    if (
      !window.confirm(
        `Delete ${employee.firstName} ${employee.lastName}? This removes their login entirely and cannot be undone.`,
      )
    ) {
      return
    }
    setPendingId(employee.id)
    try {
      await deleteEmployee(employee)
      setEmployees((prev) => prev.filter((e) => e.id !== employee.id))
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not delete this employee.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Emp Manager</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Enroll Kima employees and assign their platform role: Sales, Admin, or Super Admin.
          </p>
        </div>
        <Button size="md" onClick={() => setShowAddModal(true)}>
          <Plus size={18} weight="bold" />
          Add employee
        </Button>
      </div>

      {loadError && <p className="text-sm font-medium text-destructive">{loadError}</p>}

      {employeesLoading ? null : employees.length === 0 ? (
        <EmptyState
          icon={<UserCirclePlus size={24} />}
          title="No employees enrolled yet"
          description="Add an employee to assign them a platform role — it applies as soon as they sign up."
          action={
            <button type="button" onClick={() => setShowAddModal(true)} className={buttonClasses({ size: 'md' })}>
              Add employee
            </button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-foreground-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Contract</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((employee) => {
                  const isPending = pendingId === employee.id
                  return (
                    <tr key={employee.id}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-xs text-foreground-muted">{employee.email}</p>
                      </td>
                      <td className="px-5 py-4 text-foreground-muted">
                        <p>{employee.contractType}</p>
                        <p className="text-xs">
                          {formatDate(employee.contractStartDate)} —{' '}
                          {employee.contractEndDate ? formatDate(employee.contractEndDate) : 'Ongoing'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={employee.userId ? 'success' : 'neutral'}>
                          {employee.userId ? 'Active' : 'Pending signup'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Badge tone={roleTone[employee.role]}>{roleLabel[employee.role]}</Badge>
                          <select
                            value={employee.role}
                            disabled={isPending}
                            onChange={(e) => handleRoleChange(employee, e.target.value as EmployeeRole)}
                            aria-label={`Change role for ${employee.firstName} ${employee.lastName}`}
                            className="h-9 rounded-lg border border-border bg-surface px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-background"
                          >
                            {EMPLOYEE_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {roleLabel[r]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="destructive"
                          size="md"
                          loading={isPending}
                          onClick={() => handleDelete(employee)}
                        >
                          <Trash size={16} />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (input) => {
            const employee = await addEmployee(input)
            setEmployees((prev) => [employee, ...prev])
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

function AddEmployeeModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (input: {
    firstName: string
    lastName: string
    email: string
    contractType: string
    contractStartDate: string
    contractEndDate?: string
    role: EmployeeRole
  }) => Promise<void>
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [contractType, setContractType] = useState('')
  const [contractStartDate, setContractStartDate] = useState('')
  const [contractEndDate, setContractEndDate] = useState('')
  const [role, setRole] = useState<EmployeeRole>('sales')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | undefined>(undefined)

  const isValid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    EMAIL_PATTERN.test(email.trim()) &&
    contractType.trim().length >= 2 &&
    contractStartDate.length > 0

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setFormError(undefined)
    if (!isValid) return

    setSubmitting(true)
    try {
      await onAdd({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        contractType: contractType.trim(),
        contractStartDate,
        contractEndDate: contractEndDate || undefined,
        role,
      })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not add this employee.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Add employee" onClose={onClose}>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="First name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={submitted && firstName.trim().length < 2 ? 'Enter a first name' : undefined}
          />
          <Input
            label="Last name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={submitted && lastName.trim().length < 2 ? 'Enter a last name' : undefined}
          />
        </div>
        <Input
          label="Email"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          helperText="They'll get this role automatically once they sign up with this email."
          error={submitted && !EMAIL_PATTERN.test(email.trim()) ? 'Enter a valid email address' : undefined}
        />
        <Input
          label="Contract type"
          required
          placeholder="e.g. Full-time, Part-time, Contractor"
          value={contractType}
          onChange={(e) => setContractType(e.target.value)}
          error={submitted && contractType.trim().length < 2 ? 'Enter a contract type' : undefined}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="Contract start date"
            required
            type="date"
            value={contractStartDate}
            onChange={(e) => setContractStartDate(e.target.value)}
            error={submitted && !contractStartDate ? 'Pick a start date' : undefined}
          />
          <Input
            label="Contract end date"
            type="date"
            value={contractEndDate}
            onChange={(e) => setContractEndDate(e.target.value)}
            helperText="Leave blank for an ongoing contract."
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Role</p>
          <div className="flex gap-2.5">
            {EMPLOYEE_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={[
                  'flex-1 cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors duration-150',
                  role === r
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border bg-surface text-foreground hover:bg-muted',
                ].join(' ')}
              >
                {roleLabel[r]}
              </button>
            ))}
          </div>
        </div>

        {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Add employee
        </Button>
      </form>
    </Modal>
  )
}
