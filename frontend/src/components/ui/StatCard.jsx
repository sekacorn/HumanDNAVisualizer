import Icon from './Icon'

const ACCENTS = {
  emerald: { text: 'text-adenine-emerald', glow: 'shadow-glow-adenine', rgb: '78, 222, 163' },
  azure: { text: 'text-cytosine-azure', glow: 'shadow-glow-cytosine', rgb: '173, 198, 255' },
  amber: { text: 'text-guanine-amber', glow: 'shadow-glow-guanine', rgb: '255, 180, 0' },
  crimson: { text: 'text-thymine-crimson', glow: 'shadow-glow-thymine', rgb: '255, 180, 171' },
}

/**
 * Metric tile for the bento grid. One number, one label, one optional trend —
 * anything denser belongs in a table.
 */
function StatCard({ label, value, unit, trend, trendDirection = 'up', icon, accent = 'emerald', footnote, className = '' }) {
  const tone = ACCENTS[accent] || ACCENTS.emerald

  return (
    <div className={`glass-panel rounded-card group relative flex flex-col justify-between overflow-hidden p-card-padding ${className}`}>
      {icon && (
        <Icon
          name={icon}
          size={72}
          className={`pointer-events-none absolute -right-2 -top-2 opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.16] ${tone.text}`}
        />
      )}

      <div className="relative">
        <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">{label}</p>
        <div className="mt-3 flex items-baseline gap-1">
          <span className={`font-headline-lg text-headline-lg ${tone.text}`}>{value}</span>
          {unit && <span className="font-body-md text-body-md text-on-surface-variant">{unit}</span>}
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-2">
        {trend ? (
          <span className={`flex items-center gap-1 font-code-mono text-xs ${tone.text}`}>
            <Icon name={trendDirection === 'down' ? 'trending_down' : 'trending_up'} size={16} />
            {trend}
          </span>
        ) : (
          <span />
        )}
        {footnote && <span className="font-code-mono text-xs text-on-surface-variant/70">{footnote}</span>}
      </div>
    </div>
  )
}

export default StatCard
