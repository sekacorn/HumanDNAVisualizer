import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadCard from '../components/UploadCard'
import Icon from '../components/ui/Icon'
import PageHeader from '../components/ui/PageHeader'
import { importVCF, importGenotype } from '../services/api'
import authService from '../services/authService'

/**
 * Import Page
 *
 * Upload and process genomic data files (VCF, TSV/CSV).
 * Educational/research purposes only.
 */

const ACCEPTED = [
  ['VCF files', 'Standard variant call format (.vcf, .vcf.gz)'],
  ['TSV/CSV files', 'Tab or comma-separated genotype data'],
  ['File size', 'Up to 100 MB per file'],
  ['Reference', 'GRCh37/hg19 or GRCh38/hg38'],
]

const PIPELINE = [
  ['Validate', 'Check file format and structure'],
  ['Parse', 'Extract genomic variant data'],
  ['Store', 'Save in the canonical database schema'],
  ['Model', 'Generate anatomy associations'],
]

function ImportSuccess({ result }) {
  return (
    <div className="mt-4 animate-fade-up rounded-card border border-secondary/40 bg-secondary/[0.08] p-4">
      <div className="flex items-start gap-3">
        <Icon name="check_circle" size={22} className="shrink-0 text-secondary" fill />
        <div className="min-w-0">
          <h4 className="font-label-caps text-label-caps uppercase text-secondary">
            Import successful
          </h4>
          <p className="mt-2 text-sm text-on-surface-variant">{result.message}</p>
          <p className="mt-2 font-code-mono text-xs text-on-surface-variant/80">
            Sample ID: <span className="text-secondary">{result.sampleId}</span> · Variants:{' '}
            <span className="text-secondary">{result.variantCount}</span>
          </p>
          <p className="mt-2 flex items-center gap-2 font-code-mono text-xs text-on-surface-variant/60">
            <Icon name="progress_activity" size={14} className="animate-spin" />
            Redirecting to samples…
          </p>
        </div>
      </div>
    </div>
  )
}

