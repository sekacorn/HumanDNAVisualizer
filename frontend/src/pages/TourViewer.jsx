import { useState, useEffect, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import Stepper from '../components/Stepper'
import AnatomyScene from '../components/AnatomyScene'
import ReactMarkdown from 'react-markdown'
import VisualizationDisclaimer from '../components/VisualizationDisclaimer'

/**
 * TourViewer Page
 *
 * Displays a guided tour through an anatomical system with step-by-step explanations
 * and interactive 3D visualizations. Educational purposes only.
 */

function TourViewer() {
  const { tourId } = useParams()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)

  // Load tour data
  useEffect(() => {
    const loadTour = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/tours/${tourId}.json`)
        if (!response.ok) {
          throw new Error('Tour not found')
        }

        const data = await response.json()
        setTour(data)
        setCurrentStep(0) // Reset to first step
      } catch (err) {
        console.error('Error loading tour:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadTour()
  }, [tourId])

  // Handle step navigation
  const handleNext = () => {
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get current step data
  const step = tour?.steps?.[currentStep]

  // Create anatomy graph for 3D visualization
  const createAnatomyGraphFromStep = () => {
    if (!step) return null

    // Create a simplified anatomy graph with just the highlighted nodes
    return {
      nodes: step.highlightNodeIds.map((nodeId, index) => ({
        id: nodeId,
        label: nodeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: 'organ',
        position: {
          x: Math.cos((index * 2 * Math.PI) / step.highlightNodeIds.length) * 2,
          y: 0,
          z: Math.sin((index * 2 * Math.PI) / step.highlightNodeIds.length) * 2
        }
      })),
      edges: [],
      overlays: step.highlightNodeIds.map(nodeId => ({
        nodeId,
        intensity: step.overlayConfig?.intensity || 0.7,
        evidenceLevel: step.evidenceLevel || 'HIGH',
        color: step.evidenceLevel === 'HIGH' ? '#22c55e' :
               step.evidenceLevel === 'MEDIUM' ? '#f59e0b' : '#3b82f6',
        pulseAnimation: step.overlayConfig?.pulseAnimation || false
      }))
    }
  }

  // Get level badge color
  const getLevelColor = (level) => {
    switch (level) {
      case 'basic':
        return 'bg-green-900 bg-opacity-30 border-green-500 text-green-400'
      case 'intermediate':
        return 'bg-amber-900 bg-opacity-30 border-amber-500 text-amber-400'
      case 'advanced':
        return 'bg-red-900 bg-opacity-30 border-red-500 text-red-400'
      default:
        return 'bg-blue-900 bg-opacity-30 border-blue-500 text-blue-400'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-xl text-gray-400">Loading tour...</div>
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
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Tour</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Link
            to="/learn"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition inline-block"
          >
            Back to Learn Mode
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/learn"
          className="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Learn Mode
        </Link>
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          {tour.title}
        </h1>
        <p className="text-gray-400 text-lg mb-4">{tour.description}</p>
        <div className="flex items-center gap-4 text-sm">
          <span className={`px-3 py-1 rounded border ${getLevelColor(tour.level)}`}>
            {tour.level.charAt(0).toUpperCase() + tour.level.slice(1)}
          </span>
          <span className="text-gray-500">⏱️ {tour.estimatedMinutes} minutes</span>
          <span className="text-gray-500">📚 {tour.steps.length} steps</span>
        </div>
      </div>

      {/* Educational Disclaimer */}
      <div className="mb-6">
        <VisualizationDisclaimer />
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <Stepper
          steps={tour.steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Explanation Panel */}
        <div className="card">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">
            Step {currentStep + 1}: {step.title}
          </h2>

          {/* Markdown Content */}
          <div className="prose prose-invert prose-blue max-w-none">
            <ReactMarkdown>{step.explanation}</ReactMarkdown>
          </div>

          {/* Interactive Prompt */}
          {step.interactivePrompt && (
            <div className="mt-6 card bg-purple-900 bg-opacity-20 border-purple-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="text-purple-400 font-bold mb-1">Try This</h4>
                  <p className="text-gray-300 text-sm">{step.interactivePrompt}</p>
                </div>
              </div>
            </div>
          )}

          {/* Further Reading */}
          {step.furtherReading && step.furtherReading.length > 0 && (
            <div className="mt-6">
              <h4 className="text-white font-bold mb-2">Further Reading</h4>
              <ul className="space-y-1">
                {step.furtherReading.map((item, index) => (
                  <li key={index} className="text-sm text-gray-400">
                    • {item.title} ({item.type})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 3D Visualization Panel */}
        <div className="card" style={{ height: '600px' }}>
          <h3 className="text-lg font-bold text-white mb-4">3D Anatomy View</h3>
          <div className="h-full">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-xl text-gray-400">Initializing 3D scene...</div>
                </div>
              }
            >
              {createAnatomyGraphFromStep() && (
                <AnatomyScene
                  anatomyGraph={createAnatomyGraphFromStep()}
                  overlaysVisible={true}
                />
              )}
            </Suspense>
          </div>

          {/* Overlay Legend */}
          <div className="mt-4">
            <h4 className="text-sm font-bold text-gray-400 mb-2">Highlighted Structures:</h4>
            <div className="flex flex-wrap gap-2">
              {step.highlightNodeIds.map((nodeId) => (
                <span
                  key={nodeId}
                  className="px-2 py-1 bg-blue-900 bg-opacity-30 border border-blue-500 rounded text-xs text-blue-400"
                >
                  {nodeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded font-medium transition ${
              currentStep === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            ← Previous
          </button>

          <div className="text-gray-400 text-sm">
            Step {currentStep + 1} of {tour.steps.length}
          </div>

          {currentStep < tour.steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
            >
              Next →
            </button>
          ) : (
            <Link
              to="/learn"
              className="px-6 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition"
            >
              Complete Tour ✓
            </Link>
          )}
        </div>
      </div>

      {/* Learning Objectives */}
      {currentStep === 0 && (
        <div className="card bg-blue-900 bg-opacity-10 border-blue-600 mt-6">
          <h3 className="text-xl font-bold text-blue-400 mb-4">Learning Objectives</h3>
          <ul className="space-y-2 text-gray-300">
            {tour.learningObjectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-400">✓</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tour Metadata (Last Step) */}
      {currentStep === tour.steps.length - 1 && (
        <div className="card bg-purple-900 bg-opacity-10 border-purple-600 mt-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Educational Standards</h3>
          <div className="space-y-2 text-gray-300 text-sm">
            {tour.metadata.educationalStandards?.map((standard, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>{standard}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Version {tour.metadata.version} • Last updated {tour.metadata.lastUpdated}
          </div>
        </div>
      )}
    </div>
  )
}

export default TourViewer
