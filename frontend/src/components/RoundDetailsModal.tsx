import { X } from 'lucide-react'
import { useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'
import * as demo from '../lib/demo-rounds'
import type { DemoRound, DemoPlayerRound } from '../lib/demo-rounds'

interface RoundDetailsModalProps {
  roundId: number
  playerAddress?: string
  onClose: () => void
}

export function RoundDetailsModal({ roundId, playerAddress, onClose }: RoundDetailsModalProps) {
  const round = useMemo(() => demo.getRound(roundId), [roundId])
  const playerRound = useMemo(() => {
    if (!playerAddress) return null
    try {
      const pubkey = new PublicKey(playerAddress)
      return demo.getPlayerRound(roundId, pubkey)
    } catch {
      return null
    }
  }, [roundId, playerAddress])

  if (!round) {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="text-center text-muted-foreground">Round not found</div>
      </ModalOverlay>
    )
  }

  const winnerText = round.winnerSide === 'Milk' ? '🥛 Milk' : round.winnerSide === 'Cacao' ? '🍫 Cacao' : 'Tie'
  const totalStake = BigInt(round.countMilk + round.countCacao) * round.stakeLamports
  const fee = (totalStake * BigInt(round.feeBps)) / 10000n
  const distributedPool = totalStake - fee

  const formatFOOD = (lamports: bigint) => {
    const whole = lamports / 1_000_000_000n
    const frac = (lamports % 1_000_000_000n).toString().padStart(9, '0').slice(0, 3)
    return `${whole}.${frac} FOOD`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Round #{roundId} Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Round Status */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Status</h3>
            <div className="space-y-2">
              <InfoRow
                label="Phase"
                value={
                  round.isFinalized ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">Finalized</span>
                  ) : (
                    <span className="text-orange-600 dark:text-orange-400 font-medium">Active</span>
                  )
                }
              />
              {round.isFinalized && round.winnerSide && (
                <InfoRow label="Winner" value={<span className="font-semibold">{winnerText}</span>} />
              )}
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Timeline</h3>
            <div className="space-y-2 text-sm">
              <TimelineRow label="Started" time={round.startTime} />
              <TimelineRow label="Commit Ends" time={round.commitEndTime} />
              <TimelineRow label="Reveal Ends" time={round.revealEndTime} />
              <TimelineRow label="Finalize" time={round.finalizeTime} />
            </div>
          </section>

          {/* Participants */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Participants</h3>
            <div className="grid grid-cols-2 gap-4">
              <ParticipantCard
                tribe="Milk"
                emoji="🥛"
                count={round.countMilk}
                isWinner={round.winnerSide === 'Milk'}
              />
              <ParticipantCard
                tribe="Cacao"
                emoji="🍫"
                count={round.countCacao}
                isWinner={round.winnerSide === 'Cacao'}
              />
            </div>
          </section>

          {/* Economics */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Economics</h3>
            <div className="space-y-2">
              <InfoRow label="Stake per player" value={formatFOOD(round.stakeLamports)} />
              <InfoRow label="Total stake" value={formatFOOD(totalStake)} />
              <InfoRow label="Treasury fee" value={`${formatFOOD(fee)} (${round.feeBps / 100}%)`} />
              <InfoRow label="Distributed pool" value={formatFOOD(distributedPool)} />
            </div>
          </section>

          {/* Your Participation */}
          {playerRound && (
            <section className="bg-brand/5 rounded-lg p-4 border border-brand/20">
              <h3 className="text-sm font-semibold text-brand mb-3">Your Participation</h3>
              <div className="space-y-2">
                <InfoRow
                  label="Choice"
                  value={
                    <span className="font-medium">
                      {playerRound.tribe === 'Milk' ? '🥛 Milk' : '🍫 Cacao'}
                    </span>
                  }
                />
                <InfoRow
                  label="Committed"
                  value={formatDate(playerRound.committedAt)}
                />
                <InfoRow
                  label="Revealed"
                  value={
                    playerRound.revealed ? (
                      <span className="text-green-600 dark:text-green-400">✓ Yes</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">✗ No</span>
                    )
                  }
                />
                <InfoRow
                  label="Claimed"
                  value={
                    playerRound.claimed ? (
                      <span className="text-green-600 dark:text-green-400">✓ Yes</span>
                    ) : (
                      <span className="text-muted-foreground">Not yet</span>
                    )
                  }
                />
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface/50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-lg bg-brand text-white hover:bg-brand/90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// Helper Components

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}

function TimelineRow({ label, time }: { label: string; time: number }) {
  const date = new Date(time * 1000)
  const now = Date.now()
  const isPast = date.getTime() < now
  
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono text-sm ${isPast ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
        {date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </div>
  )
}

function ParticipantCard({
  tribe,
  emoji,
  count,
  isWinner,
}: {
  tribe: string
  emoji: string
  count: number
  isWinner: boolean
}) {
  return (
    <div
      className={`
        rounded-lg p-4 border-2 transition
        ${isWinner ? 'border-green-500/50 bg-green-500/10' : 'border-border bg-surface'}
      `}
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="font-semibold">{tribe}</div>
      <div className="text-2xl font-bold mt-1">{count}</div>
      <div className="text-xs text-muted-foreground">
        {count === 1 ? 'player' : 'players'}
      </div>
      {isWinner && (
        <div className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
          🏆 Winner
        </div>
      )}
    </div>
  )
}
