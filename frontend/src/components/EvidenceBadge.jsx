import PropTypes from 'prop-types'

/**
 * EvidenceBadge Component
 *
 * Displays evidence level (HIGH/MEDIUM/LOW) with appropriate color coding.
 * Educational/research purposes only - represents association strength, not medical certainty.
 */

const EVIDENCE_STYLES = {
  HIGH: {
    bg: 'bg-adenine-emerald/10',
    border: 'border-adenine-emerald/40',
    text: 'text-adenine-emerald',
    dot: 'bg-adenine-emerald',
    label: 'High'
  },
  MEDIUM: {
    bg: 'bg-guanine-amber/10',
    border: 'border-guanine-amber/40',
    text: 'text-guanine-amber',
    dot: 'bg-guanine-amber',
    label: 'Medium'
  },
  LOW: {
    bg: 'bg-cytosine-azure/10',
    border: 'border-cytosine-azure/40',
    text: 'text-cytosine-azure',
    dot: 'bg-cytosine-azure',
    label: 'Low'
  }
}

function EvidenceBadge({ level, showLabel = true, size = 'md', className = '' }) {
  const style = EVIDENCE_STYLES[level] || EVIDENCE_STYLES.LOW

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded border font-label-caps uppercase tracking-wider
        ${style.bg} ${style.border} ${style.text}
        ${sizeClasses[size]}
        ${className}
      `}
      role="status"
      aria-label={`Evidence level: ${style.label}`}
    >
      {/* Visual indicator dot */}
      <span
        className={`h-2 w-2 rounded-full ${style.dot}`}
        aria-hidden="true"
      />

      {showLabel && <span>Evidence: {style.label}</span>}
      {!showLabel && <span className="sr-only">Evidence: {style.label}</span>}
    </span>
  )
}

EvidenceBadge.propTypes = {
  level: PropTypes.oneOf(['HIGH', 'MEDIUM', 'LOW']).isRequired,
  showLabel: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
}

export default EvidenceBadge
