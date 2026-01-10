import PropTypes from 'prop-types'
import EvidenceBadge from './EvidenceBadge'

/**
 * OverlayLegend Component
 *
 * Legend for overlay visualization with toggle controls.
 * Educational/research purposes only.
 */

function OverlayLegend({ overlays = [], visible = true, onToggle, className = '' }) {
  // Count overlays by evidence level
  const counts = {
    HIGH: overlays.filter(o => o.evidence === 'HIGH').length,
    MEDIUM: overlays.filter(o => o.evidence === 'MEDIUM').length,
    LOW: overlays.filter(o => o.evidence === 'LOW').length
  }

  const totalCount = overlays.length

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">
          Overlays ({totalCount})
        </h3>
        {onToggle && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => onToggle(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              aria-label="Toggle overlay visibility"
            />
            <span className="text-sm text-gray-300">Show</span>
          </label>
        )}
      </div>

      <div className="space-y-3">
        {/* High evidence */}
        <div className="flex items-center justify-between">
          <EvidenceBadge level="HIGH" size="sm" />
          <span className="text-gray-400 text-sm">{counts.HIGH}</span>
        </div>

        {/* Medium evidence */}
        <div className="flex items-center justify-between">
          <EvidenceBadge level="MEDIUM" size="sm" />
          <span className="text-gray-400 text-sm">{counts.MEDIUM}</span>
        </div>

        {/* Low evidence */}
        <div className="flex items-center justify-between">
          <EvidenceBadge level="LOW" size="sm" />
          <span className="text-gray-400 text-sm">{counts.LOW}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Evidence levels represent association strength from current data models,
          not medical certainty or predictions.
        </p>
      </div>
    </div>
  )
}

OverlayLegend.propTypes = {
  overlays: PropTypes.arrayOf(PropTypes.shape({
    evidence: PropTypes.oneOf(['HIGH', 'MEDIUM', 'LOW']).isRequired
  })),
  visible: PropTypes.bool,
  onToggle: PropTypes.func,
  className: PropTypes.string
}

export default OverlayLegend
