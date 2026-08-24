import { useState } from 'react'
import Icon from './ui/Icon'
import ProgressBar from './ui/ProgressBar'

/**
 * Risk tones follow the base-pair spectrum: emerald reads as benign, amber as
 * a warning, crimson as a variant of concern.
 */
const RISK_TONES = {
  low: {
    text: 'text-adenine-emerald',
    border: 'border-adenine-emerald/40',
    bg: 'bg-adenine-emerald/[0.06]',
    dot: 'bg-adenine-emerald',
    icon: 'check_circle',
  },
  moderate: {
    text: 'text-guanine-amber',
    border: 'border-guanine-amber/40',
    bg: 'bg-guanine-amber/[0.06]',
    dot: 'bg-guanine-amber',
    icon: 'warning',
  },
  high: {
    text: 'text-thymine-crimson',
    border: 'border-thymine-crimson/40',
    bg: 'bg-thymine-crimson/[0.06]',
    dot: 'bg-thymine-crimson',
    icon: 'error',
  },
}

const FALLBACK_TONE = {
  text: 'text-on-surface-variant',
  border: 'border-glass-border',
  bg: 'bg-white/[0.02]',
  dot: 'bg-outline',
  icon: 'help',
}

function toneFor(level) {
  return RISK_TONES[String(level || '').toLowerCase()] || FALLBACK_TONE
}

function TraitDetails({ predictions }) {
  const [expandedTrait, setExpandedTrait] = useState(null)

  if (!predictions || !predictions.predictions) {
    return null
  }

  const overall = (predictions.overall_risk_score || 0) * 100

  return (
    <section className="glass-panel rounded-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-glass-border px-card-padding py-4">
        <h2 className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-on-surface">
          <Icon name="psychology" size={18} className="text-guanine-amber" />
          Trait predictions
        </h2>
        <span className="font-code-mono text-xs text-on-surface-variant">
          {predictions.predictions.length} traits
        </span>
      </div>

      <div className="p-card-padding">
        {/* Composite score */}
        <div className="rounded-card border border-glass-border bg-gradient-to-br from-primary-container/60 to-transparent p-card-padding">
          <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">
            Overall risk score
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <p className="font-display-xl text-4xl leading-none text-gradient-dna md:text-display-xl">
              {overall.toFixed(1)}
              <span className="text-xl text-on-surface-variant">%</span>
            </p>
            <p className="max-w-sm font-code-mono text-[11px] leading-relaxed text-on-surface-variant">
              Composite across all evaluated traits. Association strength, not medical certainty.
            </p>
          </div>
          <ProgressBar value={overall} showValue={false} className="mt-4" />
        </div>

        {/* Trait cards */}
        <ul className="mt-bento-gap space-y-3">
          {predictions.predictions.map((trait, index) => {
            const tone = toneFor(trait.risk_level)
            const expanded = expandedTrait === index
            const confidence = (trait.confidence || 0) * 100

            return (
              <li key={trait.trait_name || index}>
                <div className={`overflow-hidden rounded-card border ${tone.border} ${tone.bg}`}>
                  <button
                    type="button"
                    onClick={() => setExpandedTrait(expanded ? null : index)}
                    aria-expanded={expanded}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <Icon name={tone.icon} size={20} className={`mt-0.5 shrink-0 ${tone.text}`} />
                      <div className="min-w-0">
                        <h3 className="truncate font-headline-md text-base text-on-surface">
                          {trait.trait_name}
                        </h3>
                        <p
                          className={`mt-1 font-label-caps text-label-caps uppercase ${tone.text}`}
                        >
                          {trait.risk_level} risk
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <p className="font-code-mono text-[10px] uppercase text-on-surface-variant">
                          Confidence
                        </p>
                        <p className="text-on-surface">{confidence.toFixed(0)}%</p>
                      </div>
                      <Icon
                        name="expand_more"
                        size={20}
                        className={`text-on-surface-variant transition-transform ${
                          expanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {expanded && (
                    <div className="animate-fade-up border-t border-glass-border px-4 pb-4 pt-4">
                      <ProgressBar value={confidence} label="Model confidence" />

                      {trait.description && (
                        <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                          {trait.description}
                        </p>
                      )}

                      {trait.recommendations?.length > 0 && (
                        <>
                          <h4 className="mb-2 mt-5 font-label-caps text-label-caps uppercase text-on-surface">
                            Suggested next steps
                          </h4>
                          <ul className="space-y-2">
                            {trait.recommendations.map((rec) => (
                              <li
                                key={rec}
                                className="flex items-start gap-2.5 text-sm leading-relaxed text-on-surface-variant"
                              >
                                <span
                                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`}
                                />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <p className="mt-bento-gap rounded-lg border border-glass-border bg-white/[0.02] p-4 font-code-mono text-xs leading-relaxed text-on-surface-variant/80">
          <strong className="text-on-surface">Note:</strong> These predictions derive from genetic
          markers and do not replace professional medical advice. Consult a healthcare provider for
          personalized guidance.
        </p>
      </div>
    </section>
  )
}

export default TraitDetails
