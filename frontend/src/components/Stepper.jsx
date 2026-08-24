import PropTypes from 'prop-types'

/**
 * Stepper Component
 *
 * Visual progress indicator for guided tours. Shows all steps, highlights current step,
 * and allows navigation by clicking on completed or adjacent steps.
 *
 * Colour carries state: azure = current, emerald = completed, neutral = upcoming.
 */

function Stepper({ steps, currentStep, onStepClick }) {
  const handleStepClick = (stepIndex) => {
    // Allow clicking on any step for navigation
    if (onStepClick) {
      onStepClick(stepIndex)
    }
  }

  const progress = Math.round(((currentStep + 1) / steps.length) * 100)

  return (
    <div className="glass-panel rounded-card p-card-padding">
      {/* Desktop View - Horizontal Stepper */}
      <div className="no-scrollbar hidden overflow-x-auto lg:block">
        <div className="flex min-w-max items-start justify-between gap-1">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <div key={step.stepNumber} className="flex flex-1 items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleStepClick(index)}
                    aria-current={isActive ? 'step' : undefined}
                    className={`
                      flex h-10 w-10 cursor-pointer items-center justify-center rounded-full
                      text-sm font-bold transition-all duration-200
                      ${isActive ? 'scale-110 bg-cytosine-azure text-on-primary ring-4 ring-cytosine-azure/25 hover:brightness-110' : ''}
                      ${isCompleted ? 'bg-adenine-emerald text-on-secondary hover:brightness-110' : ''}
                      ${!isActive && !isCompleted ? 'bg-surface-container-high text-on-surface-variant hover:bg-surface-bright' : ''}
                    `}
                  >
                    {isCompleted ? '✓' : step.stepNumber}
                  </button>

                  {/* Step Label */}
                  <div className="mt-2 max-w-[120px] text-center">
                    <div
                      className={`
                        truncate font-label-caps text-[10px] uppercase tracking-wider
                        ${isActive ? 'text-cytosine-azure' : ''}
                        ${isCompleted ? 'text-adenine-emerald' : ''}
                        ${!isActive && !isCompleted ? 'text-on-surface-variant/60' : ''}
                      `}
                      title={step.title}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`
                      mx-2 mt-[-24px] h-1 w-8 flex-1 rounded-full transition-all duration-300
                      ${isCompleted ? 'bg-adenine-emerald' : 'bg-surface-container-highest'}
                    `}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile / tablet View - Vertical Compact Stepper */}
      <div className="lg:hidden">
        <div className="space-y-2">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <button
                key={step.stepNumber}
                type="button"
                onClick={() => handleStepClick(index)}
                aria-current={isActive ? 'step' : undefined}
                className={`
                  tap-target flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3
                  transition-colors
                  ${isActive ? 'border-cytosine-azure/40 bg-cytosine-azure/10 hover:bg-cytosine-azure/20' : ''}
                  ${isCompleted ? 'border-adenine-emerald/30 bg-adenine-emerald/[0.06] hover:bg-adenine-emerald/[0.12]' : ''}
                  ${!isActive && !isCompleted ? 'border-glass-border bg-white/[0.02] hover:bg-white/[0.06]' : ''}
                `}
              >
                {/* Step Number/Check */}
                <div
                  className={`
                    flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full
                    text-sm font-bold
                    ${isActive ? 'bg-cytosine-azure text-on-primary' : ''}
                    ${isCompleted ? 'bg-adenine-emerald text-on-secondary' : ''}
                    ${!isActive && !isCompleted ? 'bg-surface-container-high text-on-surface-variant' : ''}
                  `}
                >
                  {isCompleted ? '✓' : step.stepNumber}
                </div>

                {/* Step Title */}
                <div className="min-w-0 flex-1 text-left">
                  <div
                    className={`
                      truncate text-sm
                      ${isActive ? 'text-cytosine-azure' : ''}
                      ${isCompleted ? 'text-adenine-emerald' : ''}
                      ${!isActive && !isCompleted ? 'text-on-surface-variant' : ''}
                    `}
                  >
                    {step.title}
                  </div>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-cytosine-azure" />
                )}
              </button>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70">
            <span>Progress</span>
            <span className="font-code-mono text-secondary">{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

Stepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      stepNumber: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      explanation: PropTypes.string,
      highlightNodeIds: PropTypes.arrayOf(PropTypes.string),
      overlayConfig: PropTypes.object,
      evidenceLevel: PropTypes.string,
      interactivePrompt: PropTypes.string,
      furtherReading: PropTypes.array
    })
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
  onStepClick: PropTypes.func
}

export default Stepper
