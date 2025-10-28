import React, { useMemo } from 'react'
import { Icon } from './ui/Icon'
import { CatIllustration } from './CatIllustration'

interface BalanceDataPoint {
  roundId: number
  balance: bigint
  change: bigint
  timestamp: number
  earnings: bigint
}

interface BalanceChartProps {
  data: BalanceDataPoint[]
  className?: string
}

function formatFoodShort(lamports: bigint): string {
  const whole = Number(lamports / 1_000_000_000n)
  return whole.toFixed(1)
}

export function BalanceChart({ data, className = '' }: BalanceChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    // Use earnings (cumulative net profit) for the chart
    const earnings = data.map(d => Number(d.earnings / 1_000_000_000n))
    const minEarnings = Math.min(...earnings, 0) // Always include 0
    const maxEarnings = Math.max(...earnings, 0) // Always include 0
    const range = maxEarnings - minEarnings || 10 // Minimum range of 10 for better visualization
    const padding = Math.max(range * 0.15, 5) // At least 5 FOOD padding

    return {
      points: data,
      earnings,
      minEarnings: minEarnings - padding,
      maxEarnings: maxEarnings + padding,
      range: range + padding * 2
    }
  }, [data])

  if (!chartData || data.length === 0) {
    return (
      <div className={`rounded-2xl bg-surface-subtle border border-border p-8 text-center ${className}`}>
        <CatIllustration type="sleep" size="lg" className="mx-auto mb-3 opacity-50" />
        <p className="text-sm text-muted">No balance history yet</p>
        <p className="text-xs text-muted-strong mt-1">Play some rounds to see your progress!</p>
      </div>
    )
  }

  const { points, earnings, minEarnings, maxEarnings, range } = chartData
  const width = 100
  const height = 80 // Increased height for better visibility
  const pointSpacing = width / Math.max(points.length - 1, 1)

  // Find highest and lowest points BEFORE mapping
  const maxIndex = earnings.indexOf(Math.max(...earnings))
  const minIndex = earnings.indexOf(Math.min(...earnings))

  // Generate SVG path
  const pathPoints = points.map((point, i) => {
    const earning = earnings[i]
    if (earning === undefined) return null
    const x = i * pointSpacing
    const normalizedValue = (earning - minEarnings) / range
    const y = height - normalizedValue * height
    return { x, y, point, index: i }
  }).filter((p): p is { x: number; y: number; point: BalanceDataPoint; index: number } => p !== null)

  const linePath = pathPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chart */}
      <div className="relative rounded-2xl bg-gradient-to-br from-brand/5 to-brand/10 border-2 border-brand/20 p-8 overflow-hidden shadow-lg">
        {/* Background decoration - enhanced */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand to-transparent" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-brand to-transparent" />
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-1 top-6 bottom-6 flex flex-col justify-between text-xs font-semibold text-muted-strong">
          <span className="bg-surface px-1 rounded">{formatFoodShort(BigInt(Math.round(maxEarnings * 1_000_000_000)))}</span>
          <span className="bg-surface px-1 rounded text-brand-strong">0</span>
          <span className="bg-surface px-1 rounded">{formatFoodShort(BigInt(Math.round(minEarnings * 1_000_000_000)))}</span>
        </div>

        {/* SVG Chart */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-64 relative z-10"
          style={{ marginLeft: '40px', marginRight: '16px' }}
        >
          {/* Grid lines - more prominent */}
          <line x1="0" y1={height * 0.2} x2={width} y2={height * 0.2} stroke="currentColor" strokeWidth="0.15" className="text-border opacity-40" />
          <line x1="0" y1={height * 0.4} x2={width} y2={height * 0.4} stroke="currentColor" strokeWidth="0.15" className="text-border opacity-40" />
          <line x1="0" y1={height * 0.6} x2={width} y2={height * 0.6} stroke="currentColor" strokeWidth="0.15" className="text-border opacity-40" />
          <line x1="0" y1={height * 0.8} x2={width} y2={height * 0.8} stroke="currentColor" strokeWidth="0.15" className="text-border opacity-40" />

          {/* Zero line (horizontal) - highlight when earnings can be negative */}
          {minEarnings < 0 && maxEarnings > 0 && (
            <line 
              x1="0" 
              y1={height - ((-minEarnings) / range) * height} 
              x2={width} 
              y2={height - ((-minEarnings) / range) * height} 
              stroke="currentColor" 
              strokeWidth="0.4" 
              strokeDasharray="3,2"
              className="text-brand-strong opacity-60" 
            />
          )}

          {/* Vertical lines for each data point */}
          {pathPoints.map((p, i) => (
            <line
              key={`v-${i}`}
              x1={p.x}
              y1="0"
              x2={p.x}
              y2={height}
              stroke="currentColor"
              strokeWidth="0.08"
              className="text-border opacity-20"
            />
          ))}

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#gradient)"
            opacity="0.3"
          />

          {/* Shadow line for depth */}
          <path
            d={linePath}
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0, 0.5)"
          />

          {/* Main line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {pathPoints.map((p, i) => {
            const isHighest = p.index === maxIndex
            const isLowest = p.index === minIndex
            const isSpecial = isHighest || isLowest
            const isFirst = i === 0
            const isLast = i === pathPoints.length - 1
            const pointChange = p.point.change
            const isPositiveChange = pointChange > 0n
            const isNegativeChange = pointChange < 0n
            
            return (
              <g key={i}>
                {/* Glow effect for special points */}
                {isSpecial && (
                  <>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="3"
                      fill="currentColor"
                      className={isHighest ? 'text-green-500' : 'text-orange-500'}
                      opacity="0.2"
                    >
                      <animate
                        attributeName="r"
                        values="3;4.5;3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.2;0.4;0.2"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                )}
                
                {/* Outer circle with gradient */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSpecial ? "2" : isFirst || isLast ? "1.5" : "1"}
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="0.35"
                  className={
                    isSpecial 
                      ? isHighest ? 'text-green-600' : 'text-orange-600'
                      : isPositiveChange ? 'text-green-500'
                      : isNegativeChange ? 'text-red-500'
                      : 'text-brand'
                  }
                  opacity="1"
                >
                  {/* Pulse animation for special points */}
                  {isSpecial && (
                    <animate
                      attributeName="r"
                      values={isSpecial ? "2;2.5;2" : "1;1.2;1"}
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
                
                {/* Inner filled circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSpecial ? "1.4" : isFirst || isLast ? "1" : "0.6"}
                  fill="currentColor"
                  className={
                    isSpecial 
                      ? isHighest ? 'text-green-600' : 'text-orange-600'
                      : isPositiveChange ? 'text-green-500'
                      : isNegativeChange ? 'text-red-500'
                      : 'text-brand'
                  }
                  opacity="1"
                />
                
                {/* Label for special points with background */}
                {isSpecial && (
                  <>
                    {/* Background rect for text */}
                    <rect
                      x={p.x - 6}
                      y={isHighest ? p.y - 8 : p.y + 3}
                      width="12"
                      height="4"
                      rx="1"
                      fill="white"
                      opacity="0.95"
                    />
                    <text
                      x={p.x}
                      y={isHighest ? p.y - 5 : p.y + 6.5}
                      textAnchor="middle"
                      fontSize="3"
                      fontWeight="bold"
                      fill="currentColor"
                      className={isHighest ? 'text-green-700' : 'text-orange-700'}
                    >
                      {isHighest ? '↑' : '↓'} {formatFoodShort(p.point.earnings)}
                    </text>
                  </>
                )}
                
                {/* Small labels for first and last points */}
                {(isFirst || isLast) && !isSpecial && (
                  <>
                    <rect
                      x={p.x - 5}
                      y={isFirst ? p.y + 3 : p.y - 7}
                      width="10"
                      height="3.5"
                      rx="0.8"
                      fill="white"
                      opacity="0.9"
                    />
                    <text
                      x={p.x}
                      y={isFirst ? p.y + 6 : p.y - 4}
                      textAnchor="middle"
                      fontSize="2.5"
                      fontWeight="600"
                      fill="currentColor"
                      className="text-muted-strong"
                    >
                      {formatFoodShort(p.point.earnings)}
                    </text>
                  </>
                )}
                
                {/* Interactive hover circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill="transparent"
                  className="cursor-pointer transition-all"
                  style={{ 
                    filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))'
                  }}
                >
                  <title>Round {p.point.roundId}: {formatFoodShort(p.point.earnings)} FOOD{'\n'}Change: {pointChange >= 0n ? '+' : ''}{formatFoodShort(pointChange)}</title>
                  <animate
                    attributeName="r"
                    from="3"
                    to="4"
                    dur="0.3s"
                    begin="mouseover"
                    fill="freeze"
                  />
                  <animate
                    attributeName="r"
                    from="4"
                    to="3"
                    dur="0.3s"
                    begin="mouseout"
                    fill="freeze"
                  />
                </circle>
              </g>
            )
          })}

          {/* Gradients */}
          <defs>
            {/* Green gradient for positive earnings */}
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              {(earnings[earnings.length - 1] ?? 0) >= 0 ? (
                <>
                  <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.05" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0.4" />
                </>
              )}
            </linearGradient>
            {/* Line gradient based on overall trend */}
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" />
              <stop offset="50%" stopColor="rgb(217, 70, 239)" />
              <stop offset="100%" stopColor="rgb(236, 72, 153)" />
            </linearGradient>
          </defs>
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-3 px-10 text-xs font-semibold text-muted-strong">
          <span className="bg-surface px-2 py-0.5 rounded border border-border">Start</span>
          <span className="text-brand-strong bg-brand/10 px-3 py-0.5 rounded border border-brand/30">
            {points.length} rounds played
          </span>
          <span className="bg-surface px-2 py-0.5 rounded border border-border">Round {points[points.length - 1]?.roundId || 0}</span>
        </div>

        {/* Trend indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-surface/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-border shadow-sm">
          {(earnings[earnings.length - 1] ?? 0) >= 0 ? (
            <>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-600">Profitable</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-600">Loss</span>
            </>
          )}
        </div>

        {/* Cat decoration */}
        <div className="absolute bottom-2 right-2 opacity-20">
          <CatIllustration type="yarn" size="sm" />
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-surface border border-border px-3 py-2.5 text-center group hover:border-green-400 hover:bg-green-50/50 hover:shadow-lg transition-all duration-300 cursor-default">
          <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
            <Icon name="success" className="h-3.5 w-3.5 group-hover:animate-bounce" />
            <span className="text-xs font-semibold uppercase tracking-wider">Best</span>
          </div>
          <div className="text-lg font-bold text-fg group-hover:text-green-600 group-hover:scale-110 transition-all duration-300">
            {formatFoodShort(points[maxIndex]?.earnings || 0n)}
          </div>
          <div className="text-xs text-muted">Round {points[maxIndex]?.roundId}</div>
        </div>

        <div className="rounded-xl bg-surface border border-border px-3 py-2.5 text-center group hover:border-brand hover:bg-brand/5 hover:shadow-lg transition-all duration-300 cursor-default">
          <div className="flex items-center justify-center gap-1 text-brand-strong mb-1">
            <Icon name="treasury" className="h-3.5 w-3.5 group-hover:animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
          </div>
          <div className="text-lg font-bold text-fg group-hover:text-brand-strong group-hover:scale-110 transition-all duration-300">
            {formatFoodShort(points[points.length - 1]?.earnings || 0n)}
          </div>
          <div className="text-xs text-muted">Net Earnings</div>
        </div>

        <div className="rounded-xl bg-surface border border-border px-3 py-2.5 text-center group hover:border-orange-400 hover:bg-orange-50/50 hover:shadow-lg transition-all duration-300 cursor-default">
          <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
            <Icon name="alert" className="h-3.5 w-3.5 group-hover:animate-bounce" />
            <span className="text-xs font-semibold uppercase tracking-wider">Worst</span>
          </div>
          <div className="text-lg font-bold text-fg group-hover:text-orange-600 group-hover:scale-110 transition-all duration-300">
            {formatFoodShort(points[minIndex]?.earnings || 0n)}
          </div>
          <div className="text-xs text-muted">Round {points[minIndex]?.roundId}</div>
        </div>
      </div>

      {/* Recent changes */}
      <div className="rounded-xl bg-surface-subtle border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="history" className="h-4 w-4 text-brand-strong" />
          <span className="text-sm font-semibold text-fg">Recent Activity</span>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {points.slice(-5).reverse().map((point, i) => {
            const change = point.change
            const isPositive = change > 0n
            const isNeutral = change === 0n
            
            return (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-surface transition">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted">R{point.roundId}</span>
                  <span className="text-xs text-muted-strong">
                    {new Date(point.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-fg">
                    {formatFoodShort(point.earnings)} FOOD
                  </span>
                  {!isNeutral && (
                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? '+' : ''}{formatFoodShort(change)}
                      {isPositive ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
