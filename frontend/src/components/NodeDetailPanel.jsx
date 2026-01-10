import PropTypes from 'prop-types'
import EvidenceBadge from './EvidenceBadge'

/**
 * NodeDetailPanel Component
 *
 * Displays detailed information about a selected anatomical node and its overlays.
 * Educational/research purposes only.
 */

function NodeDetailPanel({ node, overlays = [], onClose, className = '' }) {
  if (!node) return null

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{node.label}</h3>
          <span className="text-sm text-gray-400">{node.type}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close detail panel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Node ID */}
      <div className="mb-4 p-2 bg-gray-800 bg-opacity-50 rounded">
        <div className="text-xs text-gray-500">Node ID</div>
        <code className="text-sm text-blue-400">{node.id}</code>
      </div>

      {/* Overlays */}
      {overlays.length > 0 ? (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Associations ({overlays.length})
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {overlays.map((overlay, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-800 bg-opacity-50 rounded border border-gray-700"
              >
                {/* Evidence badge */}
                <div className="mb-2">
                  <EvidenceBadge level={overlay.evidence} size="sm" />
                </div>

                {/* Label */}
                <p className="text-sm text-gray-300 mb-2">{overlay.label}</p>

                {/* Intensity */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Association Strength</span>
                    <span>{(overlay.intensity * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
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
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                      View sources ({overlay.sources.length})
                    </summary>
                    <ul className="mt-2 space-y-1 text-xs text-gray-400 ml-4">
                      {overlay.sources.map((source, sidx) => (
                        <li key={sidx} className="list-disc">{source}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-2 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-sm">No associations for this structure</p>
        </div>
      )}

      {/* Educational note */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          <strong>Note:</strong> Associations represent genomic-anatomic models
          from current data. Not medical advice or predictions.
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
