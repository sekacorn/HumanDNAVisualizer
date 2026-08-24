import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import AnatomyScene from '../components/AnatomyScene'
import { EVIDENCE_COLORS, NODE_TYPE_COLORS } from '../config/palette'
import ExplainButton from '../components/ExplainButton'
import VisualizationDisclaimer from '../components/VisualizationDisclaimer'
import Icon from '../components/ui/Icon'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import StatusPill from '../components/ui/StatusPill'
import { getAnatomyGraph, getAnatomyGraphStats } from '../services/api'

/**
 * AnatomyViewer Page
 *
 * Interactive 3D anatomy viewer that renders genomic variant overlays on anatomical structures.
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */

const EVIDENCE_LEGEND = [
  ['High evidence', 'Well-established, replicated findings', EVIDENCE_COLORS.HIGH],
  ['Medium evidence', 'Some evidence, requires validation', EVIDENCE_COLORS.MEDIUM],
  ['Low evidence', 'Preliminary or indirect associations', EVIDENCE_COLORS.LOW],
]

const INTERACTION_GUIDE = [
  ['Rotate', 'Click and drag anywhere in the 3D view'],
  ['Zoom', 'Mouse wheel or pinch gesture'],
  ['Pan', 'Right-click and drag, or two-finger drag'],
  ['Hover', 'See overlay details for each structure'],
  ['Click', 'Isolate a specific anatomical structure'],
  ['Toggle', 'Use the controls to show or hide overlays'],
]

const ABOUT = [
  'Deterministic mapping from genomic variants to anatomy',
  'All associations labelled with evidence quality',
  'Overlay intensity reflects association strength',
  'Placeholder geometry for demonstration purposes',
  'Built with React Three Fiber and Three.js',
  'Educational / research visualization only',
]

