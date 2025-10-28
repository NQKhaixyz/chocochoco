import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { CatIllustration } from '../components/CatIllustration'
import { CatAvatarPicker } from '../components/CatAvatarPicker'
import { BalanceChart } from '../components/BalanceChart'
import { RoundDetailsModal } from '../components/RoundDetailsModal'
import { useSolanaAccount } from '../hooks/useSolanaAccount'
import { clearProfile, loadProfile, saveProfile, type Profile } from '../lib/profile-store'
import * as demo from '../lib/demo-rounds'

type CatType = 
  | 'stack' | 'sleep' | 'play' | 'milk' | 'cacao' | 'winner' | 'thinking' 
  | 'sitting' | 'stretch' | 'paw' | 'box' | 'yarn'
  | 'happy' | 'sad' | 'angry' | 'surprised' | 'tired' | 'excited' | 'victorious'
  | 'eating' | 'grooming' | 'hunting' | 'walking' | 'jumping' | 'running'
  | 'hat' | 'glasses' | 'scarf' | 'crown' | 'bowtie' | 'bandana'
  | 'christmas' | 'halloween' | 'birthday' | 'valentine'
  | 'legendary' | 'epic' | 'rare' | 'common'

function formatFood(lamports: bigint): string {
  // Demo formatter: treat lamports as 9 decimals
  const neg = lamports < 0n
  const v = neg ? -lamports : lamports
  const whole = v / 1_000_000_000n
  const frac = (v % 1_000_000_000n).toString().padStart(9, '0').slice(0, 3) // 3 dp
  return `${neg ? '-' : ''}${whole.toString()}.${frac} FOOD`
}

