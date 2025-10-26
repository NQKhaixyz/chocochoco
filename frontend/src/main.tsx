import React from 'react'
import ReactDOM from 'react-dom/client'
import { Providers } from './providers'
import { SolanaProviders } from './solana/providers'
import App from './App'
import './styles/theme.css'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <SolanaProviders>
        <App />
      </SolanaProviders>
    </Providers>
  </React.StrictMode>,
)
