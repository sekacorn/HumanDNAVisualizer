import { useState } from 'react'
import PropTypes from 'prop-types'
import { explainVisualization } from '../services/api'
import Icon from './ui/Icon'

/**
 * ExplainButton Component
 *
 * AI-assisted explanation button for anatomy graph visualizations.
 * Provides safe, educational explanations with evidence labeling.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */

const STYLES = [
  { value: 'concise', label: 'Concise' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'technical', label: 'Technical' },
]

function ExplainButton({ anatomyGraph, className = '' }) {
  const [showExplanation, setShowExplanation] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [style, setStyle] = useState('detailed')
  const [userQuestion, setUserQuestion] = useState('')

  const handleExplain = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await explainVisualization(anatomyGraph, userQuestion || null, style)

      setExplanation(response.data)
      setShowExplanation(true)
    } catch (err) {
      console.error('Error getting explanation:', err)
      setError(err.response?.data?.detail || 'Failed to generate explanation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setShowExplanation(false)
    setUserQuestion('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowExplanation(true)}
        className={`btn-primary btn-scan !px-4 !py-2 ${className}`}
        title="Get AI-assisted explanation"
      >
        <Icon name="auto_awesome" size={18} />
        Explain this view
      </button>

      {showExplanation && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div
            role="presentation"
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="explain-title"
            className="glass-panel-elevated relative my-8 w-full max-w-3xl animate-fade-up rounded-card p-card-padding"
          >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-label-caps text-label-caps uppercase text-secondary">
                  AI-assisted
                </p>
                <h3 id="explain-title" className="mt-1.5 font-headline-md text-xl text-on-surface">
                  Visualization explanation
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="tap-target -mr-2 -mt-2 flex shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-on-surface"
                aria-label="Close explanation"
              >
                <Icon name="close" />
              </button>
            </div>

            {/* Question input */}
            {!explanation && (
              <div className="mb-4">
                <label
                  htmlFor="explain-question"
                  className="mb-2 block font-label-caps text-label-caps uppercase text-on-surface-variant"
                >
                  Ask a specific question (optional)
                </label>
                <input
                  id="explain-question"
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="e.g. what do the overlays mean?"
                  className="input-field"
                />
                <p className="mt-2 font-code-mono text-[11px] text-on-surface-variant/70">
                  Leave blank for a general explanation
                </p>
              </div>
            )}

            {/* Style selector */}
            {!explanation && (
              <div className="mb-5">
                <p className="mb-2 font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Explanation style
                </p>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStyle(s.value)}
                      aria-pressed={style === s.value}
                      className={`tap-target rounded-full border px-4 py-2 font-label-caps text-label-caps uppercase transition-colors ${
                        style === s.value
                          ? 'border-secondary/40 bg-secondary/10 text-secondary'
                          : 'border-glass-border bg-white/[0.02] text-on-surface-variant hover:bg-white/[0.06]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Generate */}
            {!explanation && !loading && (
              <button type="button" onClick={handleExplain} className="btn-primary btn-scan w-full">
                <Icon name="auto_awesome" size={18} />
                Generate explanation
              </button>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center gap-3 py-10">
                <Icon name="progress_activity" size={40} className="animate-spin text-cytosine-azure" />
                <p className="font-code-mono text-xs text-on-surface-variant">
                  Generating explanation…
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-error/40 bg-error/10 p-4">
                <Icon name="error" size={18} className="mt-0.5 shrink-0 text-error" />
                <p className="text-sm leading-relaxed text-error">{error}</p>
              </div>
            )}

            {/* Explanation */}
            {explanation && (
              <div className="space-y-4">
                {explanation.queryWasRewritten && (
                  <div className="flex items-start gap-2 rounded-lg border border-guanine-amber/40 bg-guanine-amber/10 p-4">
                    <Icon name="warning" size={18} className="mt-0.5 shrink-0 text-guanine-amber" />
                    <div>
                      <h4 className="font-label-caps text-label-caps uppercase text-guanine-amber">
                        Query modified for safety
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">
                        {explanation.safetyMessage}
                      </p>
                    </div>
                  </div>
                )}

                <div className="rounded-card border border-glass-border bg-surface-container-lowest/50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
                    {explanation.explanationText}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {explanation.safetyLabels?.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-cytosine-azure/30 bg-cytosine-azure/10 px-3 py-1 font-label-caps text-[10px] uppercase tracking-wider text-cytosine-azure"
                    >
                      {label}
                    </span>
                  ))}
                  {explanation.method && (
                    <span className="rounded-full border border-glass-border bg-white/[0.03] px-3 py-1 font-code-mono text-[10px] text-on-surface-variant">
                      Method: {explanation.method}
                    </span>
                  )}
                </div>

                {explanation.citationsUsed?.length > 0 && (
                  <details className="rounded-lg border border-glass-border bg-white/[0.02] p-4">
                    <summary className="cursor-pointer font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-on-surface">
                      View sources ({explanation.citationsUsed.length})
                    </summary>
                    <ul className="mt-3 space-y-1.5">
                      {explanation.citationsUsed.map((citation) => (
                        <li
                          key={citation}
                          className="flex items-start gap-2 font-code-mono text-[11px] leading-relaxed text-on-surface-variant"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cytosine-azure" />
                          {citation}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setExplanation(null)
                      setUserQuestion('')
                    }}
                    className="btn-primary flex-1"
                  >
                    <Icon name="refresh" size={18} />
                    Ask another question
                  </button>
                  <button type="button" onClick={handleClose} className="btn-secondary flex-1">
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="mt-6 border-t border-glass-border pt-4 font-code-mono text-[11px] leading-relaxed text-on-surface-variant/70">
              <strong className="text-guanine-amber">Educational / research only:</strong> this
              explanation is generated for educational visualization. It describes associations from
              current data models — not medical predictions or advice. Always consult qualified
              healthcare professionals for medical decisions.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

ExplainButton.propTypes = {
  anatomyGraph: PropTypes.object.isRequired,
  className: PropTypes.string
}

export default ExplainButton
