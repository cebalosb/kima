import { CalendarBlank, CaretDown, MagnifyingGlass, MapPin, X } from '@phosphor-icons/react'
import { useDeferredValue, useState } from 'react'
import { useAppData } from '../../lib/data'
import { categories, categoryMeta, type Category } from '../../lib/categories'
import { EventCard } from '../../components/events/EventCard'
import { EmptyState } from '../../components/ui/EmptyState'

type DateSort = 'none' | 'asc' | 'desc'

export function Home() {
  const { events } = useAppData()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [subcategory, setSubcategory] = useState<string | 'all'>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [dateSort, setDateSort] = useState<DateSort>('none')
  const deferredQuery = useDeferredValue(query)
  const deferredLocation = useDeferredValue(location)

  const subcategoryOptions = category === 'all' ? [] : categoryMeta[category].subcategories

  function handleCategoryChange(next: Category | 'all') {
    setCategory(next)
    setSubcategory('all')
  }

  const filtered = events
    .filter((event) => {
      const matchesQuery = event.title.toLowerCase().includes(deferredQuery.toLowerCase())
      const matchesLocation = event.location.toLowerCase().includes(deferredLocation.toLowerCase())
      const matchesCategory = category === 'all' || event.category === category
      const matchesSubcategory = subcategory === 'all' || event.subcategory === subcategory
      const matchesDate = !dateFilter || event.dateISO.slice(0, 10) === dateFilter
      return matchesQuery && matchesLocation && matchesCategory && matchesSubcategory && matchesDate
    })
    .sort((a, b) => {
      if (a.isTop !== b.isTop) return a.isTop ? -1 : 1
      if (dateSort === 'asc') return a.dateISO.localeCompare(b.dateISO)
      if (dateSort === 'desc') return b.dateISO.localeCompare(a.dateISO)
      return 0
    })

  return (
    <div className="flex flex-col gap-14">
      <section className="relative left-1/2 right-1/2 -mx-[50vw] -mt-8 flex min-h-[440px] w-screen items-end overflow-hidden sm:-mt-10 sm:min-h-[560px]">
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-14 sm:px-6 sm:pb-20">
          <h1 className="font-agency-display max-w-3xl text-[clamp(2.75rem,1.75rem+4vw,5.5rem)] text-white">
            Find your next event.
          </h1>

          <div className="flex h-14 w-full max-w-2xl items-center rounded-full border border-white/20 bg-surface pl-5 pr-1.5 shadow-lg shadow-black/20 focus-within:ring-2 focus-within:ring-focus focus-within:ring-offset-2 focus-within:ring-offset-background">
            <label className="flex min-w-0 flex-1 items-center gap-2.5">
              <MagnifyingGlass size={20} className="shrink-0 text-foreground-muted" />
              <span className="sr-only">Search events</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events"
                className="w-full min-w-0 bg-transparent text-base text-foreground placeholder:text-foreground-muted/70 focus:outline-none"
              />
            </label>

            <div className="mx-3 h-6 w-px shrink-0 bg-border sm:mx-4" />

            <label className="flex w-28 shrink-0 items-center gap-2 sm:w-40">
              <MapPin size={20} className="shrink-0 text-foreground-muted" />
              <span className="sr-only">Filter by city</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City"
                className="w-full min-w-0 bg-transparent text-base text-foreground placeholder:text-foreground-muted/70 focus:outline-none"
              />
            </label>

            <button
              type="button"
              aria-label="Search"
              className="ml-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-focus text-focus-foreground transition-colors duration-150 hover:bg-focus/90"
            >
              <MagnifyingGlass size={18} weight="bold" />
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-4 sm:items-center">
        <div className="relative sm:w-56">
          <span className="sr-only">Filter by category</span>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as Category | 'all')}
            className="h-14 w-full appearance-none rounded-xl border border-border bg-surface pl-4 pr-10 text-base text-foreground shadow-sm shadow-black/[0.03] focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-background"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {categoryMeta[c].label}
              </option>
            ))}
          </select>
          <CaretDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted"
          />
        </div>

        {subcategoryOptions.length > 0 && (
          <div className="relative sm:w-56">
            <span className="sr-only">Filter by subcategory</span>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="h-14 w-full appearance-none rounded-xl border border-border bg-surface pl-4 pr-10 text-base text-foreground shadow-sm shadow-black/[0.03] focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-background"
            >
              <option value="all">All subcategories</option>
              {subcategoryOptions.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <CaretDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted"
            />
          </div>
        )}

        <div className="relative sm:w-52">
          <span className="sr-only">Filter by date</span>
          <CalendarBlank
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-14 w-full rounded-xl border border-border bg-surface pl-11 pr-9 text-base text-foreground shadow-sm shadow-black/[0.03] focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-background"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              aria-label="Clear date filter"
              className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-foreground-muted transition-colors duration-150 hover:bg-muted hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative sm:w-56">
          <span className="sr-only">Sort by date</span>
          <select
            value={dateSort}
            onChange={(e) => setDateSort(e.target.value as DateSort)}
            className="h-14 w-full appearance-none rounded-xl border border-border bg-surface pl-4 pr-10 text-base text-foreground shadow-sm shadow-black/[0.03] focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-background"
          >
            <option value="none">All events</option>
            <option value="asc">Date: Soonest first</option>
            <option value="desc">Date: Latest first</option>
          </select>
          <CaretDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted"
          />
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-2xl font-bold text-foreground">Events</h2>
          <span className="text-sm text-foreground-muted">{filtered.length} events</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<MagnifyingGlass size={24} />}
            title="No events found"
            description="Try a different search term or category, or check back soon for new events."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} to={`/events/${event.id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
