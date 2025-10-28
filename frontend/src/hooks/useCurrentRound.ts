import { useEffect, useState } from 'react'
import * as demo from '../lib/demo-rounds'
import type { DemoRound } from '../lib/demo-rounds'

/**
 * Hook to get the current active round from demo state
 * Refreshes every 5 seconds and on visibility change
 */
export function useCurrentRound() {
  const [round, setRound] = useState<DemoRound | undefined>()
  const [roundId, setRoundId] = useState<number>(0)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  useEffect(() => {
    // Update function
    const updateRound = () => {
      const current = demo.getCurrentRound()
      const id = demo.getCurrentRoundId()
      setRound(current)
      setRoundId(id)
    }

    // Initial load
    updateRound()

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      updateRound()
      setUpdateTrigger(prev => prev + 1)
    }, 5000)

    // Refresh on visibility change (tab focus)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateRound()
        setUpdateTrigger(prev => prev + 1)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return { round, roundId, updateTrigger }
}
