import React from 'react'
import { useSound } from '../context/sound'

export default function SoundToggle() {
  const { enabled, toggle } = useSound()
  return (
    <button
      aria-pressed={enabled}
      onClick={toggle}
      className={`px-3 py-1 rounded-xl border shadow-soft transition ${enabled ? 'bg-pastel-mint' : 'bg-pastel-lilac'}`}
      title={enabled ? 'Sound: on' : 'Sound: off'}
    >
      {enabled ? '🔊 Purr on' : '🔇 Purr off'}
    </button>
  )
}

