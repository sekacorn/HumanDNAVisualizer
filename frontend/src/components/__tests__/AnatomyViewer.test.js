/**
 * AnatomyViewer Component Tests
 *
 * Tests the overlay rendering logic and state management (non-3D parts).
 * Educational/research purposes only.
 */

import { describe, it, expect } from 'vitest'
import {
  EVIDENCE_COLORS,
  NODE_TYPE_COLORS,
  NODE_TYPE_SCALE,
  DEFAULT_NODE_SCALE,
} from '../../config/evidenceColors'

// Mock data for testing
const mockAnatomyGraph = {
  nodes: [
    { id: 'heart', type: 'ORGAN', label: 'Heart' },
    { id: 'brain', type: 'ORGAN', label: 'Brain' },
    { id: 'cardiovascular_system', type: 'SYSTEM', label: 'Cardiovascular System' }
  ],
  edges: [
    { from: 'cardiovascular_system', to: 'heart', relation: 'contains' }
  ],
  overlays: [
    {
      targetNodeId: 'cardiovascular_system',
      intensity: 0.6,
      label: 'Variant in genomic region associated with cardiovascular structure',
      evidence: 'LOW',
      sources: ['Demo data - placeholder reference']
    },
    {
      targetNodeId: 'heart',
      intensity: 0.8,
      label: 'Variant associated with cardiac structure',
      evidence: 'MEDIUM',
      sources: ['Demo data - placeholder reference']
    }
  ],
  sampleId: 1,
  rulesVersion: '1.0.0',
  disclaimer: 'Educational/research visualization only.'
}

const mockStats = {
  sampleId: 1,
  nodeCount: 9,
  edgeCount: 6,
  overlayCount: 2,
  systemCount: 3,
  organCount: 3,
  substructureCount: 3,
  highEvidenceCount: 0,
  mediumEvidenceCount: 1,
  lowEvidenceCount: 1
}

/**
 * Test: Overlay filtering by targetNodeId
 */
describe('Overlay Filtering', () => {
  it('should filter overlays by target node', () => {
    const targetNodeId = 'heart'
    const nodeOverlays = mockAnatomyGraph.overlays.filter(
      o => o.targetNodeId === targetNodeId
    )

    expect(nodeOverlays.length).toBe(1)
    expect(nodeOverlays[0].targetNodeId).toBe('heart')
    expect(nodeOverlays[0].evidence).toBe('MEDIUM')
  })

  it('should return empty array for node with no overlays', () => {
    const targetNodeId = 'brain'
    const nodeOverlays = mockAnatomyGraph.overlays.filter(
      o => o.targetNodeId === targetNodeId
    )

    expect(nodeOverlays.length).toBe(0)
  })
})

/**
 * Test: Highlight intensity calculation
 */
describe('Highlight Intensity Calculation', () => {
  it('should sum intensities from multiple overlays', () => {
    const multipleOverlays = [
      { intensity: 0.3 },
      { intensity: 0.4 },
      { intensity: 0.5 }
    ]

    const totalIntensity = Math.min(
      1.0,
      multipleOverlays.reduce((sum, o) => sum + o.intensity, 0)
    )

    expect(totalIntensity).toBe(1.0) // Capped at 1.0
  })

  it('should return 0 for no overlays', () => {
    const noOverlays = []
    const totalIntensity = Math.min(
      1.0,
      noOverlays.reduce((sum, o) => sum + o.intensity, 0)
    )

    expect(totalIntensity).toBe(0)
  })
})

/**
 * Test: Evidence level prioritization
 */
describe('Evidence Level Priority', () => {
  it('should select highest priority evidence level', () => {
    const overlays = [
      { evidence: 'LOW' },
      { evidence: 'HIGH' },
      { evidence: 'MEDIUM' }
    ]

    const priorities = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    const highest = overlays.reduce((best, curr) =>
      priorities[curr.evidence] > priorities[best.evidence] ? curr : best
    )

    expect(highest.evidence).toBe('HIGH')
  })

  it('should handle single overlay', () => {
    const overlays = [{ evidence: 'LOW' }]
    const priorities = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    const highest = overlays.reduce((best, curr) =>
      priorities[curr.evidence] > priorities[best.evidence] ? curr : best
    )

    expect(highest.evidence).toBe('LOW')
  })
})

