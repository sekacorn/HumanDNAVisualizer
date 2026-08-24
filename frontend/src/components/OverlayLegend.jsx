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
    <div className={`glass-panel rounded-card p-card-padding ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-label-caps text-label-caps uppercase text-on-surface">
          Overlays ({totalCount})
        </h3>
        {onToggle && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => onToggle(e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant bg-surface-container-high accent-[#4edea3]"
              aria-label="Toggle overlay visibility"
            />
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
              Show
            </span>
          </label>
        )}
      </div>

      <div className="space-y-3">
        {/* High evidence */}
        <div className="flex items-center justify-between">
          <EvidenceBadge level="HIGH" size="sm" />
          <span className="font-code-mono text-sm text-on-surface">{counts.HIGH}</span>
        </div>

        {/* Medium evidence */}
        <div className="flex items-center justify-between">
          <EvidenceBadge level="MEDIUM" size="sm" />
          <span className="font-code-mono text-sm text-on-surface">{counts.MEDIUM}</span>
        </div>

        {/* Low evidence */}
        <div className="flex items-center justify-between">
          <EvidenceBadge level="LOW" size="sm" />
          <span className="font-code-mono text-sm text-on-surface">{counts.LOW}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-glass-border pt-4">
        <p className="font-code-mono text-[11px] leading-relaxed text-on-surface-variant/70">
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
