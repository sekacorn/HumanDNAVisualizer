import PropTypes from 'prop-types'
import EvidenceBadge from './EvidenceBadge'
import Icon from './ui/Icon'

/**
 * NodeDetailPanel Component
 *
 * Displays detailed information about a selected anatomical node and its overlays.
 * Educational/research purposes only.
 */

function NodeDetailPanel({ node, overlays = [], onClose, className = '' }) {
  if (!node) return null

  return (
    <div className={`glass-panel rounded-card p-card-padding ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-headline-md text-lg text-on-surface">{node.label}</h3>
          <span className="mt-1 block font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70">
            {node.type}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="tap-target -mr-2 -mt-2 flex shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label="Close detail panel"
          >
            <Icon name="close" />
          </button>
        )}
      </div>

      {/* Node ID */}
      <div className="mb-4 rounded-lg border border-glass-border bg-white/[0.02] px-3 py-2">
        <div className="font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70">
          Node ID
        </div>
        <code className="mt-1 block break-all font-code-mono text-xs text-cytosine-azure">
          {node.id}
        </code>
      </div>

      {/* Overlays */}
      {overlays.length > 0 ? (
        <div>
          <h4 className="mb-3 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Associations ({overlays.length})
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {overlays.map((overlay, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-glass-border bg-white/[0.02] p-3"
              >
                {/* Evidence badge */}
                <div className="mb-2">
                  <EvidenceBadge level={overlay.evidence} size="sm" />
                </div>

                {/* Label */}
                <p className="mb-3 text-sm leading-relaxed text-on-surface-variant">
                  {overlay.label}
                </p>

                {/* Intensity */}
                <div className="mb-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70">
                      Association strength
                    </span>
                    <span className="font-code-mono text-xs text-secondary">
                      {(overlay.intensity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${overlay.intensity * 100}%` }}
                      role="progressbar"
                      aria-valuenow={overlay.intensity * 100}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                {/* Sources */}
                {overlay.sources && overlay.sources.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70 transition-colors hover:text-on-surface">
                      View sources ({overlay.sources.length})
                    </summary>
                    <ul className="ml-1 mt-2 space-y-1">
                      {overlay.sources.map((source) => (
                        <li
                          key={source}
                          className="flex items-start gap-2 font-code-mono text-[11px] leading-relaxed text-on-surface-variant"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cytosine-azure" />
                          {source}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 text-center">
          <Icon name="inbox" size={40} className="text-on-surface-variant/30" />
          <p className="mt-3 text-sm text-on-surface-variant">
            No associations for this structure
          </p>
        </div>
      )}

      {/* Educational note */}
      <div className="mt-4 border-t border-glass-border pt-4">
        <p className="font-code-mono text-[11px] leading-relaxed text-on-surface-variant/70">
          <strong className="text-on-surface">Note:</strong> associations represent
          genomic-anatomic models from current data. Not medical advice or predictions.
        </p>
      </div>
    </div>
  )
}

NodeDetailPanel.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }),
  overlays: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    evidence: PropTypes.oneOf(['HIGH', 'MEDIUM', 'LOW']).isRequired,
    intensity: PropTypes.number.isRequired,
    sources: PropTypes.arrayOf(PropTypes.string)
  })),
  onClose: PropTypes.func,
  className: PropTypes.string
}

export default NodeDetailPanel
