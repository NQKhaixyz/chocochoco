import { useEffect, useState } from 'react'
import { useChainTime } from '../hooks/useChainTime'
export default function Countdown({ endTime, onExpire, interval = 1000 }: { endTime: number; onExpire?: () => void; interval?: number }) {
  const { offset } = useChainTime()
  const nowLocal = () => Math.floor(Date.now() / 1000)
  const nowChain = () => nowLocal() + offset
  const [remaining, setRemaining] = useState(() => endTime - nowChain())

  useEffect(() => {
    const tick = () => {
      const diff = endTime - nowChain()
      setRemaining(diff)
      if (diff <= 0) {
        onExpire?.()
      }
    }
    tick()
    const timer = setInterval(tick, interval)
    return () => clearInterval(timer)
  }, [endTime, offset, interval, onExpire])

  if (remaining <= 0) return <span className="text-gray-400">Expired</span>
  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60
  const text =
    h > 0
      ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
          .toString()
          .padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  const color = remaining < 60 ? 'text-red-600' : ''
  return <span className={`font-mono ${color}`}>{text}</span>
}
