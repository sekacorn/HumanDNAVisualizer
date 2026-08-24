import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import VisualizationDisclaimer from '../components/VisualizationDisclaimer'
import Icon from '../components/ui/Icon'
import PageHeader from '../components/ui/PageHeader'

/**
 * Learn Mode Landing Page
 *
 * Browse available guided tours through anatomical systems.
 * Educational content only - not for medical diagnosis or treatment.
 */

/** Level tones read as a difficulty ramp: emerald → amber → crimson. */
const LEVEL_TONES = {
  basic: 'border-adenine-emerald/40 bg-adenine-emerald/10 text-adenine-emerald',
  intermediate: 'border-guanine-amber/40 bg-guanine-amber/10 text-guanine-amber',
  advanced: 'border-thymine-crimson/40 bg-thymine-crimson/10 text-thymine-crimson',
}

const SYSTEM_VISUALS = {
  cardiovascular: { icon: 'cardiology', accent: 'text-thymine-crimson', wash: 'from-thymine-crimson/25' },
  nervous: { icon: 'neurology', accent: 'text-cytosine-azure', wash: 'from-cytosine-azure/25' },
  digestive: { icon: 'gastroenterology', accent: 'text-guanine-amber', wash: 'from-guanine-amber/25' },
}

const DEFAULT_VISUAL = { icon: 'school', accent: 'text-secondary', wash: 'from-secondary/25' }

function LearnMode() {
  const [tourIndex, setTourIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedSystem, setSelectedSystem] = useState('all')

  // Load tour index
  useEffect(() => {
    const loadTourIndex = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/tours/index.json')
        if (!response.ok) {
          throw new Error('Failed to load tour catalog')
        }

        const data = await response.json()
        setTourIndex(data)
      } catch (err) {
        console.error('Error loading tour index:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadTourIndex()
  }, [])

  // Filter tours based on selected level and system
  const filteredTours = tourIndex?.tours?.filter(tour => {
    const levelMatch = selectedLevel === 'all' || tour.level === selectedLevel
    const systemMatch = selectedSystem === 'all' || tour.systemId === selectedSystem
    return levelMatch && systemMatch
  }) || []

  const levelTone = (level) =>
    LEVEL_TONES[level] || 'border-glass-border bg-white/5 text-on-surface-variant'

  const visualFor = (systemId) => SYSTEM_VISUALS[systemId] || DEFAULT_VISUAL

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Icon name="progress_activity" size={44} className="animate-spin text-cytosine-azure" />
        <p className="font-code-mono text-sm text-on-surface-variant">Loading tours…</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="glass-panel rounded-card border-l-2 !border-l-error p-card-padding">
        <div className="flex items-start gap-3">
          <Icon name="error" size={22} className="mt-0.5 shrink-0 text-error" />
          <div>
            <h2 className="font-label-caps text-label-caps uppercase text-error">
              Error loading tours
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-ghost mt-4"
            >
              <Icon name="refresh" size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-bento-gap">
      <PageHeader
        eyebrow="Learn mode"
        title="Guided tours"
        subtitle="Step through human anatomy and physiology at your own pace."
        actions={
          <span className="rounded-full border border-glass-border bg-white/[0.03] px-3 py-1.5 font-code-mono text-xs text-on-surface-variant">
            {filteredTours.length} of {tourIndex?.tours?.length || 0} tours
          </span>
        }
      />

      <VisualizationDisclaimer />

      {/* Filters */}
      <section className="glass-panel rounded-card p-card-padding">
        <h2 className="font-label-caps text-label-caps uppercase text-on-surface-variant">
          Filter tours
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="level-filter"
              className="mb-2 block font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70"
            >
              Difficulty level
            </label>
            <select
              id="level-filter"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="input-field !font-body-md !text-sm"
            >
              <option value="all">All levels</option>
              {tourIndex?.levels?.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name} — {level.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="system-filter"
              className="mb-2 block font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70"
            >
              Body system
            </label>
            <select
              id="system-filter"
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="input-field !font-body-md !text-sm"
            >
              <option value="all">All systems</option>
              {tourIndex?.systems?.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Tour grid */}
      {filteredTours.length > 0 ? (
        <div className="grid grid-cols-1 gap-bento-gap sm:grid-cols-2 lg:grid-cols-3">
          {filteredTours.map((tour) => {
            const visual = visualFor(tour.systemId)
            return (
              <Link
                key={tour.id}
                to={`/learn/tour/${tour.id}`}
                className="glass-panel rounded-card group flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1"
              >
                <div
                  className={`flex h-28 items-center justify-center bg-gradient-to-br ${visual.wash} to-transparent`}
                >
                  <Icon
                    name={visual.icon}
                    size={52}
                    className={`${visual.accent} opacity-70 transition-opacity group-hover:opacity-100`}
                  />
                </div>

                <div className="flex flex-1 flex-col p-card-padding">
                  <h3 className="font-headline-md text-base text-on-surface transition-colors group-hover:text-secondary">
                    {tour.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant">
                    {tour.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span
                      className={`rounded border px-2 py-1 font-label-caps text-label-caps uppercase ${levelTone(tour.level)}`}
                    >
                      {tour.level}
                    </span>
                    <span className="flex items-center gap-1 font-code-mono text-xs text-on-surface-variant">
                      <Icon name="schedule" size={14} />
                      {tour.estimatedMinutes} min
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-card flex flex-col items-center px-6 py-16 text-center">
          <Icon name="search_off" size={48} className="text-on-surface-variant/30" />
          <h2 className="mt-4 font-headline-md text-lg text-on-surface">No tours found</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Try adjusting your filters.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedLevel('all')
              setSelectedSystem('all')
            }}
            className="btn-ghost mt-6"
          >
            <Icon name="filter_alt_off" size={16} />
            Clear filters
          </button>
        </div>
      )}

      {/* System overview */}
      {tourIndex?.systems?.length > 0 && (
        <section>
          <h2 className="font-headline-md text-xl text-on-surface md:text-headline-md">
            Body systems
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-bento-gap sm:grid-cols-2 lg:grid-cols-3">
            {tourIndex.systems.map((system) => {
              const visual = visualFor(system.id)
              return (
                <article key={system.id} className="glass-panel rounded-card p-card-padding">
                  <span className={`inline-flex rounded-lg bg-white/5 p-3 ${visual.accent}`}>
                    <Icon name={visual.icon} size={22} />
                  </span>
                  <h3 className="mt-4 font-headline-md text-base text-on-surface">
                    {system.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {system.description}
                  </p>
                  <p className="mt-4 font-code-mono text-[11px] text-on-surface-variant/70">
                    Levels: {system.availableLevels.join(', ')}
                  </p>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* About */}
      <section className="glass-panel rounded-card p-card-padding">
        <h2 className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-cytosine-azure">
          <Icon name="school" size={18} />
          About learn mode
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
          Learn Mode provides guided tours through human anatomy and physiology. Each tour includes:
        </p>
        <ul className="mt-3 space-y-2">
          {[
            'Step-by-step explanations with visual highlights',
            'Interactive 3D anatomical models',
            'Evidence-based educational content',
            'Progressive learning paths from basic to advanced',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-on-surface-variant">
              <Icon name="check_circle" size={16} className="mt-0.5 shrink-0 text-secondary" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-glass-border pt-4 font-code-mono text-[11px] leading-relaxed text-guanine-amber">
          Educational content only. Not for medical diagnosis, treatment, or advice.
        </p>
      </section>
    </div>
  )
}

export default LearnMode
