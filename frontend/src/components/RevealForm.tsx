'use client'
import { useEffect, useMemo, useState } from 'react'
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { SolanaCountdown } from './SolanaCountdown'
import { fetchRoundRaw, deriveRoundPda, type RoundState } from '../lib/round'
import { u64le, keyForSalt } from '../lib/commit'

const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID as string)
const ROUND_ID = 1n // TODO: dynamic

function playerRoundPda(roundPk: PublicKey, player: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('player'), roundPk.toBuffer(), player.toBuffer()],
    PROGRAM_ID,
  )[0]
}

export default function RevealForm() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const [round, setRound] = useState<RoundState | null>(null)
  const [saltHex, setSaltHex] = useState('')
  const [tribe, setTribe] = useState<'Milk' | 'Cacao'>('Milk')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const cluster = (import.meta as any).env?.VITE_SOLANA_CLUSTER || 'devnet'
  const roundLe = useMemo(() => u64le(ROUND_ID), [])
  const playerHex = useMemo(() => publicKey?.toBase58() ?? '', [publicKey])

  useEffect(() => {
    ;(async () => {
      const rPda = deriveRoundPda(PROGRAM_ID, ROUND_ID)
      const st = await fetchRoundRaw(connection, rPda)
      setRound(st)
    })()
  }, [connection])

  useEffect(() => {
    if (!publicKey) return
    const k = keyForSalt(ROUND_ID.toString(), publicKey.toBase58())
    const hex = localStorage.getItem(k) || ''
    setSaltHex(hex)
  }, [publicKey])

  const now = Math.floor(Date.now() / 1000)
  const canReveal = !!round && now < (round.revealEnd ?? 0)

  async function onReveal() {
    try {
      setMsg(null)
      if (!publicKey) throw new Error('Vui lòng connect ví')
      if (!round) throw new Error('Round chưa tải xong')
      if (Math.floor(Date.now() / 1000) >= round.revealEnd) throw new Error('Hết cửa sổ reveal')

      const rPda = deriveRoundPda(PROGRAM_ID, ROUND_ID)
      const prPda = playerRoundPda(rPda, publicKey)

      if (!/^[0-9a-fA-F]{64}$/.test(saltHex)) {
        throw new Error('Salt phải là hex 32 bytes (64 hex chars)')
      }
      const salt = Uint8Array.from(saltHex.match(/.{1,2}/g)!.map((h) => parseInt(h, 16)))
      const side = tribe === 'Milk' ? 0 : 1

      // Instruction data (placeholder — align with program IDL): tag=0x02, side u8, salt[32]
      const data = new Uint8Array(1 + 1 + 32)
      data[0] = 2
      data[1] = side
      data.set(salt, 2)

      const keys = [
        { pubkey: publicKey, isSigner: true, isWritable: true },
        { pubkey: rPda, isSigner: false, isWritable: true },
        { pubkey: prPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ]
      const ix = new TransactionInstruction({ programId: PROGRAM_ID, keys, data })
      const tx = new Transaction().add(ix)
      const sig = await sendTransaction(tx, connection, { skipPreflight: false })

      setMsg({ kind: 'ok', text: `Reveal thành công! Tx: https://explorer.solana.com/tx/${sig}?cluster=${cluster}` })
    } catch (e: any) {
      const txt = normalizeRevealError(e?.message || String(e))
      setMsg({ kind: 'err', text: txt })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div id="reveal-panel" className="rounded-xl border p-4 space-y-3 max-w-xl">
      <div className="text-lg font-semibold">Reveal</div>

      {round ? (
        <div className="text-sm space-y-1">
          <div>
            Commit end: <span className="font-mono">{round.commitEnd}</span>
          </div>
          <div>
            Reveal end: <span className="font-mono">{round.revealEnd}</span> · còn{' '}
            <SolanaCountdown endTs={round.revealEnd} onExpire={() => {}} />
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Đang tải round…</div>
      )}

      <div className="flex gap-2">
        {(['Milk', 'Cacao'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTribe(t)}
            disabled={!canReveal}
            className={`px-4 py-2 rounded-lg border ${tribe === t ? 'bg-black text-white' : ''} disabled:opacity-50`}
          >
            {t}
          </button>
        ))}
      </div>

      <label className="block text-sm">
        Salt (hex 32 bytes)
        <input
          className="mt-1 w-full rounded-md border px-3 py-2 font-mono"
          value={saltHex}
          onChange={(e) => setSaltHex(e.target.value.trim())}
          placeholder="e.g. a1b2… (64 hex chars)"
        />
      </label>

      <button
        onClick={onReveal}
        disabled={!canReveal || !publicKey || !round || busy}
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50"
      >
        {busy ? 'Revealing…' : 'Reveal'}
      </button>

      <div className="text-sm">Wallet: {playerHex || '—'}</div>
      {msg && <div className={`text-sm ${msg.kind === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</div>}
    </div>
  )
}

function normalizeRevealError(raw: string): string {
  if (/hash|mismatch/i.test(raw)) return 'Hash mismatch: kiểm tra tribe & salt đã dùng khi commit'
  if (/window|expired|deadline|time/i.test(raw)) return 'Hết cửa sổ Reveal hoặc chưa đến thời gian'
  if (/0x1/.test(raw)) return 'Lỗi chương trình (0x1): có thể là sai thời gian hoặc account'
  return raw
}

