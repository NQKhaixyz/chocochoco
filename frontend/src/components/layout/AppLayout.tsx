import React from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { Breadcrumbs } from './Breadcrumbs'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <Header />
      <main className="flex-1">
        <div className="container flex flex-col gap-6 py-8">
          <Breadcrumbs />
          <Outlet />
        </div>
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}

