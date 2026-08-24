import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SideNav from './SideNav'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import Icon from '../ui/Icon'
import authService from '../../services/authService'

function formatClock(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const s = String(totalSeconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

/**
 * Responsive application frame.
 *
 * Desktop (>= md): fixed 280px command rail + sticky top bar.
 * Mobile  (<  md): compact top bar + slide-in drawer + bottom tab bar.
 */
function AppShell({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())
  const [user, setUser] = useState(authService.getCurrentUser())
  const [sessionSeconds, setSessionSeconds] = useState(0)

  // Auth state lives outside React, so poll it the way the previous nav did.
  useEffect(() => {
    const id = setInterval(() => {
      setIsAuthenticated(authService.isAuthenticated())
      setUser(authService.getCurrentUser())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setSessionSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Any navigation closes the drawer; otherwise it lingers over the new page.
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  // Lock body scroll behind the drawer and allow Escape to dismiss it.
  useEffect(() => {
    if (!drawerOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [drawerOpen])

  const handleLogout = useCallback(() => {
    authService.logout()
    setIsAuthenticated(false)
    setUser(null)
    navigate('/login')
  }, [navigate])

  return (
    <div className="min-h-screen bg-surface bg-grid-pattern">
      {/* Ambient bloom — purely decorative, never intercepts pointer events */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-primary-container blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[40%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-secondary focus:px-4 focus:py-2 focus:text-on-secondary"
      >
        Skip to content
      </a>

      {/* Desktop rail */}
      <div className="hidden md:block">
        <SideNav user={user} sessionClock={formatClock(sessionSeconds)} />
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${drawerOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!drawerOpen}
      >
        <div
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
            drawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`shell-drawer absolute inset-y-0 left-0 w-sidebar-width max-w-[85vw] shadow-glass-elevated ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SideNav
            variant="drawer"
            user={user}
            sessionClock={formatClock(sessionSeconds)}
            onNavigate={() => setDrawerOpen(false)}
            onClose={() => setDrawerOpen(false)}
          />
          {!isAuthenticated && (
            <div className="absolute inset-x-0 bottom-0 border-t border-glass-border bg-surface-container-lowest/95 p-4 pb-safe backdrop-blur-xl">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn-primary w-full"
              >
                <Icon name="login" size={18} />
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content column */}
      <div className="relative z-10 flex min-h-screen flex-col md:ml-sidebar-width">
        <TopBar
          user={user}
          isAuthenticated={isAuthenticated}
          onOpenDrawer={() => setDrawerOpen(true)}
          onLogout={handleLogout}
        />

        <main
          id="main-content"
          className="mx-auto w-full max-w-command flex-1 px-4 py-6 md:px-margin md:py-margin"
        >
          {children}
        </main>

        <footer className="mx-auto w-full max-w-command px-4 pb-safe-nav pt-4 md:px-margin md:pb-8">
          <div className="border-t border-glass-border pt-6 text-center font-code-mono text-xs text-on-surface-variant/60">
            <p>HumanDNAVisualizer · Educational and research use only · Not a medical device</p>
          </div>
        </footer>
      </div>

      <BottomNav />
    </div>
  )
}

export default AppShell
