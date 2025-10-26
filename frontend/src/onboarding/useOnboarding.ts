'use client'
import { useEffect, useState } from 'react'

const KEY = 'choco:onboarding'

export function useOnboarding() {
  const [enabled, setEnabled] = useState(true)
  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY)
      if (s) setEnabled(s === 'on')
    } catch {}
  }, [])
  const set = (v: boolean) => {
    setEnabled(v)
    try {
      localStorage.setItem(KEY, v ? 'on' : 'off')
    } catch {}
  }
  return { enabled, set }
}

