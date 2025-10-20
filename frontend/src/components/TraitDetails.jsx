import { useState } from 'react'

function TraitDetails({ predictions }) {
  const [expandedTrait, setExpandedTrait] = useState(null)

  if (!predictions || !predictions.predictions) {
    return null
  }

  const getRiskColor = (level) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'text-green-400'
      case 'moderate':
        return 'text-yellow-400'
      case 'high':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getRiskBg = (level) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-green-900 border-green-500'
      case 'moderate':
        return 'bg-yellow-900 border-yellow-500'
      case 'high':
        return 'bg-red-900 border-red-500'
      default:
        return 'bg-gray-900 border-gray-500'
    }
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-purple-400">Your Trait Predictions</h2>

      {/* Overall Risk Score */}
      <div className="mb-8 p-4 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg border border-blue-500">
        <div className="text-center">
          <p className="text-gray-300 mb-2">Overall Risk Score</p>
          <p className="text-4xl font-bold text-white">
            {(predictions.overall_risk_score * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Trait Cards */}
      <div className="space-y-4">
        {predictions.predictions.map((trait, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${getRiskBg(trait.risk_level)} ${
              expandedTrait === index ? 'scale-105' : ''
            }`}
            onClick={() => setExpandedTrait(expandedTrait === index ? null : index)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-white">{trait.trait_name}</h3>
                <p className={`text-lg font-medium ${getRiskColor(trait.risk_level)}`}>
                  Risk Level: {trait.risk_level}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Confidence</p>
                <p className="text-lg font-semibold text-white">
                  {(trait.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {expandedTrait === index && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <p className="text-gray-300 mb-4">{trait.description}</p>

                <h4 className="font-semibold text-white mb-2">Recommendations:</h4>
                <ul className="space-y-2">
                  {trait.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-gray-300 flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400">
          <strong className="text-white">Note:</strong> These predictions are based on genetic markers and should not replace professional medical advice. Consult healthcare providers for personalized guidance.
        </p>
      </div>
    </div>
  )
}

export default TraitDetails
