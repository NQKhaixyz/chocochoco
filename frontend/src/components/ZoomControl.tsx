import { useEffect, useState } from 'react'

export default function ZoomControl() {
  const [scale, setScale] = useState<number>(() => {
    const saved = localStorage.getItem('uiScale')
    return saved ? Math.min(1.6, Math.max(1.0, parseFloat(saved))) : 1.15
  })

  useEffect(() => {
    document.documentElement.style.setProperty('--ui-scale', String(scale))
    localStorage.setItem('uiScale', String(scale))
  }, [scale])

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-600">Zoom</span>
      <button
        className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
        onClick={() => setScale((s) => Math.max(1.0, parseFloat((s - 0.05).toFixed(2))))}
        title="Thu nhỏ"
      >
        −
      </button>
      <span className="w-10 text-center tabular-nums">{Math.round(scale * 100)}%</span>
      <button
        className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
        onClick={() => setScale((s) => Math.min(1.6, parseFloat((s + 0.05).toFixed(2))))}
        title="Phóng to"
      >
        +
      </button>
    </div>
  )
}

