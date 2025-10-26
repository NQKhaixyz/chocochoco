'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type SoundCtx = { enabled: boolean; toggle: () => void; playPurr: () => void }
const Ctx = createContext<SoundCtx>({ enabled: true, toggle: () => {}, playPurr: () => {} })

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true)
  const audio = useMemo(() => (typeof Audio !== 'undefined' ? new Audio('/assets/sfx/purr.mp3') : null), [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('choco:sound')
      if (saved) setEnabled(saved === 'on')
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('choco:sound', enabled ? 'on' : 'off')
    } catch {}
  }, [enabled])

  const toggle = () => setEnabled((v) => !v)
  const playPurr = () => {
    if (enabled && audio) {
      try {
        audio.currentTime = 0
        void audio.play()
      } catch {}
    }
  }

  return <Ctx.Provider value={{ enabled, toggle, playPurr }}>{children}</Ctx.Provider>
}

export const useSound = () => useContext(Ctx)