function AnatomyViewer() {
  const [searchParams] = useSearchParams()
  const sampleId = searchParams.get('sampleId') || '1' // Default to sample 1 for demo

  const [anatomyGraph, setAnatomyGraph] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [overlaysVisible, setOverlaysVisible] = useState(true)

  // Load anatomy graph data
  useEffect(() => {
    const loadAnatomyGraph = async () => {
      try {
        setLoading(true)
        setError(null)

        const [graphResponse, statsResponse] = await Promise.all([
          getAnatomyGraph(sampleId),
          getAnatomyGraphStats(sampleId)
        ])

        // Extract data from SafeAPIResponse wrapper
        // Response structure: { data: {...}, disclaimer: "...", nonDiagnostic: true, ... }
        const graphData = graphResponse.data.data || graphResponse.data
        const statsData = statsResponse.data.data || statsResponse.data

        // Log disclaimer if present (for compliance audit)
        if (graphResponse.data.disclaimer) {
          console.log('[Safety] API Disclaimer:', graphResponse.data.disclaimer)
        }

        setAnatomyGraph(graphData)
        setStats(statsData)
      } catch (err) {
        console.error('Error loading anatomy graph:', err)
        setError(err.response?.data?.message || 'Failed to load anatomy visualization')
      } finally {
        setLoading(false)
      }
    }

    loadAnatomyGraph()
  }, [sampleId])

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Icon name="progress_activity" size={44} className="animate-spin text-cytosine-azure" />
        <p className="font-code-mono text-sm text-on-surface-variant">
          Loading anatomy visualization…
        </p>
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
              Error loading visualization
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
        eyebrow="Anatomy map"
        title="3D Anatomy Visualization"
        subtitle="Genomic variant overlays projected onto anatomical structures, graded by evidence quality."
        actions={
          <>
            <StatusPill tone="processing">Sample {sampleId}</StatusPill>
            {anatomyGraph?.rulesVersion && (
              <span className="rounded-full border border-glass-border bg-white/[0.03] px-3 py-1.5 font-code-mono text-xs text-on-surface-variant">
                {anatomyGraph.rulesVersion}
              </span>
            )}
          </>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-bento-gap lg:grid-cols-4">
          <StatCard label="Total overlays" value={stats.overlayCount ?? 0} icon="layers" accent="azure" />
          <StatCard label="High evidence" value={stats.highEvidenceCount ?? 0} icon="verified" accent="emerald" />
          <StatCard label="Medium evidence" value={stats.mediumEvidenceCount ?? 0} icon="help" accent="amber" />
          <StatCard label="Low evidence" value={stats.lowEvidenceCount ?? 0} icon="scatter_plot" accent="azure" />
        </div>
      )}

      <VisualizationDisclaimer />

      {/* Viewport + controls */}
      <section className="glass-panel rounded-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-glass-border px-card-padding py-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h2 className="font-label-caps text-label-caps uppercase text-on-surface">
              Visualization controls
            </h2>
            <p className="mt-1.5 font-code-mono text-[11px] leading-relaxed text-on-surface-variant">
              Drag to rotate · scroll to zoom · click a node to isolate it
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {anatomyGraph && <ExplainButton anatomyGraph={anatomyGraph} />}
            <button
              type="button"
              role="switch"
              aria-checked={overlaysVisible}
              onClick={() => setOverlaysVisible((v) => !v)}
              className={`tap-target flex items-center gap-2 rounded-full border px-4 py-2 transition-colors ${
                overlaysVisible
                  ? 'border-secondary/40 bg-secondary/10 text-secondary'
                  : 'border-glass-border bg-white/[0.02] text-on-surface-variant hover:bg-white/[0.06]'
              }`}
            >
              <Icon name={overlaysVisible ? 'visibility' : 'visibility_off'} size={18} />
              <span className="font-label-caps text-label-caps uppercase">Overlays</span>
            </button>
          </div>
        </div>

        <div className="viewport-canvas relative h-[52vh] min-h-[320px] md:h-[60vh] lg:h-[600px]">
          <Suspense
            fallback={
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <Icon name="progress_activity" size={36} className="animate-spin text-cytosine-azure" />
                <p className="font-code-mono text-xs text-on-surface-variant">
                  Initializing 3D scene…
                </p>
              </div>
            }
          >
            {anatomyGraph && (
              <AnatomyScene anatomyGraph={anatomyGraph} overlaysVisible={overlaysVisible} />
            )}
          </Suspense>
        </div>
      </section>

      {/* Legends */}
      <div className="grid grid-cols-1 gap-bento-gap md:grid-cols-2">
        <section className="glass-panel rounded-card p-card-padding">
          <h2 className="font-label-caps text-label-caps uppercase text-secondary">
            Evidence levels
          </h2>
          <ul className="mt-4 space-y-3">
            {EVIDENCE_LEGEND.map(([label, detail, color]) => (
              <li key={label} className="flex items-start gap-3">
                <span
                  className="mt-1 h-3 w-3 shrink-0 rounded"
                  style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}
                />
                <span className="min-w-0">
                  <span className="block text-sm text-on-surface">{label}</span>
                  <span className="mt-0.5 block font-code-mono text-[11px] leading-relaxed text-on-surface-variant">
                    {detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-panel rounded-card p-card-padding">
          <h2 className="font-label-caps text-label-caps uppercase text-cytosine-azure">
            Structure types
          </h2>
          <ul className="mt-4 space-y-3">
            {[
              ['System', stats?.systemCount, 'Body systems (e.g. cardiovascular)', NODE_TYPE_COLORS.SYSTEM],
              ['Organ', stats?.organCount, 'Major organs (e.g. heart, brain)', NODE_TYPE_COLORS.ORGAN],
              ['Substructure', stats?.substructureCount, 'Detailed anatomy (e.g. ventricle)', NODE_TYPE_COLORS.SUBSTRUCTURE],
            ].map(([label, count, detail, color]) => (
              <li key={label} className="flex items-start gap-3">
                <span
                  className="mt-1 h-3 w-3 shrink-0 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="min-w-0">
                  <span className="block text-sm text-on-surface">
                    {label}
                    {count != null && (
                      <span className="ml-2 font-code-mono text-xs text-on-surface-variant">
                        ({count})
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block font-code-mono text-[11px] leading-relaxed text-on-surface-variant">
                    {detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Graph disclaimer */}
      {anatomyGraph?.disclaimer && (
        <section className="glass-panel rounded-card border-l-2 !border-l-guanine-amber p-card-padding">
          <div className="flex items-start gap-3">
            <Icon name="warning" size={20} className="mt-0.5 shrink-0 text-guanine-amber" />
            <div>
              <h2 className="font-label-caps text-label-caps uppercase text-guanine-amber">
                Important notice
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                {anatomyGraph.disclaimer}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Reference */}
      <div className="grid grid-cols-1 gap-bento-gap md:grid-cols-2">
        <section className="glass-panel rounded-card p-card-padding">
          <h2 className="flex items-center gap-2 font-headline-md text-lg text-on-surface">
            <Icon name="touch_app" size={20} className="text-secondary" />
            Interaction guide
          </h2>
          <dl className="mt-4 space-y-2.5">
            {INTERACTION_GUIDE.map(([action, detail]) => (
              <div key={action} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <dt className="font-label-caps text-label-caps uppercase text-secondary">
                  {action}
                </dt>
                <dd className="text-on-surface-variant">{detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="glass-panel rounded-card p-card-padding">
          <h2 className="flex items-center gap-2 font-headline-md text-lg text-on-surface">
            <Icon name="info" size={20} className="text-cytosine-azure" />
            About this visualization
          </h2>
          <ul className="mt-4 space-y-2.5">
            {ABOUT.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 font-code-mono text-xs leading-relaxed text-on-surface-variant"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cytosine-azure" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default AnatomyViewer
