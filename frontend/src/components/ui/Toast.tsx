import React from 'react'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from './Icon'

type ToastVariant = 'success' | 'info' | 'warning' | 'danger'

const toastStyles: Record<ToastVariant, { icon: IconName; wrapper: string; accent: string }> = {
  success: {
    icon: 'success',
    wrapper:
      'bg-surface text-emerald-700 border border-emerald-200/80 shadow-soft before:bg-emerald-400/70 before:shadow-soft',
    accent: 'text-emerald-700',
  },
  info: {
    icon: 'sparkles',
    wrapper:
      'bg-surface text-brand-strong border border-brand/40 shadow-soft before:bg-brand/55 before:shadow-soft',
    accent: 'text-brand-strong',
  },
  warning: {
    icon: 'alert',
    wrapper:
      'bg-surface text-amber-700 border border-amber-200/80 shadow-soft before:bg-amber-400/75 before:shadow-soft',
    accent: 'text-amber-700',
  },
  danger: {
    icon: 'alert',
    wrapper:
      'bg-surface text-rose-700 border border-rose-200/80 shadow-soft before:bg-rose-400/80 before:shadow-soft',
    accent: 'text-rose-700',
  },
}

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  variant?: ToastVariant
  timeAgo?: string
  onDismiss?: () => void
}

export function ToastPreview({
  title,
  description,
  timeAgo,
  variant = 'info',
  className,
  onDismiss,
  ...props
}: ToastProps) {
  const style = toastStyles[variant]

  return (
    <div
      role="status"
      className={cn(
        'relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border bg-card px-5 py-4 shadow-soft backdrop-blur-sm before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-full before:content-[""]',
        style.wrapper,
        className,
      )}
      {...props}
    >
      <Icon name={style.icon} className="mt-0.5 h-5 w-5" />
      <div className="flex flex-1 flex-col gap-1">
        <p className={cn('font-semibold', style.accent)}>{title}</p>
        {description ? <p className="text-xs text-muted">{description}</p> : null}
        {timeAgo ? <span className="text-[10px] uppercase tracking-[0.18em] text-muted">{timeAgo}</span> : null}
      </div>
      <button
        type="button"
        className="rounded-full p-1 text-muted transition hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        aria-label="Dismiss toast"
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  )
}
