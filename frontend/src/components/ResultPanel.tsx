import React, { useMemo } from 'react'
import type { Abi } from 'viem'
import { useAccount } from 'wagmi'
import { useRoundResults } from '../hooks/useRoundResults'
import { useClaimTreat } from '../hooks/useClaimTreat'
import { txLink } from '../lib/explorer'

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
    if (!rr.isSettled) return 'Round chưa chốt kết quả'
    if (rr.playerSide == null) return 'Bạn không tham gia round này'
    if (rr.winnerSide == null) return 'Chưa xác định phe thắng (hoà)'
    return rr.playerSide === rr.winnerSide ? 'Bạn thuộc phe THẮNG 🎉' : 'Bạn thuộc phe THUA'
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
    <div className="max-w-xl w-full space-y-4 rounded-2xl border p-4">
      <h2 className="text-xl font-semibold">Kết quả Round #{roundId.toString()}</h2>

      <div className="space-y-1 text-sm">
        <div>
          Trạng thái: <span className="font-medium">{statusText}</span>
        </div>
        {rr.isSettled && rr.winnerSide != null && (
          <div>
            Minority (winner): <span className="font-mono">{rr.winnerSide === 1 ? 'Milk' : 'Cacao'}</span>
          </div>
        )}
        {rr.playerSide != null && (
          <div>
            Bạn chọn: <span className="font-mono">{rr.playerSide === 1 ? 'Milk' : rr.playerSide === 2 ? 'Cacao' : 'None'}</span>
          </div>
        )}
        {rr.hasClaimed && <div className="text-green-700">Đã nhận thưởng ✅</div>}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onClaim} disabled={!canClaim || isPending} className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50">
          {isPending ? 'Claiming…' : 'Claim'}
        </button>
        {txHash && (
          <a className="text-sm underline" target="_blank" rel="noreferrer" href={txLink(rr.chainId, txHash)}>
            View Tx
          </a>
        )}
      </div>

      {!rr.isSettled && <Toast kind="info" msg="⏳ Chờ round được chốt (RoundMeowed)..." />}
      {rr.isSettled && !rr.isWinner && <Toast kind="info" msg="ℹ️ Chỉ phe thắng mới claim được." />}
      {rr.isSettled && rr.isWinner && rr.hasClaimed && <Toast kind="success" msg="🎉 Bạn đã claim rồi." />}
      {writeError && <Toast kind="error" msg={(writeError as any).shortMessage || (writeError as any).message} />}
      {receipt.data && (
        <Toast kind="success" msg={`✅ Claim thành công ở block ${receipt.data.blockNumber?.toString()}`} />
      )}
    </div>
  )
}

