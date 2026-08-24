import { useRef, useState } from 'react'
import { uploadVCF, uploadCSV, predictTraits, getGenomicData } from '../services/api'
import DOMPurify from 'dompurify'
import Icon from './ui/Icon'

const TYPES = [
  { value: 'vcf', label: 'Genomic (VCF)', accept: '.vcf,.txt', icon: 'genetics' },
  { value: 'csv', label: 'Lifestyle (CSV)', accept: '.csv', icon: 'table_chart' },
]

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function DataUpload({ userId, onPredictionsUpdate, onUploadSuccess }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState('neutral')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadType, setUploadType] = useState('vcf')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const activeType = TYPES.find((t) => t.value === uploadType) || TYPES[0]

  const report = (text, tone = 'neutral') => {
    setMessage(text)
    setMessageTone(tone)
  }

  const acceptFile = (file) => {
    if (!file) return
    setSelectedFile(file)
    report(`Selected ${DOMPurify.sanitize(file.name)}`, 'neutral')
  }

  const handleFileSelect = (e) => acceptFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    acceptFile(e.dataTransfer.files?.[0])
  }

  const runPredictions = async () => {
    setLoading(true)
    report('Running AI predictions…')

    try {
      const genomicResponse = await getGenomicData(userId)
      const variants = genomicResponse.data.map((item) => ({
        chromosome: item.chromosome,
        position: item.position,
        referenceAllele: item.referenceAllele,
        alternateAllele: item.alternateAllele,
      }))

      const predictResponse = await predictTraits(userId, { variants })
      onPredictionsUpdate(predictResponse.data)
      report('Predictions complete', 'success')
    } catch (error) {
      report(`Prediction failed: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      report('Select a file first', 'error')
      return
    }

    setLoading(true)
    report('Uploading…')

    try {
      if (uploadType === 'vcf') {
        const response = await uploadVCF(selectedFile, userId)
        if (response.data.success) {
          onUploadSuccess('vcf')
          report(`VCF uploaded — ${response.data.recordsProcessed} variants processed`, 'success')
          await runPredictions()
        }
      } else if (uploadType === 'csv') {
        const response = await uploadCSV(selectedFile, userId)
        if (response.data.success) {
          onUploadSuccess('csv')
          report(`CSV uploaded — ${response.data.recordsProcessed} records processed`, 'success')
        }
      }
    } catch (error) {
      report(`Upload failed: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const messageStyles = {
    success: 'border-secondary/40 bg-secondary/10 text-secondary',
    error: 'border-error/40 bg-error/10 text-error',
    neutral: 'border-glass-border bg-white/[0.03] text-on-surface-variant',
  }[messageTone]

  return (
    <section className="glass-panel rounded-card overflow-hidden">
      <div className="border-b border-glass-border px-card-padding py-4">
        <h2 className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-on-surface">
          <Icon name="cloud_upload" size={18} className="text-cytosine-azure" />
          Upload data
        </h2>
      </div>

      <div className="p-card-padding">
        {/* Data type */}
        <fieldset>
          <legend className="mb-2 font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70">
            Data type
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((type) => {
              const active = uploadType === type.value
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setUploadType(type.value)
                    setSelectedFile(null)
                    report('')
                  }}
                  aria-pressed={active}
                  className={`tap-target flex items-center gap-2 rounded-lg border px-3 py-3 transition-colors ${
                    active
                      ? 'border-cytosine-azure/40 bg-cytosine-azure/10 text-cytosine-azure'
                      : 'border-glass-border bg-white/[0.02] text-on-surface-variant hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon name={type.icon} size={20} />
                  <span className="font-label-caps text-label-caps uppercase">{type.label}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Dropzone */}
        <div
          role="presentation"
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`mt-4 cursor-pointer rounded-card border border-dashed p-6 text-center transition-colors ${
            dragging
              ? 'border-secondary bg-secondary/[0.06]'
              : 'border-outline-variant bg-white/[0.02] hover:border-cytosine-azure/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={activeType.accept}
            onChange={handleFileSelect}
            className="sr-only"
          />
          <Icon
            name={selectedFile ? 'draft' : 'upload_file'}
            size={36}
            className={selectedFile ? 'text-secondary' : 'text-on-surface-variant/60'}
          />
          {selectedFile ? (
            <>
              <p className="mt-3 break-all text-sm text-on-surface">{selectedFile.name}</p>
              <p className="mt-1 font-code-mono text-xs text-on-surface-variant">
                {formatBytes(selectedFile.size)} · {activeType.label}
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-on-surface">
                Drop a file here, or <span className="text-secondary">browse</span>
              </p>
              <p className="mt-1 font-code-mono text-xs text-on-surface-variant">
                Accepts {activeType.accept}
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !selectedFile}
          className="btn-primary btn-scan mt-4 w-full"
        >
          {loading ? (
            <>
              <Icon name="progress_activity" size={18} className="animate-spin" />
              Processing
            </>
          ) : (
            <>
              <Icon name="bolt" size={18} />
              Upload &amp; analyze
            </>
          )}
        </button>

        {message && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-4 rounded-lg border px-4 py-3 font-code-mono text-xs leading-relaxed ${messageStyles}`}
          >
            {message}
          </p>
        )}

        <div className="mt-bento-gap rounded-lg border border-glass-border bg-white/[0.02] p-4">
          <h3 className="mb-2 font-label-caps text-[10px] uppercase tracking-[0.16em] text-cytosine-azure">
            Supported formats
          </h3>
          <ul className="space-y-1.5">
            {[
              'VCF exports from 23andMe and AncestryDNA',
              'CSV lifestyle surveys',
              'FASTA and PDB files (coming soon)',
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 font-code-mono text-[11px] leading-relaxed text-on-surface-variant"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cytosine-azure" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default DataUpload
