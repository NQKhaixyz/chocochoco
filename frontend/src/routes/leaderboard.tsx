import React, { useEffect, useState } from 'react';
import { LeaderboardTable, Column } from '../components/LeaderboardTable';
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
      render: (_, index) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {index + 1}
        </span>
      ),
      className: 'w-16',
    },
    {
      key: 'player',
      header: 'Player',
      render: (item) => (
        <span className="font-mono text-gray-700 dark:text-gray-300" title={item.player}>
          {truncateAddress(item.player, 6)}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total (SOL)',
      render: (item) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {lamportsToSol(item.totalLamports, 6)} SOL
        </span>
      ),
      className: 'text-right',
    },
  ];

  // Weekly Win Rate Columns
  const winRateColumns: Column<WeeklyWinRateEntry>[] = [
    {
      key: 'rank',
      header: '#',
      render: (_, index) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {index + 1}
        </span>
      ),
      className: 'w-16',
    },
    {
      key: 'player',
      header: 'Player',
      render: (item) => (
        <span className="font-mono text-gray-700 dark:text-gray-300" title={item.player}>
          {truncateAddress(item.player, 6)}
        </span>
      ),
    },
    {
      key: 'wins',
      header: 'Wins',
      render: (item) => (
        <span className="text-green-600 dark:text-green-400 font-medium">
          {item.wins}
        </span>
      ),
      className: 'text-center',
    },
    {
      key: 'total',
      header: 'Total',
      render: (item) => (
        <span className="text-gray-700 dark:text-gray-300">{item.total}</span>
      ),
      className: 'text-center',
    },
    {
      key: 'rate',
      header: 'Win Rate',
      render: (item) => (
        <span className="font-semibold text-purple-600 dark:text-purple-400">
          {formatWinRate(item.rate)}
        </span>
      ),
      className: 'text-right',
    },
  ];

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Top players and weekly win rates from the Solana indexer
        </p>
      </div>

      {/* Top Payout Table */}
      <LeaderboardTable
        title="🏅 Top Payout (All-time)"
        columns={payoutColumns}
        data={payoutData}
        loading={payoutLoading}
        error={payoutError}
        currentPage={payoutPage}
        pageSize={PAGE_SIZE}
        hasMore={payoutHasMore}
        onPrevPage={() => setPayoutPage((p) => Math.max(1, p - 1))}
        onNextPage={() => setPayoutPage((p) => p + 1)}
        onRetry={() => setPayoutPage((p) => p)} // Trigger re-fetch
        emptyMessage="No payout data available yet. Start playing to see winners!"
      />

      {/* Weekly Win Rate Table */}
      <LeaderboardTable
        title="📈 Weekly Win-Rate (Last 7 days)"
        columns={winRateColumns}
        data={winRateData}
        loading={winRateLoading}
        error={winRateError}
        currentPage={winRatePage}
        pageSize={PAGE_SIZE}
        hasMore={winRateHasMore}
        onPrevPage={() => setWinRatePage((p) => Math.max(1, p - 1))}
        onNextPage={() => setWinRatePage((p) => p + 1)}
        onRetry={() => setWinRatePage((p) => p)} // Trigger re-fetch
        emptyMessage="No games played in the last 7 days. Be the first!"
      />
    </main>
  );
}


