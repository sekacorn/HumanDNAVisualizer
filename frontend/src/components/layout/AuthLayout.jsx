import { Link } from 'react-router-dom'
import Wordmark from '../ui/Wordmark'
import SequenceStrip from '../ui/SequenceStrip'

/**
 * Split canvas for sign-in / registration.
 *
 * Desktop: brand panel with a live read stream on the left, form on the right.
 * Mobile: the brand panel collapses to a compact header so the form is above
 * the fold on a 375px viewport.
 */
function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-surface bg-grid-pattern">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-primary-container blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[40%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <aside className="hidden flex-col justify-between border-r border-glass-border bg-surface-container-lowest/60 p-margin backdrop-blur-xl lg:flex">
          <Link to="/">
            <Wordmark size="lg" />
          </Link>

          <div className="max-w-md">
            <h2 className="font-display-xl text-display-xl leading-[1.05] text-on-surface">
              The <span className="text-gradient-dna">living blueprint</span>, decoded.
            </h2>
            <p className="mt-6 font-body-lg text-body-lg text-on-surface-variant">
              Interactive 3D genomics, AI trait predictions and evidence-graded insight — in one
              command centre.
            </p>
          </div>

          <div className="glass-panel rounded-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-glass-border px-4 py-3">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                Live read stream
              </span>
              <span className="flex items-center gap-1.5 font-code-mono text-xs text-secondary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
                ACTIVE
              </span>
            </div>
            <div className="h-40 px-4 py-2">
              <SequenceStrip rows={8} width={40} seed={7} />
            </div>
          </div>
        </aside>

        {/* Form panel */}
        <main className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-margin">
          <Link to="/" className="mb-8 self-start lg:hidden">
            <Wordmark size="md" />
          </Link>
          <div className="mx-auto w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default AuthLayout
