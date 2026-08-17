export function formatCurrency(amount: number, currency: string) {
  return `${amount.toLocaleString('en-US')} ${currency}`
}

export function formatDate(dateISO: string) {
  return new Date(dateISO).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(dateISO: string) {
  return new Date(dateISO).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatCapacity(capacity: number) {
  return capacity === 0 ? 'Unlimited' : capacity.toLocaleString('en-US')
}

export function bannerStyle(event: { imageUrl?: string; bannerFrom: string; bannerTo: string }) {
  if (event.imageUrl) {
    return {
      backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.05)), url(${event.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return { backgroundImage: `linear-gradient(135deg, ${event.bannerFrom}, ${event.bannerTo})` }
}

export function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function generateVoucherCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export function applyDiscount(amount: number, discount: { discountType: 'percentage' | 'fixed'; discountValue: number }) {
  const off = discount.discountType === 'percentage' ? (amount * discount.discountValue) / 100 : discount.discountValue
  return Math.max(0, Math.round(amount - off))
}
