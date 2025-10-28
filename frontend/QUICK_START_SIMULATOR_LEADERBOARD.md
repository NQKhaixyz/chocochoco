# 🎮 Quick Start Guide: Simulator + Leaderboard

## Step-by-Step Usage

### 1️⃣ Initialize Simulator (First Time)

```
Navigate to: /simulator

1. Click "Initialize Users" button
   ✅ Creates 100 AI players with random strategies

2. Wait for initialization complete message
   ✅ Users stored in localStorage
   ✅ Initial balances assigned (10,000 FOOD each)
```

### 2️⃣ Run Simulation

```
On Simulator page:

Option A - Single Round:
  Click "Run Single Round" 
  → Commit → Reveal → Claim
  → See activity log update

Option B - Continuous (Recommended):
  Click "Run Continuous Simulation (5 rounds)"
  → Automatically runs 5 rounds
  → Watch stats cards update in real-time
  → Activity log shows all actions
```

### 3️⃣ View Leaderboard

```
Navigate to: /leaderboard
OR
Click "View Leaderboard" button in Simulator header

You'll see:
✅ Filter buttons at top (All Players | Real Only | Simulated)
✅ Two tables: Top Payout & Weekly Win Rate
✅ Simulated users with "AI" badge
✅ Cat avatars for each player
✅ Rank badges (🏆 🥈 🥉) for top 3
```

### 4️⃣ Use Filters

```
On Leaderboard page:

Click "All Players" (default)
  → Shows both real & simulated players ranked together

Click "Real Only"
  → Shows only blockchain players

Click "Simulated"
  → Shows only AI players
  → See their strategies in action
```

## Visual Guide

### Simulator Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  🐱 Game Simulator      [View Leaderboard]  │
│  Simulate 100 AI players...                 │
└─────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ 100      │ 1.0M     │ 10K      │ Round 5  │
│ Users    │ Balance  │ Avg      │          │
└──────────┴──────────┴──────────┴──────────┘

┌─────────────────────────────────────────────┐
│  Control Panel                              │
│  [Initialize] [Run Single] [Continuous]     │
│  [Reset All]                                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Activity Log                               │
│  ✅ SimUser_042 committed to MILK           │
│  ✅ SimUser_017 revealed CACAO             │
│  🏆 SimUser_088 claimed 250 FOOD           │
└─────────────────────────────────────────────┘
```

### Leaderboard Layout

```
┌─────────────────────────────────────────────┐
│  🏆 Leaderboard                    [Live]   │
│  Top players from Solana blockchain         │
└─────────────────────────────────────────────┘

Show: [All Players] [Real Only] [Simulated ✨]
                                  ↑ Active

┌─────────────────────────────────────────────┐
│  🏆 Top Payout                              │
├────┬─────────────────┬──────────────────────┤
│ 🏆 │ 🐱 SimUser_088  │ 15,750 SOL          │
│    │      [AI]       │ 12 claims           │
├────┼─────────────────┼──────────────────────┤
│ 🥈 │ 🐱 SimUser_042  │ 14,200 SOL          │
│    │      [AI]       │ 10 claims           │
└────┴─────────────────┴──────────────────────┘

┌─────────────────────────────────────────────┐
│  📊 Weekly Win Rate                         │
├────┬─────────────────┬──────────────────────┤
│ 🏆 │ 🐱 SimUser_017  │ 4W - 1L (80%)       │
│    │      [AI]       │ ████████░░           │
├────┼─────────────────┼──────────────────────┤
│ 🥈 │ 🐱 SimUser_055  │ 3W - 1L (75%)       │
│    │      [AI]       │ ███████░░░           │
└────┴─────────────────┴──────────────────────┘
```

## What Each AI Strategy Does

| Strategy | Behavior | Expected Win Rate |
|----------|----------|-------------------|
| 🎲 Random | 50/50 random choice | ~50% |
| 🔍 Minority Seeker | Joins smaller tribe | Variable |
| 👥 Majority Follower | Joins larger tribe | Variable |
| 🔄 Contrarian | Does opposite of majority | Variable |

*Note: Win rates depend on game dynamics and other players' choices*

## Common Scenarios

### Scenario 1: First Time Setup
```
1. Go to /simulator
2. Click "Initialize Users"
3. Click "Run Continuous (5 rounds)"
4. Go to /leaderboard
5. See 100 AI players ranked
```

### Scenario 2: Compare Strategies
```
1. Run 10+ rounds on /simulator
2. Go to /leaderboard
3. Click "Simulated" filter
4. See which strategies perform best
5. Check Top Payout vs Win Rate tables
```

### Scenario 3: Mix Real + Simulated
```
1. Have some real players on blockchain
2. Initialize simulator (100 AI)
3. Go to /leaderboard
4. Click "All Players"
5. See combined ranking
```

## Troubleshooting

### Problem: No simulated players showing
**Solution**: Go to `/simulator` and click "Initialize Users" first

### Problem: Filter buttons not visible
**Solution**: Initialize users first - buttons only appear when simulator has data

### Problem: Stats don't update after simulation
**Solution**: Refresh the leaderboard page or toggle filters

### Problem: SimUser names showing as addresses
**Solution**: Ensure localStorage has simulator data - check browser console

## Tips & Tricks

💡 **Run multiple rounds** for more interesting leaderboard competition

💡 **Watch the activity log** to see which strategies win more often

💡 **Reset and re-run** to test different scenarios

💡 **Use "Simulated" filter** to study AI strategy performance

💡 **Check both tables** - high payout doesn't always mean high win rate!

## Keyboard Shortcuts

*(Not implemented yet, but could be added)*

- `I` - Initialize users
- `R` - Run single round
- `C` - Run continuous simulation
- `L` - Go to leaderboard
- `F` - Cycle filters

---

**Ready to play? Start at `/simulator`! 🎮**
