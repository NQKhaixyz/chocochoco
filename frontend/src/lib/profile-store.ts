export type Profile = {
  address: string
  name: string
  bio: string
  avatarDataUrl?: string
  updatedAt: number
}

const key = (address: string) => `choco:profile:${address}`

export function loadProfile(address: string): Profile | null {
  const raw = localStorage.getItem(key(address))
  if (!raw) return null
  try {
    return JSON.parse(raw) as Profile
  } catch {
    return null
  }
}

export function saveProfile(p: Profile): void {
  localStorage.setItem(key(p.address), JSON.stringify(p))
}

export function clearProfile(address: string): void {
  localStorage.removeItem(key(address))
}

