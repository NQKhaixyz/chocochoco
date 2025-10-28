import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      aria-label="Loading"
    />
  )
}

interface LoadingOverlayProps {
  message?: string
  transparent?: boolean
}

export function LoadingOverlay({ message = 'Loading...', transparent = false }: LoadingOverlayProps) {
  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${transparent ? 'bg-black/20' : 'bg-background/80'}
        backdrop-blur-sm
      `}
    >
      <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-card border border-border shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = 'Loading...', className = '' }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 p-8 ${className}`}>
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// Skeleton loader components
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-surface rounded ${className}`}
      aria-label="Loading"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

// Inline loading button state
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
}

export function LoadingButton({ 
  loading = false, 
  children, 
  disabled,
  className = '',
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
}

// Transaction pending state
interface TransactionPendingProps {
  txHash?: string
  explorerUrl?: string
  message?: string
}

export function TransactionPending({ 
  txHash, 
  explorerUrl, 
  message = 'Transaction pending...' 
}: TransactionPendingProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <LoadingSpinner />
        <span className="font-medium">{message}</span>
      </div>
      {txHash && explorerUrl && (
        <a
          href={`${explorerUrl}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand hover:underline block"
        >
          View on Explorer →
        </a>
      )}
      <p className="text-xs text-muted-foreground">
        This may take a few moments. Please don't close this window.
      </p>
    </div>
  )
}
