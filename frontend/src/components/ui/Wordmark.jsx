import Icon from './Icon'

const SIZES = {
  sm: { icon: 22, text: 'text-sm sm:text-base' },
  md: { icon: 26, text: 'text-base sm:text-lg' },
  lg: { icon: 32, text: 'text-lg sm:text-xl' },
}

/**
 * The product wordmark. Single source so the mark stays identical across the
 * rail, the top bar and the auth canvas.
 *
 * "DNA" carries the emerald accent; the surrounding words stay neutral so the
 * full name still reads as one word at small sizes.
 */
function Wordmark({ size = 'md', showIcon = true, className = '' }) {
  const s = SIZES[size] || SIZES.md

  return (
    <span className={`flex min-w-0 items-center gap-2 ${className}`}>
      {showIcon && <Icon name="biotech" size={s.icon} className="shrink-0 text-secondary" fill />}
      <span
        className={`truncate font-headline-md font-bold leading-none tracking-tighter text-on-surface ${s.text}`}
      >
        Human<span className="text-secondary">DNA</span>Visualizer
      </span>
    </span>
  )
}

export default Wordmark
