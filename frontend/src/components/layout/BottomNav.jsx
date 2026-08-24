import { NavLink } from 'react-router-dom'
import Icon from '../ui/Icon'
import { mobileTabs } from '../../config/navigation'

/**
 * Mobile tab bar (< md). Five destinations max; the drawer carries the rest.
 * Sits above the home indicator via the safe-area inset.
 */
function BottomNav() {
  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-surface-container-lowest/90 backdrop-blur-2xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch justify-around px-2 pb-2 pt-2">
        {mobileTabs.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'tap-target flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition-colors',
                isActive
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-on-surface-variant/60 active:bg-white/5',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} size={22} fill={isActive} />
                <span className="font-label-caps text-[10px] uppercase tracking-wider">
                  {item.shortLabel || item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
