import React, { useEffect, useMemo, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import type { Abi } from 'viem'
import {
  buildCommitment,
  buildCommitmentFull,
  loadOrCreateSalt,
  parseStakeToWei,
  toHex,
  type Side,
} from '../lib/commit'
import { useCommitTx } from '../hooks/useCommitTx'
import Tooltip from './ui/Tooltip'
import { toastDanger, toastInfo, toastSuccess } from '../lib/toast'

type Props = {
  roundId: bigint
  contractAddress: `0x${string}`
  contractAbi: Abi
  functionName?: 'commitMeow' | 'commit'
  payable?: boolean
  commitmentSchema?: 'simple' | 'full'
}

function explorerTx(chainId: number, hash: `0x${string}`) {
  switch (chainId) {
    case 84532:
      return `https://sepolia.basescan.org/tx/${hash}`
    case 80001:
      return `https://mumbai.polygonscan.com/tx/${hash}`
    case 80002:
      return `https://amoy.polygonscan.com/tx/${hash}`
    default:
      return `https://etherscan.io/tx/${hash}`
  }
}

export default function CommitPanel(props: Props) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { commit, txHash, isPending, writeError, receipt } = useCommitTx()

  const [side, setSide] = useState<Side>('Milk')
  const [stake, setStake] = useState<string>('0.01')
  const [saltHex, setSaltHex] = useState<`0x${string}` | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected || !address) return
    const salt = loadOrCreateSalt(props.roundId, address)
    setSaltHex(toHex(salt))
  }, [isConnected, address, props.roundId])

  const stakeWei = useMemo(() => {
    try {
      return parseStakeToWei(stake)
    } catch {
      return 0n
    }
  }, [stake])

  const onCommit = async () => {
    setError(null)
    if (!isConnected || !address) {
      setError('Please connect wallet')
      return
    }
    if (!saltHex) {
      setError('Unable to generate salt')
      return
    }
    if (stakeWei <= 0n) {
      setError('Stake must be > 0')
      return
    }

    const commitment =
      (props.commitmentSchema ?? 'simple') === 'full'
        ? buildCommitmentFull({ side, roundId: props.roundId, address, stakeWei })
        : buildCommitment({ side, salt: fromHexSafe(saltHex) })

    try {
      await commit({
        address: props.contractAddress,
        abi: props.contractAbi,
        functionName: props.functionName ?? 'commitMeow',
        commitment,
        stakeWei,
        payable: props.payable ?? true,
      })
      toastInfo('Commit submitted', 'Transaction sent. Waiting for confirmation…', 'just now')
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || 'Commit failed')
      toastDanger('Commit failed', e?.shortMessage || e?.message || 'Commit failed')
    }
  }

  const short = (a?: `0x${string}`) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '')

  useEffect(() => {
    if (receipt.data) {
      toastSuccess('Commit confirmed', `Included in block ${receipt.data.blockNumber?.toString()}`)
    }
  }, [receipt.data])

  return (
    <div id="commit-panel" className="max-w-xl w-full space-y-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <h2 className="text-xl font-semibold">Commit — Choose side &amp; Stake</h2>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">Side:</span>
        {(['Milk', 'Cacao'] as Side[]).map((s) => (
          <button
            key={s}
            className={`px-4 py-2 rounded-xl border ${
              side === s ? 'bg-black text-white dark:bg-white dark:text-black' : ''
            }`}
            onClick={() => setSide(s)}
          >
            {s}
          </button>
        ))}
        <Tooltip tip="Milk=1, Cacao=2. Minority wins.">
          <span className="text-xs text-muted">(?)</span>
        </Tooltip>
      </div>

      <div>
        <label className="block text-sm mb-1 flex items-center gap-2">
          <span>Stake (ETH/MATIC)</span>
          <Tooltip tip="Enter native coin amount to send.">
            <span className="text-xs text-muted">(?)</span>
          </Tooltip>
        </label>
        <input
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="0.01"
          inputMode="decimal"
        />
        <p className="text-xs text-gray-500 mt-1">Will send {stake || '0'} as value if payable.</p>
      </div>

      <div className="text-sm space-y-1">
        <div>
          Round: <span className="font-mono">{props.roundId.toString()}</span>
        </div>
        <div>
          Address: <span className="font-mono">{short(address)}</span>
        </div>
        <div>
          Salt: <span className="font-mono break-all">{saltHex ?? '—'}</span>
        </div>
        <div>
          ChainId: <span className="font-mono">{chainId}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Tooltip tip="Generate local salt → hash → send commit tx.">
          <button onClick={onCommit} disabled={isPending} className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-60">
            {isPending ? 'Submitting…' : 'Commit'}
          </button>
        </Tooltip>
        {txHash && (
          <a className="text-sm underline" target="_blank" rel="noreferrer" href={explorerTx(chainId, txHash)}>
            View Tx
          </a>
        )}
      </div>

      {error && <div className="text-red-600 text-sm">❌ {error}</div>}
      {writeError && (
        <div className="text-red-600 text-sm">❌ {writeError.shortMessage || (writeError as any).message}</div>
      )}
      {receipt.data && (
        <div className="text-green-600 text-sm">✅ Mined in block {receipt.data.blockNumber?.toString()}</div>
      )}
    </div>
  )
}

function fromHexSafe(hex: `0x${string}`): Uint8Array {
  const h = hex.slice(2)
  const out = new Uint8Array(h.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(2 * i, 2 * i + 2), 16)
  return out
}
