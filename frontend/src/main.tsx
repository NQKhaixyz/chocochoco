import React from 'react'
import ReactDOM from 'react-dom/client'
import { Providers } from './providers'
import { SolanaProviders } from './solana/providers'
import App from './App'
import './styles/theme.css'
import './styles.css'

// Apply stored colorway early to avoid FOUC
try {
  const cw = localStorage.getItem('colorway')
  if (cw) document.documentElement.setAttribute('data-colorway', cw)
} catch {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <SolanaProviders>
        <App />
      </SolanaProviders>
    </Providers>
  </React.StrictMode>,
)
