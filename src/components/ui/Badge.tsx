import type { ReactNode } from 'react'

type Tone = 'success' | 'warning' | 'destructive' | 'neutral'

const toneClasses: Record<Tone, string> = {
  success: 'bg-success-soft text-success border-success/30',
  warning: 'bg-warning-soft text-warning border-warning/30',
  destructive: 'bg-destructive-soft text-destructive border-destructive/30',
  neutral: 'bg-muted text-foreground-muted border-border',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        toneClasses[tone],
      ].join(' ')}
    >
      {children}
    </span>
  )
}
