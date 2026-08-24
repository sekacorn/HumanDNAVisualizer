import PropTypes from 'prop-types';

/**
 * UploadDisclaimer Component
 *
 * Data privacy notice for file upload pages.
 * Informs users about data handling and their rights.
 *
 * Based on: spec/08_legal_compliance.md Section 4.2
 */

function UploadDisclaimer({ onAccept, accepted = false }) {
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
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>

        {/* Content */}
        <div className="flex-1">
          <h4 className="mb-2 font-label-caps text-label-caps uppercase text-cytosine-azure">
            Data privacy notice
          </h4>

          <p className="mb-3 text-sm text-on-surface-variant">
            By uploading genomic data, you acknowledge:
          </p>

          <ul className="mb-4 space-y-2 text-sm text-on-surface-variant">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-cytosine-azure" />
              <span>
                This is an <strong>educational/research tool</strong>, not a medical service
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-cytosine-azure" />
              <span>
                Data is stored securely but you are responsible for its sensitivity
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-cytosine-azure" />
              <span>
                You have the <strong>right to delete</strong> your data at any time
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-cytosine-azure" />
              <span>
                We <strong>do not sell or share</strong> your data with third parties
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-cytosine-azure" />
              <span>
                Genetic data may have implications for family members; use responsibly
              </span>
            </li>
          </ul>

          {/* Consent */}
          {onAccept && !accepted && (
            <div className="mt-4 border-t border-glass-border pt-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  onChange={(e) => onAccept(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-outline-variant bg-surface-container-high accent-[#4edea3]"
                  aria-describedby="consent-description"
                />
                <span
                  id="consent-description"
                  className="text-sm leading-relaxed text-on-surface-variant"
                >
                  I acknowledge this notice and consent to the{' '}
                  <a href="/terms" className="text-secondary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-secondary hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>
          )}

          {accepted && (
            <div className="mt-4 border-t border-glass-border pt-4">
              <p className="flex items-center gap-2 text-sm text-secondary">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Consent acknowledged
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

UploadDisclaimer.propTypes = {
  onAccept: PropTypes.func,
  accepted: PropTypes.bool
};

export default UploadDisclaimer;
