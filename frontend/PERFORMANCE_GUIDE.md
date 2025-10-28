# Performance Optimization Guide

Comprehensive performance optimizations implemented in ChocoChoco frontend to ensure fast load times and smooth user experience.

## 1. Code Splitting & Lazy Loading

### Route-level Code Splitting
All non-critical routes are lazy-loaded using React's `lazy()` and `Suspense`:

```tsx
// App.tsx
const JoinPage = lazy(() => import('./routes/Join'))
const RevealPage = lazy(() => import('./routes/Reveal'))
// ... other routes

function lazyRoute(Component) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}
```

**Benefits:**
- Reduces initial bundle size by ~60-70%
- Faster Time to Interactive (TTI)
- Only loads code when user navigates to that route

### Component-level Lazy Loading
Heavy components can be lazy-loaded individually:

```tsx
const CatAvatarPicker = lazy(() => import('./components/CatAvatarPicker'))

function Profile() {
  return (
    <Suspense fallback={<InlineSpinner />}>
      {showPicker && <CatAvatarPicker />}
    </Suspense>
  )
}
```

## 2. React Performance Hooks

### Custom Performance Hooks (`usePerformance.ts`)

**useDebounce** - Delays expensive operations
```tsx
const debouncedSearch = useDebounce((query) => {
  // Expensive search operation
  searchLeaderboard(query)
}, 300)
```

**useThrottle** - Limits operation frequency
```tsx
const throttledScroll = useThrottle((event) => {
  // Handle scroll
  updateVisibleItems(event)
}, 100)
```

**usePagination** - Efficiently handles large datasets
```tsx
const {
  currentData,
  currentPage,
  totalPages,
  nextPage,
  prevPage
} = usePagination(leaderboardData, 20)
```

**useVirtualScroll** - Renders only visible items
```tsx
const {
  visibleItems,
  totalHeight,
  offsetY,
  handleScroll
} = useVirtualScroll(longList, containerHeight, itemHeight)
```

## 3. Memoization Strategies

### Component Memoization
Prevent unnecessary re-renders with `React.memo`:

```tsx
export const CatIllustration = React.memo(({ type, size }) => {
  // Expensive SVG rendering
  return <svg>...</svg>
})

// Custom comparison for complex props
export const LeaderboardRow = React.memo(
  ({ player, rank }) => { /* ... */ },
  (prevProps, nextProps) => {
    return prevProps.player.address === nextProps.player.address &&
           prevProps.rank === nextProps.rank
  }
)
```

### Value Memoization
Cache expensive calculations with `useMemo`:

```tsx
const sortedPlayers = useMemo(() => {
  return players.sort((a, b) => b.totalPayout - a.totalPayout)
}, [players])

const stats = useMemo(() => ({
  totalPlayers: players.length,
  activePlayers: players.filter(p => p.isActive).length,
  totalPayout: players.reduce((sum, p) => sum + p.totalPayout, 0)
}), [players])
```

### Callback Memoization
Stable function references with `useCallback`:

```tsx
const handleCommit = useCallback(async () => {
  await saveVault(roundId, publicKey, tribe, salt)
}, [roundId, publicKey, tribe, salt])

// Pass stable callback to child components
<TribeButton onClick={handleCommit} />
```

## 4. Loading States

### LoadingSpinner Component
Provides visual feedback during async operations:

```tsx
<LoadingSpinner 
  size="lg" 
  withCat={true}
  message="Loading leaderboard..."
/>
```

**Variants:**
- `PageLoadingSpinner` - Full page loading
- `InlineSpinner` - Small inline indicator
- Custom sizes: sm, md, lg, xl

### Skeleton Screens
Show content placeholders while loading:

```tsx
function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-16 bg-surface-subtle rounded-xl" />
        </div>
      ))}
    </div>
  )
}
```

## 5. Image Optimization

### SVG Optimization
- Cat illustrations use inline SVG for instant rendering
- No HTTP requests for cat assets
- Gzip-friendly (text-based)

### Lazy Image Loading
For future photo/NFT features:

