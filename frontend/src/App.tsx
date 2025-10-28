import React, { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'

// Eager load critical routes
import HomePage from './routes/Home'

// Lazy load other routes for code splitting
const JoinPage = lazy(() => import('./routes/Join'))
const RevealPage = lazy(() => import('./routes/Reveal'))
const ClaimPage = lazy(() => import('./routes/Claim'))
const ProfilePage = lazy(() => import('./routes/Profile'))
const RoundsPage = lazy(() => import('./routes/Rounds'))
const LeaderboardPage = lazy(() => import('./routes/leaderboard'))
const TokenDashboard = lazy(() => import('./routes/TokenDashboard'))
const AdminPage = lazy(() => import('./routes/Admin'))
const Landing = lazy(() => import('./routes/Landing'))
const Styleguide = lazy(() => import('./routes/Styleguide'))
const NotFound = lazy(() => import('./routes/NotFound'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
    </div>
  )
}

// Wrapper to add Suspense to lazy-loaded routes
function lazyRoute(Component: React.LazyExoticComponent<() => React.ReactElement>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

const ENABLE_ADMIN = (import.meta.env.VITE_ENABLE_ADMIN as string | undefined) === 'true'
const SHOW_STYLEGUIDE = import.meta.env.DEV

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage />, handle: { breadcrumb: 'Home', hidden: true } },
      { path: 'join', element: lazyRoute(JoinPage), handle: { breadcrumb: 'Join' } },
      { path: 'reveal', element: lazyRoute(RevealPage), handle: { breadcrumb: 'Reveal' } },
      { path: 'claim', element: lazyRoute(ClaimPage), handle: { breadcrumb: 'Claim' } },
      { path: 'profile', element: lazyRoute(ProfilePage), handle: { breadcrumb: 'Profile' } },
      { path: 'rounds', element: lazyRoute(RoundsPage), handle: { breadcrumb: 'Rounds' } },
      { path: 'leaderboard', element: lazyRoute(LeaderboardPage), handle: { breadcrumb: 'Leaderboard' } },
      { path: 'tokens', element: lazyRoute(TokenDashboard), handle: { breadcrumb: 'Tokens' } },
      { path: 'landing', element: lazyRoute(Landing), handle: { breadcrumb: 'Landing', hidden: true } },
      ...(ENABLE_ADMIN
        ? ([{ path: 'admin', element: lazyRoute(AdminPage), handle: { breadcrumb: 'Admin' } }] as const)
        : []),
      ...(SHOW_STYLEGUIDE
        ? ([{ path: 'styleguide', element: lazyRoute(Styleguide), handle: { breadcrumb: 'Styleguide' } }] as const)
        : []),
      { path: '*', element: lazyRoute(NotFound), handle: { breadcrumb: 'Not Found', hidden: true } },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
