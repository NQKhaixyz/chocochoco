export function u64le(n: bigint) {
  const b = new Uint8Array(8)
  let v = n
  for (let i = 0; i < 8; i++) {
    b[i] = Number(v & 0xffn)
    v >>= 8n
  }
  return b
}

