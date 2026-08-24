import Icon from './Icon'

const TONES = {
  success: 'bg-secondary/10 text-secondary border-secondary/30',
  processing: 'bg-cytosine-azure/10 text-cytosine-azure border-cytosine-azure/30',
  warning: 'bg-guanine-amber/10 text-guanine-amber border-guanine-amber/30',
  danger: 'bg-error/10 text-error border-error/30',
  neutral: 'bg-white/5 text-on-surface-variant border-glass-border',
}

/** Small status descriptor. Colour carries meaning, so keep the tone honest. */
function StatusPill({ tone = 'neutral', icon, pulse = false, children, className = '' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded border px-2 py-1 font-label-caps text-label-caps uppercase ${TONES[tone] || TONES.neutral} ${className}`}
    >
      {pulse && <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-current" />}
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  )
}

export default StatusPill
