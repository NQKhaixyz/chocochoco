import { useMemo, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { computeCommitment, randomSalt32, saltKey, toHex, Tribe } from '../lib/solana-commit'
import { useWallet } from '@solana/wallet-adapter-react'
import { useLatestRound } from '../hooks/useLatestRound'

export default function SolanaCommitPanel() {
  const { publicKey } = useWallet()
  const { loading, error: roundError, round } = useLatestRound()
  const [tribe, setTribe] = useState<Tribe>('Milk')
  const [saltHex, setSaltHex] = useState('')
  const [commitHex, setCommitHex] = useState('')
  const [error, setError] = useState<string | null>(null)

  const canCompute = useMemo(() => !!publicKey && !!round?.id, [publicKey, round?.id])

  async function generate() {
    try {
      setError(null)
      if (!publicKey) throw new Error('Vui lòng connect ví Solana')
      if (!round?.id) throw new Error('Chưa có round hiện tại')
      const roundPk = new PublicKey(round.id)
      const salt = randomSalt32()
      const commitment = await computeCommitment(tribe, salt, publicKey, roundPk)
      const saltHexStr = toHex(salt)
      const commitHexStr = toHex(commitment)
      setSaltHex(saltHexStr)
      setCommitHex(commitHexStr)
      // persist salt for reveal later
      localStorage.setItem(saltKey(roundPk.toBase58(), publicKey.toBase58()), saltHexStr)
    } catch (e: any) {
      setError(e?.message || String(e))
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
      <h3 className="text-lg font-semibold">Commit</h3>
      <div className="grid gap-3">
        <div className="text-sm text-slate-600">
          {loading ? 'Đang tải round hiện tại…' : round?.id ? (
            <>
              Round hiện tại: <span className="font-mono">{round.id}</span>
            </>
          ) : (
            <span className="text-red-600">{roundError ?? 'Không tìm thấy round hiện tại'}</span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tribe"
              checked={tribe === 'Milk'}
              onChange={() => setTribe('Milk')}
            />
            Milk
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tribe"
              checked={tribe === 'Cacao'}
              onChange={() => setTribe('Cacao')}
            />
            Cacao
          </label>
        </div>
        <button
          onClick={generate}
          disabled={!canCompute}
          className="px-6 py-3 rounded-2xl bg-emerald-600 text-white disabled:opacity-50"
        >
          Generate Commitment
        </button>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {saltHex && (
          <div className="text-xs">
            <div className="font-medium">Salt (hex):</div>
            <code className="break-all">{saltHex}</code>
          </div>
        )}
        {commitHex && (
          <div className="text-xs">
            <div className="font-medium">Commitment (sha256 hex):</div>
            <code className="break-all">{commitHex}</code>
          </div>
        )}
        <div className="text-xs text-gray-600">
          Gửi commitment qua instruction <code>commit_meow</code> theo IDL. Tính năng gửi on‑chain sẽ sớm được bật.
        </div>
      </div>
    </div>
  )
}
