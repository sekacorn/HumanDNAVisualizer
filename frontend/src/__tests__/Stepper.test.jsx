import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Stepper from '../components/Stepper'

/**
 * Stepper Component UI Tests
 *
 * Tests the stepper component functionality including navigation,
 * visual states, and accessibility.
 */

describe('Stepper Component', () => {
  const mockSteps = [
    {
      stepNumber: 1,
      title: 'Introduction',
      explanation: '# Introduction\n\nWelcome to the tour.',
      highlightNodeIds: ['node-1'],
      overlayConfig: { intensity: 0.5 }
    },
    {
      stepNumber: 2,
      title: 'Main Concepts',
      explanation: '# Main Concepts\n\nLearn the basics.',
      highlightNodeIds: ['node-2'],
      overlayConfig: { intensity: 0.7 }
    },
    {
      stepNumber: 3,
      title: 'Advanced Topics',
      explanation: '# Advanced Topics\n\nDeep dive into details.',
      highlightNodeIds: ['node-3'],
      overlayConfig: { intensity: 0.9 }
    }
  ]

  describe('Rendering', () => {
    it('should render all steps', () => {
      render(<Stepper steps={mockSteps} currentStep={0} />)

      expect(screen.getByText('Introduction')).toBeInTheDocument()
      expect(screen.getByText('Main Concepts')).toBeInTheDocument()
      expect(screen.getByText('Advanced Topics')).toBeInTheDocument()
    })

    it('should render step numbers', () => {
      render(<Stepper steps={mockSteps} currentStep={0} />)

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should show progress bar on mobile view', () => {
      render(<Stepper steps={mockSteps} currentStep={1} />)

      // Progress should be 2/3 = 66.67%
      const progressText = screen.getByText('67%')
      expect(progressText).toBeInTheDocument()
    })
  })

  describe('Current Step Highlighting', () => {
    it('should highlight the current step', () => {
      const { container } = render(<Stepper steps={mockSteps} currentStep={1} />)

      // Find button containing step 2 (current)
      const buttons = container.querySelectorAll('button')
      const step2Button = Array.from(buttons).find(btn => btn.textContent.includes('Main Concepts'))

      expect(step2Button).toHaveClass('bg-blue-600')
    })

    it('should mark completed steps with checkmarks', () => {
      render(<Stepper steps={mockSteps} currentStep={2} />)

      // Steps 1 and 2 should be completed (showing checkmarks)
      const checkmarks = screen.getAllByText('✓')
      expect(checkmarks.length).toBeGreaterThanOrEqual(2)
    })

    it('should show future steps as inactive', () => {
      const { container } = render(<Stepper steps={mockSteps} currentStep={0} />)

      // Find button containing step 3 (future)
      const buttons = container.querySelectorAll('button')
      const step3Button = Array.from(buttons).find(btn => btn.textContent.includes('Advanced Topics'))

      expect(step3Button).toHaveClass('bg-gray-700')
    })
  })

  describe('Navigation', () => {
    it('should call onStepClick when a step is clicked', () => {
      const handleStepClick = vi.fn()
      const { container } = render(
        <Stepper steps={mockSteps} currentStep={0} onStepClick={handleStepClick} />
      )

      // Find and click step 2
      const buttons = container.querySelectorAll('button')
      const step2Button = Array.from(buttons).find(btn => btn.textContent.includes('Main Concepts'))
      fireEvent.click(step2Button)

      expect(handleStepClick).toHaveBeenCalledWith(1)
    })

    it('should allow clicking on any step', () => {
      const handleStepClick = vi.fn()
      const { container } = render(
        <Stepper steps={mockSteps} currentStep={0} onStepClick={handleStepClick} />
      )

      // Click on step 3 (future step)
      const buttons = container.querySelectorAll('button')
      const step3Button = Array.from(buttons).find(btn => btn.textContent.includes('Advanced Topics'))
      fireEvent.click(step3Button)

      expect(handleStepClick).toHaveBeenCalledWith(2)
    })

    it('should allow clicking on completed steps', () => {
      const handleStepClick = vi.fn()
      const { container } = render(
        <Stepper steps={mockSteps} currentStep={2} onStepClick={handleStepClick} />
      )

      // Click on step 1 (completed step)
      const buttons = container.querySelectorAll('button')
      const step1Button = Array.from(buttons).find(btn => btn.textContent.includes('Introduction'))
      fireEvent.click(step1Button)

      expect(handleStepClick).toHaveBeenCalledWith(0)
    })
  })

  describe('Visual States', () => {
    it('should display connector lines between steps on desktop', () => {
      const { container } = render(<Stepper steps={mockSteps} currentStep={0} />)

      // Check for connector lines (desktop view)
      const connectors = container.querySelectorAll('.h-1')
      expect(connectors.length).toBeGreaterThan(0)
    })

    it('should show pulse animation for active step indicator', () => {
      const { container } = render(<Stepper steps={mockSteps} currentStep={1} />)

      // Find active indicator (mobile view)
      const pulseElements = container.querySelectorAll('.animate-pulse')
      expect(pulseElements.length).toBeGreaterThan(0)
    })

    it('should apply different colors for active vs completed vs future steps', () => {
      const { container } = render(<Stepper steps={mockSteps} currentStep={1} />)

      const buttons = container.querySelectorAll('button')

      // Step 1 (completed) - should have green
      const step1Button = Array.from(buttons).find(btn => btn.textContent.includes('Introduction'))
      expect(step1Button.querySelector('.bg-green-600')).toBeInTheDocument()

      // Step 2 (active) - should have blue
      const step2Button = Array.from(buttons).find(btn => btn.textContent.includes('Main Concepts'))
      expect(step2Button.classList.contains('bg-blue-900') ||
             step2Button.querySelector('.bg-blue-600')).toBeTruthy()

      // Step 3 (future) - should have gray
      const step3Button = Array.from(buttons).find(btn => btn.textContent.includes('Advanced Topics'))
      expect(step3Button.querySelector('.bg-gray-700')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle single step tour', () => {
      const singleStep = [mockSteps[0]]
      render(<Stepper steps={singleStep} currentStep={0} />)

      expect(screen.getByText('Introduction')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should handle first step', () => {
      render(<Stepper steps={mockSteps} currentStep={0} />)

      expect(screen.getByText('33%')).toBeInTheDocument()
    })

    it('should handle last step', () => {
      render(<Stepper steps={mockSteps} currentStep={2} />)

      expect(screen.getByText('100%')).toBeInTheDocument()
      const checkmarks = screen.getAllByText('✓')
      expect(checkmarks.length).toBe(2) // Steps 1 and 2 completed
    })

    it('should handle many steps', () => {
      const manySteps = Array.from({ length: 10 }, (_, i) => ({
        stepNumber: i + 1,
        title: `Step ${i + 1}`,
        explanation: `# Step ${i + 1}\n\nContent`,
        highlightNodeIds: [`node-${i + 1}`],
        overlayConfig: { intensity: 0.5 }
      }))

      render(<Stepper steps={manySteps} currentStep={5} />)

      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 10')).toBeInTheDocument()
      expect(screen.getByText('60%')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should render buttons for step navigation', () => {
      const { container } = render(<Stepper steps={mockSteps} currentStep={0} />)

      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(mockSteps.length)
    })

    it('should have hover states for interactive elements', () => {
      const { container } = render(<Stepper steps={mockSteps} currentStep={0} />)

      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button.classList.toString()).toMatch(/hover:/)
      })
    })

    it('should show step titles for screen readers', () => {
      render(<Stepper steps={mockSteps} currentStep={0} />)

      mockSteps.forEach(step => {
        expect(screen.getByText(step.title)).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Design', () => {
    it('should have desktop-specific layout classes', () => {
      const { container } = render(<Stepper steps={mockSteps} currentStep={0} />)

      const desktopView = container.querySelector('.hidden.md\\:block')
      expect(desktopView).toBeInTheDocument()
    })

    it('should have mobile-specific layout classes', () => {
      const { container } = render(<Stepper steps={mockSteps} currentStep={0} />)

      const mobileView = container.querySelector('.md\\:hidden')
      expect(mobileView).toBeInTheDocument()
    })
  })
})
