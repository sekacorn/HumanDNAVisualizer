import { NavLink } from 'react-router-dom'
import Icon from '../ui/Icon'
import Wordmark from '../ui/Wordmark'
import { primaryNav, dataNav, footerNav } from '../../config/navigation'

function NavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'group flex items-center gap-4 px-6 py-3 transition-all duration-200 tap-target',
          isActive
            ? 'border-l-2 border-secondary bg-secondary/5 text-secondary'
            : 'border-l-2 border-transparent text-on-surface-variant hover:bg-white/5 hover:text-on-surface',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon name={item.icon} size={22} fill={isActive} />
          <span className="font-label-caps text-label-caps uppercase transition-transform group-hover:translate-x-1">
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="px-6 pb-2 pt-6 font-label-caps text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50">
      {children}
    </div>
  )
}

/**
 * Desktop rail (>= md) and the sliding panel behind the mobile drawer share
 * this component so the two never disagree about what exists.
 */
function SideNav({ user, sessionClock, onNavigate, onClose, variant = 'desktop' }) {
  const isDrawer = variant === 'drawer'

  return (
    <nav
      aria-label="Primary"
      className={`flex h-full w-sidebar-width flex-col border-r border-glass-border bg-surface-container-lowest/90 py-6 backdrop-blur-xl ${
        isDrawer ? '' : 'fixed left-0 top-0 z-40 h-screen'
      }`}
    >
      {/* Brand */}
      <div className="mb-8 flex items-center justify-between px-6">
        <Wordmark size="md" />
        {isDrawer && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="tap-target flex items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <Icon name="close" />
          </button>
        )}
      </div>

      {/* Session identity */}
      <div className="mb-6 flex items-center gap-4 px-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-glass-border bg-gradient-to-br from-cytosine-azure/30 to-secondary/30">
          <span className="font-headline-md text-lg text-on-surface">
            {user?.username?.charAt(0).toUpperCase() || '·'}
          </span>
        </div>
        <div className="min-w-0">
          <div className="truncate font-label-caps text-label-caps uppercase text-on-surface">
            {user?.username || 'Guest Session'}
          </div>
          <div className="mt-1 font-code-mono text-xs text-on-surface-variant">
            {user ? `Active: ${sessionClock}` : 'Read-only access'}
          </div>
        </div>
      </div>

      {/* Destinations */}
      <div className="no-scrollbar flex-1 overflow-y-auto">
        <SectionLabel>Analysis</SectionLabel>
        <div className="flex flex-col">
          {primaryNav.map((item) => (
            <NavItem key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>

        <SectionLabel>Data &amp; Learning</SectionLabel>
        <div className="flex flex-col">
          {dataNav.map((item) => (
            <NavItem key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

      {/* Utility footer */}
      <div className="mt-4 border-t border-glass-border px-6 pt-4">
        <NavLink
          to="/import"
          onClick={onNavigate}
          className="btn-scan flex w-full items-center justify-center gap-2 rounded-lg border border-glass-border bg-surface-container-high py-3 font-label-caps text-label-caps uppercase text-on-surface transition-colors hover:bg-surface-bright"
        >
          <Icon name="upload_file" size={18} />
          Import Genome
        </NavLink>

        <div className="mt-4 flex flex-col gap-1">
          {footerNav.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              className="flex items-center gap-3 py-2 text-[10px] uppercase tracking-wider text-on-surface-variant transition-colors hover:text-on-surface"
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default SideNav
