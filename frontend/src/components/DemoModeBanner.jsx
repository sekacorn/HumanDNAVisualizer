import { useState } from 'react'
import Icon from './ui/Icon'
import { MOCK_ENABLED, resetMockData } from '../mocks/mockApi'
import { DEMO_USERS } from '../mocks/fixtures'

/**
 * Visible only in demo mode. Surfaces the demo credentials and makes it
 * unmistakable that the data on screen is fixtures, not a live backend.
 */
function DemoModeBanner() {
  const [expanded, setExpanded] = useState(false)

  if (!MOCK_ENABLED) return null

  return (
    <div className="glass-panel rounded-card mb-bento-gap border-l-2 !border-l-cytosine-azure">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-card-padding">
        <Icon name="science" size={20} className="shrink-0 text-cytosine-azure" />
        <div className="min-w-0 flex-1">
          <p className="font-label-caps text-label-caps uppercase text-cytosine-azure">
            Demo mode · mock data
          </p>
          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
            No backend is running. All samples, predictions and answers come from local fixtures.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="btn-ghost !py-2 text-[10px]"
        >
          {expanded ? 'Hide' : 'Credentials'}
          <Icon
            name="expand_more"
            size={16}
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {expanded && (
        <div className="animate-fade-up border-t border-glass-border px-4 py-4 sm:px-card-padding">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] border-collapse text-left">
              <thead>
                <tr className="border-b border-glass-border">
                  {['Username', 'Password', 'Role'].map((h) => (
                    <th
                      key={h}
                      className="pb-2 pr-4 font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEMO_USERS.map((u) => (
                  <tr key={u.username} className="border-b border-glass-border last:border-0">
                    <td className="py-2.5 pr-4 font-code-mono text-xs text-secondary">
                      {u.username}
                    </td>
                    <td className="py-2.5 pr-4 font-code-mono text-xs text-secondary">
                      {u.password}
                    </td>
                    <td className="py-2.5 pr-4 font-code-mono text-xs text-on-surface-variant">
                      {u.roles[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => {
              resetMockData()
              window.location.reload()
            }}
            className="btn-ghost mt-4 !py-2 text-[10px]"
          >
            <Icon name="restart_alt" size={16} />
            Reset demo data
          </button>
        </div>
      )}
    </div>
  )
}

export default DemoModeBanner