function formatShortAddress(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

function calculateWinRate(stats: ReturnType<typeof demo.getPlayerStats>): number {
  if (stats.roundsPlayed === 0) return 0
  return Math.round((stats.wins / stats.roundsPlayed) * 100)
}

function getBadges(stats: ReturnType<typeof demo.getPlayerStats>) {
  const badges: Array<{ icon: string; label: string; color: string; iconName?: 'trophy' | 'sparkles' | 'history' | 'success' | 'shield' }> = []
  
  if (stats.wins >= 10) badges.push({ icon: 'trophy', label: 'Champion', color: 'bg-yellow-500/20 text-yellow-700', iconName: 'trophy' })
  if (stats.wins >= 5) badges.push({ icon: 'sparkles', label: 'Star Player', color: 'bg-blue-500/20 text-blue-700', iconName: 'sparkles' })
  if (stats.roundsPlayed >= 20) badges.push({ icon: 'history', label: 'Veteran', color: 'bg-purple-500/20 text-purple-700', iconName: 'history' })
  if (stats.revealed === stats.roundsPlayed && stats.roundsPlayed > 0) badges.push({ icon: 'success', label: 'Reliable', color: 'bg-green-500/20 text-green-700', iconName: 'success' })
  if (calculateWinRate(stats) >= 60) badges.push({ icon: 'shield', label: 'Hot Streak', color: 'bg-orange-500/20 text-orange-700', iconName: 'shield' })
  
  return badges
}

export default function ProfilePage() {
  const { address, publicKey, isConnected } = useSolanaAccount()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(undefined)
  const [catAvatarType, setCatAvatarType] = useState<CatType | undefined>('paw')
  const [showCatPicker, setShowCatPicker] = useState(false)
  const [savedAt, setSavedAt] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<string>('')
  const [updateTrigger, setUpdateTrigger] = useState(0) // Force update trigger
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null) // For modal
  const fileRef = useRef<HTMLInputElement>(null)

  // Force update when page becomes visible or every 5 seconds
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setUpdateTrigger(prev => prev + 1)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    const interval = setInterval(() => setUpdateTrigger(prev => prev + 1), 5000)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!address) return
    const p = loadProfile(address)
    if (p) {
      setName(p.name)
      setBio(p.bio)
      setAvatarDataUrl(p.avatarDataUrl)
      setCatAvatarType((p.catAvatarType as CatType) || 'paw')
      setSavedAt(p.updatedAt)
    } else {
      setName('')
      setBio('')
      setAvatarDataUrl(undefined)
      setCatAvatarType('paw')
      setSavedAt(undefined)
    }
  }, [address])

  const stats = useMemo(() => {
    if (!publicKey) return null
    return demo.getPlayerStats(publicKey)
  }, [publicKey, updateTrigger]) // Add updateTrigger

  const recentGames = useMemo(() => {
    if (!publicKey) return []
    const playerRounds = demo.listPlayerRounds(publicKey)
    return playerRounds
      .sort((a, b) => b.committedAt - a.committedAt)
      .slice(0, 5)
      .map(pr => {
        const round = demo.getRound(pr.roundId)
        return { ...pr, round }
      })
  }, [publicKey, updateTrigger]) // Add updateTrigger

  const badges = useMemo(() => {
    if (!stats) return []
    return getBadges(stats)
  }, [stats])

  const winRate = useMemo(() => {
    if (!stats) return 0
    return calculateWinRate(stats)
  }, [stats])

  const balanceHistory = useMemo(() => {
    if (!publicKey) return []
    return demo.getBalanceHistory(publicKey)
  }, [publicKey, updateTrigger]) // Add updateTrigger to refresh data

  // Calculate total net earnings from balance history
  const totalEarnings = useMemo(() => {
    if (balanceHistory.length === 0) return 0n
    return balanceHistory[balanceHistory.length - 1]?.earnings || 0n
  }, [balanceHistory])

  // Calculate current balance: initial (100) + earnings
  const currentBalance = useMemo(() => {
    // Always calculate from earnings to ensure consistency
    return 100_000_000_000n + totalEarnings
  }, [totalEarnings])

  function onPickAvatar() {
    fileRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setAvatarDataUrl(url)
    }
    reader.readAsDataURL(file)
  }

  function onRemoveAvatar() {
    setAvatarDataUrl(undefined)
    setCatAvatarType(undefined)
    if (fileRef.current) fileRef.current.value = ''
  }

  function onSave() {
    if (!address) return
    const profile: Profile = {
      address,
      name,
      bio,
      avatarDataUrl,
      catAvatarType,
      updatedAt: Date.now(),
    }
    saveProfile(profile)
    setSavedAt(profile.updatedAt)
    setStatus('Đã lưu hồ sơ')
    setTimeout(() => setStatus(''), 1500)
  }

  function onClear() {
    if (!address) return
    clearProfile(address)
    setName('')
    setBio('')
    setAvatarDataUrl(undefined)
    setCatAvatarType('paw')
    setSavedAt(undefined)
    setStatus('Đã xóa hồ sơ cục bộ')
    setTimeout(() => setStatus(''), 1500)
  }

  if (!isConnected) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CatIllustration type="sitting" size="sm" />
              Hồ sơ
            </CardTitle>
            <CardDescription>Kết nối ví để tạo và xem hồ sơ của bạn.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Profile Header with Social Stats */}
      <div className="rounded-3xl bg-gradient-brand p-0.5 shadow-float">
        <div className="rounded-3xl bg-surface px-8 py-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-brand bg-surface-subtle relative">
                {avatarDataUrl ? (
                  <img src={avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : catAvatarType ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <CatIllustration type={catAvatarType} size="md" />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <CatIllustration type="paw" size="md" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-fg">{name || 'Anonymous Player'}</h1>
                <p className="text-sm text-muted">{formatShortAddress(address!)}</p>
                {bio && <p className="mt-1 text-sm text-muted-strong">{bio}</p>}
              </div>
            </div>
            
            {/* Social Stats */}
            <div className="flex gap-6">
              <div className="text-center group cursor-default">
                <div className="text-2xl font-bold text-brand-strong transition-all duration-300 group-hover:scale-110 group-hover:text-brand">
                  {demo.formatFoodBalance(currentBalance)}
                </div>
                <div className="text-xs text-muted">Balance</div>
              </div>
              <div className="text-center group cursor-default">
                <div className="text-2xl font-bold text-brand-strong transition-all duration-300 group-hover:scale-110 group-hover:text-brand">
                  {stats?.roundsPlayed || 0}
                </div>
                <div className="text-xs text-muted">Games</div>
              </div>
              <div className="text-center group cursor-default">
                <div className="text-2xl font-bold text-brand-strong transition-all duration-300 group-hover:scale-110 group-hover:text-brand">
                  {stats?.wins || 0}
                </div>
                <div className="text-xs text-muted">Wins</div>
              </div>
              <div className="text-center group cursor-default">
                <div className="text-2xl font-bold text-brand-strong transition-all duration-300 group-hover:scale-110 group-hover:text-brand">
                  {winRate}%
                </div>
                <div className="text-xs text-muted">Win Rate</div>
              </div>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {badges.map((badge, i) => (
                <span
                  key={i}
                  className={`flex items-center gap-1.5 rounded-full ${badge.color} px-3 py-1 text-xs font-semibold`}
                >
                  {badge.iconName && <Icon name={badge.iconName} className="h-3.5 w-3.5" />}
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        {/* Left Column - Activity Feed */}
        <div className="space-y-6">
          {/* Balance History Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="treasury" className="h-5 w-5" />
                    Earnings History
                  </CardTitle>
                  <CardDescription>Your cumulative FOOD token earnings over time</CardDescription>
                </div>
                {balanceHistory.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const svg = document.querySelector('#earnings-chart-svg') as SVGSVGElement
                      if (svg) {
                        const { exportChartAsPNG } = await import('../lib/chart-export')
                        try {
                          await exportChartAsPNG(svg, `chocochoco-earnings-${address}.png`)
                          setStatus('Chart exported!')
                          setTimeout(() => setStatus(''), 2000)
                        } catch (error) {
                          console.error('Export failed:', error)
                          setStatus('Export failed')
                          setTimeout(() => setStatus(''), 2000)
                        }
                      }
                    }}
                  >
                    📥 Export
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <BalanceChart 
                data={balanceHistory} 
                onDataPointClick={(roundId) => setSelectedRoundId(roundId)}
              />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CatIllustration type="yarn" size="sm" className="animate-float" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest game history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentGames.length === 0 ? (
                <div className="text-center py-8">
                  <CatIllustration type="sleep" size="lg" className="mx-auto mb-3" />
                  <p className="text-sm text-muted">No games played yet. Join a round to get started!</p>
                </div>
              ) : (
                recentGames.map((game) => (
                  <div
                    key={`${game.roundId}-${game.player}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition hover:border-brand/50"
                  >
                    <div className="flex items-center gap-3">
                      <Icon 
                        name={game.tribe === 'Milk' ? 'milk' : 'cacao'} 
                        className="h-5 w-5 text-brand-strong" 
                      />
                      <div>
                        <div className="text-sm font-semibold text-fg">
                          Round #{game.roundId} · {game.tribe}
                        </div>
                        <div className="text-xs text-muted">
                          {game.revealed ? (
                            game.round?.winnerSide === game.tribe ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <Icon name="success" className="h-3 w-3" /> Won!
                              </span>
                            ) : game.round?.winnerSide === null ? (
                              <span className="text-yellow-600 flex items-center gap-1">
                                <Icon name="neutral" className="h-3 w-3" /> Tied
                              </span>
                            ) : (
                              <span className="text-red-600 flex items-center gap-1">
                                <Icon name="alert" className="h-3 w-3" /> Lost
                              </span>
                            )
                          ) : (
                            <span className="text-orange-600 flex items-center gap-1">
                              <Icon name="timer" className="h-3 w-3" /> Waiting reveal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted">
                        {new Date(game.committedAt).toLocaleDateString()}
                      </div>
                      {game.claimed && (
                        <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                          <Icon name="treasury" className="h-3 w-3" /> Claimed
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Edit Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="settings" className="h-5 w-5" />
                Edit Profile
              </CardTitle>
              <CardDescription>Customize your profile (stored locally)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Avatar Options */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong mb-3 block">Avatar</span>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full border border-border bg-surface-subtle">
                    {avatarDataUrl ? (
                      <img src={avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : catAvatarType ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <CatIllustration type={catAvatarType} size="md" />
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        <Icon name="user" className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" leftIcon="sparkles" onClick={() => setShowCatPicker(true)}>
                      Choose Cat
                    </Button>
                    <Button size="sm" variant="secondary" leftIcon="sparkles" onClick={onPickAvatar}>
                      Upload Image
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onRemoveAvatar} disabled={!avatarDataUrl && !catAvatarType}>
                      Clear
                    </Button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFileChange}
                    />
                  </div>
                </div>
                {catAvatarType && !avatarDataUrl && (
                  <p className="mt-2 text-xs text-muted">Using cat avatar: <span className="font-semibold text-brand">{catAvatarType}</span></p>
                )}
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Display Name</span>
                <Input placeholder="Enter your name…" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Bio</span>
                <Textarea placeholder="Tell us about yourself…" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
              </div>
              <div className="flex gap-3">
                <Button size="lg" rightIcon="sparkles" onClick={onSave}>
                  Save Profile
                </Button>
                <Button size="lg" variant="outline" onClick={onClear}>
                  Clear
                </Button>
                {status ? <span className="self-center text-xs text-brand-strong">{status}</span> : null}
              </div>
              {savedAt ? (
                <p className="text-xs text-muted">Last updated: {new Date(savedAt).toLocaleString()}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Wallet */}
        <div className="space-y-6">
          {/* Wallet Balance */}
          <Card variant="solid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="wallet" className="h-5 w-5" />
                My Wallet
              </CardTitle>
              <CardDescription>Your current FOOD token balance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 p-6 text-center group cursor-default">
                <div className="text-3xl font-bold text-brand-strong transition-all duration-500 group-hover:scale-110">
                  {demo.formatFoodBalance(currentBalance)}
                </div>
                <div className="mt-1 text-xs text-muted">Total Balance</div>
              </div>
              <div className="rounded-xl bg-surface-subtle border border-border p-4 space-y-2">
                <div className="flex items-center justify-between text-sm group hover:bg-surface transition-colors px-2 py-1 rounded">
                  <span className="text-muted">Initial Balance</span>
                  <span className="font-semibold text-muted-strong transition-transform group-hover:scale-105">100.000 FOOD</span>
                </div>
                <div className="flex items-center justify-between text-sm group hover:bg-surface transition-colors px-2 py-1 rounded">
                  <span className="text-muted">Net Earnings</span>
                  <span className={`font-semibold transition-all duration-300 group-hover:scale-105 ${totalEarnings >= 0n ? 'text-green-600' : 'text-red-600'}`}>
                    {totalEarnings >= 0n ? '+' : ''}{demo.formatFoodBalance(totalEarnings)}
                  </span>
                </div>
              </div>
              
              {/* Formula explanation */}
              <div className="rounded-xl bg-brand/5 border border-brand/20 p-3">
                <div className="flex items-start gap-2">
                  <Icon name="info" className="h-4 w-4 text-brand-strong mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted-strong">
                    <p className="font-semibold mb-1">Balance Formula:</p>
                    <p className="font-mono text-xs">
                      Current = Initial (100) {totalEarnings >= 0n ? '+' : ''} Earnings ({demo.formatFoodBalance(totalEarnings)})
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="trophy" className="h-5 w-5" />
                Statistics
              </CardTitle>
              <CardDescription>Performance breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
                <span className="text-muted">Rounds Played</span>
                <span className="font-semibold text-fg">{stats?.roundsPlayed || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
                <span className="text-muted">Revealed</span>
                <span className="font-semibold text-fg">{stats?.revealed || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
                <span className="text-muted">Wins</span>
                <span className="font-semibold text-green-600">{stats?.wins || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
                <span className="text-muted">Claimed</span>
                <span className="font-semibold text-fg">{stats?.claimed || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
                <span className="text-muted">Win Rate</span>
                <span className={`font-semibold ${winRate >= 50 ? 'text-green-600' : 'text-muted'}`}>
                  {winRate}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Social Actions (Mock) */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="sparkles" className="h-5 w-5" />
                Social
              </CardTitle>
              <CardDescription>Connect with other players</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" leftIcon="trophy">
                View Leaderboard
              </Button>
              <Button variant="outline" className="w-full" leftIcon="history">
                Browse All Rounds
              </Button>
              <div className="pt-2 text-center text-xs text-muted">
                More social features coming soon!
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Round Details Modal */}
      {selectedRoundId !== null && (
        <RoundDetailsModal
          roundId={selectedRoundId}
          playerAddress={address}
          onClose={() => setSelectedRoundId(null)}
        />
      )}

      {/* Cat Avatar Picker Modal */}
      {showCatPicker && (
        <CatAvatarPicker
          selectedCat={catAvatarType}
          onSelect={(catType) => {
            setCatAvatarType(catType)
            setAvatarDataUrl(undefined) // Clear uploaded image when selecting cat
            setShowCatPicker(false)
          }}
          onClose={() => setShowCatPicker(false)}
        />
      )}
    </div>
  )
}

