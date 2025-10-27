import React, { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SoundProvider } from './context/sound'

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 15_000 } },
})

export function Providers({ children }: PropsWithChildren) {
  return (
    <SoundProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SoundProvider>
  )
}
