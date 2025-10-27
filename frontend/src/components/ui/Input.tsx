import React from 'react'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from './Icon'

type InputState = 'default' | 'success' | 'error'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: InputState
  leadingIcon?: IconName
  trailingIcon?: IconName
}

const stateRing: Record<InputState, string> = {
  default: 'focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:border-brand-strong',
  success: 'focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:border-emerald-400',
  error: 'focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:border-rose-400',
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, state = 'default', leadingIcon, trailingIcon, ...props },
  ref,
) {
  const withIcon = leadingIcon || trailingIcon

  return (
    <div
      className={cn(
        'relative flex w-full items-center rounded-xl border border-border-strong/70 bg-surface text-fg shadow-inner transition duration-200 focus-within:-translate-y-[1px] focus-within:shadow-soft',
        state === 'error' && 'border-rose-300',
        state === 'success' && 'border-emerald-300',
      )}
    >
      {leadingIcon ? (
        <Icon name={leadingIcon} className="ml-3 mr-2 h-4 w-4 text-muted" strokeWidth={2.2} />
      ) : null}
      <input
        ref={ref}
        className={cn(
          'peer h-11 w-full rounded-xl bg-transparent px-4 text-sm outline-none placeholder:text-muted/65',
          withIcon && 'pl-2',
          stateRing[state],
          className,
        )}
        {...props}
      />
      {trailingIcon ? (
        <Icon name={trailingIcon} className="mr-3 h-4 w-4 text-muted" strokeWidth={2.2} />
      ) : null}
    </div>
  )
})
