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
    <div className="card bg-blue-900 bg-opacity-10 border-blue-500">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <svg
          className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5"
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
          <h4 className="text-blue-400 font-bold text-base mb-2">
            📋 DATA PRIVACY NOTICE
          </h4>

          <p className="text-sm text-gray-300 mb-3">
            By uploading genomic data, you acknowledge:
          </p>

          <ul className="text-sm text-gray-300 space-y-2 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 flex-shrink-0">•</span>
              <span>
                This is an <strong>educational/research tool</strong>, not a medical service
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 flex-shrink-0">•</span>
              <span>
                Data is stored securely but you are responsible for its sensitivity
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 flex-shrink-0">•</span>
              <span>
                You have the <strong>right to delete</strong> your data at any time
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 flex-shrink-0">•</span>
              <span>
                We <strong>do not sell or share</strong> your data with third parties
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 flex-shrink-0">•</span>
              <span>
                Genetic data may have implications for family members; use responsibly
              </span>
            </li>
          </ul>

          {/* Consent */}
          {onAccept && !accepted && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  onChange={(e) => onAccept(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                  aria-describedby="consent-description"
                />
                <span
                  id="consent-description"
                  className="text-sm text-gray-300"
                >
                  I acknowledge this notice and consent to the{' '}
                  <a href="/terms" className="text-blue-400 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-400 hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>
          )}

          {accepted && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-green-400 flex items-center gap-2">
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
