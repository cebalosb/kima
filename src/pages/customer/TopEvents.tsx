import { useState } from 'react'
import { Star } from '@phosphor-icons/react'
import { useAppData } from '../../lib/data'
import { categories, categoryMeta, type Category } from '../../lib/categories'
import { EventCard } from '../../components/events/EventCard'
import { EmptyState } from '../../components/ui/EmptyState'

function isThisMonth(dateISO: string) {
  const d = new Date(dateISO)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export function TopEvents() {
  const { events } = useAppData()
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [subcategory, setSubcategory] = useState<string | 'all'>('all')

  const topThisMonth = events.filter((e) => e.isTop && isThisMonth(e.dateISO))
  const subcategoryOptions = category === 'all' ? [] : categoryMeta[category].subcategories

  function handleCategoryChange(next: Category | 'all') {
    setCategory(next)
    setSubcategory('all')
  }

  const filtered = topThisMonth.filter((event) => {
    const matchesCategory = category === 'all' || event.category === category
    const matchesSubcategory = subcategory === 'all' || event.subcategory === subcategory
    return matchesCategory && matchesSubcategory
  })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Top Events</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          This month's featured events, picked by our team.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            aria-pressed={category === 'all'}
            className={[
              'flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150',
              category === 'all'
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-border bg-surface text-foreground hover:bg-muted',
            ].join(' ')}
          >
            All categories
          </button>
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

        {subcategoryOptions.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setSubcategory('all')}
              aria-pressed={subcategory === 'all'}
              className={[
                'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
                subcategory === 'all'
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border bg-surface text-foreground-muted hover:bg-muted',
              ].join(' ')}
            >
              All subcategories
            </button>
            {subcategoryOptions.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSubcategory(sub)}
                aria-pressed={subcategory === sub}
                className={[
                  'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
                  subcategory === sub
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border bg-surface text-foreground-muted hover:bg-muted',
                ].join(' ')}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Star size={24} />}
          title="No top events this month"
          description="Check back soon, or browse all events for what's on."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} to={`/events/${event.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
