import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

// DNA Helix Component
function DNAHelix() {
  const groupRef = useRef()

  // Rotate the helix slowly
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2
    }
  })

  // Generate DNA helix geometry
  const helixData = useMemo(() => {
    const pairs = []
    const numPairs = 20
    const radius = 2
    const height = 10
    const rotationsPerPair = (Math.PI * 2) / 10

    for (let i = 0; i < numPairs; i++) {
      const y = (i / numPairs) * height - height / 2
      const angle = i * rotationsPerPair

      // First strand (backbone)
      const x1 = Math.cos(angle) * radius
      const z1 = Math.sin(angle) * radius

      // Second strand (opposite side)
      const x2 = Math.cos(angle + Math.PI) * radius
      const z2 = Math.sin(angle + Math.PI) * radius

      pairs.push({
        y,
        strand1: [x1, y, z1],
        strand2: [x2, y, z2],
        // Alternate base pair colors (A-T: blue-yellow, G-C: red-green)
        color: i % 2 === 0 ? '#3b82f6' : '#ef4444'
      })
    }

    return pairs
  }, [])

  return (
    <group ref={groupRef}>
      {helixData.map((pair, index) => (
        <group key={index}>
          {/* Backbone spheres */}
          <mesh position={pair.strand1}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#8b5cf6" />
          </mesh>
          <mesh position={pair.strand2}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#8b5cf6" />
          </mesh>

          {/* Base pair connector */}
          <Line
            start={pair.strand1}
            end={pair.strand2}
            color={pair.color}
            lineWidth={2}
          />

          {/* Base pair spheres */}
          <mesh position={[(pair.strand1[0] + pair.strand2[0]) / 2, pair.y, (pair.strand1[2] + pair.strand2[2]) / 2]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={pair.color} />
          </mesh>
        </group>
      ))}

      {/* Connect backbone with lines */}
      {helixData.slice(0, -1).map((pair, index) => {
        const nextPair = helixData[index + 1]
        return (
          <group key={`backbone-${index}`}>
            <Line
              start={pair.strand1}
              end={nextPair.strand1}
              color="#a78bfa"
              lineWidth={3}
            />
            <Line
              start={pair.strand2}
              end={nextPair.strand2}
              color="#a78bfa"
              lineWidth={3}
            />
          </group>
        )
      })}
    </group>
  )
}

// Line component for connecting points
function Line({ start, end, color, lineWidth }) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end])

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return geometry
  }, [points])

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} linewidth={lineWidth} />
    </line>
  )
}

// Main DNAViewer component
function DNAViewer() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
        <OrbitControls enableDamping dampingFactor={0.05} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={0.5} />

        {/* DNA Helix */}
        <DNAHelix />

        {/* Grid helper */}
        <gridHelper args={[20, 20, '#444444', '#222222']} position={[0, -6, 0]} />
      </Canvas>
    </div>
  )
}

export default DNAViewer
