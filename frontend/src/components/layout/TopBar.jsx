import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Icon from '../ui/Icon'
import Wordmark from '../ui/Wordmark'

/**
 * Sticky command bar. On mobile it collapses to brand + search toggle +
 * hamburger; the full search field and account menu appear from md up.
 */
function TopBar({ user, isAuthenticated, onOpenDrawer, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    const handler = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-30 border-b border-glass-border bg-surface/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:h-20 md:px-margin">
        {/* Mobile: drawer trigger */}
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Open navigation"
          className="tap-target -ml-2 flex items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-on-surface md:hidden"
        >
          <Icon name="menu" />
        </button>

        {/* Mobile brand — the desktop rail already carries it */}
        <Link to="/" className="min-w-0 md:hidden">
          <Wordmark size="sm" />
        </Link>

        {/* Desktop search */}
        <div className="hidden min-w-0 flex-1 md:block md:max-w-md">
          <label className="group relative block">
            <span className="sr-only">Search sequences, variants or genes</span>
            <Icon
              name="search"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-cytosine-azure"
            />
            <input
              type="search"
              placeholder="Search sequences, variants, rsIDs…"
              className="w-full rounded-full border border-glass-border bg-surface-container-highest/50 py-2 pl-11 pr-4 font-code-mono text-sm text-on-surface placeholder-on-surface-variant/50 transition-all focus:border-cytosine-azure focus:bg-surface-bright/40 focus:outline-none"
            />
          </label>
        </div>

        <div className="ml-auto flex items-center gap-1 md:gap-3">
          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="Toggle search"
            aria-expanded={mobileSearchOpen}
            className="tap-target flex items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-cytosine-azure md:hidden"
          >
            <Icon name={mobileSearchOpen ? 'search_off' : 'search'} />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="tap-target relative hidden items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-white/5 hover:text-cytosine-azure sm:flex"
          >
            <Icon name="notifications" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 animate-pulse rounded-full bg-error" />
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="tap-target flex items-center gap-2 rounded-full border border-glass-border bg-white/[0.03] py-1 pl-1 pr-2 transition-colors hover:bg-white/[0.08] md:pr-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cytosine-azure to-secondary font-semibold text-on-primary">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="hidden text-left md:block">
                  <span className="block text-sm font-medium leading-tight text-on-surface">
                    {user?.username}
                  </span>
                  <span className="block font-code-mono text-[10px] uppercase leading-tight text-on-surface-variant">
                    {user?.roles?.[0] || 'USER'}
                  </span>
                </span>
                <Icon name="expand_more" size={18} className="hidden text-on-surface-variant md:block" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="glass-panel-elevated absolute right-0 mt-2 w-56 overflow-hidden rounded-card"
                >
                  <div className="border-b border-glass-border px-4 py-3">
                    <p className="truncate text-sm text-on-surface">{user?.username}</p>
                    <p className="truncate font-code-mono text-xs text-on-surface-variant">
                      {user?.email || 'Signed in'}
                    </p>
                  </div>
                  <NavLink
                    to="/samples"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
                  >
                    <Icon name="science" size={18} />
                    My Samples
                  </NavLink>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      onLogout()
                    }}
                    className="flex w-full items-center gap-3 border-t border-glass-border px-4 py-3 text-left text-sm text-error transition-colors hover:bg-error/10"
                  >
                    <Icon name="logout" size={18} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="tap-target hidden items-center px-3 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-on-surface sm:flex"
              >
                Sign in
              </NavLink>
              <NavLink to="/register" className="btn-primary btn-scan !px-4 !py-2 text-[11px]">
                <Icon name="add" size={16} />
                Get Started
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search drawer */}
      {mobileSearchOpen && (
        <div className="border-t border-glass-border px-4 py-3 md:hidden">
          <label className="relative block">
            <span className="sr-only">Search sequences, variants or genes</span>
            <Icon
              name="search"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              autoFocus
              type="search"
              placeholder="Search sequences, rsIDs…"
              className="w-full rounded-full border border-glass-border bg-surface-container-highest/50 py-2.5 pl-11 pr-4 font-code-mono text-sm text-on-surface placeholder-on-surface-variant/50 focus:border-cytosine-azure focus:outline-none"
            />
          </label>
        </div>
      )}
    </header>
  )
}

export default TopBar
