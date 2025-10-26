import { useEffect, useMemo, useState } from 'react'
import { gqlFetch } from '../lib/subgraph'
import { Q_CLAIMS_PAGE, Q_PLAYERROUNDS_WEEK } from '../queries/leaderboard'

type PayoutRow = { player: string; totalPayout: bigint }
type WinrateRow = { player: string; wins: number; total: number; rate: number }

export function useTopPayout(pageIndex: number, pageSize = 100) {
  const [rows, setRows] = useState<PayoutRow[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const data = await gqlFetch<{ claims: { player: string; amount: string }[] }>(Q_CLAIMS_PAGE, {
          first: pageSize,
          skip: pageIndex * pageSize,
          orderBy: 'amount',
          orderDirection: 'desc',
        })
        const agg = new Map<string, bigint>()
        for (const c of data.claims) {
          const p = c.player.toLowerCase()
          const v = BigInt(c.amount)
          agg.set(p, (agg.get(p) ?? 0n) + v)
        }
        const arr = [...agg.entries()].map(([player, totalPayout]) => ({ player, totalPayout }))
        arr.sort((a: any, b: any) => (a.totalPayout > b.totalPayout ? -1 : a.totalPayout < b.totalPayout ? 1 : 0))
        if (!cancelled) setRows(arr)
      } catch (e: any) {
        if (!cancelled) setErr(e.message || 'subgraph error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [pageIndex, pageSize])

  return { rows, loading, error: err }
}

export function useWeeklyWinrate(pageIndex: number, pageSize = 500) {
  const [rows, setRows] = useState<WinrateRow[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const from = Math.floor(Date.now() / 1000) - 7 * 24 * 3600
        const data = await gqlFetch<{ playerRounds: { player: string; side: number; round: { winnerSide: number } }[] }>(
          Q_PLAYERROUNDS_WEEK,
          { from, first: pageSize, skip: pageIndex * pageSize },
        )
        const agg = new Map<string, { wins: number; total: number }>()
        for (const pr of data.playerRounds) {
          const p = pr.player.toLowerCase()
          const isWin = pr.side === pr.round.winnerSide && pr.round.winnerSide != null
          const cur = agg.get(p) ?? { wins: 0, total: 0 }
          cur.total += 1
          if (isWin) cur.wins += 1
          agg.set(p, cur)
        }
        const arr = [...agg.entries()].map(([player, { wins, total }]) => ({ player, wins, total, rate: total ? wins / total : 0 }))
        arr.sort((a: any, b: any) => b.rate - a.rate || b.total - a.total)
        if (!cancelled) setRows(arr)
      } catch (e: any) {
        if (!cancelled) setErr(e.message || 'subgraph error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [pageIndex, pageSize])

  return { rows, loading, error: err }
}

