import React, { useEffect, useState } from 'react';
import { LeaderboardTable, Column } from '../components/LeaderboardTable';
import { CatIllustration } from '../components/CatIllustration';
import { Icon } from '../components/ui/Icon';
import {
  fetchTopPayout,
  fetchWeeklyWinRate,
  getWeeklyTimestamp,
  lamportsToSol,
  formatWinRate,
  truncateAddress,
  TopPayoutEntry,
  WeeklyWinRateEntry,
} from '../lib/indexer';
import { getMixedLeaderboard, loadSimulatedUsers } from '../lib/game-simulator';
import * as demo from '../lib/demo-rounds';
import { simulatorEvents } from '../lib/simulator-events';

const PAGE_SIZE = 50;

type DataFilter = 'all' | 'real' | 'simulated';

type CatType = 
  | 'stack' | 'sleep' | 'play' | 'milk' | 'cacao' | 'winner' | 'thinking' 
  | 'sitting' | 'stretch' | 'paw' | 'box' | 'yarn'
  | 'happy' | 'sad' | 'angry' | 'surprised' | 'tired' | 'excited' | 'victorious'
  | 'eating' | 'grooming' | 'hunting' | 'walking' | 'jumping' | 'running'
  | 'hat' | 'glasses' | 'scarf' | 'crown' | 'bowtie' | 'bandana'
  | 'christmas' | 'halloween' | 'birthday' | 'valentine'
  | 'legendary' | 'epic' | 'rare' | 'common'

// Deterministic cat avatar based on player address
function getPlayerCatAvatar(playerAddress: string): CatType {
  const hash = playerAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const cats: CatType[] = ['winner', 'crown', 'legendary', 'epic', 'victorious', 'excited', 'happy', 'play', 'sitting', 'paw', 'hat', 'glasses', 'bowtie'];
  return cats[hash % cats.length] || 'winner';
}

// Get rank badge color and icon
function getRankBadge(rank: number): { color: string; icon: string; glow: string } {
  if (rank === 1) return { color: 'bg-gradient-to-br from-yellow-400 to-yellow-600', icon: '👑', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]' };
  if (rank === 2) return { color: 'bg-gradient-to-br from-gray-300 to-gray-500', icon: '🥈', glow: 'shadow-[0_0_15px_rgba(156,163,175,0.5)]' };
  if (rank === 3) return { color: 'bg-gradient-to-br from-amber-600 to-amber-800', icon: '🥉', glow: 'shadow-[0_0_15px_rgba(217,119,6,0.5)]' };
  return { color: 'bg-gray-200 dark:bg-gray-700', icon: '', glow: '' };
}

// Get player display name (check if simulated user)
function getPlayerDisplayName(playerAddress: string): { name: string; isSimulated: boolean } {
  const users = loadSimulatedUsers();
  const simUser = users.find(u => u.address === playerAddress);
  
  if (simUser) {
    return { name: simUser.name, isSimulated: true };
  }
  
  return { name: truncateAddress(playerAddress, 6), isSimulated: false };
}

