import { useEffect, useState } from 'react'
import { fetchLatestRound, type RoundListItem } from '../lib/indexer'

export function useLatestRound() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [round, setRound] = useState<RoundListItem | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      const r = await fetchLatestRound()
      if (!mounted) return
      if (!r) setError('Không lấy được round hiện tại từ Indexer')
      setRound(r ?? null)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [])

  return { loading, error, round }
}

