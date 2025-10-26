import React, { useMemo, useState } from 'react'
import { useTopPayout, useWeeklyWinrate } from '../hooks/useLeaderboard'
import { LeaderboardTable } from '../components/LeaderboardTable'
import { formatEther } from 'viem'

export default function LeaderboardPage() {
  const [payoutPage, setPayoutPage] = useState(0)
  const [winPage, setWinPage] = useState(0)

  const pageSizePayout = 100
  const pageSizeWin = 500

  const { rows: payoutRows, loading: payoutLoading } = useTopPayout(payoutPage, pageSizePayout)
  const payoutView = useMemo(
    () => payoutRows.map((r, i) => ({ rank: i + 1 + payoutPage * pageSizePayout, ...r })),
    [payoutRows, payoutPage],
  )
  const payoutCanNext = payoutRows.length === pageSizePayout

  const { rows: winRows, loading: winLoading } = useWeeklyWinrate(winPage, pageSizeWin)
  const winView = useMemo(() => winRows.map((r, i) => ({ rank: i + 1 + winPage * pageSizeWin, ...r })), [winRows, winPage])
  const winCanNext = winRows.length === pageSizeWin

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>

      <LeaderboardTable
        title="🏅 Top Payout (All-time)"
        columns={['#', 'Player', 'Total Payout']}
        rows={payoutView}
        loading={payoutLoading}
        pageIndex={payoutPage}
        setPageIndex={setPayoutPage}
        canPrev={payoutPage > 0}
        canNext={payoutCanNext}
        renderRow={(r: any) => (
          <tr key={r.player} className="border-b last:border-0">
            <td className="py-2 pr-6">{r.rank}</td>
            <td className="py-2 pr-6 font-mono">{r.player}</td>
            <td className="py-2 pr-6">{formatEther(r.totalPayout)} </td>
          </tr>
        )}
      />

      <LeaderboardTable
        title="📈 Weekly Win-Rate (Last 7 days)"
        columns={['#', 'Player', 'Wins', 'Total', 'Win-Rate']}
        rows={winView}
        loading={winLoading}
        pageIndex={winPage}
        setPageIndex={setWinPage}
        canPrev={winPage > 0}
        canNext={winCanNext}
        renderRow={(r: any) => (
          <tr key={r.player} className="border-b last:border-0">
            <td className="py-2 pr-6">{r.rank}</td>
            <td className="py-2 pr-6 font-mono">{r.player}</td>
            <td className="py-2 pr-6">{r.wins}</td>
            <td className="py-2 pr-6">{r.total}</td>
            <td className="py-2 pr-6">{(r.rate * 100).toFixed(1)}%</td>
          </tr>
        )}
      />
    </main>
  )
}