function Import() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()

  const [vcfUploading, setVcfUploading] = useState(false)
  const [vcfProgress, setVcfProgress] = useState(0)
  const [vcfError, setVcfError] = useState(null)
  const [vcfSuccess, setVcfSuccess] = useState(null)

  const [genotypeUploading, setGenotypeUploading] = useState(false)
  const [genotypeProgress, setGenotypeProgress] = useState(0)
  const [genotypeError, setGenotypeError] = useState(null)
  const [genotypeSuccess, setGenotypeSuccess] = useState(null)

  const handleVCFUpload = async (file) => {
    if (!user) {
      setVcfError('User not authenticated')
      return
    }

    try {
      setVcfUploading(true)
      setVcfProgress(0)
      setVcfError(null)
      setVcfSuccess(null)

      // Simulate progress (real progress would require backend support)
      const progressInterval = setInterval(() => {
        setVcfProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await importVCF(file, user.userId || user.username)

      clearInterval(progressInterval)
      setVcfProgress(100)

      setVcfSuccess({
        sampleId: response.data.sampleId,
        variantCount: response.data.variantCount,
        message: response.data.message || 'VCF file imported successfully'
      })

      setTimeout(() => {
        navigate('/samples')
      }, 2000)

    } catch (error) {
      console.error('VCF upload error:', error)
      setVcfError(
        error.response?.data?.message ||
        error.message ||
        'Failed to upload VCF file. Please check the file format and try again.'
      )
    } finally {
      setVcfUploading(false)
    }
  }

  const handleGenotypeUpload = async (file) => {
    if (!user) {
      setGenotypeError('User not authenticated')
      return
    }

    try {
      setGenotypeUploading(true)
      setGenotypeProgress(0)
      setGenotypeError(null)
      setGenotypeSuccess(null)

      const progressInterval = setInterval(() => {
        setGenotypeProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await importGenotype(file, user.userId || user.username)

      clearInterval(progressInterval)
      setGenotypeProgress(100)

      setGenotypeSuccess({
        sampleId: response.data.sampleId,
        variantCount: response.data.variantCount,
        message: response.data.message || 'Genotype file imported successfully'
      })

      setTimeout(() => {
        navigate('/samples')
      }, 2000)

    } catch (error) {
      console.error('Genotype upload error:', error)
      setGenotypeError(
        error.response?.data?.message ||
        error.message ||
        'Failed to upload genotype file. Please check the file format and try again.'
      )
    } finally {
      setGenotypeUploading(false)
    }
  }

  return (
    <div className="space-y-bento-gap">
      <PageHeader
        eyebrow="Ingest pipeline"
        title="Import genomic data"
        subtitle="Upload your genomic data files for visualization and association modeling."
      />

      {/* Spec cards */}
      <div className="grid grid-cols-1 gap-bento-gap md:grid-cols-2">
        <section className="glass-panel rounded-card p-card-padding">
          <h2 className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-cytosine-azure">
            <Icon name="checklist" size={18} />
            What we accept
          </h2>
          <dl className="mt-4 space-y-3">
            {ACCEPTED.map(([term, detail]) => (
              <div key={term} className="flex flex-col gap-0.5 border-b border-glass-border pb-3 last:border-0 last:pb-0">
                <dt className="text-sm text-on-surface">{term}</dt>
                <dd className="font-code-mono text-[11px] leading-relaxed text-on-surface-variant">
                  {detail}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="glass-panel rounded-card p-card-padding">
          <h2 className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-secondary">
            <Icon name="conveyor_belt" size={18} />
            Processing steps
          </h2>
          <ol className="mt-4 space-y-3">
            {PIPELINE.map(([step, detail], i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-secondary/30 bg-secondary/10 font-code-mono text-[11px] text-secondary">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-on-surface">{step}</span>
                  <span className="mt-0.5 block font-code-mono text-[11px] leading-relaxed text-on-surface-variant">
                    {detail}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Upload lanes */}
      <div className="grid grid-cols-1 gap-bento-gap lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-headline-md text-lg text-on-surface">VCF format</h2>
          <UploadCard
            accept=".vcf,.vcf.gz"
            maxSizeMB={100}
            onUpload={handleVCFUpload}
            uploading={vcfUploading}
            progress={vcfProgress}
            error={vcfError}
            title="Upload VCF File"
            description="Variant Call Format (VCF) — industry standard for genomic variants"
            disabled={vcfUploading || !!vcfSuccess}
          />
          {vcfSuccess && <ImportSuccess result={vcfSuccess} />}
        </div>

        <div>
          <h2 className="mb-3 font-headline-md text-lg text-on-surface">TSV/CSV format</h2>
          <UploadCard
            accept=".tsv,.csv"
            maxSizeMB={100}
            onUpload={handleGenotypeUpload}
            uploading={genotypeUploading}
            progress={genotypeProgress}
            error={genotypeError}
            title="Upload TSV/CSV File"
            description="Tab or comma-separated genotype data with flexible column mapping"
            disabled={genotypeUploading || !!genotypeSuccess}
          />
          {genotypeSuccess && <ImportSuccess result={genotypeSuccess} />}
        </div>
      </div>

      {/* Format reference */}
      <section className="glass-panel rounded-card p-card-padding">
        <h2 className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-cytosine-azure">
          <Icon name="terminal" size={18} />
          File format requirements
        </h2>

        <div className="mt-5 space-y-6">
          <div>
            <h3 className="font-headline-md text-base text-on-surface">VCF format</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Standard VCF 4.x with these columns:
            </p>
            {/* Wide fixed-width content scrolls inside its own container */}
            <div className="mt-2 overflow-x-auto rounded border border-glass-border bg-surface-container-lowest/70">
              <code className="block whitespace-pre px-3 py-2 font-code-mono text-xs text-secondary">
                #CHROM  POS  ID  REF  ALT  QUAL  FILTER  INFO  FORMAT  SAMPLE
              </code>
            </div>
          </div>

          <div>
            <h3 className="font-headline-md text-base text-on-surface">TSV/CSV format</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Flexible column names; must include:
            </p>
            <ul className="mt-2 space-y-1.5">
              {[
                'Chromosome — chromosome, chr, chrom or #chr',
                'Position — position, pos or start',
                'Genotype — genotype, gt, or Allele1/Allele2',
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
            <p className="mt-2 font-code-mono text-[11px] text-on-surface-variant/70">
              Optional: rsid, ref, alt, quality, filter
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="glass-panel rounded-card border-l-2 !border-l-guanine-amber p-card-padding">
        <div className="flex items-start gap-3">
          <Icon name="warning" size={20} className="mt-0.5 shrink-0 text-guanine-amber" />
          <div>
            <h2 className="font-label-caps text-label-caps uppercase text-guanine-amber">
              Educational / research use only
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              This platform is designed for educational visualization and association modeling.
              Results represent preliminary associations with evidence quality labels — not medical
              predictions or treatment recommendations. Always consult qualified healthcare
              professionals for medical decisions.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Import
