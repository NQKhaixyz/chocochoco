import { useEffect, useMemo, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { fromHex, saltKey, toHex, Tribe, computeCommitment } from '../lib/solana-commit'
import { useWallet } from '@solana/wallet-adapter-react'
import { useLatestRound } from '../hooks/useLatestRound'

export default function SolanaRevealPanel() {
  const { publicKey } = useWallet()
  const { loading, error: roundError, round } = useLatestRound()
  const [tribe, setTribe] = useState<Tribe>('Milk')
  const [saltHex, setSaltHex] = useState('')
  const [computedCommit, setComputedCommit] = useState('')
  const [error, setError] = useState<string | null>(null)

  const canReveal = useMemo(() => !!publicKey && !!round?.id && !!saltHex, [publicKey, round?.id, saltHex])

  useEffect(() => {
    if (!publicKey || !round?.id) return
    const saved = localStorage.getItem(saltKey(round.id, publicKey.toBase58()))
    if (saved) setSaltHex(saved)
  }, [publicKey, round?.id])

  async function recompute() {
    try {
      setError(null)
      if (!publicKey) throw new Error('Please connect Solana wallet')
      if (!round?.id) throw new Error('No current round')
      const roundPk = new PublicKey(round.id)
      const salt = fromHex(saltHex)
      const c = await computeCommitment(tribe, salt, publicKey, roundPk)
      setComputedCommit(toHex(c))
    } catch (e: any) {
      setError(e?.message || String(e))
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
      <h3 className="text-lg font-semibold">Reveal</h3>
      <div className="grid gap-3">
        <div className="text-sm text-slate-600">
          {loading ? 'Loading current round…' : round?.id ? (
            <>
              Current round: <span className="font-mono">{round.id}</span>
            </>
          ) : (
            <span className="text-red-600">{roundError ?? 'Current round not found'}</span>
          )}
        </div>
        <label className="text-sm">
          Salt (hex)
          <input
            value={saltHex}
            onChange={(e) => setSaltHex(e.target.value.trim())}
            placeholder="64 hex chars"
            className="mt-1 w-full rounded border px-3 py-2 font-mono"
          />
        </label>
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="tribe2" checked={tribe === 'Milk'} onChange={() => setTribe('Milk')} />
            Milk
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="tribe2" checked={tribe === 'Cacao'} onChange={() => setTribe('Cacao')} />
            Cacao
          </label>
        </div>
        <button
          onClick={recompute}
          disabled={!canReveal}
          className="px-6 py-3 rounded-2xl bg-indigo-600 text-white disabled:opacity-50"
        >
          Compute Reveal Hash
        </button>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {computedCommit && (
          <div className="text-xs">
            <div className="font-medium">Expected Commitment (sha256 hex):</div>
            <code className="break-all">{computedCommit}</code>
          </div>
        )}
        <div className="text-xs text-gray-600">
          Send reveal via <code>reveal_meow</code> instruction per the IDL (args: tribe, salt[32]).
        </div>
      </div>
    </div>
  )
}
