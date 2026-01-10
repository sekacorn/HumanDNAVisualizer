import { useRef, useState, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 3D Anatomy Scene Component
 *
 * Renders anatomical structures as placeholder geometry with overlay highlighting.
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */

// Color mapping for evidence levels
const EVIDENCE_COLORS = {
  HIGH: '#22c55e',    // green
  MEDIUM: '#f59e0b',  // amber
  LOW: '#3b82f6'      // blue
}

// Node type colors for base anatomy
const NODE_TYPE_COLORS = {
  SYSTEM: '#8b5cf6',      // purple
  ORGAN: '#ec4899',       // pink
  SUBSTRUCTURE: '#06b6d4' // cyan
}

// Placeholder positions for anatomical structures (simple layout)
const NODE_POSITIONS = {
  // Systems (top level)
  cardiovascular_system: [0, 4, 0],
  nervous_system: [-5, 4, 0],
  metabolic_system: [5, 4, 0],

  // Organs (middle level)
  heart: [0, 0, 0],
  brain: [-5, 0, 0],
  liver: [5, 0, 0],

  // Substructures (bottom level)
  left_ventricle: [0, -4, 0],
  hippocampus: [-5, -4, 0],
  hepatocytes: [5, -4, 0]
}

// AnatomyNode - represents a single anatomical structure
function AnatomyNode({ node, overlays, onHover, onClick, isSelected, isIsolated }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Find overlays targeting this node
  const nodeOverlays = useMemo(() =>
    overlays.filter(o => o.targetNodeId === node.id),
    [overlays, node.id]
  )

  // Calculate highlight intensity from overlays
  const highlightIntensity = useMemo(() => {
    if (nodeOverlays.length === 0) return 0
    return Math.min(1.0, nodeOverlays.reduce((sum, o) => sum + o.intensity, 0))
  }, [nodeOverlays])

  // Get highest evidence level
  const highestEvidence = useMemo(() => {
    if (nodeOverlays.length === 0) return null
    const priorities = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    return nodeOverlays.reduce((best, curr) =>
      priorities[curr.evidence] > priorities[best.evidence] ? curr : best
    ).evidence
  }, [nodeOverlays])

  // Determine node color
  const nodeColor = useMemo(() => {
    if (highlightIntensity > 0 && highestEvidence) {
      return EVIDENCE_COLORS[highestEvidence]
    }
    return NODE_TYPE_COLORS[node.type] || '#666666'
  }, [highlightIntensity, highestEvidence, node.type])

  // Scale based on node type
  const scale = useMemo(() => {
    switch (node.type) {
      case 'SYSTEM': return 1.0
      case 'ORGAN': return 0.8
      case 'SUBSTRUCTURE': return 0.6
      default: return 0.7
    }
  }, [node.type])

  // Position from lookup or default
  const position = NODE_POSITIONS[node.id] || [0, 0, 0]

  // Gentle pulsing animation for highlighted nodes
  useFrame((state) => {
    if (meshRef.current && highlightIntensity > 0) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1.0
      meshRef.current.scale.setScalar(scale * (1 + highlightIntensity * 0.2 * pulse))
    }
  })

  // Hide if isolated mode and not selected
  const opacity = isIsolated && !isSelected ? 0.1 : 1.0

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onClick(node)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          onHover(node, nodeOverlays)
        }}
        onPointerOut={() => {
          setHovered(false)
          onHover(null, [])
        }}
        scale={isSelected ? scale * 1.2 : scale}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={highlightIntensity * 0.5}
          transparent
          opacity={opacity}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Outer glow for highlighted nodes */}
      {highlightIntensity > 0 && (
        <mesh scale={scale * 1.3}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color={nodeColor}
            transparent
            opacity={highlightIntensity * 0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Hover label */}
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-gray-800 bg-opacity-90 px-3 py-2 rounded-lg shadow-lg border border-gray-600 pointer-events-none">
            <div className="text-white font-bold text-sm">{node.label}</div>
            <div className="text-gray-400 text-xs">{node.type}</div>
            {nodeOverlays.length > 0 && (
              <div className="text-xs mt-1">
                <span className="text-gray-300">{nodeOverlays.length} overlay(s)</span>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

// ConnectionLine - visual connection between anatomical structures
function ConnectionLine({ edge, nodes }) {
  const fromNode = nodes.find(n => n.id === edge.from)
  const toNode = nodes.find(n => n.id === edge.to)

  if (!fromNode || !toNode) return null

  const fromPos = NODE_POSITIONS[fromNode.id] || [0, 0, 0]
  const toPos = NODE_POSITIONS[toNode.id] || [0, 0, 0]

  const points = useMemo(() => [
    new THREE.Vector3(...fromPos),
    new THREE.Vector3(...toPos)
  ], [fromPos, toPos])

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [points])

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#444444" linewidth={2} transparent opacity={0.3} />
    </line>
  )
}

// Main AnatomyScene component
function AnatomyScene({ anatomyGraph, overlaysVisible = true }) {
  const [hoveredNode, setHoveredNode] = useState(null)
  const [hoveredOverlays, setHoveredOverlays] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [isolateMode, setIsolateMode] = useState(false)

  const handleNodeHover = useCallback((node, overlays) => {
    setHoveredNode(node)
    setHoveredOverlays(overlays)
  }, [])

  const handleNodeClick = useCallback((node) => {
    if (selectedNode?.id === node.id) {
      setSelectedNode(null)
      setIsolateMode(false)
    } else {
      setSelectedNode(node)
      setIsolateMode(true)
    }
  }, [selectedNode])

  const activeOverlays = overlaysVisible ? anatomyGraph.overlays : []

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={40}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} />
        <directionalLight position={[-10, -10, -10]} intensity={0.4} />
        <pointLight position={[0, 0, 10]} intensity={0.5} />

        {/* Render anatomical structures */}
        {anatomyGraph.nodes.map(node => (
          <AnatomyNode
            key={node.id}
            node={node}
            overlays={activeOverlays}
            onHover={handleNodeHover}
            onClick={handleNodeClick}
            isSelected={selectedNode?.id === node.id}
            isIsolated={isolateMode}
          />
        ))}

        {/* Render connections */}
        {anatomyGraph.edges.map((edge, idx) => (
          <ConnectionLine key={idx} edge={edge} nodes={anatomyGraph.nodes} />
        ))}

        {/* Grid helper */}
        <gridHelper args={[30, 30, '#333333', '#1a1a1a']} position={[0, -8, 0]} />
      </Canvas>

      {/* Hover info panel */}
      {hoveredNode && hoveredOverlays.length > 0 && (
        <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-95 p-4 rounded-lg shadow-xl border border-gray-600 max-w-sm">
          <h3 className="text-white font-bold text-lg mb-2">{hoveredNode.label}</h3>
          <div className="space-y-2">
            {hoveredOverlays.map((overlay, idx) => (
              <div key={idx} className="border-l-2 pl-3 py-1" style={{ borderColor: EVIDENCE_COLORS[overlay.evidence] }}>
                <div className="text-sm text-gray-300">{overlay.label}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">Evidence:</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: EVIDENCE_COLORS[overlay.evidence] + '20',
                      color: EVIDENCE_COLORS[overlay.evidence]
                    }}
                  >
                    {overlay.evidence}
                  </span>
                  <span className="text-xs text-gray-400">
                    Intensity: {(overlay.intensity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected node info */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-95 p-3 rounded-lg shadow-xl border border-blue-500">
          <div className="text-white font-bold">{selectedNode.label}</div>
          <div className="text-gray-400 text-sm">Click again to exit isolation mode</div>
        </div>
      )}
    </div>
  )
}

export default AnatomyScene
