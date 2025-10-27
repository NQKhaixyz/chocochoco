import React, { useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { Breadcrumbs } from './Breadcrumbs'
import { DemoSimulator } from '../DemoSimulator'

export function AppLayout() {
  const [refreshKey, setRefreshKey] = useState(0)
  const isDev = import.meta.env.DEV

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <Header />
      <main className="flex-1" key={refreshKey}>
        <div className="container flex flex-col gap-6 py-8">
          <Breadcrumbs />
          <Outlet />
        </div>
      </main>
      <Footer />
      <ScrollRestoration />
      {isDev && <DemoSimulator onUpdate={() => setRefreshKey(k => k + 1)} />}
    </div>
  )
}

