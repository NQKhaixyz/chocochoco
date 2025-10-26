'use client'
import { useEffect, useMemo, useState } from 'react'
import { useSolanaTime } from '../solana/time'
import { formatCountdown } from '../lib/time-format'

export interface SolanaCountdownProps {
  /** Unix timestamp in seconds */
  endTs: number
  /** Callback when countdown reaches zero */
  onExpire?: () => void
  /** Show hours even if zero */
  alwaysShowHours?: boolean
  /** Show days if applicable */
  showDays?: boolean
  /** Custom className */
  className?: string
  /** Highlight when under threshold (seconds) */
  urgentThreshold?: number
  /** Custom color for urgent state */
  urgentColor?: string
}

export function SolanaCountdown({
  endTs,
  onExpire,
  alwaysShowHours = false,
  showDays = false,
  className,
  urgentThreshold = 60,
  urgentColor = 'text-red-600',
}: SolanaCountdownProps) {
  const { chainTime } = useSolanaTime()
  const [remain, setRemain] = useState(() => Math.max(0, endTs - chainTime))

  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000)
      const diff = endTs - now // offset already reflected by initial state sync cadence
      if (diff <= 0) {
        setRemain(0)
        onExpire?.()
      } else {
        setRemain(diff)
      }
    }
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTs, onExpire])

  const text = useMemo(() => {
    return formatCountdown(remain, { alwaysShowHours, showDays })
  }, [remain, alwaysShowHours, showDays])

  const isUrgent = remain > 0 && remain < urgentThreshold
  const computedClassName = className || `font-mono ${isUrgent ? urgentColor : ''}`

  return <span className={computedClassName}>{text}</span>
}


