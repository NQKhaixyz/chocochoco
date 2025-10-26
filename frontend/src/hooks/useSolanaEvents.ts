import { useEffect, useState, useCallback } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'

/**
 * Hook to subscribe to Solana program logs for specific events.
 * This is a simple polling-based approach since Anchor events require IDL parsing.
 * 
 * For production: use Anchor's event parser with your IDL.
 * 
 * @param programId - The program to monitor
 * @param eventNames - Array of event names to watch (e.g., ['RoundMeowed', 'TreatClaimed'])
 * @param onEvent - Callback when event is detected
 * @param pollInterval - How often to check (ms)
 */
export function useSolanaProgramEvents(
  programId: PublicKey | null,
  eventNames: string[],
  onEvent: (eventName: string, signature: string) => void,
  pollInterval = 10000,
) {
  const { connection } = useConnection()
  const [lastSignature, setLastSignature] = useState<string | null>(null)

  const poll = useCallback(async () => {
    if (!programId) return

    try {
      // Get recent signatures for the program
      const sigs = await connection.getSignaturesForAddress(programId, {
        limit: 10,
      })

      if (sigs.length === 0) return

      const newest = sigs[0]?.signature
      if (!newest || lastSignature === newest) return // No new transactions

      // Fetch transaction details to check logs
      for (const sigInfo of sigs) {
        if (lastSignature && sigInfo.signature === lastSignature) break

        const tx = await connection.getTransaction(sigInfo.signature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0,
        })

        if (!tx?.meta?.logMessages) continue

        // Check if any event name appears in logs
        for (const log of tx.meta.logMessages) {
          for (const eventName of eventNames) {
            if (log.includes(eventName)) {
              onEvent(eventName, sigInfo.signature)
              break
            }
          }
        }
      }

      setLastSignature(newest)
    } catch (err) {
      console.error('Error polling program events:', err)
    }
  }, [connection, programId, eventNames, onEvent, lastSignature])

  useEffect(() => {
    void poll()
    const id = setInterval(() => void poll(), pollInterval)
    return () => clearInterval(id)
  }, [poll, pollInterval])

  return { refetch: poll }
}

/**
 * Hook to watch for specific Anchor events by parsing account changes.
 * This is a simplified version. For production, integrate with @coral-xyz/anchor
 * and use program.addEventListener().
 */
export function useAnchorEvent(
  connection: Connection,
  programId: PublicKey,
  eventName: string,
  callback: (event: any) => void,
) {
  useEffect(() => {
    // TODO: Implement proper Anchor event listener with IDL
    // For now, this is a placeholder
    // In production:
    // const program = new Program(idl, programId, provider)
    // const listener = program.addEventListener(eventName, callback)
    // return () => { program.removeEventListener(listener) }

    console.log(`Anchor event listener for ${eventName} not yet implemented`)
  }, [connection, programId, eventName, callback])
}

/**
 * Simple hook to periodically refetch data (fallback for event subscription)
 */
export function usePolling(callback: () => void, interval = 5000) {
  useEffect(() => {
    void callback()
    const id = setInterval(() => void callback(), interval)
    return () => clearInterval(id)
  }, [callback, interval])
}
