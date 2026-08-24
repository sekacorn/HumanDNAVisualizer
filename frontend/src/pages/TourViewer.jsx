import { useState, useEffect, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import Stepper from '../components/Stepper'
import AnatomyScene from '../components/AnatomyScene'
import ReactMarkdown from 'react-markdown'
import VisualizationDisclaimer from '../components/VisualizationDisclaimer'
import Icon from '../components/ui/Icon'

/**
 * TourViewer Page
 *
 * Displays a guided tour through an anatomical system with step-by-step explanations
 * and interactive 3D visualizations. Educational purposes only.
 */

function TourViewer() {
  const { tourId } = useParams()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)

  // Load tour data
  useEffect(() => {
    const loadTour = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/tours/${tourId}.json`)
        if (!response.ok) {
          throw new Error('Tour not found')
        }

        const data = await response.json()
        setTour(data)
        setCurrentStep(0) // Reset to first step
      } catch (err) {
        console.error('Error loading tour:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadTour()
  }, [tourId])

  // Handle step navigation
  const handleNext = () => {
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get current step data
  const step = tour?.steps?.[currentStep]

  // Create anatomy graph for 3D visualization
  const createAnatomyGraphFromStep = () => {
    if (!step) return null

    // Create a simplified anatomy graph with just the highlighted nodes
    return {
      nodes: step.highlightNodeIds.map((nodeId, index) => ({
        id: nodeId,
        label: nodeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: 'organ',
        position: {
          x: Math.cos((index * 2 * Math.PI) / step.highlightNodeIds.length) * 2,
          y: 0,
          z: Math.sin((index * 2 * Math.PI) / step.highlightNodeIds.length) * 2
        }
      })),
      edges: [],
      overlays: step.highlightNodeIds.map(nodeId => ({
        nodeId,
        intensity: step.overlayConfig?.intensity || 0.7,
        evidenceLevel: step.evidenceLevel || 'HIGH',
        color: step.evidenceLevel === 'HIGH' ? '#22c55e' :
               step.evidenceLevel === 'MEDIUM' ? '#f59e0b' : '#3b82f6',
        pulseAnimation: step.overlayConfig?.pulseAnimation || false
      }))
    }
  }

  // Get level badge color
  // Difficulty ramp: emerald -> amber -> crimson, matching Learn Mode.
  const getLevelColor = (level) => {
    switch (level) {
      case 'basic':
        return 'border-adenine-emerald/40 bg-adenine-emerald/10 text-adenine-emerald'
      case 'intermediate':
        return 'border-guanine-amber/40 bg-guanine-amber/10 text-guanine-amber'
      case 'advanced':
        return 'border-thymine-crimson/40 bg-thymine-crimson/10 text-thymine-crimson'
      default:
        return 'border-glass-border bg-white/5 text-on-surface-variant'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Icon name="progress_activity" size={44} className="animate-spin text-cytosine-azure" />
        <p className="font-code-mono text-sm text-on-surface-variant">Loading tour…</p>
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
              Error loading tour
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{error}</p>
            <Link to="/learn" className="btn-ghost mt-4">
              <Icon name="arrow_back" size={16} />
              Back to Learn Mode
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-bento-gap">
      {/* Header */}
      <header>
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 font-label-caps text-label-caps uppercase text-secondary transition-colors hover:text-secondary-fixed"
        >
          <Icon name="arrow_back" size={16} />
          Back to Learn Mode
        </Link>
        <h1 className="mt-4 font-headline-lg text-2xl tracking-tight text-on-surface md:text-headline-lg">
          {tour.title}
        </h1>
        <p className="mt-2 max-w-2xl text-base text-on-surface-variant">{tour.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span
            className={`rounded border px-2 py-1 font-label-caps text-label-caps uppercase ${getLevelColor(tour.level)}`}
          >
            {tour.level}
          </span>
          <span className="flex items-center gap-1.5 font-code-mono text-xs text-on-surface-variant">
            <Icon name="schedule" size={14} />
            {tour.estimatedMinutes} minutes
          </span>
          <span className="flex items-center gap-1.5 font-code-mono text-xs text-on-surface-variant">
            <Icon name="list" size={14} />
            {tour.steps.length} steps
          </span>
        </div>
      </header>

      <VisualizationDisclaimer />

      <Stepper steps={tour.steps} currentStep={currentStep} onStepClick={handleStepClick} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-bento-gap lg:grid-cols-2">
        {/* Explanation Panel */}
        <section className="glass-panel rounded-card p-card-padding">
          <p className="font-label-caps text-label-caps uppercase text-secondary">
            Step {currentStep + 1} of {tour.steps.length}
          </p>
          <h2 className="mt-2 font-headline-md text-xl text-on-surface">{step.title}</h2>

          {/* Markdown Content */}
          <div className="tour-prose mt-4">
            <ReactMarkdown>{step.explanation}</ReactMarkdown>
          </div>

          {/* Interactive Prompt */}
          {step.interactivePrompt && (
            <div className="mt-6 rounded-card border border-cytosine-azure/30 bg-cytosine-azure/[0.06] p-4">
              <div className="flex items-start gap-3">
                <Icon name="lightbulb" size={20} className="mt-0.5 shrink-0 text-cytosine-azure" />
                <div>
                  <h3 className="font-label-caps text-label-caps uppercase text-cytosine-azure">
                    Try this
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {step.interactivePrompt}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Further Reading */}
          {step.furtherReading && step.furtherReading.length > 0 && (
            <div className="mt-6 border-t border-glass-border pt-4">
              <h3 className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                Further reading
              </h3>
              <ul className="mt-3 space-y-1.5">
                {step.furtherReading.map((item) => (
                  <li
                    key={item.title}
                    className="flex items-start gap-2 font-code-mono text-[11px] leading-relaxed text-on-surface-variant"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-secondary" />
                    {item.title} ({item.type})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* 3D Visualization Panel */}
        <section className="glass-panel rounded-card flex flex-col overflow-hidden">
          <h3 className="border-b border-glass-border px-card-padding py-4 font-label-caps text-label-caps uppercase text-on-surface">
            3D anatomy view
          </h3>

          <div className="viewport-canvas h-[40vh] min-h-[280px] lg:h-[420px]">
            <Suspense
              fallback={
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <Icon
                    name="progress_activity"
                    size={36}
                    className="animate-spin text-cytosine-azure"
                  />
                  <p className="font-code-mono text-xs text-on-surface-variant">
                    Initializing 3D scene…
                  </p>
                </div>
              }
            >
              {createAnatomyGraphFromStep() && (
                <AnatomyScene anatomyGraph={createAnatomyGraphFromStep()} overlaysVisible />
              )}
            </Suspense>
          </div>

          {/* Overlay Legend */}
          <div className="border-t border-glass-border p-card-padding">
            <h4 className="font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70">
              Highlighted structures
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {step.highlightNodeIds.map((nodeId) => (
                <span
                  key={nodeId}
                  className="rounded border border-cytosine-azure/30 bg-cytosine-azure/10 px-2 py-1 font-code-mono text-[11px] text-cytosine-azure"
                >
                  {nodeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Navigation Controls */}
      <nav
        aria-label="Tour navigation"
        className="glass-panel rounded-card flex items-center justify-between gap-3 p-4"
      >
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="btn-secondary !px-4 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="arrow_back" size={18} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <span className="font-code-mono text-xs text-on-surface-variant">
          {currentStep + 1} / {tour.steps.length}
        </span>

        {currentStep < tour.steps.length - 1 ? (
          <button type="button" onClick={handleNext} className="btn-primary btn-scan !px-4">
            <span className="hidden sm:inline">Next</span>
            <Icon name="arrow_forward" size={18} />
          </button>
        ) : (
          <Link to="/learn" className="btn-primary btn-scan !px-4">
            <Icon name="check" size={18} />
            <span className="hidden sm:inline">Complete tour</span>
          </Link>
        )}
      </nav>

      {/* Learning Objectives */}
      {currentStep === 0 && (
        <section className="glass-panel rounded-card p-card-padding">
          <h3 className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-cytosine-azure">
            <Icon name="flag" size={18} />
            Learning objectives
          </h3>
          <ul className="mt-4 space-y-2.5">
            {tour.learningObjectives.map((objective) => (
              <li
                key={objective}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-on-surface-variant"
              >
                <Icon name="check_circle" size={16} className="mt-0.5 shrink-0 text-secondary" />
                {objective}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tour Metadata (Last Step) */}
      {currentStep === tour.steps.length - 1 && (
        <section className="glass-panel rounded-card p-card-padding">
          <h3 className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-guanine-amber">
            <Icon name="school" size={18} />
            Educational standards
          </h3>
          <ul className="mt-4 space-y-2">
            {tour.metadata.educationalStandards?.map((standard) => (
              <li
                key={standard}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-on-surface-variant"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-guanine-amber" />
                {standard}
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-glass-border pt-4 font-code-mono text-[11px] text-on-surface-variant/60">
            Version {tour.metadata.version} · last updated {tour.metadata.lastUpdated}
          </p>
        </section>
      )}
    </div>
  )
}

export default TourViewer
