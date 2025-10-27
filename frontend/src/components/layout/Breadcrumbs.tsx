import React from 'react'
import { Link, useMatches } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { Icon } from '../ui/Icon'

type BreadcrumbHandle = {
  breadcrumb: string
  hidden?: boolean
}

export function Breadcrumbs({ className }: { className?: string }) {
  const matches = useMatches()
  const crumbs = matches
    .filter((match) => Boolean((match.handle as BreadcrumbHandle | undefined)?.breadcrumb))
    .map((match) => {
      const handle = match.handle as BreadcrumbHandle | undefined
      const to = match.pathname ?? '/'
      return {
        label: handle?.breadcrumb ?? '',
        to,
        hidden: handle?.hidden ?? false,
      }
    })
    .filter((crumb) => !crumb.hidden)

  if (crumbs.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-2 text-xs uppercase tracking-[0.18em]', className)}>
      <Link to="/" className="flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-muted transition hover:text-fg">
        <Icon name="sparkles" className="h-3.5 w-3.5" />
        Home
      </Link>
      {crumbs.slice(1).map((crumb, index) => (
        <React.Fragment key={`${crumb.to}-${index}`}>
          <span className="text-muted">/</span>
          {index === crumbs.length - 2 ? (
            <span className="rounded-full bg-surface px-3 py-1 text-muted">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.to}
              className="rounded-full bg-surface px-3 py-1 text-muted transition hover:text-fg"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
