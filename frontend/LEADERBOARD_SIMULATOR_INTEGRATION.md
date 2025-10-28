# Leaderboard & Simulator Integration

## Overview

The leaderboard now displays both **real players** (from the blockchain indexer) and **simulated AI players** (from the game simulator) in a unified view with smart filtering options.

## Features

### 1. Mixed Leaderboard Display

The leaderboard automatically merges and ranks players from both sources:

- **Real Players**: Fetched from the blockchain indexer API
- **Simulated Players**: Generated and tracked by the game simulator (100 AI users)

### 2. Smart Filtering

Users can filter the leaderboard display:

- **All Players** (default): Shows both real and simulated players ranked together
- **Real Only**: Shows only blockchain players
- **Simulated**: Shows only AI players with their strategies

### 3. Visual Indicators

Simulated players are clearly marked:

- **Name Display**: Simulated users show their assigned names (e.g., "SimUser_001")
- **AI Badge**: Small badge next to simulated player names
- **Color Coding**: Simulated names use brand color (purple) instead of monospace

### 4. Statistics Integration

Both leaderboard tables show comprehensive stats:

**Top Payout Table:**
- Total winnings (SOL)
- Number of claims
- Last claim timestamp
- Player avatar (deterministic cat)
- Rank badges (🏆 🥈 🥉)

**Weekly Win Rate Table:**
- Win/Loss record
- Win rate percentage
- Visual progress bars
- Player avatar and rank

## Technical Implementation

### Key Functions

#### `game-simulator.ts`

```typescript
// Get leaderboard data from simulated users
export function getSimulatedLeaderboard() {
  // Fetches all simulated users
  // Calculates their stats (payout, wins, losses, win rate)
  // Returns sorted arrays for top payout and top win rate
}

// Merge real and simulated data
export function getMixedLeaderboard(realTopPayout, realTopWinRate) {
  // Combines real and simulated data
  // Re-sorts by performance metrics
  // Re-ranks players (1-50)
  // Returns merged arrays
}
```

#### `leaderboard.tsx`

```typescript
// Get player display information
function getPlayerDisplayName(playerAddress: string) {
  // Checks if address belongs to a simulated user
  // Returns name and isSimulated flag
  // Used for rendering player names with AI badge
}
```

### Data Flow

1. **Simulator Page** (`/simulator`):
   - Initialize 100 AI users with strategies
   - Run rounds (commit → reveal → claim)
   - Store results in demo-rounds.ts state
   - Track balances in localStorage

2. **Leaderboard Page** (`/leaderboard`):
   - Load real players from indexer API
   - Load simulated users from localStorage
   - Calculate stats for simulated users using `demo.getPlayerStats()`
   - Merge and rank both datasets
   - Display with filter options

3. **Player Stats Calculation**:
   - `roundsPlayed`: Total rounds participated
   - `wins`: Number of winning rounds
   - `losses`: Rounds played - wins
   - `totalPayout`: Current balance - initial balance
   - `winRate`: (wins / roundsPlayed) × 100

### Filter Logic

```typescript
const [dataFilter, setDataFilter] = useState<'all' | 'real' | 'simulated'>('all');

// In data fetching useEffect:
if (dataFilter === 'all' && hasSimulatedUsers) {
  // Fetch real + merge with simulated
  const mixed = getMixedLeaderboard(realData, []);
  data = mixed.topPayout;
} else if (dataFilter === 'simulated') {
  // Show only simulated
  const mixed = getMixedLeaderboard([], []);
  data = mixed.topPayout;
} else {
  // Show only real
  data = await fetchTopPayout({ limit, offset });
}
```

## UI Components

### Filter Buttons

```tsx
<div className="flex gap-2">
  <button onClick={() => setDataFilter('all')}>All Players</button>
  <button onClick={() => setDataFilter('real')}>Real Only</button>
  <button onClick={() => setDataFilter('simulated')}>
    <Icon name="sparkles" /> Simulated
  </button>
</div>
```

### Player Name Display

```tsx
const displayInfo = getPlayerDisplayName(item.player);

<span className={displayInfo.isSimulated ? 'text-brand-strong' : 'text-fg font-mono'}>
  {displayInfo.name}
</span>
{displayInfo.isSimulated && <span className="badge">AI</span>}
```

## Strategy Distribution

The simulator uses 4 AI strategies:

1. **Random** (25%): 50/50 chance each tribe
2. **Minority Seeker** (25%): Joins smaller tribe
3. **Majority Follower** (25%): Joins larger tribe
4. **Contrarian** (25%): Does opposite of majority

Each strategy has different win rates, creating diverse leaderboard competition.

## Data Persistence

- **Simulated Users**: Stored in `localStorage` under key `choco-simulator-users`
- **Game State**: Stored in demo-rounds.ts in-memory state
- **Stats Calculation**: Computed on-demand from game history

## Usage Example

### Initialize Simulator

1. Go to `/simulator`
2. Click "Initialize Users" → Creates 100 AI players
3. Click "Run Continuous Simulation (5 rounds)" → Starts auto-play
4. Watch activity log for commits/reveals/claims

### View Leaderboard

1. Go to `/leaderboard`
2. See filter buttons (only visible if simulator has users)
3. Toggle between "All Players", "Real Only", "Simulated"
4. Simulated users show "AI" badge and purple names
5. Click "View Leaderboard" button in Simulator header

## Performance Notes

- **Pagination**: Both tables show 50 entries per page
- **Re-ranking**: Mixed leaderboard re-sorts and re-ranks on every filter change
- **Stat Calculation**: Player stats computed efficiently using `demo.getPlayerStats()`
- **Local Storage**: Minimal data stored (user info only, not full game history)

## Future Enhancements

Potential improvements:

1. **Strategy Filter**: Filter leaderboard by AI strategy type
2. **Real-time Updates**: Auto-refresh leaderboard during simulation
3. **Performance Charts**: Show win rate trends over time
4. **Export Data**: Download leaderboard as CSV/JSON
5. **Compare Mode**: Side-by-side comparison of real vs simulated performance
6. **Simulation History**: Track multiple simulation sessions

## Testing

To test the integration:

```bash
# Start development server
pnpm dev

# Navigate to /simulator
# Initialize users and run simulation
# Navigate to /leaderboard
# Toggle filters and verify:
# - All Players shows mixed data
# - Real Only shows blockchain data
# - Simulated shows only AI players
# - AI badge appears on simulated users
# - Stats match simulator results
```

## Troubleshooting

**Issue**: Simulated players not showing on leaderboard

- **Solution**: Ensure simulator has been initialized (`loadSimulatedUsers().length > 0`)

**Issue**: Duplicate ranks or incorrect sorting

- **Solution**: Check that `getMixedLeaderboard` re-ranks after merging

**Issue**: Player names showing as addresses instead of SimUser_XXX

- **Solution**: Verify `getPlayerDisplayName()` is finding users in localStorage

**Issue**: Stats don't match simulator dashboard

- **Solution**: Ensure `demo.getPlayerStats()` is using the same PublicKey

---

**Status**: ✅ Fully Integrated  
**Last Updated**: 2025  
**Components**: Simulator.tsx, leaderboard.tsx, game-simulator.ts
