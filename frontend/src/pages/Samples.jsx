import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { listUserSamples, deleteSample } from '../services/api'
import authService from '../services/authService'
import Icon from '../components/ui/Icon'
import PageHeader from '../components/ui/PageHeader'
import StatusPill from '../components/ui/StatusPill'

/**
 * Samples Page
 *
 * List and manage imported genomic samples.
 * Educational/research purposes only.
 */

function Samples() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()

  const [samples, setSamples] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadSamples = useCallback(async () => {
    if (!user) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await listUserSamples(user.userId || user.username)
      setSamples(response.data)

    } catch (err) {
      console.error('Error loading samples:', err)
      setError(err.response?.data?.message || 'Failed to load samples')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadSamples()
  }, [loadSamples])

  const handleView3D = useCallback((sampleId) => {
    navigate(`/anatomy?sampleId=${sampleId}`)
  }, [navigate])

  const handleDelete = useCallback((sample) => {
    setDeleteConfirm(sample)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return

    try {
      setDeleting(true)
      await deleteSample(deleteConfirm.id)

      setSamples(prev => prev.filter(s => s.id !== deleteConfirm.id))
      setDeleteConfirm(null)

    } catch (err) {
      console.error('Error deleting sample:', err)
      setError(err.response?.data?.message || 'Failed to delete sample')
    } finally {
      setDeleting(false)
    }
  }, [deleteConfirm])

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (num) => {
    if (num == null) return '0'
    return num.toLocaleString()
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Icon name="progress_activity" size={44} className="animate-spin text-cytosine-azure" />
        <p className="font-code-mono text-sm text-on-surface-variant">Loading samples…</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="glass-panel rounded-card border-l-2 !border-l-error p-card-padding">
        <div className="flex items-start gap-3">
          <Icon name="error" size={22} className="mt-0.5 shrink-0 text-error" />
          <div>
            <h2 className="font-label-caps text-label-caps uppercase text-error">
              Error loading samples
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{error}</p>
            <button type="button" onClick={loadSamples} className="btn-ghost mt-4">
              <Icon name="refresh" size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-bento-gap">
      <PageHeader
        eyebrow="Sample library"
        title="My genomic samples"
        subtitle={`${samples.length} sample${samples.length !== 1 ? 's' : ''} imported`}
        actions={
          <button type="button" onClick={() => navigate('/import')} className="btn-primary btn-scan">
            <Icon name="add" size={18} />
            Import sample
          </button>
        }
      />

      {/* Empty state */}
      {samples.length === 0 && (
        <div className="glass-panel rounded-card flex flex-col items-center px-6 py-16 text-center">
          <Icon name="science" size={56} className="text-secondary/25" />
          <h2 className="mt-4 font-headline-md text-lg text-on-surface">No samples yet</h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-on-surface-variant">
            Import your first genomic data file to start building the library.
          </p>
          <button
            type="button"
            onClick={() => navigate('/import')}
            className="btn-primary btn-scan mt-6"
          >
            <Icon name="upload_file" size={18} />
            Import sample
          </button>
        </div>
      )}

      {/* Samples list */}
      {samples.length > 0 && (
        <ul className="space-y-4">
          {samples.map((sample) => (
            <li
              key={sample.id}
              className="glass-panel rounded-card p-card-padding transition-colors hover:bg-white/[0.03]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  {/* Sample header */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-headline-md text-lg text-on-surface">
                      Sample #{sample.id}
                    </h2>
                    <StatusPill tone="processing">
                      {sample.importFormat?.toUpperCase() || 'UNKNOWN'}
                    </StatusPill>
                    {sample.importStatus && (
                      <StatusPill
                        tone={sample.importStatus === 'SUCCESS' ? 'success' : 'warning'}
                      >
                        {sample.importStatus}
                      </StatusPill>
                    )}
                  </div>

                  {/* Sample details */}
                  <dl className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                      ['Imported', formatDate(sample.importedAt)],
                      ['Variants', formatNumber(sample.variantCount)],
                      ['Genome build', sample.genomeBuild || 'Not specified'],
                      ['Parser version', sample.parserVersion || 'N/A'],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <dt className="font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70">
                          {label}
                        </dt>
                        <dd className="mt-1 truncate text-sm text-on-surface">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  {sample.fileHash && (
                    <p className="mt-4 truncate font-code-mono text-[11px] text-on-surface-variant/60">
                      Hash: {sample.fileHash.substring(0, 16)}…
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2 lg:flex-col">
                  <button
                    type="button"
                    onClick={() => handleView3D(sample.id)}
                    className="btn-primary btn-scan flex-1 whitespace-nowrap !px-4 !py-2.5 lg:flex-none"
                    title="View in 3D anatomy viewer"
                  >
                    <Icon name="3d_rotation" size={18} />
                    View 3D
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(sample)}
                    className="tap-target flex flex-1 items-center justify-center gap-2 rounded-full border border-error/40 bg-error/10 px-4 py-2.5 font-label-caps text-label-caps uppercase text-error transition-colors hover:bg-error/20 lg:flex-none"
                    title="Delete this sample"
                  >
                    <Icon name="delete" size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            role="presentation"
            onClick={() => !deleting && setDeleteConfirm(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="glass-panel-elevated relative w-full max-w-md animate-fade-up rounded-card p-card-padding"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/15 text-error">
                <Icon name="delete_forever" size={22} />
              </span>
              <div className="min-w-0">
                <h2 id="delete-title" className="font-headline-md text-lg text-on-surface">
                  Delete sample #{deleteConfirm.id}?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  This permanently removes the sample and all{' '}
                  {formatNumber(deleteConfirm.variantCount)} variant calls. This action cannot be
                  undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="tap-target flex flex-1 items-center justify-center gap-2 rounded-full bg-error px-4 py-3 font-label-caps text-label-caps uppercase text-on-error transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Icon name="progress_activity" size={18} className="animate-spin" />
                    Deleting
                  </>
                ) : (
                  <>
                    <Icon name="delete" size={18} />
                    Delete sample
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Educational disclaimer */}
      <section className="glass-panel rounded-card border-l-2 !border-l-guanine-amber p-card-padding">
        <div className="flex items-start gap-3">
          <Icon name="warning" size={20} className="mt-0.5 shrink-0 text-guanine-amber" />
          <div>
            <h2 className="font-label-caps text-label-caps uppercase text-guanine-amber">
              Educational / research use only
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              All samples are processed for educational visualization and association modeling. Data
              represents genomic-anatomic associations with labeled evidence quality — not medical
              predictions or recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Samples
