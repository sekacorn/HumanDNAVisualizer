/**
 * VisualizationDisclaimer Component
 *
 * Disclaimer for 3D anatomy viewer and visualizations.
 * Clarifies that visualizations show associations, not medical predictions.
 *
 * Based on: spec/08_legal_compliance.md Section 4.3
 */

function VisualizationDisclaimer() {
  return (
    <div className="card bg-purple-900 bg-opacity-10 border-purple-500">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <svg
          className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>

        {/* Content */}
        <div className="flex-1">
          <h4 className="text-purple-400 font-bold text-base mb-2">
            📊 VISUALIZATION DISCLAIMER
          </h4>

          <p className="text-sm text-gray-300 leading-relaxed">
            This 3D visualization shows <strong>genomic-anatomic associations</strong> from current
            data models. These are <strong>NOT</strong> medical predictions or{' '}
            <span className="underline">diagnoses</span>. Evidence
            levels (HIGH/MEDIUM/LOW) indicate <strong>association strength</strong> from research,
            not medical certainty. Educational and research purposes only.
          </p>

          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              <strong>Note:</strong> Always consult qualified healthcare professionals for medical
              decisions. This platform does not provide medical advice or{' '}
              <span className="underline">recommendations</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisualizationDisclaimer;
