import React, { useMemo } from 'react'
import type { Abi } from 'viem'
import { useAccount } from 'wagmi'
import { useRoundResults } from '../hooks/useRoundResults'
import { useClaimTreat } from '../hooks/useClaimTreat'
import { txLink } from '../lib/explorer'
import WinLoseAnimation from './WinLoseAnimation'
import Tooltip from './ui/Tooltip'

function Toast({ kind, msg }: { kind: 'success' | 'error' | 'info'; msg: string }) {
  const color = kind === 'success' ? 'text-green-600' : kind === 'error' ? 'text-red-600' : 'text-gray-700'
  return <div className={`${color} text-sm`}>{msg}</div>
}

export default function ResultPanel({
  roundId,
  contractAddress,
  contractAbi,
  fnGetInfo = 'rounds',
  fnHasClaimed = 'claimed',
  fnPlayerRevealed = 'revealed',
  eventRoundMeowed = 'RoundMeowed',
  fnClaim = 'claimTreat',
  playerArgInClaim = false,
}: {
  roundId: bigint
  contractAddress: `0x${string}`
  contractAbi: Abi
  fnGetInfo?: string
  fnHasClaimed?: string
  fnPlayerRevealed?: string
  eventRoundMeowed?: string
  fnClaim?: string
  playerArgInClaim?: boolean
}) {
  const { address, isConnected } = useAccount()
  const rr = useRoundResults({
    roundId,
    contractAddress,
    contractAbi,
    fnGetInfo,
    fnHasClaimed,
    fnPlayerRevealed,
    eventRoundMeowed,
  })
  const { claim, txHash, isPending, writeError, receipt } = useClaimTreat()

  const statusText = useMemo(() => {
    if (!rr.isSettled) return 'Round not settled yet'
    if (rr.playerSide == null) return 'You did not join this round'
    if (rr.winnerSide == null) return 'Winner not determined (tie)'
    return rr.playerSide === rr.winnerSide ? 'You are on the WINNING side 🎉' : 'You are on the LOSING side'
  }, [rr.isSettled, rr.playerSide, rr.winnerSide])

  const canClaim = rr.isSettled && rr.isWinner && !rr.hasClaimed && isConnected

  async function onClaim() {
    if (!address) return
    try {
      await claim({
        contractAddress,
        contractAbi,
        functionName: fnClaim,
        roundId,
        extraArgs: playerArgInClaim ? [address] : [],
      })
    } catch {
      // handled by writeError
    }
  }

  return (
    <div id="result-panel" className="max-w-xl w-full space-y-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <h2 className="text-xl font-semibold">Round Results #{roundId.toString()}</h2>

      <div className="space-y-1 text-sm">
        <div>
          Status: <span className="font-medium">{statusText}</span>
        </div>
        {rr.isSettled && rr.winnerSide != null && (
          <div>
            Minority (winner): <span className="font-mono">{rr.winnerSide === 1 ? 'Milk' : 'Cacao'}</span>
          </div>
        )}
        {rr.playerSide != null && (
          <div>
            Your choice: <span className="font-mono">{rr.playerSide === 1 ? 'Milk' : rr.playerSide === 2 ? 'Cacao' : 'None'}</span>
          </div>
        )}
        {rr.hasClaimed && <div className="text-green-700">Claimed ✅</div>}
      </div>

      {rr.isSettled && rr.winnerSide != null && (
        <WinLoseAnimation result={rr.isWinner ? 'win' : 'lose'} />
      )}

      <div className="flex items-center gap-3">
        <Tooltip tip="Only the winning side can claim. Double-claim prevented.">
          <button onClick={onClaim} disabled={!canClaim || isPending} className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50">
            {isPending ? 'Claiming…' : 'Claim'}
          </button>
        </Tooltip>
        {txHash && (
          <a className="text-sm underline" target="_blank" rel="noreferrer" href={txLink(rr.chainId, txHash)}>
            View Tx
          </a>
        )}
      </div>

      {!rr.isSettled && <Toast kind="info" msg="⌛ Waiting for round to settle (RoundMeowed)..." />}
      {rr.isSettled && !rr.isWinner && <Toast kind="info" msg="ℹ️ Only the winning side can claim." />}
      {rr.isSettled && rr.isWinner && rr.hasClaimed && <Toast kind="success" msg="🎉 You have already claimed." />}
      {writeError && <Toast kind="error" msg={(writeError as any).shortMessage || (writeError as any).message} />}
      {receipt.data && (
        <Toast kind="success" msg={`✅ Claim successful at block ${receipt.data.blockNumber?.toString()}`} />
      )}
    </div>
  )
}
