/**
 * Page-level header. Title scales down on mobile so it never wraps to three
 * lines on a 375px viewport.
 */
function PageHeader({ eyebrow, title, subtitle, actions, className = '' }) {
  return (
    <header className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 font-label-caps text-label-caps uppercase text-secondary">{eyebrow}</p>
        )}
        <h1 className="font-headline-lg text-2xl leading-tight tracking-tight text-on-surface md:text-headline-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl font-body-md text-body-md text-on-surface-variant">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  )
}

export default PageHeader
