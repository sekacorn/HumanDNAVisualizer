import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * DisclaimerBanner Component
 *
 * Primary disclaimer banner for educational/research use only.
 * Displays at the top of the application.
 *
 * Based on: spec/08_legal_compliance.md Section 4.1
 */

function DisclaimerBanner({ persistent = false }) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user has previously dismissed (if not persistent)
  const [hasSeenBefore] = useState(() => {
    if (persistent) return false;
    return localStorage.getItem('disclaimer_seen') === 'true';
  });

  const handleDismiss = () => {
    if (!persistent) {
      localStorage.setItem('disclaimer_seen', 'true');
      setIsDismissed(true);
    }
  };

  // Don't show if dismissed or seen before (and not persistent)
  if ((!persistent && hasSeenBefore) || isDismissed) {
    return null;
  }

  return (
    <div
      className="glass-panel rounded-card mb-bento-gap border-l-2 !border-l-guanine-amber"
      role="alert"
      aria-live="polite"
    >
      <div className="px-4 py-3 sm:px-card-padding sm:py-4">
        <div className="flex items-start gap-3">
          {/* Warning Icon */}
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-guanine-amber"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>

          {/* Content */}
          <div className="flex-1">
            <h3 className="mb-1.5 font-label-caps text-label-caps uppercase text-guanine-amber">
              Educational / research use only
            </h3>
            <p className="text-xs leading-relaxed text-on-surface-variant sm:text-sm">
              This platform provides educational visualizations of genomic data.
              It is <strong>NOT</strong> a medical device and does <strong>NOT</strong> provide medical{' '}
              <span className="underline">diagnosis</span>,{' '}
              <span className="underline">treatment</span> advice, or health{' '}
              <span className="underline">recommendations</span>. All associations are
              labeled with evidence quality to indicate uncertainty. For medical
              decisions, always consult qualified healthcare professionals.
            </p>
          </div>

          {/* Dismiss Button (if not persistent) */}
          {!persistent && (
            <button
              onClick={handleDismiss}
              className="tap-target -m-2 flex flex-shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-on-surface"
              aria-label="Dismiss disclaimer"
              title="Dismiss this notice"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

DisclaimerBanner.propTypes = {
  persistent: PropTypes.bool
};

export default DisclaimerBanner;
