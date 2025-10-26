# Countdown & Time Utilities - Developer Guide

## Overview

This guide covers the shared countdown and time synchronization utilities for the ChocoChoco frontend, specifically designed for Solana blockchain integration with ±1 second accuracy.

## Table of Contents

1. [Time Synchronization](#time-synchronization)
2. [Countdown Components](#countdown-components)
3. [Formatting Utilities](#formatting-utilities)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)

---

## Time Synchronization

### `useSolanaTime` Hook

**Location:** `frontend/src/solana/time.ts`

Synchronizes local time with Solana chain time using RPC `getBlockTime()`.

#### Features
- Auto-syncs every 15 seconds (configurable)
- Calculates offset between local and chain time
- Provides current chain timestamp
- Handles transient RPC errors gracefully

#### Usage

```typescript
import { useSolanaTime } from '@/solana/time'

function MyComponent() {
  const { chainTime, offset, lastSync, sync } = useSolanaTime(15000)
  
  console.log('Chain time:', chainTime)        // unix seconds
  console.log('Offset:', offset)               // seconds difference
  console.log('Last sync:', lastSync)          // unix seconds
  
  // Manual sync
  const handleSync = async () => {
    await sync()
  }
}
```

#### API

```typescript
interface UseSolanaTimeReturn {
  chainTime: number      // Current chain time (unix seconds)
  offset: number         // chainTs - localTs
  lastSync: number       // Last successful sync timestamp
  sync: () => Promise<void>  // Manual sync function
}

function useSolanaTime(refreshMs?: number): UseSolanaTimeReturn
```

#### Parameters
- `refreshMs` (optional): Sync interval in milliseconds. Default: `15000` (15s)

#### Accuracy
- ±1 second drift guaranteed with default 15s refresh
- Initial sync on mount
- Continuous background sync

---

## Countdown Components

### 1. `SolanaCountdown` Component

**Location:** `frontend/src/components/SolanaCountdown.tsx`

**Use for:** Solana-specific countdowns with automatic chain time sync.

#### Features
- Auto-syncs with Solana chain time via `useSolanaTime`
- Configurable formatting (HH:MM:SS or MM:SS)
- Urgent state highlighting (red when < 60s)
- onExpire callback
- Fully customizable styling

#### Basic Usage

```tsx
import { SolanaCountdown } from '@/components/SolanaCountdown'

function RevealScreen() {
  const handleExpire = () => {
    console.log('Reveal period ended!')
  }

  return (
    <div>
      <p>Time remaining: <SolanaCountdown endTs={revealEndTimestamp} onExpire={handleExpire} /></p>
    </div>
  )
}
```

#### Advanced Usage

```tsx
<SolanaCountdown
  endTs={1735689600}
  onExpire={() => setPhase('settled')}
  alwaysShowHours={true}
  showDays={true}
  className="text-2xl font-bold text-blue-600"
  urgentThreshold={300}  // Urgent when < 5 minutes
  urgentColor="text-orange-500"
/>
```

#### Props

```typescript
interface SolanaCountdownProps {
  endTs: number                 // Unix timestamp (seconds)
  onExpire?: () => void        // Called when countdown hits zero
  alwaysShowHours?: boolean    // Show hours even if 0. Default: false
  showDays?: boolean           // Show days if applicable. Default: false
  className?: string           // Override default className
  urgentThreshold?: number     // Seconds threshold for urgent state. Default: 60
  urgentColor?: string         // Tailwind class for urgent. Default: 'text-red-600'
}
```

### 2. `Countdown` Component (Legacy/EVM)

**Location:** `frontend/src/components/Countdown.tsx`

For EVM chains or custom offset scenarios.

```tsx
import Countdown from '@/components/Countdown'

<Countdown 
  endTime={deadline} 
  onExpire={() => alert('Done!')} 
  interval={1000} 
/>
```

---

## Formatting Utilities

### Location
`frontend/src/lib/time-format.ts`

### Functions

#### 1. `formatCountdown(seconds, options)`

Format seconds to countdown string.

```typescript
formatCountdown(3661)  // "01:01:01"
formatCountdown(125)   // "02:05"
formatCountdown(125, { alwaysShowHours: true })  // "00:02:05"
formatCountdown(90000, { showDays: true })       // "1d 01:00:00"
```

**Options:**
- `showHours?: boolean` - Show hours component
- `showDays?: boolean` - Show days component
- `alwaysShowHours?: boolean` - Force hours display

#### 2. `formatHumanReadable(seconds)`

Convert to natural language.

```typescript
formatHumanReadable(3661)    // "1 hour 1 minute"
formatHumanReadable(45)      // "45 seconds"
formatHumanReadable(7200)    // "2 hours"
```

#### 3. `formatCompact(seconds)`

Compact display format.

```typescript
formatCompact(3661)    // "1h 1m"
formatCompact(125)     // "2m 5s"
formatCompact(90000)   // "1d 1h"
```

#### 4. `formatTimestamp(unixSeconds, options)`

Format unix timestamp to locale string.

```typescript
formatTimestamp(1735689600)
// "Jan 1, 2025, 12:00 AM"

formatTimestamp(1735689600, { 
  dateStyle: 'full',
  timeStyle: 'short' 
})
// "Monday, January 1, 2025 at 12:00 AM"
```

#### 5. Utility Functions

```typescript
// Get time difference
getTimeDiff(endTs, startTs?)  // returns seconds

// Check if expired
isExpired(unixSeconds)  // returns boolean

// Check if in window
isInWindow(ts, startTs, endTs)  // returns boolean

// Parse to components
secondsToComponents(3661)
// { days: 0, hours: 1, minutes: 1, seconds: 1, totalSeconds: 3661 }
```

---

## Hooks

### `useCountdown` Hook

**Location:** `frontend/src/hooks/useCountdown.ts`

Headless countdown logic for custom UIs.

```typescript
import { useCountdown } from '@/hooks/useCountdown'

function CustomCountdown({ endTs }: { endTs: number }) {
  const { remaining, isExpired, isUrgent, hours, minutes, seconds } = useCountdown(endTs, {
    onExpire: () => console.log('Done!'),
    timeOffset: 0  // Optional offset in seconds
  })

  if (isExpired) return <span>Expired</span>

  return (
    <div className={isUrgent ? 'text-red-600' : 'text-gray-900'}>
      {hours > 0 && <span>{hours}h </span>}
      <span>{minutes}m {seconds}s</span>
    </div>
  )
}
```

#### Returns

```typescript
{
  remaining: number      // Total seconds remaining
  isExpired: boolean     // True if countdown reached zero
  isUrgent: boolean      // True if < 60 seconds
  hours: number          // Hours component
  minutes: number        // Minutes component
  seconds: number        // Seconds component
}
```

---

## Usage Examples

### Example 1: Commit Deadline

```tsx
import { SolanaCountdown } from '@/components/SolanaCountdown'
import { formatTimestamp } from '@/lib/time-format'

function CommitPanel({ commitEnd }: { commitEnd: number }) {
  return (
    <div>
      <h3>Commit Phase</h3>
      <p>Deadline: {formatTimestamp(commitEnd)}</p>
      <p>Time left: <SolanaCountdown endTs={commitEnd} /></p>
    </div>
  )
}
```

### Example 2: Multi-Phase Display

```tsx
function RoundPhases({ commitEnd, revealEnd }: { commitEnd: number; revealEnd: number }) {
  const now = Math.floor(Date.now() / 1000)
  
  return (
    <div className="space-y-4">
      <div>
        <h4>Commit Phase</h4>
        {now < commitEnd ? (
          <SolanaCountdown endTs={commitEnd} alwaysShowHours />
        ) : (
          <span className="text-gray-500">Ended</span>
        )}
      </div>
      
      <div>
        <h4>Reveal Phase</h4>
        {now >= commitEnd && now < revealEnd ? (
          <SolanaCountdown 
            endTs={revealEnd} 
            urgentThreshold={300}
            urgentColor="text-orange-600"
          />
        ) : now < commitEnd ? (
          <span className="text-gray-400">Not started</span>
        ) : (
          <span className="text-gray-500">Ended</span>
        )}
      </div>
    </div>
  )
}
```

### Example 3: Custom Countdown with Formatting

```tsx
import { useCountdown } from '@/hooks/useCountdown'
import { formatHumanReadable, formatCompact } from '@/lib/time-format'

function DetailedCountdown({ endTs }: { endTs: number }) {
  const countdown = useCountdown(endTs)
  
  return (
    <div>
      <div className="text-3xl font-mono">
        {countdown.hours.toString().padStart(2, '0')}:
        {countdown.minutes.toString().padStart(2, '0')}:
        {countdown.seconds.toString().padStart(2, '0')}
      </div>
      <div className="text-sm text-gray-600">
        {formatHumanReadable(countdown.remaining)}
      </div>
      <div className="text-xs text-gray-400">
        ({formatCompact(countdown.remaining)} remaining)
      </div>
    </div>
  )
}
```

### Example 4: Progress Bar with Countdown

```tsx
function CountdownProgress({ startTs, endTs }: { startTs: number; endTs: number }) {
  const { remaining } = useCountdown(endTs)
  const total = endTs - startTs
  const progress = Math.max(0, 100 - (remaining / total) * 100)
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Progress</span>
        <SolanaCountdown endTs={endTs} />
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
```

---

## Best Practices

### 1. **Use SolanaCountdown for Solana Timestamps**

Always use `SolanaCountdown` when displaying deadlines from Solana program state:

✅ **Correct:**
```tsx
<SolanaCountdown endTs={round.revealEnd} />
```

❌ **Incorrect:**
```tsx
<Countdown endTime={round.revealEnd} />  // Uses local time, no chain sync
```

### 2. **Sync Interval Tuning**

Default 15s sync is optimal for most cases:
- Balances accuracy (±1s) with RPC costs
- Adjust only if needed:

```tsx
// More frequent sync (higher RPC costs)
useSolanaTime(5000)   // Every 5 seconds

// Less frequent (lower accuracy)
useSolanaTime(30000)  // Every 30 seconds
```

### 3. **Handle Expired States**

Always provide fallback for expired countdowns:

```tsx
const now = Math.floor(Date.now() / 1000)

{now < deadline ? (
  <SolanaCountdown endTs={deadline} />
) : (
  <span className="text-gray-500">Phase ended</span>
)}
```

### 4. **Memoize Expensive Formatting**

Use `useMemo` for complex formatting:

```tsx
const formattedDeadline = useMemo(() => 
  formatTimestamp(deadline, { dateStyle: 'full' }),
  [deadline]
)
```

### 5. **Cleanup Callbacks**

If using `onExpire`, ensure cleanup:

```tsx
const handleExpire = useCallback(() => {
  setPhase('reveal')
  // Trigger refetch, navigate, etc.
}, [setPhase])

<SolanaCountdown endTs={commitEnd} onExpire={handleExpire} />
```

### 6. **Accessibility**

Provide context for screen readers:

```tsx
<span aria-label={`Time remaining: ${formatHumanReadable(remaining)}`}>
  <SolanaCountdown endTs={deadline} />
</span>
```

### 7. **Testing**

Mock time utilities in tests:

```typescript
jest.mock('@/solana/time', () => ({
  useSolanaTime: () => ({
    chainTime: 1735689600,
    offset: 0,
    lastSync: 1735689600,
    sync: jest.fn(),
  })
}))
```

---

## Architecture Decisions

### Why Separate Components?

- **SolanaCountdown**: Auto-syncs with chain, ideal for Solana
- **Countdown**: Generic, for EVM or custom scenarios
- **useCountdown**: Headless, for full UI control

### Time Sync Strategy

1. **Initial Sync**: On component mount
2. **Periodic Sync**: Every 15s (configurable)
3. **Offset Calculation**: `chainTime - localTime`
4. **Display**: `localTime + offset` for real-time ticking

### Accuracy Guarantee

- Chain sync: ±1s drift max
- Display tick: 1s interval
- No cumulative error (periodic resync)

---

## API Reference Summary

### Components
- `<SolanaCountdown />` - Chain-synced countdown for Solana
- `<Countdown />` - Generic countdown (legacy/EVM)

### Hooks
- `useSolanaTime()` - Sync with Solana chain time
- `useCountdown()` - Headless countdown logic

### Utilities
- `formatCountdown()` - HH:MM:SS formatting
- `formatHumanReadable()` - Natural language
- `formatCompact()` - Short format (1h 2m)
- `formatTimestamp()` - Locale date string
- `secondsToComponents()` - Parse to h/m/s
- `getTimeDiff()` - Calculate difference
- `isExpired()` - Check if past
- `isInWindow()` - Check if between

---

## Troubleshooting

### Countdown Not Updating
- Verify `endTs` is in seconds (not milliseconds)
- Check RPC connection in browser console
- Ensure component is not memoized incorrectly

### Drift > 1 Second
- Check network latency to RPC
- Reduce sync interval if needed
- Verify system clock is accurate

### Wrong Timezone Display
- Use `formatTimestamp()` with explicit timezone
- Or display unix timestamp directly

### Performance Issues
- Increase sync interval to reduce RPC calls
- Use `useMemo` for expensive calculations
- Avoid unnecessary re-renders

---

## Version History

- **v1.0** (S1.7) - Initial `useSolanaTime` and `SolanaCountdown`
- **v1.1** (S1.9) - Added formatting utilities, `useCountdown` hook, comprehensive docs

---

## Related Documentation

- [S1.7: Reveal Screen Implementation](./S1.7-IMPLEMENTATION.md)
- [S1.8: Claim Screen Implementation](./S1.8-IMPLEMENTATION.md)
- [Solana Time Docs](https://docs.solana.com/developing/clients/javascript-api#getblocktime)

---

**Status:** ✅ Complete | **Sprint:** S1.9 | **Updated:** Oct 2025
