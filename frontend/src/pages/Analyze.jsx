import { useState } from 'react'
import DataUpload from '../components/DataUpload'
import TraitDetails from '../components/TraitDetails'
import LLMChat from '../components/LLMChat'
import Icon from '../components/ui/Icon'
import PageHeader from '../components/ui/PageHeader'
import StatusPill from '../components/ui/StatusPill'

const SOURCES = [
  { key: 'vcf', label: 'Genomic data', format: 'VCF', icon: 'genetics', accent: 'text-secondary' },
  { key: 'fhir', label: 'Health records', format: 'FHIR', icon: 'health_and_safety', accent: 'text-cytosine-azure' },
  { key: 'csv', label: 'Lifestyle data', format: 'CSV', icon: 'table_chart', accent: 'text-guanine-amber' },
]

function Analyze() {
  const [userId] = useState(() => `user_${Math.random().toString(36).slice(2, 11)}`)
  const [predictions, setPredictions] = useState(null)
  const [uploadStatus, setUploadStatus] = useState({ vcf: false, fhir: false, csv: false })

  const handleUploadSuccess = (dataType) => {
    setUploadStatus((prev) => ({ ...prev, [dataType]: true }))
  }

  const connected = Object.values(uploadStatus).filter(Boolean).length

  return (
    <div className="space-y-bento-gap">
      <PageHeader
        eyebrow="Variant analysis"
        title="Analyze your DNA"
        subtitle="Connect your data sources, run AI trait predictions, and interrogate the results in plain language."
        actions={
          <>
            <StatusPill tone={connected > 0 ? 'success' : 'neutral'} pulse={connected > 0}>
              {connected}/3 sources
            </StatusPill>
            <span className="hidden items-center gap-2 rounded-full border border-glass-border bg-white/[0.03] px-3 py-1.5 font-code-mono text-xs text-on-surface-variant sm:flex">
              <Icon name="fingerprint" size={16} className="text-cytosine-azure" />
              {userId}
            </span>
          </>
        }
      />

      {/* Source status */}
      <div className="grid grid-cols-1 gap-bento-gap sm:grid-cols-3">
        {SOURCES.map((source) => {
          const done = uploadStatus[source.key]
          return (
            <div
              key={source.key}
              className={`glass-panel rounded-card flex items-center gap-4 p-card-padding transition-colors ${
                done ? '!border-l-2 !border-l-secondary' : ''
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                  done ? 'bg-secondary/15 text-secondary' : `bg-white/5 ${source.accent}`
                }`}
              >
                <Icon name={done ? 'check_circle' : source.icon} size={22} fill={done} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-on-surface">{source.label}</p>
                <p className="mt-0.5 font-code-mono text-[11px] text-on-surface-variant">
                  {source.format} · {done ? 'connected' : 'awaiting upload'}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Upload + results */}
      <div className="grid grid-cols-1 gap-bento-gap lg:grid-cols-12">
        <div className="lg:col-span-5 xl:col-span-4">
          <DataUpload
            userId={userId}
            onPredictionsUpdate={setPredictions}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        <div className="lg:col-span-7 xl:col-span-8">
          {predictions ? (
            <TraitDetails predictions={predictions} />
          ) : (
            <div className="glass-panel rounded-card flex h-full min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
              <Icon name="query_stats" size={44} className="text-secondary/30" />
              <h2 className="mt-4 font-headline-md text-lg text-on-surface">
                No predictions yet
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-on-surface-variant">
                Upload a VCF file to run the trait models. Every result arrives with an evidence
                grade so you can weigh it honestly.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['Health risk', 'Cognitive traits', 'Ancestry'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-glass-border bg-white/[0.03] px-3 py-1.5 font-code-mono text-[11px] text-on-surface-variant"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <LLMChat userId={userId} />
    </div>
  )
}

export default Analyze
