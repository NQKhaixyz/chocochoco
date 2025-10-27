import React from 'react'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from './Icon'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'pill'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: IconName
  rightIcon?: IconName
  loading?: boolean
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 font-semibold transition-transform duration-200 ease-snappy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-60 whitespace-nowrap'

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-brand text-slate-900 shadow-soft hover:-translate-y-[1px] hover:shadow-float border border-transparent focus-visible:ring-brand-strong/55',
  secondary:
    'bg-surface-subtle text-fg border border-border-strong/70 shadow-soft hover:-translate-y-[1px] hover:shadow-float focus-visible:ring-brand/45',
  outline:
    'bg-transparent border border-brand/60 text-brand-strong hover:bg-brand/10 hover:text-slate-900 focus-visible:ring-brand/35',
  ghost:
    'bg-transparent border border-transparent text-muted hover:text-fg hover:bg-surface-subtle/80 focus-visible:ring-border-strong/35',
  danger:
    'bg-lose/75 text-[#5d1e1e] border border-transparent hover:bg-lose focus-visible:ring-lose/50 hover:text-[#401010]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 rounded-lg text-xs tracking-wide',
  md: 'h-11 px-5 rounded-xl text-sm',
  lg: 'h-12 px-6 rounded-2xl text-base',
  pill: 'h-11 px-7 rounded-pill text-sm uppercase tracking-[0.08em]',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', leftIcon, rightIcon, loading, children, disabled, ...props },
  ref,
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
          <span className="opacity-80">Đang xử lý…</span>
        </span>
      ) : (
        <>
          {leftIcon ? <Icon name={leftIcon} className="h-4 w-4" /> : null}
          <span>{children}</span>
          {rightIcon ? <Icon name={rightIcon} className="h-4 w-4" /> : null}
        </>
      )}
    </button>
  )
})
