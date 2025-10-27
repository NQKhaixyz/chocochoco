import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import JoinPage from './routes/Join'
import RevealPage from './routes/Reveal'
import ClaimPage from './routes/Claim'
import RoundsPage from './routes/Rounds'
import LeaderboardPage from './routes/leaderboard'
import AdminPage from './routes/Admin'
import Landing from './routes/Landing'
import Styleguide from './routes/Styleguide'
import NotFound from './routes/NotFound'

const ENABLE_ADMIN = (import.meta.env.VITE_ENABLE_ADMIN as string | undefined) === 'true'
const SHOW_STYLEGUIDE = import.meta.env.DEV

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <JoinPage />, handle: { breadcrumb: 'Join' } },
      { path: 'reveal', element: <RevealPage />, handle: { breadcrumb: 'Reveal' } },
      { path: 'claim', element: <ClaimPage />, handle: { breadcrumb: 'Claim' } },
      { path: 'rounds', element: <RoundsPage />, handle: { breadcrumb: 'Rounds' } },
      { path: 'leaderboard', element: <LeaderboardPage />, handle: { breadcrumb: 'Leaderboard' } },
      { path: 'landing', element: <Landing />, handle: { breadcrumb: 'Landing', hidden: true } },
      ...(ENABLE_ADMIN
        ? ([{ path: 'admin', element: <AdminPage />, handle: { breadcrumb: 'Admin' } }] as const)
        : []),
      ...(SHOW_STYLEGUIDE
        ? ([{ path: 'styleguide', element: <Styleguide />, handle: { breadcrumb: 'Styleguide' } }] as const)
        : []),
      { path: '*', element: <NotFound />, handle: { breadcrumb: 'Not Found', hidden: true } },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
