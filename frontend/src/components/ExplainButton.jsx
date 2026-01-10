import { useState } from 'react'
import PropTypes from 'prop-types'
import { explainVisualization } from '../services/api'

/**
 * ExplainButton Component
 *
 * AI-assisted explanation button for anatomy graph visualizations.
 * Provides safe, educational explanations with evidence labeling.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */

function ExplainButton({ anatomyGraph, className = '' }) {
  const [showExplanation, setShowExplanation] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [style, setStyle] = useState('detailed')
  const [userQuestion, setUserQuestion] = useState('')

  const handleExplain = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await explainVisualization(
        anatomyGraph,
        userQuestion || null,
        style
      )

      setExplanation(response.data)
      setShowExplanation(true)

    } catch (err) {
      console.error('Error getting explanation:', err)
      setError(
        err.response?.data?.detail ||
        'Failed to generate explanation. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setShowExplanation(false)
    setUserQuestion('')
  }

  return (
    <>
      {/* Explain Button */}
      <button
        onClick={() => setShowExplanation(true)}
        className={`
          px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-md font-medium
          hover:from-green-600 hover:to-blue-700 transition
          flex items-center gap-2
          ${className}
        `}
        title="Get AI-assisted explanation"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Explain What I'm Seeing
      </button>

      {/* Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card max-w-3xl w-full my-8 bg-gray-900 border-blue-500">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Visualization Explanation
                </h3>
                <p className="text-sm text-gray-400">
                  AI-assisted educational explanation
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition"
                aria-label="Close explanation"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Question Input */}
            {!explanation && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ask a specific question (optional)
                </label>
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="e.g., What do the overlays mean?"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank for a general explanation
                </p>
              </div>
            )}

            {/* Style Selector */}
            {!explanation && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Explanation Style
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStyle('concise')}
                    className={`
                      px-4 py-2 rounded-md font-medium transition
                      ${style === 'concise'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    Concise
                  </button>
                  <button
                    onClick={() => setStyle('detailed')}
                    className={`
                      px-4 py-2 rounded-md font-medium transition
                      ${style === 'detailed'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    Detailed
                  </button>
                  <button
                    onClick={() => setStyle('technical')}
                    className={`
                      px-4 py-2 rounded-md font-medium transition
                      ${style === 'technical'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    Technical
                  </button>
                </div>
              </div>
            )}

            {/* Generate Button */}
            {!explanation && !loading && (
              <button
                onClick={handleExplain}
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-md font-medium hover:from-green-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Explanation
              </button>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-400">Generating explanation...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mt-4 p-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Explanation Display */}
            {explanation && (
              <div className="space-y-4">
                {/* Safety Warning if query was rewritten */}
                {explanation.queryWasRewritten && (
                  <div className="p-4 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="text-yellow-500 font-bold text-sm mb-1">Query Modified for Safety</h4>
                        <p className="text-xs text-gray-300">{explanation.safetyMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Explanation Text */}
                <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">
                    {explanation.explanationText}
                  </pre>
                </div>

                {/* Safety Labels */}
                <div className="flex flex-wrap gap-2">
                  {explanation.safetyLabels?.map((label, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-900 bg-opacity-30 border border-blue-500 text-blue-400"
                    >
                      {label}
                    </span>
                  ))}
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 border border-gray-600 text-gray-400">
                    Method: {explanation.method}
                  </span>
                </div>

                {/* Citations */}
                {explanation.citationsUsed && explanation.citationsUsed.length > 0 && (
                  <details className="mt-4">
                    <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                      View Sources ({explanation.citationsUsed.length})
                    </summary>
                    <ul className="mt-2 space-y-1 text-xs text-gray-400 ml-4">
                      {explanation.citationsUsed.map((citation, idx) => (
                        <li key={idx} className="list-disc">{citation}</li>
                      ))}
                    </ul>
                  </details>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setExplanation(null)
                      setUserQuestion('')
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
                  >
                    Ask Another Question
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Educational Disclaimer */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                <strong>Educational/Research Only:</strong> This explanation is generated for educational visualization purposes.
                It describes associations from current data models, not medical predictions or advice.
                Always consult qualified healthcare professionals for medical decisions.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

ExplainButton.propTypes = {
  anatomyGraph: PropTypes.object.isRequired,
  className: PropTypes.string
}

export default ExplainButton
