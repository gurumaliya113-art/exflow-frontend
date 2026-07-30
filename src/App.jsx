import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import EnquiryProvider from './components/enquiry/EnquiryProvider'
import PublicLayout from './components/layout/PublicLayout'
import LegacyLayout from './components/layout/LegacyLayout'
import HomePage from './pages/HomePage'
import NewHomePage from './pages/NewHomePage'
import PortfolioPage from './pages/PortfolioPage'
import SolutionsPage from './pages/SolutionsPage'
import IndustriesPage from './pages/IndustriesPage'
import AboutPage from './pages/AboutPage'
import BlogsPage from './pages/BlogsPage'
import ContactPage from './pages/ContactPage'
import PartnerPage from './pages/PartnerPage'
import PartnerBenefitsPage from './pages/PartnerBenefitsPage'
import EnquirePage from './pages/EnquirePage'
import WorkBenefitsPage from './pages/WorkBenefitsPage'

/**
 * Route table. Paths are byte-identical to the pre-redesign table; only the
 * shell each group renders inside changed (Requirements 8.11, 8.12, 11.1, 11.2).
 *
 * Public_Routes render inside `PublicLayout`, Legacy_Routes inside
 * `LegacyLayout`; both shells supply the Shared_Chrome, so no route carries its
 * own header or footer (Requirement 8.1).
 */
const PUBLIC_ROUTES = [
  { path: '/', element: <NewHomePage /> },
  { path: '/portfolio', element: <PortfolioPage /> },
  { path: '/solutions', element: <SolutionsPage /> },
  { path: '/industries', element: <IndustriesPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/blogs', element: <BlogsPage /> },
  { path: '/contact', element: <ContactPage /> },
]

const LEGACY_ROUTES = [
  { path: '/home-old', element: <HomePage /> },
  { path: '/partner', element: <PartnerPage /> },
  { path: '/partner-benefits', element: <PartnerBenefitsPage /> },
  { path: '/enquire', element: <EnquirePage /> },
  { path: '/work-benefits', element: <WorkBenefitsPage /> },
]

/** Permanent redirects, unchanged from the pre-redesign table. */
const REDIRECT_ROUTES = [
  { path: '/our-work', to: '/portfolio' },
  { path: '*', to: '/' },
]

export const PUBLIC_ROUTE_PATHS = PUBLIC_ROUTES.map((route) => route.path)
export const LEGACY_ROUTE_PATHS = LEGACY_ROUTES.map((route) => route.path)
export const REDIRECT_ROUTE_PATHS = REDIRECT_ROUTES.map((route) => route.path)

/**
 * The routed part of the app, split out from `App` so it can be mounted inside
 * any router (the browser router in production, a memory router in tests).
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {PUBLIC_ROUTES.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      <Route element={<LegacyLayout />}>
        {LEGACY_ROUTES.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      {REDIRECT_ROUTES.map(({ path, to }) => (
        <Route key={path} path={path} element={<Navigate to={to} replace />} />
      ))}
    </Routes>
  )
}

/**
 * App-level wiring: toasts and the route table, all inside `EnquiryProvider` so
 * any route can reach `useEnquiry()` (Requirement 7.1).
 *
 * The enquiry dialog is not mounted here: `EnquiryProvider` renders
 * `EnquiryModal` itself, which is what keeps exactly one modal mounted app-wide
 * however many CTAs can open it. The superseded `components/EnquireModal` is no
 * longer mounted, so one activation opens one dialog (Requirement 11.1).
 */
export function AppShell() {
  return (
    <EnquiryProvider>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '1rem', fontSize: '14px' } }} />
      <AppRoutes />
    </EnquiryProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
