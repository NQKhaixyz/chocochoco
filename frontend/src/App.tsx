import React from 'react'
import SolanaConnect from './components/SolanaConnect'
import SolanaClaimPanel from './components/SolanaClaimPanel'
import { Navbar } from './components/Navbar'
import LeaderboardPage from './routes/leaderboard'
import Landing from './routes/Landing'

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {path === '/leaderboard' ? (
          <LeaderboardPage />
        ) : path === '/landing' ? (
          <Landing />
        ) : path === '/app' ? (
          <>
            <h1 className="text-2xl font-bold mb-4">Welcome to ChocoChoco</h1>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Solana</h2>
              <SolanaConnect />
              <div className="mt-6">
                <SolanaClaimPanel />
              </div>
            </div>
          </>
        ) : (
          <Landing />
        )}
      </main>
    </div>
  )
}
