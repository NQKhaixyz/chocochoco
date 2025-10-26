export const SUBGRAPH_URL =
  (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_SUBGRAPH_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUBGRAPH_URL) ||
  ''

export async function gqlFetch<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  if (!SUBGRAPH_URL) throw new Error('Missing SUBGRAPH_URL env')
  const res = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Subgraph HTTP ${res.status}`)
  if (json.errors?.length) throw new Error(json.errors[0].message || 'Subgraph error')
  return json.data as T
}

