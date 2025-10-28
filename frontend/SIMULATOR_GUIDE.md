# Game Simulator - 100 AI Players

Automated game simulator với 100 AI players có chiến lược khác nhau, tự động tham gia game và hoạt động qua nhiều rounds.

## 🎮 Tính năng

### 100 Simulated Users
- Mỗi user có balance ngẫu nhiên (100-600 FOOD)
- 4 loại chiến lược AI khác nhau
- Play rate ngẫu nhiên (50-100% - một số user skip rounds)
- Tên định dạng: SimUser_000 đến SimUser_099

### 4 AI Strategies

1. **Random (25 users)**
   - Chọn Milk hoặc Cacao ngẫu nhiên 50/50
   - Không có chiến thuật, hoàn toàn chaos
   - Best for: Testing game balance

2. **Minority Seeker (25 users)**
   - Luôn cố gắng join tribe nhỏ hơn
   - Chiến thuật thông minh, tối ưu hóa cơ hội thắng
   - Best for: Maximum profit potential

3. **Majority Follower (25 users)**
   - Luôn join tribe lớn hơn
   - An toàn hơn nhưng ít lợi nhuận
   - Best for: Conservative play

4. **Contrarian (25 users)**
   - Làm ngược lại điều có vẻ hợp lý
   - Unpredictable và creative
   - Best for: Creating chaos

## 🚀 Cách sử dụng

### Từ UI (Simulator Page)

1. **Truy cập Simulator**
   ```
   Navigate to: /simulator
   ```

2. **Initialize Users**
   - Click "Initialize 100 Users"
   - 100 users sẽ được tạo với balances ngẫu nhiên

3. **Run Simulations**
   
   **Option A: Single Round**
   - Click "Simulate Current Round"
   - Users sẽ commit → reveal → claim tự động
   
   **Option B: Multiple Rounds**
   - Chọn số rounds (1-20)
   - Click "Run X Rounds"
   - Simulator sẽ chạy liên tục qua nhiều rounds

4. **View Results**
   - Check Activity Log để xem real-time progress
   - View stats cards để track balances
   - Visit Leaderboard để xem top earners

### Từ Console (Advanced)

```javascript
// Import simulator
import * as simulator from './lib/game-simulator'

// 1. Initialize 100 users
simulator.initializeSimulator()

// 2. Simulate single round
await simulator.simulateFullRound(1)

// 3. Simulate multiple rounds (auto-play)
await simulator.startContinuousSimulation(5) // 5 rounds

// 4. Get stats
const stats = simulator.getSimulatorStats()
console.log(stats)

// 5. Reset everything
simulator.resetSimulator()
```

## 📊 Simulation Flow

### Phase 1: Commit
- Users decide to play based on their playRate
- Each user checks their balance
- User chooses tribe based on their strategy
- Random stake amount (5-20 FOOD)
- Salt generated and commitment saved

### Phase 2: Reveal
- All users who committed now reveal
- Salt is submitted to prove honest commitment
- Winner tribe is determined (minority)

### Phase 3: Claim
- Winners automatically claim their rewards
- Balances updated
- Round finalized

### Phase 4: Next Round
- Game advances to next round
- Process repeats

## 🎯 Use Cases

### 1. Testing Game Balance
```javascript
// Run 10 rounds and see which strategy performs best
await simulator.startContinuousSimulation(10)

// Check leaderboard - are strategies balanced?
```

### 2. Stress Testing
```javascript
// Initialize 100 users
simulator.initializeSimulator()

// Run many rounds quickly
await simulator.startContinuousSimulation(20)

// Check for any bugs or edge cases
```

### 3. Data Generation
```javascript
// Generate realistic game data for testing frontend
await simulator.startContinuousSimulation(5)

// Now you have:
// - Transaction history
// - Earnings data
// - Leaderboard entries
// - Round history
```

### 4. Strategy Analysis
```javascript
// Run simulation
await simulator.startContinuousSimulation(10)

// Analyze results
const stats = simulator.getSimulatorStats()

// Check which strategies earned most
// Visit leaderboard to see distribution
```

## 🔧 Configuration

### Adjust User Count
Edit `game-simulator.ts`:
```typescript
// Change from 100 to any number
for (let i = 0; i < 200; i++) {
  // ...
}
```

### Adjust Strategy Distribution
Edit strategy array:
```typescript
const strategies = [
  'random',
  'random',           // More random players
  'minority-seeker',
  'contrarian'
]
```

### Adjust Play Rates
```typescript
playRate: Math.random() * 0.3 + 0.7, // 70-100% play rate
```

### Adjust Stake Amounts
```typescript
const stakeAmount = BigInt(Math.floor(Math.random() * 30 + 10)) * 1_000_000_000n
// Now stakes 10-40 FOOD
```

## 📈 Monitoring

### Activity Log
- Real-time log trong UI
- Shows commits, reveals, claims
- Error messages
- Round summaries

### Stats Cards
- Total Users
- Total Balance
- Average Balance
- Current Round

### Strategy Distribution
- Bar chart showing user count per strategy

### Top Earners
- Console log shows top 10 after continuous simulation
- Check Leaderboard page for full rankings

## 🎲 Random Behaviors

Simulator includes several random elements:

1. **Play Rate** (50-100%)
   - Some users skip rounds randomly
   - Creates realistic participation patterns

2. **Stake Amounts** (5-20 FOOD)
   - Each commit uses random stake
   - Simulates different risk appetites

3. **Initial Balances** (100-600 FOOD)
   - Users start with different amounts
   - Some will run out faster than others

4. **Strategy Execution**
   - Even within strategy, small randomness
   - Minority-seekers might join majority if tied

## 🐛 Troubleshooting

### "No simulated users found"
**Solution:** Run `simulator.initializeSimulator()` first

### Simulation not progressing
**Solution:** Check console for errors, ensure demo-rounds is working

### Users running out of money
**Solution:** This is expected! Users who lose too much will stop playing. Reset to start fresh.

### Balances seem wrong
**Solution:** Demo state uses localStorage. Clear and reinitialize if needed.

## 🔄 Reset & Cleanup

```javascript
// Reset simulator only (keeps game data)
simulator.resetSimulator()

// Clear all game data
demo.clearAllDemoData()

// Full reset (both)
simulator.resetSimulator()
demo.clearAllDemoData()
```

## 💡 Tips

1. **Start small**: Run 1-3 rounds first to understand flow
2. **Watch Activity Log**: See what's happening in real-time
3. **Check Leaderboard**: See which strategies are winning
4. **Reset often**: Start fresh to see different outcomes
5. **Vary rounds**: Different patterns emerge over 5 vs 20 rounds

## 🎉 Fun Experiments

### 1. All Random
- Set all users to 'random' strategy
- Run 10 rounds
- Result: Pure chaos, 50/50 distribution

### 2. All Minority-Seekers
- All users try to join minority
- Creates oscillating pattern
- Tests game theory edge cases

### 3. Mixed Strategies
- Default 25/25/25/25 distribution
- Most realistic simulation
- See which strategy wins long-term

## 📝 Notes

- Simulator uses demo-rounds.ts backend
- All data stored in localStorage
- Works completely client-side
- No blockchain transactions
- Perfect for testing and development

Enjoy testing with 100 AI cats! 🐱🎮
