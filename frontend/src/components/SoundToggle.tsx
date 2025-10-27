import React from 'react'
import { useSound } from '../context/sound'

export default function SoundToggle() {
  const { enabled, toggle } = useSound()
  return (
    <button
      aria-pressed={enabled}
      onClick={toggle}
      className={`shrink-0 inline-flex items-center gap-2 whitespace-nowrap px-2 md:px-3 py-1 rounded-xl border shadow-soft transition ${enabled ? 'bg-pastel-mint' : 'bg-pastel-lilac'}`}
      title={enabled ? 'Sound: on' : 'Sound: off'}
    >
      <span aria-hidden>{enabled ? '🔊' : '🔇'}</span>
      <span className="hidden md:inline">{enabled ? 'Purr on' : 'Purr off'}</span>
    </button>
  )
}