/**
 * Test: Evidence color mapping
 */
describe('Evidence Color Mapping', () => {
  it('should map evidence levels to the base-pair spectrum', () => {
    expect(EVIDENCE_COLORS.HIGH).toBe('#4edea3') // adenine emerald
    expect(EVIDENCE_COLORS.MEDIUM).toBe('#ffb400') // guanine amber
    expect(EVIDENCE_COLORS.LOW).toBe('#adc6ff') // cytosine azure
  })

  it('should return color for overlay evidence level', () => {
    const overlay = { evidence: 'MEDIUM' }

    expect(EVIDENCE_COLORS[overlay.evidence]).toBe('#ffb400')
  })

  it('should define a colour for every evidence level', () => {
    expect(Object.keys(EVIDENCE_COLORS).sort()).toEqual(['HIGH', 'LOW', 'MEDIUM'])
  })
})

/**
 * Test: Node type color mapping
 */
describe('Node Type Color Mapping', () => {
  it('should map node types to the neutral surface ladder', () => {
    expect(NODE_TYPE_COLORS.SYSTEM).toBe('#b7c8e1')
    expect(NODE_TYPE_COLORS.ORGAN).toBe('#8e9197')
    expect(NODE_TYPE_COLORS.SUBSTRUCTURE).toBe('#44474c')
  })

  it('should handle node type from anatomy graph', () => {
    const node = mockAnatomyGraph.nodes.find(n => n.id === 'heart')

    expect(NODE_TYPE_COLORS[node.type]).toBe('#8e9197')
  })

  it('should keep base anatomy visually distinct from evidence overlays', () => {
    const overlayColours = Object.values(EVIDENCE_COLORS)
    Object.values(NODE_TYPE_COLORS).forEach(colour => {
      expect(overlayColours).not.toContain(colour)
    })
  })
})

/**
 * Test: Stats calculation
 */
describe('Stats Validation', () => {
  it('should have correct evidence counts', () => {
    const highCount = mockAnatomyGraph.overlays.filter(
      o => o.evidence === 'HIGH'
    ).length
    const mediumCount = mockAnatomyGraph.overlays.filter(
      o => o.evidence === 'MEDIUM'
    ).length
    const lowCount = mockAnatomyGraph.overlays.filter(
      o => o.evidence === 'LOW'
    ).length

    expect(highCount).toBe(0)
    expect(mediumCount).toBe(1)
    expect(lowCount).toBe(1)
    expect(highCount + mediumCount + lowCount).toBe(mockAnatomyGraph.overlays.length)
  })

  it('should count nodes by type', () => {
    const systemCount = mockAnatomyGraph.nodes.filter(
      n => n.type === 'SYSTEM'
    ).length
    const organCount = mockAnatomyGraph.nodes.filter(
      n => n.type === 'ORGAN'
    ).length

    expect(systemCount).toBe(1)
    expect(organCount).toBe(2)
  })
})

/**
 * Test: Node scale calculation
 */
describe('Node Scale Calculation', () => {
  const getNodeScale = (nodeType) => NODE_TYPE_SCALE[nodeType] ?? DEFAULT_NODE_SCALE

  it('should return correct scale for each node type', () => {
    expect(getNodeScale('SYSTEM')).toBe(1.0)
    expect(getNodeScale('ORGAN')).toBe(0.8)
    expect(getNodeScale('SUBSTRUCTURE')).toBe(0.6)
  })

  it('should return default scale for unknown type', () => {
    expect(getNodeScale('UNKNOWN')).toBe(0.7)
  })
})

/**
 * Test: Isolation mode visibility
 */
describe('Isolation Mode', () => {
  const calculateOpacity = (isIsolated, isSelected) => {
    return isIsolated && !isSelected ? 0.1 : 1.0
  }

  it('should reduce opacity for non-selected nodes in isolation mode', () => {
    expect(calculateOpacity(true, false)).toBe(0.1)
  })

  it('should keep full opacity for selected node in isolation mode', () => {
    expect(calculateOpacity(true, true)).toBe(1.0)
  })

  it('should keep full opacity when not in isolation mode', () => {
    expect(calculateOpacity(false, false)).toBe(1.0)
    expect(calculateOpacity(false, true)).toBe(1.0)
  })
})
