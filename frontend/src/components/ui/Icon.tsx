import React from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Candy,
  Cat,
  CheckCircle2,
  Coins,
  History,
  Info,
  LayoutDashboard,
  Milk,
  Menu,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
  Wallet2,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../../lib/cn'

const icons = {
  cat: Cat,
  milk: Milk,
  cacao: Candy,
  treasury: Coins,
  alert: AlertTriangle,
  info: Info,
  success: CheckCircle2,
  neutral: AlertCircle,
  timer: Timer,
  wallet: Wallet2,
  shield: ShieldCheck,
  sparkles: Sparkles,
  history: History,
  trophy: Trophy,
  dashboard: LayoutDashboard,
  menu: Menu,
  close: X,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof icons

export interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  name: IconName
  size?: number
  strokeWidth?: number
}

export function Icon({ name, className, size = 18, strokeWidth = 2, ...rest }: IconProps) {
  const IconComponent = icons[name] ?? icons.neutral
  return (
    <IconComponent
      aria-hidden="true"
      className={cn('shrink-0 text-current', className)}
      size={size}
      strokeWidth={strokeWidth}
      {...rest}
    />
  )
}
