import { describe, it, expect, beforeEach } from 'vitest'

/**
 * Tour Schema Validation Tests
 *
 * Validates that tour JSON files conform to the expected schema and contain
 * educationally appropriate content without medical claims.
 */

describe('Tour Schema Validation', () => {
  let cardiovascularTour
  let nervousTour
  let digestiveTour
  let tourIndex

  beforeEach(async () => {
    // Load tour files
    const [cardioResp, nervousResp, digestiveResp, indexResp] = await Promise.all([
      fetch('/tours/cardiovascular-basic.json'),
      fetch('/tours/nervous-basic.json'),
      fetch('/tours/digestive-basic.json'),
      fetch('/tours/index.json')
    ])

    cardiovascularTour = await cardioResp.json()
    nervousTour = await nervousResp.json()
    digestiveTour = await digestiveResp.json()
    tourIndex = await indexResp.json()
  })

  describe('Tour Index Schema', () => {
    it('should have required top-level fields', () => {
      expect(tourIndex).toHaveProperty('version')
      expect(tourIndex).toHaveProperty('lastUpdated')
      expect(tourIndex).toHaveProperty('tours')
      expect(tourIndex).toHaveProperty('systems')
      expect(tourIndex).toHaveProperty('levels')
    })

    it('should list all three tours', () => {
      expect(tourIndex.tours).toHaveLength(3)
      const tourIds = tourIndex.tours.map(t => t.id)
      expect(tourIds).toContain('cardiovascular-basic')
      expect(tourIds).toContain('nervous-basic')
      expect(tourIds).toContain('digestive-basic')
    })

    it('should list all three systems', () => {
      expect(tourIndex.systems).toHaveLength(3)
      const systemIds = tourIndex.systems.map(s => s.id)
      expect(systemIds).toContain('cardiovascular')
      expect(systemIds).toContain('nervous')
      expect(systemIds).toContain('digestive')
    })

    it('should define difficulty levels', () => {
      expect(tourIndex.levels).toHaveLength(3)
      const levelIds = tourIndex.levels.map(l => l.id)
      expect(levelIds).toContain('basic')
      expect(levelIds).toContain('intermediate')
      expect(levelIds).toContain('advanced')
    })

    it('should have valid tour metadata', () => {
      tourIndex.tours.forEach(tour => {
        expect(tour).toHaveProperty('id')
        expect(tour).toHaveProperty('systemId')
        expect(tour).toHaveProperty('title')
        expect(tour).toHaveProperty('description')
        expect(tour).toHaveProperty('level')
        expect(tour).toHaveProperty('estimatedMinutes')
        expect(tour.estimatedMinutes).toBeGreaterThan(0)
      })
    })
  })

  describe('Tour Structure Schema', () => {
    const tours = [
      { name: 'Cardiovascular', data: null },
      { name: 'Nervous', data: null },
      { name: 'Digestive', data: null }
    ]

    beforeEach(() => {
      tours[0].data = cardiovascularTour
      tours[1].data = nervousTour
      tours[2].data = digestiveTour
    })

    it('should have required top-level fields', () => {
      tours.forEach(({ name, data }) => {
        expect(data, `${name} tour`).toHaveProperty('id')
        expect(data, `${name} tour`).toHaveProperty('systemId')
        expect(data, `${name} tour`).toHaveProperty('title')
        expect(data, `${name} tour`).toHaveProperty('description')
        expect(data, `${name} tour`).toHaveProperty('level')
        expect(data, `${name} tour`).toHaveProperty('estimatedMinutes')
        expect(data, `${name} tour`).toHaveProperty('prerequisites')
        expect(data, `${name} tour`).toHaveProperty('learningObjectives')
        expect(data, `${name} tour`).toHaveProperty('steps')
        expect(data, `${name} tour`).toHaveProperty('metadata')
      })
    })

    it('should have valid level values', () => {
      tours.forEach(({ name, data }) => {
        expect(['basic', 'intermediate', 'advanced'], `${name} tour level`).toContain(data.level)
      })
    })

    it('should have at least 4 learning objectives', () => {
      tours.forEach(({ name, data }) => {
        expect(data.learningObjectives.length, `${name} tour objectives`).toBeGreaterThanOrEqual(4)
        data.learningObjectives.forEach(obj => {
          expect(obj, `${name} objective`).toBeTruthy()
          expect(typeof obj, `${name} objective type`).toBe('string')
        })
      })
    })

    it('should have at least 5 steps', () => {
      tours.forEach(({ name, data }) => {
        expect(data.steps.length, `${name} tour steps`).toBeGreaterThanOrEqual(5)
      })
    })

    it('should have metadata with required fields', () => {
      tours.forEach(({ name, data }) => {
        expect(data.metadata, `${name} metadata`).toHaveProperty('author')
        expect(data.metadata, `${name} metadata`).toHaveProperty('createdDate')
        expect(data.metadata, `${name} metadata`).toHaveProperty('lastUpdated')
        expect(data.metadata, `${name} metadata`).toHaveProperty('version')
        expect(data.metadata, `${name} metadata`).toHaveProperty('tags')
        expect(data.metadata, `${name} metadata`).toHaveProperty('educationalStandards')
      })
    })
  })

  describe('Step Structure Schema', () => {
    const tours = [
      { name: 'Cardiovascular', data: null },
      { name: 'Nervous', data: null },
      { name: 'Digestive', data: null }
    ]

    beforeEach(() => {
      tours[0].data = cardiovascularTour
      tours[1].data = nervousTour
      tours[2].data = digestiveTour
    })

    it('should have sequential step numbers starting from 1', () => {
      tours.forEach(({ name, data }) => {
        data.steps.forEach((step, index) => {
          expect(step.stepNumber, `${name} step ${index + 1}`).toBe(index + 1)
        })
      })
    })

    it('should have required step fields', () => {
      tours.forEach(({ name, data }) => {
        data.steps.forEach((step, index) => {
          expect(step, `${name} step ${index + 1}`).toHaveProperty('stepNumber')
          expect(step, `${name} step ${index + 1}`).toHaveProperty('title')
          expect(step, `${name} step ${index + 1}`).toHaveProperty('explanation')
          expect(step, `${name} step ${index + 1}`).toHaveProperty('highlightNodeIds')
          expect(step, `${name} step ${index + 1}`).toHaveProperty('overlayConfig')
        })
      })
    })

    it('should have non-empty step titles', () => {
      tours.forEach(({ name, data }) => {
        data.steps.forEach((step, index) => {
          expect(step.title, `${name} step ${index + 1} title`).toBeTruthy()
          expect(step.title.length, `${name} step ${index + 1} title length`).toBeGreaterThan(5)
        })
      })
    })

    it('should have substantial explanations (markdown)', () => {
      tours.forEach(({ name, data }) => {
        data.steps.forEach((step, index) => {
          expect(step.explanation, `${name} step ${index + 1} explanation`).toBeTruthy()
          expect(step.explanation.length, `${name} step ${index + 1} explanation length`).toBeGreaterThan(100)
          // Should contain markdown headers
          expect(step.explanation, `${name} step ${index + 1} markdown`).toMatch(/^#/)
        })
      })
    })

    it('should have at least one highlighted node', () => {
      tours.forEach(({ name, data }) => {
        data.steps.forEach((step, index) => {
          expect(Array.isArray(step.highlightNodeIds), `${name} step ${index + 1} highlightNodeIds`).toBe(true)
          expect(step.highlightNodeIds.length, `${name} step ${index + 1} highlightNodeIds length`).toBeGreaterThan(0)
        })
      })
    })

    it('should have valid overlay configuration', () => {
      tours.forEach(({ name, data }) => {
        data.steps.forEach((step, index) => {
          expect(step.overlayConfig, `${name} step ${index + 1} overlayConfig`).toHaveProperty('intensity')
          expect(step.overlayConfig.intensity, `${name} step ${index + 1} intensity`).toBeGreaterThan(0)
          expect(step.overlayConfig.intensity, `${name} step ${index + 1} intensity`).toBeLessThanOrEqual(1)
        })
      })
    })

    it('should have valid evidence levels when present', () => {
      tours.forEach(({ name, data }) => {
        data.steps.forEach((step, index) => {
          if (step.evidenceLevel) {
            expect(['HIGH', 'MEDIUM', 'LOW'], `${name} step ${index + 1} evidenceLevel`).toContain(step.evidenceLevel)
          }
        })
      })
    })
  })

  describe('Educational Safety Constraints', () => {
    const tours = [
      { name: 'Cardiovascular', data: null },
      { name: 'Nervous', data: null },
      { name: 'Digestive', data: null }
    ]

    beforeEach(() => {
      tours[0].data = cardiovascularTour
      tours[1].data = nervousTour
      tours[2].data = digestiveTour
    })

    const forbiddenPhrases = [
      /\bdiagnose\b/i,
      /\bdiagnosis\b/i,
      /\btreatment\b/i,
      /\btherapy\b/i,
      /\bcure\b/i,
      /\bprescribe\b/i,
      /\bmedication\b/i,
      /\bpredicts?\b/i,
      /\brisk score\b/i
    ]

    it('should not contain forbidden medical claim phrases in titles', () => {
      tours.forEach(({ name, data }) => {
        const title = data.title.toLowerCase()
        forbiddenPhrases.forEach(pattern => {
          expect(title, `${name} title should not match ${pattern}`).not.toMatch(pattern)
        })
      })
    })

    it('should not contain forbidden medical claim phrases in descriptions', () => {
      tours.forEach(({ name, data }) => {
        const description = data.description.toLowerCase()
        forbiddenPhrases.forEach(pattern => {
          expect(description, `${name} description should not match ${pattern}`).not.toMatch(pattern)
        })
      })
    })

    it('should include educational disclaimer in last step', () => {
      tours.forEach(({ name, data }) => {
        const lastStep = data.steps[data.steps.length - 1]
        const explanation = lastStep.explanation.toLowerCase()
        expect(explanation, `${name} last step disclaimer`).toMatch(/educational/)
        expect(explanation, `${name} last step disclaimer`).toMatch(/not.*medical advice/i)
      })
    })

    it('should use educational language in learning objectives', () => {
      tours.forEach(({ name, data }) => {
        data.learningObjectives.forEach((obj, index) => {
          const objLower = obj.toLowerCase()
          // Should use educational verbs
          const educationalVerbs = ['identify', 'understand', 'explain', 'describe', 'recognize', 'compare', 'analyze']
          const hasEducationalVerb = educationalVerbs.some(verb => objLower.includes(verb))
          expect(hasEducationalVerb, `${name} objective ${index + 1} should use educational verb`).toBe(true)
        })
      })
    })

    it('should reference educational standards', () => {
      tours.forEach(({ name, data }) => {
        expect(data.metadata.educationalStandards, `${name} educational standards`).toBeTruthy()
        expect(data.metadata.educationalStandards.length, `${name} educational standards count`).toBeGreaterThan(0)
      })
    })
  })

  describe('Content Quality', () => {
    const tours = [
      { name: 'Cardiovascular', data: null },
      { name: 'Nervous', data: null },
      { name: 'Digestive', data: null }
    ]

    beforeEach(() => {
      tours[0].data = cardiovascularTour
      tours[1].data = nervousTour
      tours[2].data = digestiveTour
    })

    it('should have progressive disclosure (steps build on each other)', () => {
      tours.forEach(({ name, data }) => {
        // First step should be introductory
        const firstStep = data.steps[0]
        expect(firstStep.title.toLowerCase(), `${name} first step`).toMatch(/intro/i)

        // Steps should have increasing complexity (longer explanations)
        const explanationLengths = data.steps.map(s => s.explanation.length)
        const avgFirstHalf = explanationLengths.slice(0, Math.floor(explanationLengths.length / 2))
          .reduce((a, b) => a + b, 0) / Math.floor(explanationLengths.length / 2)
        const avgSecondHalf = explanationLengths.slice(Math.floor(explanationLengths.length / 2))
          .reduce((a, b) => a + b, 0) / (explanationLengths.length - Math.floor(explanationLengths.length / 2))

        // Second half should generally be more detailed
        expect(avgSecondHalf, `${name} progressive detail`).toBeGreaterThan(avgFirstHalf * 0.8)
      })
    })

    it('should include interactive prompts for engagement', () => {
      tours.forEach(({ name, data }) => {
        const stepsWithPrompts = data.steps.filter(s => s.interactivePrompt)
        expect(stepsWithPrompts.length, `${name} interactive prompts`).toBeGreaterThan(0)
      })
    })

    it('should use appropriate tags', () => {
      tours.forEach(({ name, data }) => {
        expect(data.metadata.tags, `${name} tags`).toBeTruthy()
        expect(data.metadata.tags.length, `${name} tags count`).toBeGreaterThanOrEqual(4)
        expect(data.metadata.tags, `${name} basic tag`).toContain('basic')
        expect(data.metadata.tags, `${name} anatomy tag`).toContain('anatomy')
      })
    })

    it('should have realistic time estimates', () => {
      tours.forEach(({ name, data }) => {
        // Assume ~2-3 minutes per step on average
        const minExpected = data.steps.length * 1.5
        const maxExpected = data.steps.length * 5
        expect(data.estimatedMinutes, `${name} time estimate`).toBeGreaterThanOrEqual(minExpected)
        expect(data.estimatedMinutes, `${name} time estimate`).toBeLessThanOrEqual(maxExpected)
      })
    })
  })

  describe('System-Specific Content', () => {
    it('cardiovascular tour should cover heart and blood vessels', () => {
      const allText = cardiovascularTour.steps.map(s => s.explanation).join(' ').toLowerCase()
      expect(allText).toMatch(/heart/)
      expect(allText).toMatch(/blood/)
      expect(allText).toMatch(/arter/)
      expect(allText).toMatch(/vein/)
    })

    it('nervous tour should cover brain and neurons', () => {
      const allText = nervousTour.steps.map(s => s.explanation).join(' ').toLowerCase()
      expect(allText).toMatch(/brain/)
      expect(allText).toMatch(/neuron/)
      expect(allText).toMatch(/spinal/)
      expect(allText).toMatch(/signal/)
    })

    it('digestive tour should cover digestion and organs', () => {
      const allText = digestiveTour.steps.map(s => s.explanation).join(' ').toLowerCase()
      expect(allText).toMatch(/digest/)
      expect(allText).toMatch(/stomach/)
      expect(allText).toMatch(/intestine/)
      expect(allText).toMatch(/nutrient/)
    })
  })
})
