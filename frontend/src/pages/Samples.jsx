import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { listUserSamples, deleteSample } from '../services/api'
import authService from '../services/authService'

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

      // Remove from list
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-xl text-gray-400">Loading samples...</div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card bg-red-900 bg-opacity-20 border-red-500">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Samples</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={loadSamples}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            My Genomic Samples
          </h1>
          <p className="text-gray-400">
            {samples.length} sample{samples.length !== 1 ? 's' : ''} imported
          </p>
        </div>
        <button
          onClick={() => navigate('/import')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md font-medium hover:from-blue-600 hover:to-purple-700 transition"
        >
          + Import New Sample
        </button>
      </div>

      {/* Empty state */}
      {samples.length === 0 && (
        <div className="card text-center py-12">
          <svg
            className="w-16 h-16 text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Samples Yet</h3>
          <p className="text-gray-500 mb-6">Import your first genomic data file to get started</p>
          <button
            onClick={() => navigate('/import')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md font-medium hover:from-blue-600 hover:to-purple-700 transition"
          >
            Import Sample
          </button>
        </div>
      )}

      {/* Samples list */}
      {samples.length > 0 && (
        <div className="space-y-4">
          {samples.map((sample) => (
            <div
              key={sample.id}
              className="card hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Sample header */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-white">
                      Sample #{sample.id}
                    </h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-900 bg-opacity-30 border border-blue-500 text-blue-400">
                      {sample.importFormat?.toUpperCase() || 'UNKNOWN'}
                    </span>
                    {sample.importStatus && (
                      <span className={`
                        px-2 py-1 text-xs font-semibold rounded
                        ${sample.importStatus === 'SUCCESS'
                          ? 'bg-green-900 bg-opacity-30 border-green-500 text-green-400'
                          : 'bg-yellow-900 bg-opacity-30 border-yellow-500 text-yellow-400'
                        }
                      `}>
                        {sample.importStatus}
                      </span>
                    )}
                  </div>

                  {/* Sample details */}
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Imported</div>
                      <div className="text-white font-medium">
                        {formatDate(sample.importedAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Variants</div>
                      <div className="text-white font-medium">
                        {formatNumber(sample.variantCount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Genome Build</div>
                      <div className="text-white font-medium">
                        {sample.genomeBuild || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Parser Version</div>
                      <div className="text-white font-medium">
                        {sample.parserVersion || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* File hash */}
                  {sample.fileHash && (
                    <div className="text-xs text-gray-500">
                      Hash: {sample.fileHash.substring(0, 16)}...
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleView3D(sample.id)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md font-medium hover:from-blue-600 hover:to-purple-700 transition whitespace-nowrap"
                    title="View in 3D anatomy viewer"
                  >
                    View 3D
                  </button>
                  <button
                    onClick={() => handleDelete(sample)}
                    className="px-4 py-2 bg-red-600 bg-opacity-20 border border-red-600 text-red-400 rounded-md font-medium hover:bg-opacity-30 transition"
                    title="Delete this sample"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full bg-gray-900 border-red-500">
            <h3 className="text-xl font-bold text-red-400 mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete Sample #{deleteConfirm.id}?
              This will permanently remove the sample and all {formatNumber(deleteConfirm.variantCount)} variant calls.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Sample'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Educational disclaimer */}
      <div className="mt-8 card bg-yellow-900 bg-opacity-10 border-yellow-600">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h4 className="text-yellow-500 font-bold mb-1">Educational/Research Use Only</h4>
            <p className="text-sm text-gray-300">
              All samples are processed for educational visualization and association modeling.
              Data represents genomic-anatomic associations with labeled evidence quality,
              not medical predictions or recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Samples
