'use client'
import { useMemo, useState } from 'react'
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { keyForSalt, genSalt32, toHexBytes, computeCommitment, u64le, type Tribe } from '../lib/commit'

const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID as string)
const STAKE_LAMPORTS = BigInt((import.meta as any).env?.VITE_STAKE_LAMPORTS || '0')
const ROUND_ID = 1n // TODO: fetch from program state or indexer

function deriveRoundPda(roundId: bigint) {
  const seed = Buffer.from(u64le(roundId))
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from('round'), seed], PROGRAM_ID)
  return pda
}
function derivePlayerRoundPda(roundPk: PublicKey, player: PublicKey) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('player'), roundPk.toBuffer(), player.toBuffer()],
    PROGRAM_ID,
  )
  return pda
}
function deriveVaultPda(roundPk: PublicKey) {
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from('vault'), roundPk.toBuffer()], PROGRAM_ID)
  return pda
}

export default function JoinCommit() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [tribe, setTribe] = useState<Tribe>('Milk')
  const [saltHex, setSaltHex] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const roundId = ROUND_ID
  const cluster = (import.meta as any).env?.VITE_SOLANA_CLUSTER || 'devnet'
  const playerB58 = useMemo(() => publicKey?.toBase58() ?? '', [publicKey])

  function ensureSalt(): string | undefined {
    if (!publicKey) return
    const key = keyForSalt(roundId.toString(), publicKey.toBase58())
    let hex = localStorage.getItem(key)
    if (!hex) {
      hex = toHexBytes(genSalt32())
      localStorage.setItem(key, hex)
    }
    setSaltHex(hex)
    return hex
  }

  async function onCommit() {
    setMsg(null)
    try {
      if (!publicKey) throw new Error('Vui lòng connect ví')
      setBusy(true)

      // 1) Load/generate salt
      const hex = ensureSalt()
      if (!hex) throw new Error('Không thể tạo salt')
      const salt = Uint8Array.from(hex.match(/.{1,2}/g)!.map((h) => parseInt(h, 16)))

      // 2) Build commitment
      const roundLe = u64le(roundId)
      const commitment = await computeCommitment(tribe, salt, publicKey.toBytes(), roundLe)

      // 3) Derive PDAs & accounts
      const roundPda = deriveRoundPda(roundId)
      const playerRoundPda = derivePlayerRoundPda(roundPda, publicKey)
      const vaultPda = deriveVaultPda(roundPda)

      // 4) Instruction data (placeholder — align with program IDL)
      const data = new Uint8Array(1 + 32 + 8)
      data[0] = 1 // commit opcode (example)
      data.set(commitment, 1)
      data.set(u64le(STAKE_LAMPORTS), 33)

      const keys = [
        { pubkey: publicKey, isSigner: true, isWritable: true },
        { pubkey: roundPda, isSigner: false, isWritable: true },
        { pubkey: playerRoundPda, isSigner: false, isWritable: true },
        { pubkey: vaultPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ]
      const ixCommit = new TransactionInstruction({ programId: PROGRAM_ID, keys, data })

      // 5) Transfer stake to vault (remove if program debits lamports itself)
      const ixTransfer = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: vaultPda,
        lamports: Number(STAKE_LAMPORTS),
      })

      const tx = new Transaction().add(ixTransfer, ixCommit)
      const sig = await sendTransaction(tx, connection, { skipPreflight: false })

      setMsg({ kind: 'ok', text: `Commit thành công! Tx: https://explorer.solana.com/tx/${sig}?cluster=${cluster}` })
    } catch (e: any) {
      setMsg({ kind: 'err', text: e?.message || 'Commit thất bại' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div id="commit-panel" className="rounded-xl border p-4 space-y-3 max-w-xl">
      <div className="text-lg font-semibold">Join (Commit)</div>

      <div className="flex gap-2">
        {(['Milk', 'Cacao'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTribe(t)}
            className={`px-4 py-2 rounded-lg border ${tribe === t ? 'bg-black text-white' : ''}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="text-sm">Wallet: {playerB58 || '—'}</div>

      <div className="text-sm">
        Salt: <span className="font-mono break-all">{saltHex || '—'}</span>
        <button onClick={() => ensureSalt()} className="ml-2 text-xs underline">
          Generate/Load
        </button>
      </div>

      <div className="text-sm">
        Stake (lamports): <span className="font-mono">{STAKE_LAMPORTS.toString()}</span>
      </div>

      <button
        onClick={onCommit}
        disabled={busy || !publicKey}
        className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50"
      >
        {busy ? 'Committing…' : 'Commit'}
      </button>

      {msg && (
        <div className={`text-sm ${msg.kind === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</div>
      )}
    </div>
  )
}

