import { Suspense, useState } from 'react'
import DNAViewer from '../components/DNAViewer'
import { BASE_COLORS } from '../config/palette'
import Icon from '../components/ui/Icon'
import PageHeader from '../components/ui/PageHeader'
import StatusPill from '../components/ui/StatusPill'
import VisualizationDisclaimer from '../components/VisualizationDisclaimer'

const EXPORT_FORMATS = ['PNG', 'SVG', 'STL', 'OBJ']

function ViewportFallback() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <Icon name="progress_activity" size={40} className="animate-spin text-cytosine-azure" />
      <p className="font-code-mono text-xs text-on-surface-variant">Compiling helix geometry…</p>
    </div>
  )
}

/** Toggle row shared by the desktop rail and the mobile control sheet. */
function ControlToggles({ spinning, setSpinning, showGrid, setShowGrid, showBackbone, setShowBackbone }) {
  const toggles = [
    ['Auto-rotate', spinning, setSpinning, 'rotate_right'],
    ['Reference grid', showGrid, setShowGrid, 'grid_on'],
    ['Backbone', showBackbone, setShowBackbone, 'timeline'],
  ]

  return (
    <div className="space-y-2">
      {toggles.map(([label, value, setter, icon]) => (
        <button
          key={label}
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => setter((v) => !v)}
          className={`tap-target flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
            value
              ? 'border-secondary/30 bg-secondary/10 text-secondary'
              : 'border-glass-border bg-white/[0.02] text-on-surface-variant hover:bg-white/[0.06]'
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon name={icon} size={18} />
            <span className="truncate font-label-caps text-label-caps uppercase">{label}</span>
          </span>
          <span
            className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
              value ? 'bg-secondary/40' : 'bg-surface-container-highest'
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full bg-current transition-transform ${
                value ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </span>
        </button>
      ))}
    </div>
  )
}

function BaseLegend() {
  return (
    <ul className="grid grid-cols-2 gap-2">
      {Object.entries(BASE_COLORS).map(([base, color]) => (
        <li
          key={base}
          className={`flex items-center gap-2 rounded border px-2 py-1.5 font-code-mono text-xs chip-${base}`}
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
          />
          {base}
          <span className="ml-auto opacity-70">
            {{ A: 'Adenine', T: 'Thymine', G: 'Guanine', C: 'Cytosine' }[base]}
          </span>
        </li>
      ))}
    </ul>
  )
}

function Explore() {
  const [spinning, setSpinning] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showBackbone, setShowBackbone] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  const controlProps = {
    spinning,
    setSpinning,
    showGrid,
    setShowGrid,
    showBackbone,
    setShowBackbone,
  }

  return (
    <div className="space-y-bento-gap">
      <PageHeader
        eyebrow="Gene explorer"
        title="3D DNA Visualization"
        subtitle="Drag to rotate, scroll to zoom, right-drag to pan. Base pairs are coloured by the A/T/G/C spectrum used throughout the platform."
        actions={
          <>
            <StatusPill tone="processing" pulse>
              Viewport live
            </StatusPill>
            <button type="button" className="btn-ghost">
              <Icon name="download" size={16} />
              Export
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-bento-gap lg:grid-cols-12">
        {/* Viewport */}
        <section className="glass-panel rounded-card relative overflow-hidden lg:col-span-8">
          <div className="flex items-center justify-between gap-3 border-b border-glass-border px-4 py-3">
            <span className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-on-surface">
              <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
              Double helix · reference model
            </span>
            <div className="hidden gap-2 sm:flex">
              <span className="rounded border border-cytosine-azure/30 bg-surface-bright/40 px-2 py-1 font-code-mono text-[11px] text-cytosine-azure">
                3D
              </span>
              <span className="rounded border border-glass-border px-2 py-1 font-code-mono text-[11px] text-on-surface-variant">
                24 bp
              </span>
            </div>
          </div>

          {/* Height steps up with the viewport so mobile keeps content below the fold reachable */}
          <div className="viewport-canvas relative h-[52vh] min-h-[320px] md:h-[60vh] lg:h-[640px]">
            <Suspense fallback={<ViewportFallback />}>
              <DNAViewer
                spinning={spinning}
                showGrid={showGrid}
                showBackbone={showBackbone}
              />
            </Suspense>

            <div className="pointer-events-none absolute bottom-3 left-3 space-y-0.5 font-code-mono text-[10px] text-on-surface-variant/60">
              <div>three.js · react-three-fiber</div>
              <div>{spinning ? 'auto-rotate on' : 'auto-rotate off'}</div>
            </div>

            {/* Mobile control trigger */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="btn-primary absolute bottom-3 right-3 !px-4 !py-2.5 text-[11px] lg:hidden"
            >
              <Icon name="tune" size={18} />
              Controls
            </button>
          </div>
        </section>

        {/* Desktop control rail */}
        <aside className="hidden flex-col gap-bento-gap lg:col-span-4 lg:flex">
          <div className="glass-panel rounded-card p-card-padding">
            <h2 className="mb-4 font-label-caps text-label-caps uppercase text-on-surface-variant">
              Viewport controls
            </h2>
            <ControlToggles {...controlProps} />
          </div>

          <div className="glass-panel rounded-card p-card-padding">
            <h2 className="mb-4 font-label-caps text-label-caps uppercase text-on-surface-variant">
              Base pair legend
            </h2>
            <BaseLegend />
          </div>

          <div className="glass-panel rounded-card p-card-padding">
            <h2 className="mb-4 font-label-caps text-label-caps uppercase text-on-surface-variant">
              Export
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {EXPORT_FORMATS.map((fmt) => (
                <button key={fmt} type="button" className="btn-ghost justify-center !py-2.5">
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Reference panels */}
      <div className="grid grid-cols-1 gap-bento-gap md:grid-cols-2">
        <section className="glass-panel rounded-card p-card-padding">
          <h2 className="flex items-center gap-2 font-headline-md text-lg text-on-surface">
            <Icon name="visibility" size={20} className="text-secondary" />
            Visualization features
          </h2>
          <ul className="mt-4 space-y-2.5">
            {[
              'Interactive 3D double-helix structure',
              'Rotate, zoom and pan controls',
              'Colour-coded base pairs (A–T, G–C)',
              'Export as PNG, SVG, STL or OBJ',
              'SNP variation highlighting',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-on-surface-variant">
                <Icon name="check_circle" size={16} className="mt-0.5 shrink-0 text-secondary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-panel rounded-card p-card-padding">
          <h2 className="flex items-center gap-2 font-headline-md text-lg text-on-surface">
            <Icon name="terminal" size={20} className="text-cytosine-azure" />
            Technical details
          </h2>
          <ul className="mt-4 space-y-2.5">
            {[
              'Built with Three.js and React Three Fiber',
              'Open-source rendering without proprietary code',
              'Compatible with PyMOL and Blender workflows',
              'Supports PDB, FASTA and VCF formats',
              'Real-time rendering for research and education',
            ].map((item) => (
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

      <VisualizationDisclaimer />

      {/* Mobile control sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            role="presentation"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="glass-panel-elevated absolute inset-x-0 bottom-0 max-h-[85vh] animate-fade-up overflow-y-auto rounded-t-card p-card-padding pb-safe">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-headline-md text-lg text-on-surface">Viewport controls</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close controls"
                className="tap-target flex items-center justify-center rounded-full text-on-surface-variant"
              >
                <Icon name="close" />
              </button>
            </div>

            <ControlToggles {...controlProps} />

            <h3 className="mb-3 mt-6 font-label-caps text-label-caps uppercase text-on-surface-variant">
              Base pair legend
            </h3>
            <BaseLegend />

            <h3 className="mb-3 mt-6 font-label-caps text-label-caps uppercase text-on-surface-variant">
              Export
            </h3>
            <div className="grid grid-cols-4 gap-2 pb-4">
              {EXPORT_FORMATS.map((fmt) => (
                <button key={fmt} type="button" className="btn-ghost justify-center !py-2.5">
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Explore
