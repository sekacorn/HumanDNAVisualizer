import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Base-pair colour spectrum from the design system. Colour here is data
 * signification, not decoration: each base keeps its hue everywhere in the app.
 */
export const BASE_COLORS = {
  A: '#4edea3', // adenine — emerald
  T: '#ffb4ab', // thymine — crimson
  G: '#ffb400', // guanine — amber
  C: '#adc6ff', // cytosine — azure
}

const BACKBONE_COLOR = '#b7c8e1'
const PAIRINGS = [
  ['A', 'T'],
  ['T', 'A'],
  ['G', 'C'],
  ['C', 'G'],
]

function Line({ start, end, color, opacity = 1 }) {
  const lineGeometry = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...start),
        new THREE.Vector3(...end),
      ]),
    [start, end]
  )

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  )
}

function DNAHelix({ spinning = true, showBackbone = true, highlightIndex = null }) {
  const groupRef = useRef()

  useFrame((state, delta) => {
    if (spinning && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2
    }
  })

  const helixData = useMemo(() => {
    const pairs = []
    const numPairs = 24
    const radius = 2
    const height = 11
    const rotationsPerPair = (Math.PI * 2) / 10

    for (let i = 0; i < numPairs; i += 1) {
      const y = (i / numPairs) * height - height / 2
      const angle = i * rotationsPerPair
      const [left, right] = PAIRINGS[i % PAIRINGS.length]

      pairs.push({
        y,
        strand1: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
        strand2: [Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius],
        leftBase: left,
        rightBase: right,
      })
    }

    return pairs
  }, [])

  return (
    <group ref={groupRef}>
      {helixData.map((pair, index) => {
        const highlighted = highlightIndex === index
        const leftColor = BASE_COLORS[pair.leftBase]
        const rightColor = BASE_COLORS[pair.rightBase]
        const midpoint = [
          (pair.strand1[0] + pair.strand2[0]) / 2,
          pair.y,
          (pair.strand1[2] + pair.strand2[2]) / 2,
        ]

        return (
          <group key={pair.y}>
            {/* Backbone nodes */}
            <mesh position={pair.strand1}>
              <sphereGeometry args={[highlighted ? 0.22 : 0.16, 20, 20]} />
              <meshStandardMaterial
                color={leftColor}
                emissive={leftColor}
                emissiveIntensity={highlighted ? 1.2 : 0.45}
                roughness={0.35}
                metalness={0.15}
              />
            </mesh>
            <mesh position={pair.strand2}>
              <sphereGeometry args={[highlighted ? 0.22 : 0.16, 20, 20]} />
              <meshStandardMaterial
                color={rightColor}
                emissive={rightColor}
                emissiveIntensity={highlighted ? 1.2 : 0.45}
                roughness={0.35}
                metalness={0.15}
              />
            </mesh>

            {/* Hydrogen bond between the pair */}
            <Line
              start={pair.strand1}
              end={midpoint}
              color={leftColor}
              opacity={highlighted ? 1 : 0.7}
            />
            <Line
              start={midpoint}
              end={pair.strand2}
              color={rightColor}
              opacity={highlighted ? 1 : 0.7}
            />
          </group>
        )
      })}

      {/* Sugar-phosphate backbone */}
      {showBackbone &&
        helixData.slice(0, -1).map((pair, index) => {
          const next = helixData[index + 1]
          return (
            <group key={`backbone-${pair.y}`}>
              <Line start={pair.strand1} end={next.strand1} color={BACKBONE_COLOR} opacity={0.55} />
              <Line start={pair.strand2} end={next.strand2} color={BACKBONE_COLOR} opacity={0.55} />
            </group>
          )
        })}
    </group>
  )
}

/**
 * Interactive double-helix viewport. Sizing is delegated to the parent so the
 * same component works in a full-bleed desktop panel and a short mobile card.
 */
function DNAViewer({ spinning = true, showGrid = true, showBackbone = true, highlightIndex = null }) {
  return (
    <div className="h-full w-full">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
        <OrbitControls enableDamping dampingFactor={0.05} enablePan makeDefault />

        <color attach="background" args={['#0d0e10']} />
        <fog attach="fog" args={['#0d0e10', 18, 34]} />

        <ambientLight intensity={0.45} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.4} color="#adc6ff" />
        <pointLight position={[0, 0, 6]} intensity={0.6} color="#4edea3" />

        <DNAHelix spinning={spinning} showBackbone={showBackbone} highlightIndex={highlightIndex} />

        {showGrid && <gridHelper args={[24, 24, '#2a3a4f', '#1b1b1d']} position={[0, -6.5, 0]} />}
      </Canvas>
    </div>
  )
}

export default DNAViewer
