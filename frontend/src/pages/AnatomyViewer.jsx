import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import AnatomyScene from '../components/AnatomyScene'
import OverlayLegend from '../components/OverlayLegend'
import NodeDetailPanel from '../components/NodeDetailPanel'
import ExplainButton from '../components/ExplainButton'
import VisualizationDisclaimer from '../components/VisualizationDisclaimer'
import { getAnatomyGraph, getAnatomyGraphStats } from '../services/api'

/**
 * AnatomyViewer Page
 *
 * Interactive 3D anatomy viewer that renders genomic variant overlays on anatomical structures.
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */

function AnatomyViewer() {
  const [searchParams] = useSearchParams()
  const sampleId = searchParams.get('sampleId') || '1' // Default to sample 1 for demo

  const [anatomyGraph, setAnatomyGraph] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [overlaysVisible, setOverlaysVisible] = useState(true)
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedOverlays, setSelectedOverlays] = useState([])

  // Load anatomy graph data
  useEffect(() => {
    const loadAnatomyGraph = async () => {
      try {
        setLoading(true)
        setError(null)

        const [graphResponse, statsResponse] = await Promise.all([
          getAnatomyGraph(sampleId),
          getAnatomyGraphStats(sampleId)
        ])

        // Extract data from SafeAPIResponse wrapper
        // Response structure: { data: {...}, disclaimer: "...", nonDiagnostic: true, ... }
        const graphData = graphResponse.data.data || graphResponse.data
        const statsData = statsResponse.data.data || statsResponse.data

        // Log disclaimer if present (for compliance audit)
        if (graphResponse.data.disclaimer) {
          console.log('[Safety] API Disclaimer:', graphResponse.data.disclaimer)
        }

        setAnatomyGraph(graphData)
        setStats(statsData)
      } catch (err) {
        console.error('Error loading anatomy graph:', err)
        setError(err.response?.data?.message || 'Failed to load anatomy visualization')
      } finally {
        setLoading(false)
      }
    }

    loadAnatomyGraph()
  }, [sampleId])

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-xl text-gray-400">Loading anatomy visualization...</div>
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
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Visualization</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Main content
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          3D Anatomy Visualization
        </h1>
        <p className="text-gray-400">
          Sample ID: {sampleId} | Rules Version: {anatomyGraph?.rulesVersion}
        </p>
      </div>

      {/* Stats Panel */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card bg-blue-900 bg-opacity-20 border-blue-500">
            <div className="text-3xl font-bold text-blue-400">{stats.overlayCount}</div>
            <div className="text-sm text-gray-400">Total Overlays</div>
          </div>
          <div className="card bg-green-900 bg-opacity-20 border-green-500">
            <div className="text-3xl font-bold text-green-400">{stats.highEvidenceCount}</div>
            <div className="text-sm text-gray-400">High Evidence</div>
          </div>
          <div className="card bg-amber-900 bg-opacity-20 border-amber-500">
            <div className="text-3xl font-bold text-amber-400">{stats.mediumEvidenceCount}</div>
            <div className="text-sm text-gray-400">Medium Evidence</div>
          </div>
          <div className="card bg-blue-900 bg-opacity-20 border-blue-500">
            <div className="text-3xl font-bold text-blue-400">{stats.lowEvidenceCount}</div>
            <div className="text-sm text-gray-400">Low Evidence</div>
          </div>
        </div>
      )}

      {/* Visualization Disclaimer */}
      <div className="mb-6">
        <VisualizationDisclaimer />
      </div>

      {/* Controls Panel */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Visualization Controls</h3>
            <p className="text-sm text-gray-400">
              Click and drag to rotate | Scroll to zoom | Click nodes to isolate
            </p>
          </div>
          <div className="flex items-center gap-4">
            {anatomyGraph && <ExplainButton anatomyGraph={anatomyGraph} />}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={overlaysVisible}
                onChange={(e) => setOverlaysVisible(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white text-sm font-medium">Show Overlays</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="card" style={{ height: '600px' }}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-xl text-gray-400">Initializing 3D scene...</div>
            </div>
          }
        >
          {anatomyGraph && (
            <AnatomyScene
              anatomyGraph={anatomyGraph}
              overlaysVisible={overlaysVisible}
            />
          )}
        </Suspense>
      </div>

      {/* Legend */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="card">
          <h3 className="text-xl font-bold mb-4 text-blue-400">Evidence Levels</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
              <div>
                <div className="text-white font-medium">High Evidence</div>
                <div className="text-sm text-gray-400">Well-established, replicated findings</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
              <div>
                <div className="text-white font-medium">Medium Evidence</div>
                <div className="text-sm text-gray-400">Some evidence, requires validation</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
              <div>
                <div className="text-white font-medium">Low Evidence</div>
                <div className="text-sm text-gray-400">Preliminary or indirect associations</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4 text-purple-400">Structure Types</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
              <div>
                <div className="text-white font-medium">System ({stats?.systemCount})</div>
                <div className="text-sm text-gray-400">Body systems (e.g., cardiovascular)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ec4899' }}></div>
              <div>
                <div className="text-white font-medium">Organ ({stats?.organCount})</div>
                <div className="text-sm text-gray-400">Major organs (e.g., heart, brain)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#06b6d4' }}></div>
              <div>
                <div className="text-white font-medium">Substructure ({stats?.substructureCount})</div>
                <div className="text-sm text-gray-400">Detailed anatomy (e.g., ventricle)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Disclaimer */}
      {anatomyGraph?.disclaimer && (
        <div className="card bg-yellow-900 bg-opacity-10 border-yellow-600 mt-6">
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
              <h4 className="text-yellow-500 font-bold mb-1">Important Notice</h4>
              <p className="text-sm text-gray-300">{anatomyGraph.disclaimer}</p>
            </div>
          </div>
        </div>
      )}

      {/* Feature Information */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="card">
          <h3 className="text-xl font-bold mb-4 text-blue-400">Interaction Guide</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• <strong>Rotate:</strong> Click and drag anywhere in the 3D view</li>
            <li>• <strong>Zoom:</strong> Use mouse wheel or pinch gesture</li>
            <li>• <strong>Pan:</strong> Right-click and drag (or two-finger drag)</li>
            <li>• <strong>Hover:</strong> See overlay details for each structure</li>
            <li>• <strong>Click:</strong> Isolate a specific anatomical structure</li>
            <li>• <strong>Toggle:</strong> Use controls to show/hide overlays</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4 text-purple-400">About This Visualization</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• Deterministic mapping from genomic variants to anatomy</li>
            <li>• All associations labeled with evidence quality</li>
            <li>• Overlay intensity reflects association strength</li>
            <li>• Placeholder geometry for demonstration purposes</li>
            <li>• Built with React Three Fiber and Three.js</li>
            <li>• Educational/research visualization only</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AnatomyViewer
