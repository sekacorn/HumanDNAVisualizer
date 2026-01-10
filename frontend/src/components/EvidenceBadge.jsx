import PropTypes from 'prop-types'

/**
 * EvidenceBadge Component
 *
 * Displays evidence level (HIGH/MEDIUM/LOW) with appropriate color coding.
 * Educational/research purposes only - represents association strength, not medical certainty.
 */

const EVIDENCE_STYLES = {
  HIGH: {
    bg: 'bg-green-900 bg-opacity-30',
    border: 'border-green-500',
    text: 'text-green-400',
    label: 'High'
  },
  MEDIUM: {
    bg: 'bg-amber-900 bg-opacity-30',
    border: 'border-amber-500',
    text: 'text-amber-400',
    label: 'Medium'
  },
  LOW: {
    bg: 'bg-blue-900 bg-opacity-30',
    border: 'border-blue-500',
    text: 'text-blue-400',
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
        inline-flex items-center gap-1.5 rounded-md border
        ${style.bg} ${style.border} ${style.text}
        ${sizeClasses[size]}
        font-semibold
        ${className}
      `}
      role="status"
      aria-label={`Evidence level: ${style.label}`}
    >
      {/* Visual indicator dot */}
      <span
        className={`w-2 h-2 rounded-full ${style.text.replace('text-', 'bg-')}`}
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
