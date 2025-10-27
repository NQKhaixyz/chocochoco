import React from 'react'
import { Toaster } from 'sonner'

export function ToasterHost() {
  return (
    <Toaster
      position="top-right"
      expand
      closeButton
      toastOptions={{
        className:
          'relative flex items-start gap-3 overflow-hidden rounded-2xl border border-border bg-card px-5 py-4 text-fg shadow-soft backdrop-blur-sm',
      }}
    />
  )
}

export default ToasterHost

