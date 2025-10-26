'use client'
import { useEffect, useState, useCallback } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'

// Sync offset between local time and Solana chain time (seconds)
export function useSolanaTime(refreshMs = 15000) {
  const { connection } = useConnection()
  const [offset, setOffset] = useState(0) // chainTs - localTs
  const [lastSync, setLastSync] = useState<number>(0)

  const sync = useCallback(async () => {
    try {
      const slot = await connection.getSlot('confirmed')
      const chainTs = await connection.getBlockTime(slot) // seconds
      if (chainTs) {
        const localTs = Math.floor(Date.now() / 1000)
        setOffset(chainTs - localTs)
        setLastSync(localTs)
      }
    } catch {
      // ignore transient errors
    }
  }, [connection])

  useEffect(() => {
    void sync()
    const id = setInterval(() => void sync(), refreshMs)
    return () => clearInterval(id)
  }, [sync, refreshMs])

  const chainTime = Math.floor(Date.now() / 1000) + offset
  return { chainTime, offset, lastSync, sync }
}

