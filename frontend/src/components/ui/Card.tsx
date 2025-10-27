import React from 'react'
import { cn } from '../../lib/cn'

type CardVariant = 'glass' | 'solid' | 'outline'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variantStyles: Record<CardVariant, string> = {
  glass: 'bg-gradient-card border-border/50 backdrop-blur-lg',
  solid: 'bg-surface border-border-strong/70',
  outline: 'bg-transparent border-brand/45',
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant = 'glass', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-2xl border shadow-soft transition-transform duration-200 hover:-translate-y-[1px] hover:shadow-float',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  )
})

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex flex-col gap-2 px-6 pt-6', className)} {...props} />
  },
)

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cn('font-display text-2xl font-semibold text-fg drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]', className)}
        {...props}
      />
    )
  },
)

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className, ...props }, ref) {
    return <p ref={ref} className={cn('text-sm text-muted', className)} {...props} />
  },
)

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn('px-6 pb-6', className)} {...props} />
  },
)

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex items-center gap-3 px-6 pb-6', className)} {...props} />
  },
)

