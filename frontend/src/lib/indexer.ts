/**
 * Solana Indexer API Client
 * Fetches leaderboard data from the indexer REST API
 */

const INDEXER_BASE_URL = import.meta.env.VITE_INDEXER_URL || 'http://localhost:3001';

export interface TopPayoutEntry {
  player: string;
  totalLamports: string;
}

export interface WeeklyWinRateEntry {
  player: string;
  wins: number;
  total: number;
  rate: number;
}

export interface StatsMetaResponse {
  now: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface WeeklyWinRateParams extends PaginationParams {
  from?: number;
}

/**
 * Convert lamports to SOL with specified decimal places
 */
export function lamportsToSol(lamports: string | number, decimals: number = 4): string {
  const sol = Number(lamports) / 1e9;
  return sol.toFixed(decimals);
}

/**
 * Format win rate as percentage
 */
export function formatWinRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Fetch top payout leaderboard
 */
export async function fetchTopPayout(params: PaginationParams = {}): Promise<TopPayoutEntry[]> {
  const { limit = 50, offset = 0 } = params;
  
  try {
    const url = new URL('/leaderboard/top-payout', INDEXER_BASE_URL);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to fetch top payout: ${response.statusText}`);
    }

    const data = await response.json();
    return data as TopPayoutEntry[];
  } catch (error) {
    console.error('Error fetching top payout:', error);
    throw error;
  }
}

/**
 * Fetch weekly win rate leaderboard
 */
export async function fetchWeeklyWinRate(params: WeeklyWinRateParams = {}): Promise<WeeklyWinRateEntry[]> {
  const { limit = 50, offset = 0, from } = params;
  
  try {
    const url = new URL('/leaderboard/weekly-winrate', INDEXER_BASE_URL);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());
    
    if (from !== undefined) {
      url.searchParams.set('from', from.toString());
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weekly win rate: ${response.statusText}`);
    }

    const data = await response.json();
    return data as WeeklyWinRateEntry[];
  } catch (error) {
    console.error('Error fetching weekly win rate:', error);
    throw error;
  }
}

/**
 * Fetch stats metadata (optional - for server time)
 */
export async function fetchStatsMeta(): Promise<StatsMetaResponse | null> {
  try {
    const url = new URL('/stats/meta', INDEXER_BASE_URL);
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data as StatsMetaResponse;
  } catch (error) {
    console.warn('Stats meta endpoint not available, using local time');
    return null;
  }
}

/**
 * Get timestamp for 7 days ago
 */
export async function getWeeklyTimestamp(): Promise<number> {
  // Try to get server time first
  const meta = await fetchStatsMeta();
  const now = meta?.now || Math.floor(Date.now() / 1000);
  
  // 7 days in seconds
  const sevenDaysAgo = now - (7 * 24 * 60 * 60);
  return sevenDaysAgo;
}

/**
 * Truncate wallet address for display
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
