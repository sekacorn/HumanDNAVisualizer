/**
 * Material Symbols wrapper. `fill` switches the variable-font FILL axis, which
 * the design system uses to mark the active navigation destination.
 */
function Icon({ name, className = '', size = 24, fill = false, ...rest }) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined leading-none ${className}`}
      data-fill={fill ? '1' : '0'}
      style={{ fontSize: `${size}px`, width: `${size}px`, height: `${size}px` }}
      {...rest}
    >
      {name}
    </span>
  )
}

export default Icon
