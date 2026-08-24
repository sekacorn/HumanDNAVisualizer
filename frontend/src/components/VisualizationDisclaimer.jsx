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
    <div className="glass-panel rounded-card border-l-2 !border-l-cytosine-azure p-card-padding">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-cytosine-azure"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>

        {/* Content */}
        <div className="flex-1">
          <h4 className="mb-2 font-label-caps text-label-caps uppercase text-cytosine-azure">
            Visualization disclaimer
          </h4>

          <p className="text-sm leading-relaxed text-on-surface-variant">
            This 3D visualization shows <strong>genomic-anatomic associations</strong> from current
            data models. These are <strong>NOT</strong> medical predictions or{' '}
            <span className="underline">diagnoses</span>. Evidence
            levels (HIGH/MEDIUM/LOW) indicate <strong>association strength</strong> from research,
            not medical certainty. Educational and research purposes only.
          </p>

          <div className="mt-3 border-t border-glass-border pt-3">
            <p className="font-code-mono text-xs leading-relaxed text-on-surface-variant/70">
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
