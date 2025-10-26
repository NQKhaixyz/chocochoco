import React, { useEffect, useMemo, useState } from 'react'
import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import type { Abi } from 'viem'
import { sideToUint, saltStorageKey } from '../lib/commit'
import Countdown from './Countdown'
import Tooltip from './ui/Tooltip'
import { txLink } from '../lib/explorer'

type Props = {
  round: {
    id: bigint
    commitEnd: bigint
    revealEnd: bigint
  }
  contractAddress: `0x${string}`
  contractAbi: Abi
  functionName?: 'revealMeow' | 'reveal'
}

export default function RevealPanel({ round, contractAddress, contractAbi, functionName }: Props) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: !!hash } })

  const [side, setSide] = useState<'Milk' | 'Cacao'>('Milk')
  const [salt, setSalt] = useState<`0x${string}` | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  // Load local salt
  useEffect(() => {
    if (!isConnected || !address) return
    const key = saltStorageKey(round.id, address)
    const s = typeof localStorage !== 'undefined' ? (localStorage.getItem(key) as `0x${string}` | null) : null
    setSalt(s)
  }, [isConnected, address, round.id])

  const now = Math.floor(Date.now() / 1000)
  const commitEnd = Number(round.commitEnd)
  const revealEnd = Number(round.revealEnd)
  const canReveal = now >= commitEnd && now < revealEnd
  const tooEarly = now < commitEnd
  const expired = now >= revealEnd

  const friendlyError = useMemo(() => {
    const msg = (writeError as any)?.shortMessage || (writeError as any)?.message || ''
    if (!msg) return null
    if (/BadReveal|mismatch/i.test(msg)) return '❌ Sai salt hoặc phe đã chọn.'
    if (/RevealClosed|window|deadline|closed/i.test(msg)) return '⏰ Không trong thời gian reveal.'
    return null
  }, [writeError])

  async function onReveal() {
    setErrMsg(null)
    if (!isConnected || !address) {
      setErrMsg('Vui lòng kết nối ví')
      return
    }
    if (!salt) {
      setErrMsg('Không tìm thấy salt. Có thể bạn chưa commit hoặc đã xoá cache.')
      return
    }
    if (!canReveal) {
      setErrMsg('Không trong thời gian reveal')
      return
    }

    const fn = functionName ?? 'revealMeow'
    const choice = sideToUint(side)
    try {
      await writeContract({ address: contractAddress, abi: contractAbi, functionName: fn, args: [choice, salt] })
    } catch (e: any) {
      const msg = e?.shortMessage || e?.message || 'Reveal thất bại'
      if (/BadReveal|mismatch/i.test(msg)) setErrMsg('❌ Sai salt hoặc phe đã chọn.')
      else if (/RevealClosed|window|deadline|closed/i.test(msg)) setErrMsg('⏰ Không trong thời gian reveal.')
      else setErrMsg(msg)
    }
  }

  return (
    <div id="reveal-panel" className="max-w-xl w-full space-y-4 rounded-xl2 border border-border bg-card p-4 shadow-soft">
      <h2 className="text-xl font-semibold">Reveal Phase</h2>

      <div className="text-sm">
        <div>Round: {round.id.toString()}</div>
        <div>
          Reveal ends in: <Countdown endTime={revealEnd} />
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        {(['Milk', 'Cacao'] as const).map((s) => (
          <button key={s} onClick={() => setSide(s)} className={`px-4 py-2 rounded-xl border ${side === s ? 'bg-black text-white' : ''}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="text-sm font-mono break-all">Salt: {salt ?? '—'}</div>

      <div className="mt-3">
        <Tooltip tip="Chỉ bấm trong thời gian Reveal, dùng đúng salt.">
          <button onClick={onReveal} disabled={isPending || tooEarly || expired} className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50">
            {isPending ? 'Revealing…' : expired ? 'Expired' : tooEarly ? 'Not open yet' : 'Reveal'}
          </button>
        </Tooltip>
        {hash && (
          <a href={txLink(chainId, hash)} target="_blank" rel="noreferrer" className="ml-3 text-sm underline">
            View Tx
          </a>
        )}
      </div>

      {errMsg && <div className="text-red-600 text-sm">{errMsg}</div>}
      {friendlyError && <div className="text-red-600 text-sm">{friendlyError}</div>}
      {receipt.data && (
        <div className="text-green-600 text-sm">✅ Revealed in block {receipt.data.blockNumber?.toString()}</div>
      )}
    </div>
  )
}
