'use client'
import { useEffect, useMemo, useState } from 'react'
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { deriveRoundPda, fetchRoundRaw, type RoundState } from '../lib/round'
import { derivePlayerRoundPda, fetchPlayerRoundRaw, type PlayerRoundState } from '../lib/player-round'
import WinLoseAnimation from './WinLoseAnimation'

const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID as string)
const ROUND_ID = 1n // TODO: make dynamic

type ToastMsg = { kind: 'ok' | 'err' | 'info'; text: string }

export default function SolanaClaimPanel() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const [round, setRound] = useState<RoundState | null>(null)
  const [playerRound, setPlayerRound] = useState<PlayerRoundState | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<ToastMsg | null>(null)
  const [pollTrigger, setPollTrigger] = useState(0)

  const cluster = (import.meta as any).env?.VITE_SOLANA_CLUSTER || 'devnet'

  // Load round state
  useEffect(() => {
    ;(async () => {
      const rPda = deriveRoundPda(PROGRAM_ID, ROUND_ID)
      const st = await fetchRoundRaw(connection, rPda)
      setRound(st)
    })()
  }, [connection, pollTrigger])

  // Load player round state
  useEffect(() => {
    if (!publicKey) return
    ;(async () => {
      const rPda = deriveRoundPda(PROGRAM_ID, ROUND_ID)
      const prPda = derivePlayerRoundPda(PROGRAM_ID, rPda, publicKey)
      const prState = await fetchPlayerRoundRaw(connection, prPda)
      setPlayerRound(prState)
    })()
  }, [connection, publicKey, pollTrigger])

  // Poll for updates every 5s
  useEffect(() => {
    const id = setInterval(() => {
      setPollTrigger((n) => n + 1)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const isWinner = useMemo(() => {
    if (!round || !playerRound) return false
    if (!round.settled || round.winnerSide == null) return false
    if (!playerRound.revealed) return false
    // tribe: 0=Milk, 1=Cacao; winnerSide: 0=Milk, 1=Cacao
    return playerRound.tribe === round.winnerSide
  }, [round, playerRound])

  const canClaim = useMemo(() => {
    return (
      !!round &&
      !!playerRound &&
      round.settled &&
      isWinner &&
      !playerRound.claimed &&
      !!publicKey
    )
  }, [round, playerRound, isWinner, publicKey])

  async function onClaim() {
    try {
      setMsg(null)
      if (!publicKey) throw new Error('Vui lòng connect ví')
      if (!round) throw new Error('Round chưa tải xong')
      if (!playerRound) throw new Error('Bạn chưa tham gia round')
      if (!round.settled) throw new Error('Round chưa chốt kết quả')
      if (!isWinner) throw new Error('Chỉ phe thắng mới claim được')
      if (playerRound.claimed) throw new Error('Bạn đã claim rồi')

      setBusy(true)

      const rPda = deriveRoundPda(PROGRAM_ID, ROUND_ID)
      const prPda = derivePlayerRoundPda(PROGRAM_ID, rPda, publicKey)

      // Instruction data: opcode for claim_treat (e.g., 0x03)
      // Adjust according to your program's IDL
      const data = Buffer.from([3]) // claim_treat opcode

      const keys = [
        { pubkey: publicKey, isSigner: true, isWritable: true }, // player
        { pubkey: rPda, isSigner: false, isWritable: true }, // round
        { pubkey: prPda, isSigner: false, isWritable: true }, // player_round
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ]

      const ix = new TransactionInstruction({ programId: PROGRAM_ID, keys, data })
      const tx = new Transaction().add(ix)
      const sig = await sendTransaction(tx, connection, { skipPreflight: false })

      setMsg({
        kind: 'ok',
        text: `Claim thành công! Tx: https://explorer.solana.com/tx/${sig}?cluster=${cluster}`,
      })

      // Trigger re-fetch
      setTimeout(() => setPollTrigger((n) => n + 1), 2000)
    } catch (e: any) {
      const txt = normalizeClaimError(e?.message || String(e))
      setMsg({ kind: 'err', text: txt })
    } finally {
      setBusy(false)
    }
  }

  const statusText = useMemo(() => {
    if (!round) return 'Đang tải round...'
    if (!round.settled) return 'Round chưa chốt kết quả'
    if (!playerRound) return 'Bạn không tham gia round này'
    if (!playerRound.revealed) return 'Bạn chưa reveal'
    if (round.winnerSide == null) return 'Chưa xác định phe thắng (hoà)'
    return isWinner ? 'Bạn thuộc phe THẮNG 🎉' : 'Bạn thuộc phe THUA'
  }, [round, playerRound, isWinner])

  const winnerSideText = useMemo(() => {
    if (!round || round.winnerSide == null) return '—'
    return round.winnerSide === 0 ? 'Milk' : 'Cacao'
  }, [round])

  const playerSideText = useMemo(() => {
    if (!playerRound) return '—'
    if (playerRound.tribe === 0) return 'Milk'
    if (playerRound.tribe === 1) return 'Cacao'
    return 'None'
  }, [playerRound])

  return (
    <div
      id="solana-claim-panel"
      className="w-full space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft"
    >
      <h2 className="text-2xl font-semibold">Kết quả Round #{ROUND_ID.toString()}</h2>

      <div className="space-y-1 text-base">
        <div>
          Trạng thái: <span className="font-medium">{statusText}</span>
        </div>
        {round?.settled && round.winnerSide != null && (
          <div>
            Minority (winner): <span className="font-mono">{winnerSideText}</span>
          </div>
        )}
        {playerRound && (
          <>
            <div>
              Bạn chọn: <span className="font-mono">{playerSideText}</span>
            </div>
            <div>
              Revealed: <span className="font-mono">{playerRound.revealed ? '✅' : '❌'}</span>
            </div>
            {playerRound.claimed && <div className="text-green-700">Đã nhận thưởng ✅</div>}
          </>
        )}
      </div>

      {round?.settled && round.winnerSide != null && playerRound?.revealed && (
        <div className="mt-2"><WinLoseAnimation result={isWinner ? 'win' : 'lose'} /></div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={onClaim}
          disabled={!canClaim || busy}
          className="px-6 py-3 rounded-2xl text-base bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-700 transition"
          title="Chỉ phe thắng mới claim. Đã claim sẽ bị chặn lần 2."
        >
          {busy ? 'Claiming…' : 'Claim phần thưởng'}
        </button>
      </div>

      {/* Toast messages */}
      {!round?.settled && <Toast kind="info" text="⏳ Chờ round được chốt (RoundMeowed)..." />}
      {round?.settled && playerRound && !playerRound.revealed && (
        <Toast kind="info" text="ℹ️ Bạn cần reveal trước khi claim." />
      )}
      {round?.settled && isWinner && playerRound?.claimed && (
        <Toast kind="ok" text="🎉 Bạn đã claim rồi." />
      )}
      {round?.settled && playerRound?.revealed && !isWinner && (
        <Toast kind="info" text="ℹ️ Chỉ phe thắng mới claim được." />
      )}
      {msg && <Toast kind={msg.kind} text={msg.text} />}

      <div className="text-xs text-gray-500 mt-2">
        Wallet: {publicKey?.toBase58() || '—'}
      </div>
    </div>
  )
}

function Toast({ kind, text }: { kind: 'ok' | 'err' | 'info'; text: string }) {
  const color =
    kind === 'ok' ? 'text-green-600' : kind === 'err' ? 'text-red-600' : 'text-gray-700'
  return <div className={`${color} text-sm`}>{text}</div>
}

function normalizeClaimError(raw: string): string {
  if (/already claimed|double.?claim/i.test(raw)) return 'Bạn đã claim rồi (double-claim blocked)'
  if (/not.*winner|wrong.*side|not.*eligible/i.test(raw))
    return 'Chỉ phe thắng mới claim được'
  if (/not.*settled|not.*finalized/i.test(raw)) return 'Round chưa chốt kết quả'
  if (/0x1/.test(raw)) return 'Lỗi chương trình (0x1): kiểm tra state/account'
  return raw
}
