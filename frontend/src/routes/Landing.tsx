import React from 'react'
import Hero from '../components/sections/Hero'
import Features from '../components/sections/Features'
import HowItWorks from '../components/sections/HowItWorks'
import CTA from '../components/sections/CTA'

export default function Landing() {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <footer className="text-center text-xs text-muted p-6">Testnet only · Play responsibly</footer>
    </main>
  )
}

