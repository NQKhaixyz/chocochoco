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

const PAGE_SIZE = 50;

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

export default function LeaderboardPage() {
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
  }, []);

  // Fetch Top Payout
  useEffect(() => {
    let mounted = true;

    const loadTopPayout = async () => {
      setPayoutLoading(true);
      setPayoutError(null);

      try {
        const offset = (payoutPage - 1) * PAGE_SIZE;
        const data = await fetchTopPayout({ limit: PAGE_SIZE + 1, offset });

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
  }, [payoutPage]);

  // Fetch Weekly Win Rate
  useEffect(() => {
    if (weeklyFrom === undefined) return;

    let mounted = true;

    const loadWinRate = async () => {
      setWinRateLoading(true);
      setWinRateError(null);

      try {
        const offset = (winRatePage - 1) * PAGE_SIZE;
        const data = await fetchWeeklyWinRate({
          from: weeklyFrom,
          limit: PAGE_SIZE + 1,
          offset,
        });

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
  }, [winRatePage, weeklyFrom]);

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
        
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-brand/30 bg-surface-subtle transition-transform hover:scale-110">
              <CatIllustration type={catAvatar} size="md" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-medium text-fg" title={item.player}>
                {truncateAddress(item.player, 6)}
              </span>
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
      render: (item) => (
        <div className="flex flex-col items-end">
          <span className="text-lg font-bold text-brand-strong">
            {lamportsToSol(item.totalLamports, 4)} SOL
          </span>
          {item.lastClaim && (
            <span className="text-xs text-muted">
              Last: {new Date(item.lastClaim).toLocaleDateString()}
            </span>
          )}
        </div>
      ),
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
        
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-brand/30 bg-surface-subtle transition-transform hover:scale-110">
              <CatIllustration type={catAvatar} size="md" />
            </div>
            <span className="font-mono text-sm font-medium text-fg" title={item.player}>
              {truncateAddress(item.player, 6)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'performance',
      header: 'Performance',
      render: (item) => (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon name="success" className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-600 dark:text-green-400">
              {item.wins}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="history" className="h-4 w-4 text-muted" />
            <span className="text-muted">
              {item.total}
            </span>
          </div>
        </div>
      ),
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


