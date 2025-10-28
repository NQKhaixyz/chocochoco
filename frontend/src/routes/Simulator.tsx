import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { CatIllustration } from '../components/CatIllustration'
import * as simulator from '../lib/game-simulator'
import * as demo from '../lib/demo-rounds'

export default function SimulatorPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [isInfiniteRunning, setIsInfiniteRunning] = useState(false)
  const [stats, setStats] = useState(simulator.getSimulatorStats())
  const [log, setLog] = useState<string[]>([])
  const [numRounds, setNumRounds] = useState(3)

  useEffect(() => {
    // Initialize simulator on mount
    simulator.initializeSimulator()
    updateStats()
  }, [])

  const updateStats = () => {
    setStats(simulator.getSimulatorStats())
  }

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-20))
  }

  const handleInitialize = () => {
    simulator.initializeSimulator()
    updateStats()
    addLog('✅ Simulator initialized with 100 users')
  }

  const handleSimulateRound = async () => {
    setIsRunning(true)
    const currentRound = demo.getCurrentRoundId()
    addLog(`🎮 Starting simulation for Round ${currentRound}...`)
    
    try {
      await simulator.simulateFullRound(currentRound)
      updateStats()
      addLog(`✅ Round ${currentRound} simulation complete`)
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleAddAIPlayers = async () => {
    setIsRunning(true)
    const currentRound = demo.getCurrentRoundId()
    addLog(`🤖 Adding AI players to Round ${currentRound}...`)
    
    try {
      const count = await simulator.addAIPlayersToCurrentRound()
      updateStats()
      addLog(`✅ Added ${count} AI players to current round (you can now reveal together!)`)
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleContinuousSimulation = async () => {
    setIsRunning(true)
    addLog(`🚀 Starting continuous simulation for ${numRounds} rounds...`)
    
    try {
      await simulator.startContinuousSimulation(numRounds)
      updateStats()
      addLog(`✅ Continuous simulation complete!`)
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleStartInfinite = async () => {
    setIsInfiniteRunning(true)
    setIsRunning(true)
    addLog(`♾️ Starting infinite simulation (will run until stopped)...`)
    
    // Update stats periodically
    const interval = setInterval(() => {
      if (simulator.isInfiniteSimulationActive()) {
        updateStats()
      } else {
        clearInterval(interval)
        setIsInfiniteRunning(false)
        setIsRunning(false)
      }
    }, 2000)
    
    try {
      // Start infinite simulation (will run until stopped)
      await simulator.startInfiniteSimulation()
      clearInterval(interval)
      setIsInfiniteRunning(false)
      setIsRunning(false)
      addLog(`✅ Infinite simulation stopped`)
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`)
      clearInterval(interval)
      setIsInfiniteRunning(false)
      setIsRunning(false)
    }
  }

  const handleStopInfinite = () => {
    simulator.stopInfiniteSimulation()
    addLog(`⏹️ Stopping infinite simulation...`)
    setIsInfiniteRunning(false)
    setIsRunning(false)
    updateStats()
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the simulator? This will clear all simulated users.')) {
      simulator.resetSimulator()
      demo.clearAllDemoData()
      updateStats()
      setLog([])
      addLog('✅ Simulator and game data reset')
    }
  }

  const handleAdvanceRound = () => {
    demo.advanceToNextRound()
    addLog(`⏭️ Advanced to round ${demo.getCurrentRoundId()}`)
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <header className="relative rounded-2xl bg-gradient-brand px-8 py-10 shadow-float animate-fade-up overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-20">
          <CatIllustration type="play" size="xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="font-display text-4xl font-semibold text-on-brand flex items-center gap-3">
                <CatIllustration type="excited" size="lg" className="animate-bounce-slow" />
                Game Simulator
              </h1>
              <p className="mt-2 max-w-3xl text-base text-on-brand/80">
                Simulate 100 AI players with different strategies playing the game automatically across multiple rounds! 🤖
              </p>
            </div>
            {stats.totalUsers > 0 && (
              <a
                href="/leaderboard"
                className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 flex items-center gap-2"
              >
                <Icon name="trophy" className="h-4 w-4" />
                View Leaderboard
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Users</CardTitle>
              <Icon name="user" className="h-4 w-4 text-brand-strong" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-fg">{stats.totalUsers}</div>
            <p className="text-xs text-muted mt-1">Simulated players</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Initial Tokens</CardTitle>
              <Icon name="sparkles" className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fg">
              {demo.formatFoodBalance(BigInt(10000 * stats.totalUsers))}
            </div>
            <p className="text-xs text-muted mt-1">10K per user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Balance</CardTitle>
              <Icon name="wallet" className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fg">
              {demo.formatFoodBalance(stats.totalBalance)}
            </div>
            <p className="text-xs text-muted mt-1">Current total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Avg Balance</CardTitle>
              <Icon name="treasury" className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fg">
              {demo.formatFoodBalance(stats.averageBalance)}
            </div>
            <p className="text-xs text-muted mt-1">per user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Current Round</CardTitle>
              <Icon name="history" className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-fg">{demo.getCurrentRoundId()}</div>
            <p className="text-xs text-muted mt-1">Active round</p>
          </CardContent>
        </Card>
      </div>

      {/* Profit/Loss Summary */}
      {stats.totalUsers > 0 && (
        <Card className="border-2 border-brand/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Total Profit/Loss</CardTitle>
                <CardDescription>Overall performance of all simulated users</CardDescription>
              </div>
              <Icon name="sparkles" className="h-6 w-6 text-brand-strong" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-surface-subtle p-4">
                <p className="text-xs text-muted mb-1">Initial Balance</p>
                <p className="text-xl font-bold text-fg">
                  {demo.formatFoodBalance(BigInt(10000 * stats.totalUsers))}
                </p>
                <p className="text-xs text-muted mt-1">10,000 × {stats.totalUsers} users</p>
              </div>
              
              <div className="rounded-xl bg-surface-subtle p-4">
                <p className="text-xs text-muted mb-1">Current Balance</p>
                <p className="text-xl font-bold text-fg">
                  {demo.formatFoodBalance(stats.totalBalance)}
                </p>
                <p className="text-xs text-muted mt-1">Total across all users</p>
              </div>
              
              <div className={`rounded-xl p-4 ${
                stats.totalBalance >= BigInt(10000 * stats.totalUsers)
                  ? 'bg-green-500/10 border-2 border-green-500/30'
                  : 'bg-red-500/10 border-2 border-red-500/30'
              }`}>
                <p className="text-xs text-muted mb-1">Net Profit/Loss</p>
                <p className={`text-xl font-bold ${
                  stats.totalBalance >= BigInt(10000 * stats.totalUsers)
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {stats.totalBalance >= BigInt(10000 * stats.totalUsers) ? '+' : ''}
                  {demo.formatFoodBalance(stats.totalBalance - BigInt(10000 * stats.totalUsers))}
                </p>
                <p className={`text-xs mt-1 ${
                  stats.totalBalance >= BigInt(10000 * stats.totalUsers)
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {stats.totalBalance >= BigInt(10000 * stats.totalUsers) ? '📈 Profit' : '📉 Loss'}
                  {' '}
                  ({((Number(stats.totalBalance - BigInt(10000 * stats.totalUsers)) / (10000 * stats.totalUsers)) * 100).toFixed(2)}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategy Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Player Strategies</CardTitle>
          <CardDescription>Distribution of AI player strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            {Object.entries(stats.strategies).map(([strategy, count]) => (
              <div
                key={strategy}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle p-4"
              >
                <div>
                  <p className="font-semibold text-fg capitalize">{strategy.replace('-', ' ')}</p>
                  <p className="text-xs text-muted">{count} players</p>
                </div>
                <div className="text-2xl font-bold text-brand-strong">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Initialize and manage the simulator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleInitialize}
              disabled={isRunning}
              variant="secondary"
              leftIcon="sparkles"
              className="w-full"
            >
              Initialize 100 Users
            </Button>

            <Button
              onClick={handleAddAIPlayers}
              disabled={isRunning || stats.totalUsers === 0}
              variant="primary"
              leftIcon="user"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isRunning ? 'Adding AI...' : '🤖 Add AI to Current Round'}
            </Button>

            <Button
              onClick={handleSimulateRound}
              disabled={isRunning || stats.totalUsers === 0}
              variant="primary"
              leftIcon="treasury"
              className="w-full"
            >
              {isRunning ? 'Simulating...' : 'Simulate Full Round (AI only)'}
            </Button>

            <div className="border-t border-border pt-3 mt-3">
              <p className="text-xs text-muted mb-2 text-center">Infinite Mode - AI plays until stopped</p>
              {!isInfiniteRunning ? (
                <Button
                  onClick={handleStartInfinite}
                  disabled={isRunning || stats.totalUsers === 0}
                  variant="primary"
                  leftIcon="history"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  ♾️ Start Infinite Simulation
                </Button>
              ) : (
                <Button
                  onClick={handleStopInfinite}
                  variant="secondary"
                  leftIcon="close"
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                >
                  ⏹️ Stop Simulation
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAdvanceRound}
                disabled={isRunning}
                variant="ghost"
                leftIcon="sparkles"
                className="flex-1"
              >
                Advance Round
              </Button>
              <Button
                onClick={handleReset}
                disabled={isRunning}
                variant="ghost"
                className="flex-1 text-red-500 hover:text-red-600"
                leftIcon="close"
              >
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Real-time simulation activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 rounded-xl border border-border bg-surface p-4 font-mono text-xs h-[280px] overflow-y-auto">
              {log.length === 0 ? (
                <p className="text-muted">No activity yet. Start a simulation!</p>
              ) : (
                log.map((entry, idx) => (
                  <div key={idx} className="text-muted-strong">
                    {entry}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Guide</CardTitle>
          <CardDescription>How each AI strategy works</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <h3 className="font-semibold text-fg">Random</h3>
              </div>
              <p className="text-sm text-muted">
                50/50 chance of choosing Milk or Cacao. No strategy, pure chaos! 🎲
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <h3 className="font-semibold text-fg">Minority Seeker</h3>
              </div>
              <p className="text-sm text-muted">
                Always tries to join the smaller tribe. Smart players! 🧠
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500" />
                <h3 className="font-semibold text-fg">Majority Follower</h3>
              </div>
              <p className="text-sm text-muted">
                Joins the larger tribe. Safety in numbers! 👥
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <h3 className="font-semibold text-fg">Contrarian</h3>
              </div>
              <p className="text-sm text-muted">
                Does the opposite of what seems logical. Rebels! 😎
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CatIllustration type="thinking" size="lg" />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-fg text-lg">💡 Pro Tips</h3>
              <ul className="space-y-1 text-sm text-muted-strong">
                <li>• Each user has 50-100% play rate (some skip rounds randomly)</li>
                <li>• Users stake random amounts between 5-20 FOOD per round</li>
                <li>• Winners automatically claim rewards after each round</li>
                <li>• Run multiple rounds to see which strategy performs best!</li>
                <li>• Check the Leaderboard to see top performing simulated users</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
