import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock fetch API for tour loading tests
global.fetch = async (url) => {
  if (url.includes('/tours/')) {
    const tourId = url.split('/').pop().replace('.json', '')

    // Mock tour data based on URL
    const mockTours = {
      'cardiovascular-basic': {
        id: 'cardiovascular-basic',
        systemId: 'cardiovascular',
        title: 'Introduction to the Cardiovascular System',
        description: 'Learn about the heart and blood vessels',
        level: 'basic',
        estimatedMinutes: 15,
        prerequisites: [],
        learningObjectives: [
          'Identify major structures',
          'Understand blood flow',
          'Explain vessel function',
          'Describe cardiac cycle'
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Introduction',
            explanation: '# Introduction\n\nContent here',
            highlightNodeIds: ['heart'],
            overlayConfig: { intensity: 0.5 }
          }
        ],
        metadata: {
          author: 'HumanDNAVisualizer',
          createdDate: '2025-01-09',
          lastUpdated: '2025-01-09',
          version: '1.0.0',
          tags: ['cardiovascular', 'basic'],
          educationalStandards: ['NGSS HS-LS1-2']
        }
      },
      index: {
        version: '1.0.0',
        lastUpdated: '2025-01-09',
        tours: [
          {
            id: 'cardiovascular-basic',
            systemId: 'cardiovascular',
            title: 'Introduction to the Cardiovascular System',
            description: 'Learn about the heart',
            level: 'basic',
            estimatedMinutes: 15
          }
        ],
        systems: [
          {
            id: 'cardiovascular',
            name: 'Cardiovascular System',
            description: 'Heart and blood vessels',
            availableLevels: ['basic']
          }
        ],
        levels: [
          {
            id: 'basic',
            name: 'Basic',
            description: 'Introduction to fundamental concepts',
            prerequisites: []
          }
        ]
      }
    }

    const data = mockTours[tourId]
    if (data) {
      return {
        ok: true,
        json: async () => data
      }
    }

    return {
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' })
    }
  }

  return {
    ok: false,
    json: async () => ({})
  }
}
