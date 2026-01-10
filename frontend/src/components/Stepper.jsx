import PropTypes from 'prop-types'

/**
 * Stepper Component
 *
 * Visual progress indicator for guided tours. Shows all steps, highlights current step,
 * and allows navigation by clicking on completed or adjacent steps.
 */

function Stepper({ steps, currentStep, onStepClick }) {
  const handleStepClick = (stepIndex) => {
    // Allow clicking on any step for navigation
    if (onStepClick) {
      onStepClick(stepIndex)
    }
  }

  return (
    <div className="card bg-gray-900 bg-opacity-50">
      {/* Desktop View - Horizontal Stepper */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            const isClickable = true // Allow clicking all steps

            return (
              <div key={step.stepNumber} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleStepClick(index)}
                    disabled={!isClickable}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                      transition-all duration-200
                      ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-opacity-30 scale-110' : ''}
                      ${isCompleted ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : ''}
                      ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                    `}
                  >
                    {isCompleted ? '✓' : step.stepNumber}
                  </button>

                  {/* Step Label */}
                  <div className="mt-2 text-center max-w-[120px]">
                    <div
                      className={`
                        text-xs font-medium truncate
                        ${isActive ? 'text-blue-400' : ''}
                        ${isCompleted ? 'text-green-400' : ''}
                        ${!isActive && !isCompleted ? 'text-gray-500' : ''}
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
                      flex-1 h-1 mx-2 mt-[-24px]
                      transition-all duration-300
                      ${isCompleted ? 'bg-green-600' : 'bg-gray-700'}
                    `}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile View - Vertical Compact Stepper */}
      <div className="md:hidden">
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            const isClickable = true

            return (
              <button
                key={step.stepNumber}
                onClick={() => handleStepClick(index)}
                disabled={!isClickable}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg transition-all
                  ${isActive ? 'bg-blue-900 bg-opacity-30 border border-blue-500' : ''}
                  ${isCompleted ? 'bg-green-900 bg-opacity-20 border border-green-700' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-800 bg-opacity-30 border border-gray-700' : ''}
                  ${isClickable ? 'cursor-pointer hover:bg-opacity-50' : 'cursor-not-allowed'}
                `}
              >
                {/* Step Number/Check */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                    ${isActive ? 'bg-blue-600 text-white' : ''}
                    ${isCompleted ? 'bg-green-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-700 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? '✓' : step.stepNumber}
                </div>

                {/* Step Title */}
                <div className="flex-1 text-left">
                  <div
                    className={`
                      text-sm font-medium
                      ${isActive ? 'text-blue-400' : ''}
                      ${isCompleted ? 'text-green-400' : ''}
                      ${!isActive && !isCompleted ? 'text-gray-500' : ''}
                    `}
                  >
                    {step.title}
                  </div>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
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
