import React from 'react'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from './Icon'

type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

const variantMap: Record<
  AlertVariant,
  { icon: IconName; wrapper: string; accent: string; badge: string; text: string }
> = {
  info: {
    icon: 'info',
    wrapper: 'bg-pastel-blue/45 border border-brand/40 shadow-soft',
    accent: 'text-brand-strong',
    badge: 'bg-brand/20 text-brand-strong',
    text: 'text-muted-strong',
  },
  success: {
    icon: 'success',
    wrapper: 'bg-win/45 border border-emerald-200/70 shadow-soft',
    accent: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-600',
    text: 'text-emerald-800',
  },
  warning: {
    icon: 'alert',
    wrapper: 'bg-pastel-yellow/55 border border-amber-200/70 shadow-soft',
    accent: 'text-amber-700',
    badge: 'bg-amber-200 text-amber-700',
    text: 'text-amber-800',
  },
  danger: {
    icon: 'alert',
    wrapper: 'bg-lose/50 border border-rose-200/70 shadow-soft',
    accent: 'text-rose-700',
    badge: 'bg-rose-200 text-rose-700',
    text: 'text-rose-800',
  },
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: AlertVariant
}

export function Alert({ title, description, action, variant = 'info', className, children, ...props }: AlertProps) {
  const styles = variantMap[variant]

  return (
    <div
      role="alert"
      className={cn('relative flex items-start gap-3 rounded-2xl p-4 transition', styles.wrapper, className)}
      {...props}
    >
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', styles.badge)}>
        <Icon name={styles.icon} className="h-5 w-5" strokeWidth={2.3} />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        {title ? <p className={cn('font-semibold', styles.accent)}>{title}</p> : null}
        {description ? <p className={cn('text-sm leading-relaxed', styles.text)}>{description}</p> : null}
        {children}
      </div>
      {action ? <div className="flex items-center">{action}</div> : null}
    </div>
  )
}

