'use client'
import React, { useState } from 'react'

export default function Tooltip({ tip, children }: { tip: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      {open && (
        <span
          className="absolute z-20 -top-2 left-1/2 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-card text-xs text-fg px-2 py-1 shadow-soft"
          role="tooltip"
        >
          {tip}
        </span>
      )}
    </span>
  )
}

