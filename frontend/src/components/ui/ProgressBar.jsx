/** Gradient progress track with the shimmer sweep from the design system. */
function ProgressBar({ value = 0, label, showValue = true, className = '' }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          {label && (
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{label}</span>
          )}
          {showValue && <span className="font-code-mono text-xs text-secondary">{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
