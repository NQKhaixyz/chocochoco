import React from 'react'
import { cn } from '../../lib/cn'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: 'default' | 'success' | 'error'
}

const stateRing = {
  default: 'focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:border-brand-strong',
  success: 'focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:border-emerald-400',
  error: 'focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:border-rose-400',
} as const

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, state = 'default', rows = 4, ...props },
  ref,
) {
  return (
    <div
      className={cn(
        'relative flex w-full rounded-xl border border-border-strong/70 bg-surface text-fg shadow-inner transition duration-200 focus-within:-translate-y-[1px] focus-within:shadow-soft',
        state === 'error' && 'border-rose-300',
        state === 'success' && 'border-emerald-300',
      )}
    >
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full rounded-xl bg-transparent p-4 text-sm outline-none placeholder:text-muted/65',
          stateRing[state],
          className,
        )}
        {...props}
      />
    </div>
  )
})