export default function LeaderboardPage() {
  // Data filter state
  const [dataFilter, setDataFilter] = useState<DataFilter>('all');
  const [hasSimulatedUsers, setHasSimulatedUsers] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Top Payout State
  const [payoutData, setPayoutData] = useState<TopPayoutEntry[]>([]);
  const [payoutLoading, setPayoutLoading] = useState(true);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutHasMore, setPayoutHasMore] = useState(false);

  // Weekly Win Rate State
  const [winRateData, setWinRateData] = useState<WeeklyWinRateEntry[]>([]);
  const [winRateLoading, setWinRateLoading] = useState(true);
  const [winRateError, setWinRateError] = useState<string | null>(null);
  const [winRatePage, setWinRatePage] = useState(1);
  const [winRateHasMore, setWinRateHasMore] = useState(false);
  const [weeklyFrom, setWeeklyFrom] = useState<number | undefined>();

  // Load weekly timestamp on mount
  useEffect(() => {
    getWeeklyTimestamp().then(setWeeklyFrom);
    
    // Check if simulator has users
    const users = loadSimulatedUsers();
    setHasSimulatedUsers(users.length > 0);
    
    // Subscribe to simulator events for auto-refresh
    const unsubscribeRoundComplete = simulatorEvents.subscribe('round-complete', () => {
      console.log('🔄 Leaderboard: Received round complete event, refreshing...');
      setRefreshTrigger(prev => prev + 1);
    });
    
    const unsubscribeSimStart = simulatorEvents.subscribe('simulation-start', () => {
      console.log('▶️ Leaderboard: Simulation started, enabling auto-refresh');
      setAutoRefresh(true);
    });
    
    const unsubscribeSimEnd = simulatorEvents.subscribe('simulation-end', () => {
      console.log('⏹️ Leaderboard: Simulation ended, final refresh');
      setRefreshTrigger(prev => prev + 1);
      setAutoRefresh(false);
    });
    
    // Cleanup subscriptions
    return () => {
      unsubscribeRoundComplete();
      unsubscribeSimStart();
      unsubscribeSimEnd();
    };
  }, []);

  // Fetch Top Payout
  useEffect(() => {
    let mounted = true;

    const loadTopPayout = async () => {
      setPayoutLoading(true);
      setPayoutError(null);

      try {
        const offset = (payoutPage - 1) * PAGE_SIZE;
        let data: TopPayoutEntry[];
        
        if (dataFilter === 'all' && hasSimulatedUsers) {
          // Fetch real data and merge with simulated
          const realData = await fetchTopPayout({ limit: PAGE_SIZE + 1, offset: 0 });
          const mixed = getMixedLeaderboard(realData, []);
          data = mixed.topPayout;
        } else if (dataFilter === 'simulated' && hasSimulatedUsers) {
          // Show only simulated data
          const mixed = getMixedLeaderboard([], []);
          data = mixed.topPayout;
        } else {
          // Show only real data
          data = await fetchTopPayout({ limit: PAGE_SIZE + 1, offset });
        }

        if (!mounted) return;

        setPayoutHasMore(data.length > PAGE_SIZE);
        setPayoutData(data.slice(0, PAGE_SIZE));
      } catch (error) {
        if (!mounted) return;
        setPayoutError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        if (mounted) {
          setPayoutLoading(false);
        }
      }
    };

    loadTopPayout();

    return () => {
      mounted = false;
    };
  }, [payoutPage, dataFilter, hasSimulatedUsers, refreshTrigger]);

  // Fetch Weekly Win Rate
  useEffect(() => {
    if (weeklyFrom === undefined) return;

    let mounted = true;

    const loadWinRate = async () => {
      setWinRateLoading(true);
      setWinRateError(null);

      try {
        const offset = (winRatePage - 1) * PAGE_SIZE;
        let data: WeeklyWinRateEntry[];
        
        if (dataFilter === 'all' && hasSimulatedUsers) {
          // Fetch real data and merge with simulated
          const realData = await fetchWeeklyWinRate({
            from: weeklyFrom,
            limit: PAGE_SIZE + 1,
            offset: 0,
          });
          const mixed = getMixedLeaderboard([], realData);
          data = mixed.topWinRate;
        } else if (dataFilter === 'simulated' && hasSimulatedUsers) {
          // Show only simulated data
          const mixed = getMixedLeaderboard([], []);
          data = mixed.topWinRate;
        } else {
          // Show only real data
          data = await fetchWeeklyWinRate({
            from: weeklyFrom,
            limit: PAGE_SIZE + 1,
            offset,
          });
        }

        if (!mounted) return;

        setWinRateHasMore(data.length > PAGE_SIZE);
        setWinRateData(data.slice(0, PAGE_SIZE));
      } catch (error) {
        if (!mounted) return;
        setWinRateError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        if (mounted) {
          setWinRateLoading(false);
        }
      }
    };

    loadWinRate();

    return () => {
      mounted = false;
    };
  }, [winRatePage, weeklyFrom, dataFilter, hasSimulatedUsers, refreshTrigger]);

  // Top Payout Columns
  const payoutColumns: Column<TopPayoutEntry>[] = [
    {
      key: 'rank',
      header: '#',
      render: (_, index) => {
        const rank = (payoutPage - 1) * PAGE_SIZE + index + 1;
        const badge = getRankBadge(rank);
        
        return (
          <div className="flex items-center justify-center">
            {rank <= 3 ? (
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${badge.color} ${badge.glow} text-lg font-bold text-white transition-transform hover:scale-110`}>
                {badge.icon}
              </div>
            ) : (
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {rank}
              </span>
            )}
          </div>
        );
      },
      className: 'w-20',
    },
    {
      key: 'player',
      header: 'Player',
      render: (item) => {
        const catAvatar = getPlayerCatAvatar(item.player);
        const displayInfo = getPlayerDisplayName(item.player);
        
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-brand/30 bg-surface-subtle transition-transform hover:scale-110">
              <CatIllustration type={catAvatar} size="md" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${displayInfo.isSimulated ? 'text-brand-strong' : 'text-fg font-mono'}`} title={item.player}>
                  {displayInfo.name}
                </span>
                {displayInfo.isSimulated && (
                  <span className="rounded bg-brand/20 px-1.5 py-0.5 text-xs font-semibold text-brand-strong">
                    AI
                  </span>
                )}
              </div>
              <span className="text-xs text-muted">
                {item.totalClaims} {item.totalClaims === 1 ? 'claim' : 'claims'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'total',
      header: 'Total Winnings',
      render: (item) => {
        // Check if this is a simulated user (mixed data will have totalPayout)
        const itemAny = item as any;
        const isSimulated = typeof itemAny.totalPayout !== 'undefined';
        const amount = isSimulated 
          ? demo.formatFoodBalance(itemAny.totalPayout)
          : `${lamportsToSol(item.totalLamports, 2)}`;
        const currency = isSimulated ? 'FOOD' : 'SOL';
        
        return (
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-brand-strong">
              {amount} {currency}
            </span>
            {item.lastClaim && (
              <span className="text-xs text-muted">
                Last: {new Date(item.lastClaim).toLocaleDateString()}
              </span>
            )}
          </div>
        );
      },
      className: 'text-right',
    },
  ];

  // Weekly Win Rate Columns
  const winRateColumns: Column<WeeklyWinRateEntry>[] = [
    {
      key: 'rank',
      header: '#',
      render: (_, index) => {
        const rank = (winRatePage - 1) * PAGE_SIZE + index + 1;
        const badge = getRankBadge(rank);
        
        return (
          <div className="flex items-center justify-center">
            {rank <= 3 ? (
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${badge.color} ${badge.glow} text-lg font-bold text-white transition-transform hover:scale-110`}>
                {badge.icon}
              </div>
            ) : (
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {rank}
              </span>
            )}
          </div>
        );
      },
      className: 'w-20',
    },
    {
      key: 'player',
      header: 'Player',
      render: (item) => {
        const catAvatar = getPlayerCatAvatar(item.player);
        const displayInfo = getPlayerDisplayName(item.player);
        
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-brand/30 bg-surface-subtle transition-transform hover:scale-110">
              <CatIllustration type={catAvatar} size="md" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${displayInfo.isSimulated ? 'text-brand-strong' : 'text-fg font-mono'}`} title={item.player}>
                {displayInfo.name}
              </span>
              {displayInfo.isSimulated && (
                <span className="rounded bg-brand/20 px-1.5 py-0.5 text-xs font-semibold text-brand-strong">
                  AI
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'performance',
      header: 'Performance',
      render: (item) => {
        // Check if item has losses property (from simulated data)
        const itemAny = item as any;
        const losses = itemAny.losses !== undefined ? itemAny.losses : (item.total - item.wins);
        
        return (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="success" className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-green-600 dark:text-green-400">
                {item.wins}W
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="alert" className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="font-semibold text-red-600 dark:text-red-400">
                {losses}L
              </span>
            </div>
          </div>
        );
      },
      className: 'text-center',
    },
    {
      key: 'rate',
      header: 'Win Rate',
      render: (item) => {
        const rate = item.rate;
        const color = rate >= 60 ? 'text-green-600 dark:text-green-400' : 
                      rate >= 40 ? 'text-blue-600 dark:text-blue-400' : 
                      'text-orange-600 dark:text-orange-400';
        
        return (
          <div className="flex flex-col items-end">
            <span className={`text-xl font-bold ${color}`}>
              {formatWinRate(rate)}
            </span>
            <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-surface-subtle">
              <div 
                className={`h-full transition-all duration-500 ${
                  rate >= 60 ? 'bg-green-500' : 
                  rate >= 40 ? 'bg-blue-500' : 
                  'bg-orange-500'
                }`}
                style={{ width: `${Math.min(rate, 100)}%` }}
              />
            </div>
          </div>
        );
      },
      className: 'text-right',
    },
  ];

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header with enhanced visuals */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-0.5 shadow-float">
        <div className="rounded-3xl bg-surface px-8 py-10">
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-fg mb-3 flex items-center gap-3">
                  <CatIllustration type="winner" size="lg" className="animate-bounce-slow" />
                  Leaderboard
                  <span className="rounded-full bg-brand/20 px-3 py-1 text-sm font-semibold text-brand-strong">
                    Live
                  </span>
                  {autoRefresh && (
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-semibold text-green-600 flex items-center gap-1 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      Auto-refresh
                    </span>
                  )}
                </h1>
                <p className="text-lg text-muted max-w-2xl">
                  Top players and weekly win rates from the Solana blockchain
                </p>
              </div>
              <div className="hidden lg:block">
                <CatIllustration type="crown" size="xl" className="opacity-20 animate-float" />
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-surface-subtle p-4 transition hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/20">
                    <Icon name="trophy" className="h-6 w-6 text-brand-strong" />
                  </div>
                  <div>
                    <p className="text-sm text-muted">Total Players</p>
                    <p className="text-2xl font-bold text-fg">{payoutData.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl border border-border bg-surface-subtle p-4 transition hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                    <Icon name="sparkles" className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted">Active This Week</p>
                    <p className="text-2xl font-bold text-fg">{winRateData.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl border border-border bg-surface-subtle p-4 transition hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                    <Icon name="history" className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted">Last Updated</p>
                    <p className="text-sm font-semibold text-fg">Just now</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Filter (only show if simulator has users) */}
            {hasSimulatedUsers && (
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm font-medium text-muted">Show:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDataFilter('all')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      dataFilter === 'all'
                        ? 'bg-brand text-white shadow-md'
                        : 'bg-surface-subtle text-muted hover:bg-surface-subtle/80 hover:text-fg'
                    }`}
                  >
                    All Players
                  </button>
                  <button
                    onClick={() => setDataFilter('real')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      dataFilter === 'real'
                        ? 'bg-brand text-white shadow-md'
                        : 'bg-surface-subtle text-muted hover:bg-surface-subtle/80 hover:text-fg'
                    }`}
                  >
                    Real Only
                  </button>
                  <button
                    onClick={() => setDataFilter('simulated')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      dataFilter === 'simulated'
                        ? 'bg-brand text-white shadow-md'
                        : 'bg-surface-subtle text-muted hover:bg-surface-subtle/80 hover:text-fg'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon name="sparkles" className="h-4 w-4" />
                      Simulated
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Payout Table */}
      <div className="rounded-3xl border border-border/60 bg-surface-subtle/80 backdrop-blur-xl p-6 shadow-float">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-fg flex items-center gap-2">
              🏅 Top Earners
              <span className="text-sm font-normal text-muted">(All-time)</span>
            </h2>
            <p className="mt-1 text-sm text-muted">Players with highest total winnings</p>
          </div>
          <CatIllustration type="legendary" size="md" className="animate-pulse" />
        </div>
        
        <LeaderboardTable
          title=""
          columns={payoutColumns}
          data={payoutData}
          loading={payoutLoading}
          error={payoutError}
          currentPage={payoutPage}
          pageSize={PAGE_SIZE}
          hasMore={payoutHasMore}
          onPrevPage={() => setPayoutPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setPayoutPage((p) => p + 1)}
          onRetry={() => setPayoutPage((p) => p)}
          emptyMessage="No payout data available yet. Start playing to see winners!"
        />
      </div>

      {/* Weekly Win Rate Table */}
      <div className="rounded-3xl border border-border/60 bg-surface-subtle/80 backdrop-blur-xl p-6 shadow-float">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-fg flex items-center gap-2">
              📈 Hot Streak
              <span className="text-sm font-normal text-muted">(Last 7 days)</span>
            </h2>
            <p className="mt-1 text-sm text-muted">Players with best weekly performance</p>
          </div>
          <CatIllustration type="excited" size="md" className="animate-bounce-slow" />
        </div>
        
        <LeaderboardTable
          title=""
          columns={winRateColumns}
          data={winRateData}
          loading={winRateLoading}
          error={winRateError}
          currentPage={winRatePage}
          pageSize={PAGE_SIZE}
          hasMore={winRateHasMore}
          onPrevPage={() => setWinRatePage((p) => Math.max(1, p - 1))}
          onNextPage={() => setWinRatePage((p) => p + 1)}
          onRetry={() => setWinRatePage((p) => p)}
          emptyMessage="No games played in the last 7 days. Be the first!"
        />
      </div>

      {/* Decorative cats */}
      <div className="fixed bottom-10 right-10 opacity-10 pointer-events-none hidden xl:block">
        <CatIllustration type="victorious" size="xl" />
      </div>
    </main>
  );
}