```tsx
<img 
  src={imageUrl}
  loading="lazy"
  decoding="async"
  alt="NFT artwork"
/>
```

## 6. Bundle Size Optimization

### Analyze Bundle
Run bundle analysis to identify large dependencies:

```bash
npm run build -- --mode analyze
```

### Tree Shaking
Ensure imports are tree-shakeable:

```tsx
// ❌ Bad - imports entire library
import _ from 'lodash'

// ✅ Good - imports only what's needed
import { debounce } from 'lodash-es'
```

### Dynamic Imports
Load heavy libraries only when needed:

```tsx
// Load charting library only on Stats page
const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js')
  return Chart
}
```

## 7. Data Fetching Optimization

### Request Deduplication
Prevent duplicate API calls:

```tsx
const requestCache = new Map()

async function fetchWithCache(key, fetcher) {
  if (requestCache.has(key)) {
    return requestCache.get(key)
  }
  
  const promise = fetcher()
  requestCache.set(key, promise)
  
  try {
    const result = await promise
    return result
  } finally {
    requestCache.delete(key)
  }
}
```

### Stale-While-Revalidate
Show cached data while fetching fresh data:

```tsx
function useLeaderboard() {
  const [data, setData] = useState(getCachedData())
  
  useEffect(() => {
    fetchFreshData().then(fresh => {
      setData(fresh)
      cacheData(fresh)
    })
  }, [])
  
  return data
}
```

## 8. Render Optimization

### Avoid Inline Objects/Arrays
```tsx
// ❌ Bad - creates new object every render
<Component style={{ color: 'red' }} />

// ✅ Good - stable reference
const style = { color: 'red' }
<Component style={style} />
```

### Key Prop Optimization
```tsx
// ❌ Bad - using index as key
{items.map((item, index) => <Item key={index} />)}

// ✅ Good - using stable identifier
{items.map(item => <Item key={item.id} />)}
```

### Conditional Rendering
```tsx
// ❌ Bad - renders null
{showModal && <Modal />}

// ✅ Good - doesn't render at all
{showModal ? <Modal /> : null}
```

## 9. Web Vitals Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Custom Metrics
- **Route Change**: < 200ms
- **API Response**: < 1s
- **Animation FPS**: 60fps

## 10. Monitoring & Profiling

### React DevTools Profiler
Record performance profiles to identify slow components:

```tsx
<Profiler id="Leaderboard" onRender={onRenderCallback}>
  <LeaderboardTable />
</Profiler>
```

### Performance API
Track custom metrics:

```tsx
performance.mark('leaderboard-start')
// ... render leaderboard
performance.mark('leaderboard-end')
performance.measure('leaderboard', 'leaderboard-start', 'leaderboard-end')
```

## Best Practices Checklist

- [ ] Lazy load non-critical routes
- [ ] Use React.memo for expensive components
- [ ] Memoize calculations with useMemo
- [ ] Stabilize callbacks with useCallback
- [ ] Implement virtual scrolling for long lists
- [ ] Add loading states for async operations
- [ ] Optimize images (lazy loading, proper formats)
- [ ] Minimize bundle size (tree shaking, code splitting)
- [ ] Cache API responses appropriately
- [ ] Avoid unnecessary re-renders
- [ ] Use proper React keys
- [ ] Profile with React DevTools
- [ ] Monitor Core Web Vitals
- [ ] Test on low-end devices

## Performance Testing

### Lighthouse
```bash
npm run build
npm run preview
# Run Lighthouse in Chrome DevTools
```

### Bundle Analysis
```bash
npm run build -- --mode analyze
```

### Load Testing
```bash
# Test with slow 3G
# Chrome DevTools > Network > Throttling > Slow 3G
```

## Future Optimizations

- [ ] Service Worker for offline support
- [ ] HTTP/2 Server Push
- [ ] Brotli compression
- [ ] CDN for static assets
- [ ] Preconnect to API domains
- [ ] Resource hints (prefetch, preload)
- [ ] Web Workers for heavy computations
- [ ] IndexedDB for large datasets
