import { Suspense } from 'react'
import DNAViewer from '../components/DNAViewer'

function Explore() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        3D DNA Visualization
      </h1>

      <div className="card mb-6">
        <p className="text-gray-300 text-center">
          Interact with the 3D DNA structure below. Click and drag to rotate, scroll to zoom.
        </p>
      </div>

      <div className="card" style={{ height: '600px' }}>
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-xl text-gray-400">Loading 3D visualization...</div>
          </div>
        }>
          <DNAViewer />
        </Suspense>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="card">
          <h3 className="text-xl font-bold mb-4 text-blue-400">Visualization Features</h3>
          <ul className="space-y-2 text-gray-300">
            <li>✓ Interactive 3D DNA double helix structure</li>
            <li>✓ Rotate, zoom, and pan controls</li>
            <li>✓ Color-coded base pairs (A-T, G-C)</li>
            <li>✓ Export as PNG, SVG, STL, or OBJ</li>
            <li>✓ SNP variation highlighting</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4 text-purple-400">Technical Details</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Built with Three.js and React Three Fiber</li>
            <li>• Open-source rendering without proprietary code</li>
            <li>• Compatible with PyMOL and Blender workflows</li>
            <li>• Supports PDB, FASTA, and VCF formats</li>
            <li>• Real-time rendering for research and education</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Explore
