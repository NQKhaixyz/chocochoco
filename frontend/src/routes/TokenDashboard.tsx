import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { CatIllustration } from '../components/CatIllustration'
import { useSolanaAccount } from '../hooks/useSolanaAccount'
import { cn } from '../lib/cn'
import * as demo from '../lib/demo-rounds'

interface Transaction {
  id: string
  type: 'commit' | 'claim' | 'refund'
  amount: bigint
  roundId: number
  timestamp: number
  status: 'success' | 'pending' | 'failed'
}

interface EarningsData {
  roundId: number
  tribe: 'Milk' | 'Cacao'
  stake: bigint
  payout: bigint
  profit: bigint
  timestamp: number
}

export default function TokenDashboard() {
  const { publicKey, isConnected } = useSolanaAccount()
  const [balance, setBalance] = useState<bigint>(0n)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [earnings, setEarnings] = useState<EarningsData[]>([])
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'all'>('30d')

  useEffect(() => {
    if (publicKey) {
      // Get balance
      const bal = demo.getBalance(publicKey)
      setBalance(bal)

      // Get transaction history
      const txs = demo.getTransactionHistory(publicKey)
      setTransactions(txs)

      // Get earnings breakdown
      const earningsData = demo.getEarningsBreakdown(publicKey)
      setEarnings(earningsData)
    }
  }, [publicKey])

  // Calculate stats
  const stats = useMemo(() => {
    const totalEarned = earnings.reduce((sum, e) => sum + e.payout, 0n)
    const totalStaked = earnings.reduce((sum, e) => sum + e.stake, 0n)
    const totalProfit = earnings.reduce((sum, e) => sum + e.profit, 0n)
    const avgROI = totalStaked > 0n ? Number((totalProfit * 10000n) / totalStaked) / 100 : 0

    return {
      totalEarned,
      totalStaked,
      totalProfit,
      avgROI,
      winCount: earnings.filter(e => e.profit > 0n).length,
      totalRounds: earnings.length,
    }
  }, [earnings])

  // Filter transactions by time
  const filteredTransactions = useMemo(() => {
    const now = Date.now()
    const filterTime = timeFilter === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                       timeFilter === '30d' ? 30 * 24 * 60 * 60 * 1000 :
                       Infinity

    return transactions.filter(tx => now - tx.timestamp < filterTime)
  }, [transactions, timeFilter])

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <CatIllustration type="sleep" size="xl" />
            <h2 className="text-2xl font-bold text-fg">Connect Your Wallet</h2>
            <p className="text-center text-muted">
              Connect your Solana wallet to view your token dashboard and transaction history.
            </p>
            <Button variant="primary" leftIcon="wallet">
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <header className="relative rounded-2xl bg-gradient-brand px-8 py-10 shadow-float animate-fade-up overflow-hidden">
        <div className="relative z-10">
          <h1 className="font-display text-4xl font-semibold text-on-brand flex items-center gap-3">
            <CatIllustration type="victorious" size="lg" className="animate-bounce-slow" />
            Token Dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-base text-on-brand/80">
            Track your FOOD tokens, earnings, and transaction history. Manage your GameFi portfolio! 💎
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-20">
          <CatIllustration type="winner" size="xl" />
        </div>
      </header>

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Current Balance</CardTitle>
              <Icon name="wallet" className="h-4 w-4 text-brand-strong" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-fg">
                {demo.formatFoodBalance(balance)}
              </span>
              <span className="text-xs text-muted">FOOD</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Available to stake in next round
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Earned</CardTitle>
              <Icon name="treasury" className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-500">
                {demo.formatFoodBalance(stats.totalEarned)}
              </span>
              <span className="text-xs text-muted">FOOD</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Across {stats.totalRounds} rounds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Net Profit</CardTitle>
              <Icon name="trophy" className="h-4 w-4 text-brand-strong" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-2xl font-bold",
                stats.totalProfit > 0n ? "text-green-500" : stats.totalProfit < 0n ? "text-red-500" : "text-muted"
              )}>
                {stats.totalProfit > 0n ? "+" : ""}
                {demo.formatFoodBalance(stats.totalProfit)}
              </span>
              <span className="text-xs text-muted">FOOD</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Average ROI: {stats.avgROI.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card variant="glass">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20">
              <Icon name="treasury" className="h-5 w-5 text-brand-strong" />
            </div>
            <div>
              <p className="text-lg font-bold text-fg">{demo.formatFoodBalance(stats.totalStaked)}</p>
              <p className="text-xs text-muted">Total Staked</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
              <Icon name="success" className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-fg">{stats.winCount}</p>
              <p className="text-xs text-muted">Wins</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
              <Icon name="history" className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-fg">{stats.totalRounds}</p>
              <p className="text-xs text-muted">Total Rounds</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
              <Icon name="sparkles" className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-fg">{stats.avgROI.toFixed(1)}%</p>
              <p className="text-xs text-muted">Avg ROI</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Earnings Breakdown</CardTitle>
              <CardDescription>Round-by-round profit analysis</CardDescription>
            </div>
            <CatIllustration type="play" size="sm" />
          </div>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <CatIllustration type="sleep" size="lg" />
              <p className="text-muted">No earnings yet. Join a round to start playing!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {earnings.slice(0, 10).map((earning) => (
                <div
                  key={earning.roundId}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition hover:bg-surface-subtle"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20">
                      <span className="text-sm font-bold text-brand-strong">R{earning.roundId}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-fg">
                        Round {earning.roundId} · {earning.tribe} Tribe
                      </p>
                      <p className="text-xs text-muted">
                        Staked: {demo.formatFoodBalance(earning.stake)} FOOD
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-bold",
                      earning.profit > 0n ? "text-green-500" : earning.profit < 0n ? "text-red-500" : "text-muted"
                    )}>
                      {earning.profit > 0n ? "+" : ""}
                      {demo.formatFoodBalance(earning.profit)} FOOD
                    </p>
                    <p className="text-xs text-muted">
                      Payout: {demo.formatFoodBalance(earning.payout)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent activity on your account</CardDescription>
            </div>
            <div className="flex gap-2">
              {(['7d', '30d', 'all'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={timeFilter === filter ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeFilter(filter)}
                >
                  {filter === '7d' ? '7 Days' : filter === '30d' ? '30 Days' : 'All Time'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <CatIllustration type="thinking" size="lg" />
              <p className="text-muted">No transactions in this period</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      tx.type === 'commit' ? "bg-blue-500/20" :
                      tx.type === 'claim' ? "bg-green-500/20" :
                      "bg-orange-500/20"
                    )}>
                      <Icon 
                        name={tx.type === 'commit' ? 'shield' : tx.type === 'claim' ? 'treasury' : 'history'}
                        className={cn(
                          "h-5 w-5",
                          tx.type === 'commit' ? "text-blue-500" :
                          tx.type === 'claim' ? "text-green-500" :
                          "text-orange-500"
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-semibold capitalize text-fg">{tx.type}</p>
                      <p className="text-xs text-muted">
                        Round {tx.roundId} · {new Date(tx.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-bold",
                      tx.type === 'claim' ? "text-green-500" : "text-fg"
                    )}>
                      {tx.type === 'claim' ? "+" : "-"}
                      {demo.formatFoodBalance(tx.amount)} FOOD
                    </p>
                    <p className={cn(
                      "text-xs",
                      tx.status === 'success' ? "text-green-500" :
                      tx.status === 'pending' ? "text-yellow-500" :
                      "text-red-500"
                    )}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
