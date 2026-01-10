import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import VisualizationDisclaimer from '../components/VisualizationDisclaimer'

/**
 * Learn Mode Landing Page
 *
 * Browse available guided tours through anatomical systems.
 * Educational content only - not for medical diagnosis or treatment.
 */

function LearnMode() {
  const [tourIndex, setTourIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedSystem, setSelectedSystem] = useState('all')

  // Load tour index
  useEffect(() => {
    const loadTourIndex = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/tours/index.json')
        if (!response.ok) {
          throw new Error('Failed to load tour catalog')
        }

        const data = await response.json()
        setTourIndex(data)
      } catch (err) {
        console.error('Error loading tour index:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadTourIndex()
  }, [])

  // Filter tours based on selected level and system
  const filteredTours = tourIndex?.tours?.filter(tour => {
    const levelMatch = selectedLevel === 'all' || tour.level === selectedLevel
    const systemMatch = selectedSystem === 'all' || tour.systemId === selectedSystem
    return levelMatch && systemMatch
  }) || []

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

  // Get system color
  const getSystemColor = (systemId) => {
    switch (systemId) {
      case 'cardiovascular':
        return 'from-red-500 to-pink-500'
      case 'nervous':
        return 'from-purple-500 to-blue-500'
      case 'digestive':
        return 'from-amber-500 to-orange-500'
      default:
        return 'from-blue-500 to-purple-500'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-xl text-gray-400">Loading tours...</div>
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
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Tours</h2>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Learn Mode
        </h1>
        <p className="text-gray-400 text-lg">
          Guided tours through human anatomy and physiology
        </p>
      </div>

      {/* Educational Disclaimer */}
      <div className="mb-8">
        <VisualizationDisclaimer />
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Filter Tours</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Difficulty Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              {tourIndex?.levels?.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name} - {level.description}
                </option>
              ))}
            </select>
          </div>

          {/* System Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Body System
            </label>
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Systems</option>
              {tourIndex?.systems?.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tour Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredTours.map((tour) => (
          <Link
            key={tour.id}
            to={`/learn/tour/${tour.id}`}
            className="card hover:border-blue-500 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 group"
          >
            {/* Tour Header with Gradient */}
            <div
              className={`h-32 rounded-t-lg bg-gradient-to-br ${getSystemColor(tour.systemId)} mb-4 flex items-center justify-center`}
            >
              <div className="text-white text-6xl opacity-80">
                {tour.systemId === 'cardiovascular' && '❤️'}
                {tour.systemId === 'nervous' && '🧠'}
                {tour.systemId === 'digestive' && '🔬'}
              </div>
            </div>

            {/* Tour Content */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">
                {tour.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{tour.description}</p>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded border ${getLevelColor(tour.level)}`}>
                  {tour.level.charAt(0).toUpperCase() + tour.level.slice(1)}
                </span>
                <span className="text-gray-500">
                  ⏱️ {tour.estimatedMinutes} min
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredTours.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">No tours found</h3>
          <p className="text-gray-400">Try adjusting your filters</p>
        </div>
      )}

      {/* System Overview Cards */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Body Systems</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {tourIndex?.systems?.map((system) => (
            <div key={system.id} className="card">
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                {system.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{system.description}</p>
              <div className="text-sm text-gray-500">
                Available levels: {system.availableLevels.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Info */}
      <div className="card bg-blue-900 bg-opacity-10 border-blue-600 mt-8">
        <h3 className="text-xl font-bold text-blue-400 mb-4">About Learn Mode</h3>
        <div className="space-y-3 text-gray-300 text-sm">
          <p>
            Learn Mode provides guided tours through human anatomy and physiology. Each tour includes:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Step-by-step explanations with visual highlights</li>
            <li>Interactive 3D anatomical models</li>
            <li>Evidence-based educational content</li>
            <li>Progressive learning paths from basic to advanced</li>
          </ul>
          <p className="text-yellow-400 font-medium">
            This is educational content only. Not for medical diagnosis, treatment, or advice.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LearnMode
