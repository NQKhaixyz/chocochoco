# ⏰ Chain Time Utilities

This app includes a reusable hook to sync chain time (block timestamp) and a Countdown component that renders time remaining based on chain time rather than local time.

## Hook: `useChainTime`

Syncs local time with the latest block timestamp via viem/wagmi public client.

```ts
import { useChainTime } from '../frontend/src/hooks/useChainTime'

const { chainTime, offset, lastSync, sync } = useChainTime()
```

- `chainTime`: current timestamp in seconds based on chain
- `offset`: chainTime - localTime (seconds)
- `lastSync`: local timestamp when the last sync happened
- `sync()`: manually trigger a sync (auto-sync runs every 15s by default)

## Component: `Countdown`

Displays a live countdown using chain time. It updates every second, stops at zero, and formats consistently.

```tsx
import Countdown from '../frontend/src/components/Countdown'

<Countdown endTime={Number(round.revealEnd)} onExpire={() => console.log('Reveal closed')} />
```

Formatting rules:
- `HH:MM:SS` when remaining time is 1 hour or more
- `MM:SS` when under 1 hour

Accuracy target is within ±1 second of on-chain time (thanks to periodic offset sync from `useChainTime`).

Tip: You can reuse `Countdown` anywhere (CommitPanel, RevealPanel, ResultPanel) by passing the end timestamp (in seconds) from the contract.

