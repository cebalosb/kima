import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Star, UploadSimple, X } from '@phosphor-icons/react'
import type { EventItem } from '../../lib/data'
import { useAuth, isAdminRole } from '../../lib/auth'
import { categories, categoryMeta, type Category } from '../../lib/categories'
import { Card } from '../ui/Card'
import { Input, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const PHONE_PATTERN = /^\+?[0-9\s]{8,15}$/

const BANNER = { from: '#0ea5e9', to: '#4f46e5' }

function toDateTimeLocal(dateISO: string) {
  const d = new Date(dateISO)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export type EventFormValues = Omit<EventItem, 'id' | 'organizerId'>

export function EventForm({
  initialEvent,
  submitLabel,
  onSubmit,
}: {
  initialEvent?: EventItem
  submitLabel: string
  onSubmit: (values: EventFormValues) => void | Promise<void>
}) {
  const { user } = useAuth()
  const isAdmin = !!user && isAdminRole(user.role)
  const [title, setTitle] = useState(initialEvent?.title ?? '')
  const [description, setDescription] = useState(initialEvent?.description ?? '')
  const [date, setDate] = useState(initialEvent ? toDateTimeLocal(initialEvent.dateISO) : '')
  const [location, setLocation] = useState(initialEvent?.location ?? '')
  const [contactPhone, setContactPhone] = useState(initialEvent?.contactPhone ?? '')
  const [price, setPrice] = useState(initialEvent ? String(initialEvent.priceAmount) : '10000')
  const [currency, setCurrency] = useState(initialEvent?.priceCurrency ?? 'CFA')
  const [capacity, setCapacity] = useState(initialEvent ? String(initialEvent.capacity) : '100')
  const [category, setCategory] = useState<Category>(initialEvent?.category ?? 'music')
  const [subcategory, setSubcategory] = useState<string | undefined>(
    initialEvent?.subcategory ?? categoryMeta[initialEvent?.category ?? 'music'].subcategories[0],
  )
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | undefined>(undefined)
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialEvent?.imageUrl)
  const [imageError, setImageError] = useState<string | undefined>(undefined)
  const [isTop, setIsTop] = useState(initialEvent?.isTop ?? false)

  function handleCategoryChange(next: Category) {
    setCategory(next)
    setSubcategory(categoryMeta[next].subcategories[0])
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image is too large (max 5MB).')
      return
    }

    setImageError(undefined)
    const reader = new FileReader()
    reader.onload = () => setImageUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const isValid =
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    date.length > 0 &&
    location.trim().length >= 2 &&
    PHONE_PATTERN.test(contactPhone.trim()) &&
    Number(price) > 0 &&
    capacity.trim().length > 0 &&
    Number(capacity) >= 0

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setFormError(undefined)
    if (!isValid) return

    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        dateISO: new Date(date).toISOString(),
        location: location.trim(),
        contactPhone: contactPhone.trim(),
        priceAmount: Number(price),
        priceCurrency: currency.trim() || 'CFA',
        capacity: Number(capacity),
        bannerFrom: BANNER.from,
        bannerTo: BANNER.to,
        imageUrl,
        category,
        subcategory,
        isTop: isAdmin ? isTop : false,
      })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <Input
          label="Event title"
          required
          placeholder="e.g. Afrobeat Sunset Festival"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={submitted && title.trim().length < 3 ? 'Enter a title (min 3 characters)' : undefined}
        />
        <Textarea
          label="Description"
          required
          placeholder="Tell attendees what to expect"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={
            submitted && description.trim().length < 10 ? 'Enter a description (min 10 characters)' : undefined
          }
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="Date & time"
            required
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={submitted && !date ? 'Pick a date and time' : undefined}
          />
          <Input
            label="Location"
            required
            placeholder="Venue, city"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            error={submitted && location.trim().length < 2 ? 'Enter a location' : undefined}
          />
        </div>
        <Input
          label="Contact phone number"
          required
          type="tel"
          inputMode="tel"
          placeholder="e.g. 07 00 00 00 00"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          helperText="Attendees and admins may use this to reach you about this event."
          error={
            submitted && !PHONE_PATTERN.test(contactPhone.trim()) ? 'Enter a valid phone number' : undefined
          }
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="Ticket price"
            required
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={submitted && Number(price) <= 0 ? 'Enter a price' : undefined}
          />
          <Input label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
        </div>

        <Input
          label="What is the maximum number of people for your event?"
          required
          type="number"
          min={0}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          helperText="Type 0 if you're not sure — we'll treat it as unlimited."
          error={
            submitted && (capacity.trim().length === 0 || Number(capacity) < 0)
              ? 'Enter a number (0 for unlimited)'
              : undefined
          }
        />

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsTop((v) => !v)}
            aria-pressed={isTop}
            className={[
              'flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-left transition-colors duration-150',
              isTop ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:bg-muted',
            ].join(' ')}
          >
            <span
              className={[
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                isTop ? 'bg-accent text-accent-foreground' : 'bg-muted text-foreground-muted',
              ].join(' ')}
            >
              <Star size={18} weight={isTop ? 'fill' : 'regular'} />
            </span>
            <span>
              <span className="block text-sm font-medium text-foreground">Promote as a Top Event</span>
              <span className="block text-xs text-foreground-muted">
                Surfaces on the Top Events page (while it's this month) and sorts first within its category and
                subcategory on Browse Events.
              </span>
            </span>
          </button>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Category</p>
          <div className="flex flex-wrap gap-2.5">
            {categories.map((c) => {
              const meta = categoryMeta[c]
              const Icon = meta.icon
              const isActive = category === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCategoryChange(c)}
                  aria-pressed={isActive}
                  className="flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150"
                  style={{
                    borderColor: isActive ? meta.color : 'var(--color-border)',
                    backgroundColor: isActive ? meta.color : 'var(--color-surface)',
                    color: isActive ? '#ffffff' : 'var(--color-foreground)',
                  }}
                >
                  <Icon size={16} weight={isActive ? 'fill' : 'regular'} />
                  {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        {categoryMeta[category].subcategories.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Subcategory</p>
            <div className="flex flex-wrap gap-2.5">
              {categoryMeta[category].subcategories.map((sub) => {
                const isActive = subcategory === sub
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubcategory(sub)}
                    aria-pressed={isActive}
                    className="flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150"
                    style={{
                      borderColor: isActive ? categoryMeta[category].color : 'var(--color-border)',
                      backgroundColor: isActive ? categoryMeta[category].color : 'var(--color-surface)',
                      color: isActive ? '#ffffff' : 'var(--color-foreground)',
                    }}
                  >
                    {sub}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Event photo</p>
          {imageUrl ? (
            <div className="relative h-40 w-full overflow-hidden rounded-2xl sm:w-72">
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl(undefined)}
                aria-label="Remove photo"
                className="absolute right-2 top-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors duration-150 hover:bg-black/75"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
          ) : (
            <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-muted text-foreground-muted transition-colors duration-150 hover:border-accent hover:text-accent sm:w-72">
              <UploadSimple size={22} />
              <span className="text-sm font-medium">Upload a photo</span>
              <span className="text-xs">JPG or PNG, up to 5MB</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
            </label>
          )}
          {imageError && <p className="text-xs font-medium text-destructive">{imageError}</p>}
          <p className="text-xs text-foreground-muted">
            Optional — shown on the event tile. If you skip this, a blue banner is used instead.
          </p>
        </div>

        {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}

        <Button type="submit" size="lg" fullWidth className="mt-1" loading={submitting}>
          {submitLabel}
        </Button>
      </form>
    </Card>
  )
}
