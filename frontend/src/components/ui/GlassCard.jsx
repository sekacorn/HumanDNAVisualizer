import Icon from './Icon'

/**
 * Level-1 bento cell. Depth comes from backdrop blur plus rim light on the
 * top/left edges, per the elevation model.
 */
function GlassCard({
  as: Tag = 'div',
  title,
  icon,
  accent = 'secondary',
  action,
  className = '',
  bodyClassName = '',
  children,
  ...rest
}) {
  const accentText = {
    secondary: 'text-secondary',
    azure: 'text-cytosine-azure',
    amber: 'text-guanine-amber',
    crimson: 'text-error',
    neutral: 'text-on-surface-variant',
  }[accent] || 'text-secondary'

  return (
    <Tag className={`glass-panel rounded-card flex flex-col ${className}`} {...rest}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 border-b border-glass-border px-card-padding py-4">
          <h3 className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-on-surface">
            {icon && <Icon name={icon} size={18} className={accentText} />}
            {title}
          </h3>
          {action}
        </div>
      )}
      <div className={`p-card-padding ${bodyClassName}`}>{children}</div>
    </Tag>
  )
}

export default GlassCard
