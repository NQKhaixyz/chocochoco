export type Cluster = 'devnet' | 'testnet' | 'mainnet-beta'

export function getCluster(): Cluster {
  const c = (import.meta as any).env?.VITE_SOLANA_CLUSTER || 'devnet'
  if (c === 'devnet' || c === 'testnet' || c === 'mainnet-beta') return c
  return 'devnet'
}

export function rpcUrl(cluster: Cluster) {
  if (cluster === 'devnet') return 'https://api.devnet.solana.com'
  if (cluster === 'testnet') return 'https://api.testnet.solana.com'
  return 'https://api.mainnet-beta.solana.com'
}

