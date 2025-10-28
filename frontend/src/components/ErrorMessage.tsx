import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  type?: 'error' | 'warning' | 'network'
  className?: string
}

export function ErrorMessage({ 
  title = 'Error', 
  message, 
  onRetry, 
  type = 'error',
  className = ''
}: ErrorMessageProps) {
  const isNetwork = type === 'network'
  const isWarning = type === 'warning'
  
  const Icon = isNetwork ? WifiOff : AlertCircle
  
  const colorClasses = isWarning 
    ? 'bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400'
    : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'

  return (
    <div className={`rounded-lg border p-4 ${colorClasses} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-sm opacity-90">{message}</div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Specific error types
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      type="network"
      title="Network Error"
      message="Unable to connect to the network. Please check your internet connection and try again."
      onRetry={onRetry}
    />
  )
}

export function WalletConnectionError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      type="error"
      title="Wallet Connection Failed"
      message="Unable to connect to your wallet. Please make sure your wallet extension is installed and unlocked."
      onRetry={onRetry}
    />
  )
}

export function TransactionError({ 
  message, 
  onRetry 
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <ErrorMessage
      type="error"
      title="Transaction Failed"
      message={message || "Your transaction couldn't be processed. Please try again or check your wallet for details."}
      onRetry={onRetry}
    />
  )
}

export function InsufficientFundsError() {
  return (
    <ErrorMessage
      type="warning"
      title="Insufficient Funds"
      message="You don't have enough tokens to complete this transaction. Please add funds to your wallet and try again."
    />
  )
}

// Normalize common blockchain errors
export function normalizeBlockchainError(error: any): string {
  const message = error?.message || error?.toString() || 'Unknown error'
  
  // User rejected
  if (/user rejected|denied/i.test(message)) {
    return 'Transaction was cancelled'
  }
  
  // Insufficient funds
  if (/insufficient funds|insufficient balance/i.test(message)) {
    return 'Insufficient funds to complete this transaction'
  }
  
  // Network errors
  if (/network|timeout|connection/i.test(message)) {
    return 'Network error. Please check your connection and try again'
  }
  
  // Gas errors
  if (/gas|fee/i.test(message)) {
    return 'Transaction fee too high or insufficient gas'
  }
  
  // Contract errors
  if (/revert|execution reverted/i.test(message)) {
    // Try to extract revert reason
    const match = message.match(/execution reverted: (.+?)["']?$/i)
    if (match) {
      return `Contract error: ${match[1]}`
    }
    return 'Transaction failed: Contract execution reverted'
  }
  
  // Nonce errors
  if (/nonce/i.test(message)) {
    return 'Transaction nonce error. Please reset your wallet or try again'
  }
  
  // Already processed
  if (/already|duplicate/i.test(message)) {
    return 'This action has already been completed'
  }
  
  // Deadline/timing
  if (/deadline|expired|too late|too early/i.test(message)) {
    return 'Transaction deadline expired. Please try again'
  }
  
  return message
}
