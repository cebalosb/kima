import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'

type FieldWrapperProps = {
  label: string
  required?: boolean
  error?: string
  helperText?: string
  children: (id: string, describedBy: string | undefined) => ReactNode
}

function FieldWrapper({ label, required, error, helperText, children }: FieldWrapperProps) {
  const id = useId()
  const helperId = helperText ? `${id}-helper` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children(id, describedBy)}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-foreground-muted">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

const fieldClasses =
  'h-12 w-full rounded-xl border bg-muted px-4 text-base text-foreground placeholder:text-foreground-muted/70 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background'

type InputProps = InputHTMLAttributes<HTMLInputElement> &
  Omit<FieldWrapperProps, 'children'>

export function Input({ label, required, error, helperText, className = '', ...props }: InputProps) {
  return (
    <FieldWrapper label={label} required={required} error={error} helperText={helperText}>
      {(id, describedBy) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          className={[
            fieldClasses,
            error ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-focus',
            className,
          ].join(' ')}
          {...props}
        />
      )}
    </FieldWrapper>
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  Omit<FieldWrapperProps, 'children'>

export function Textarea({ label, required, error, helperText, className = '', ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} required={required} error={error} helperText={helperText}>
      {(id, describedBy) => (
        <textarea
          id={id}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          className={[
            fieldClasses,
            'h-auto min-h-28 resize-y py-3',
            error ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-focus',
            className,
          ].join(' ')}
          {...props}
        />
      )}
    </FieldWrapper>
  )
}
