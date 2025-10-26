'use client'
import { useEffect, useState } from 'react'

/**
 * Hook to manage countdown state with optional time offset
 * Returns remaining seconds and formatted display
 */
export function useCountdown(
  endTs: number,
  options: {
    onExpire?: () => void
    timeOffset?: number
  } = {}
) {
  const { onExpire, timeOffset = 0 } = options
  
  const [remaining, setRemaining] = useState(() => {
    const now = Math.floor(Date.now() / 1000) + timeOffset
    return Math.max(0, endTs - now)
  })

  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000) + timeOffset
      const diff = endTs - now
      
      if (diff <= 0) {
        setRemaining(0)
        onExpire?.()
      } else {
        setRemaining(diff)
      }
    }
    
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTs, timeOffset, onExpire])

  const isExpired = remaining <= 0
  const isUrgent = remaining > 0 && remaining < 60

  return {
    remaining,
    isExpired,
    isUrgent,
    hours: Math.floor(remaining / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
  }
}
