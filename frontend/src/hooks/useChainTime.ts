'use client'
import { useCallback, useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'

export function useChainTime(refreshInterval = 15_000) {
  const publicClient = usePublicClient()
  const [offset, setOffset] = useState(0) // seconds: chainTime - localTime
  const [lastSync, setLastSync] = useState<number>(0)

  const sync = useCallback(async () => {
    try {
      if (!publicClient) return
      const block = await publicClient.getBlock()
      const chainTs = Number(block.timestamp)
      const localTs = Math.floor(Date.now() / 1000)
      setOffset(chainTs - localTs)
      setLastSync(localTs)
    } catch (err) {
      // Non-fatal: keep last offset
      // eslint-disable-next-line no-console
      console.error('Failed to sync chain time:', err)
    }
  }, [publicClient])

  useEffect(() => {
    void sync()
    const id = setInterval(() => void sync(), refreshInterval)
    return () => clearInterval(id)
  }, [sync, refreshInterval])

  const chainTime = Math.floor(Date.now() / 1000) + offset

  return { chainTime, offset, lastSync, sync }
}

