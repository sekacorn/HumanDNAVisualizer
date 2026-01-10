# Learn Mode Specification

**Document Version:** 1.0.0
**Last Updated:** 2025-01-09
**Status:** Active
**Purpose:** Define guided educational tours for anatomy and biological systems

---

## Overview

Learn Mode provides interactive, guided tours through anatomical systems and biological concepts. It teaches anatomy, physiology, and genomic concepts through layered explanations without providing medical advice.

**Educational Principle:** Progressive disclosure with evidence-based explanations. Start simple, layer complexity, always label uncertainty.

---

## 1. Core Concepts

### 1.1 Guided Tours

**Definition:** Step-by-step educational journeys through anatomical systems or biological concepts.

**Structure:**
- **System-based:** Cardiovascular, Nervous, Digestive, Respiratory, etc.
- **Concept-based:** Gene expression, Protein folding, Cell signaling, etc.
- **Multi-level:** Basic (high school), Intermediate (undergrad), Advanced (grad/professional)

**Components:**
- Title and description
- Ordered steps with explanations
- Highlighted anatomical structures
- Evidence levels for biological claims
- Interactive 3D visualizations
- Progressive complexity

### 1.2 Learning Levels

**BASIC (High School):**
- Simple language, minimal jargon
- Focus on structure and basic function
- Analogies and everyday examples
- Foundation concepts only

**INTERMEDIATE (Undergraduate):**
- Technical terminology introduced
- Mechanisms and processes explained
- Multiple systems integration
- Evidence-based claims with citations

**ADVANCED (Graduate/Professional):**
- Detailed molecular mechanisms
- Current research findings
- Genomic associations and evidence
- Uncertainty and limitations discussed

### 1.3 Educational Boundaries

**✅ ALLOWED:**
- Anatomical structure descriptions
- Physiological processes and mechanisms
- Biological system interactions
- Gene-protein relationships
- Evidence-based research findings
- Historical context and discoveries

**❌ FORBIDDEN:**
- Medical diagnosis or disease detection
- Treatment recommendations
- Health advice or lifestyle recommendations
- Risk assessment or prediction
- Clinical decision support
- Personalized medical interpretations

---

## 2. Tour JSON Schema

### 2.1 Tour Structure

```typescript
interface Tour {
  id: string;                    // Unique identifier (e.g., "cardiovascular-basic")
  systemId: string;              // System identifier (e.g., "cardiovascular")
  title: string;                 // Tour title
  description: string;           // Brief tour description
  level: "basic" | "intermediate" | "advanced";
  estimatedMinutes: number;      // Estimated completion time
  prerequisites?: string[];      // Required prior tours
  learningObjectives: string[];  // What student will learn
  steps: TourStep[];            // Ordered tour steps
  metadata: TourMetadata;       // Additional metadata
}

interface TourStep {
  stepNumber: number;           // Sequential step number
  title: string;                // Step title
  explanation: string;          // Educational explanation (markdown)
  highlightNodeIds: string[];   // Anatomical nodes to highlight
  overlayConfig?: {             // Optional overlay configuration
    intensity: number;          // 0.0 to 1.0
    color?: string;            // Hex color code
    pulseAnimation?: boolean;  // Enable pulsing effect
  };
  evidenceLevel?: "HIGH" | "MEDIUM" | "LOW";  // For biological claims
  interactivePrompt?: string;   // Question or prompt for student
  furtherReading?: Reference[]; // Optional references
}

interface TourMetadata {
  author: string;
  createdDate: string;
  lastUpdated: string;
  version: string;
  tags: string[];
  educationalStandards?: string[];  // e.g., "NGSS HS-LS1-2"
}

interface Reference {
  title: string;
  url?: string;
  citation?: string;
  type: "textbook" | "research" | "review" | "video";
}
```

### 2.2 Validation Rules

**Required Fields:**
- `id`: Must be unique, lowercase with hyphens
- `systemId`: Must match a valid anatomical system
- `title`: Non-empty, max 100 characters
- `level`: Must be "basic", "intermediate", or "advanced"
- `steps`: Minimum 3 steps, maximum 20 steps
- `learningObjectives`: Minimum 2 objectives

**Step Validation:**
- `stepNumber`: Sequential starting from 1
- `explanation`: Non-empty, markdown format
- `highlightNodeIds`: Must reference valid anatomy node IDs
- `evidenceLevel`: Required if making biological claims

**Safety Validation:**
- All text validated with SafetyLanguage module
- No forbidden medical claims allowed
- Disclaimers included for genomic associations

---

## 3. System Tours

### 3.1 Cardiovascular System Tour

**Tour ID:** `cardiovascular-basic`
**Level:** Basic
**Duration:** 15-20 minutes
**Prerequisites:** None

**Learning Objectives:**
1. Identify major structures of the cardiovascular system
2. Understand the path of blood flow through the heart
3. Explain the function of arteries, veins, and capillaries
4. Describe the cardiac cycle at a basic level

**Tour Outline:**
1. **Introduction to the Cardiovascular System**
   - Overview of heart, blood vessels, blood
   - Highlight: Heart, major arteries, major veins

2. **The Heart Structure**
   - Four chambers: atria and ventricles
   - Highlight: Right atrium, right ventricle, left atrium, left ventricle

3. **Blood Flow Through the Heart**
   - Deoxygenated blood → right side → lungs
   - Oxygenated blood → left side → body
   - Highlight: Flow path with animated arrows

4. **Major Blood Vessels**
   - Arteries carry blood away from heart
   - Veins carry blood to heart
   - Capillaries enable gas exchange
   - Highlight: Aorta, vena cava, pulmonary vessels

5. **The Cardiac Cycle**
   - Systole (contraction) and diastole (relaxation)
   - Coordinated pumping action
   - Highlight: Heart chambers with pulse animation

6. **Integration with Other Systems**
   - Oxygen delivery to all body tissues
   - Connection to respiratory system
   - Highlight: Lungs, heart, body circulation

**Genomic Connections (Advanced):**
- Genes involved in cardiac development
- Ion channels and electrical conduction
- Evidence-labeled associations

### 3.2 Nervous System Tour

**Tour ID:** `nervous-basic`
**Level:** Basic
**Duration:** 15-20 minutes
**Prerequisites:** None

**Learning Objectives:**
1. Identify major divisions: central and peripheral nervous systems
2. Understand neuron structure and basic function
3. Explain how signals travel through the nervous system
4. Recognize major brain regions and their roles

**Tour Outline:**
1. **Introduction to the Nervous System**
   - Central (brain, spinal cord) vs. peripheral
   - Highlight: Brain, spinal cord, peripheral nerves

2. **Neuron Structure**
   - Cell body, dendrites, axon, synapses
   - Highlight: Neuron diagram overlay

3. **Signal Transmission**
   - Electrical signals along axons
   - Chemical signals across synapses
   - Highlight: Synapse detail

4. **The Brain Regions**
   - Cerebrum (thinking), cerebellum (coordination)
   - Brain stem (basic functions)
   - Highlight: Each region sequentially

5. **Spinal Cord Function**
   - Reflex pathways
   - Communication between brain and body
   - Highlight: Spinal cord segments

6. **Sensory and Motor Pathways**
   - Sensory input → processing → motor output
   - Highlight: Complete pathway

**Genomic Connections (Advanced):**
- Neurotransmitter receptor genes
- Ion channel variants
- Neurodevelopmental genes

### 3.3 Digestive System Tour

**Tour ID:** `digestive-basic`
**Level:** Basic
**Duration:** 15-20 minutes
**Prerequisites:** None

**Learning Objectives:**
1. Trace the path of food through the digestive tract
2. Identify accessory organs and their functions
3. Understand mechanical and chemical digestion
4. Explain nutrient absorption process

**Tour Outline:**
1. **Introduction to Digestion**
   - Breaking down food for energy and building blocks
   - Highlight: Entire digestive tract

2. **Mouth and Esophagus**
   - Mechanical (chewing) and chemical (saliva) digestion
   - Swallowing and peristalsis
   - Highlight: Mouth, esophagus

3. **The Stomach**
   - Acid and enzyme secretion
   - Protein digestion begins
   - Churning and mixing
   - Highlight: Stomach structure

4. **Small Intestine**
   - Primary site of nutrient absorption
   - Villi and microvilli increase surface area
   - Highlight: Small intestine, villi detail

5. **Accessory Organs**
   - Liver (bile production), gallbladder (bile storage)
   - Pancreas (enzymes and hormones)
   - Highlight: Liver, gallbladder, pancreas

6. **Large Intestine and Elimination**
   - Water absorption
   - Bacterial fermentation
   - Waste elimination
   - Highlight: Large intestine

**Genomic Connections (Advanced):**
- Digestive enzyme genes
- Nutrient transporter genes
- Microbiome interactions

---

## 4. UI Components

### 4.1 Learn Mode Landing Page

**Route:** `/learn`

**Components:**
- Hero section with Learn Mode description
- Browse tours by system
- Browse tours by level
- Featured/recommended tours
- Progress tracking (if user logged in)

**Layout:**
```
┌─────────────────────────────────────┐
│  Learn Mode: Interactive Anatomy    │
│  Guided tours through body systems  │
└─────────────────────────────────────┘

Browse by System:
[Cardiovascular] [Nervous] [Digestive]
[Respiratory] [Musculoskeletal] ...

Browse by Level:
[Basic] [Intermediate] [Advanced]

Featured Tours:
┌──────────────┐ ┌──────────────┐
│ Cardiovasc.  │ │ Nervous Sys. │
│ Basic • 15min│ │ Basic • 15min│
└──────────────┘ └──────────────┘
```

### 4.2 System Tour Page

**Route:** `/learn/system/:systemId`

**Components:**
- System overview
- Available tours for this system (by level)
- Prerequisite warnings
- Start tour button

**Layout:**
```
┌─────────────────────────────────────┐
│  Cardiovascular System              │
│  Learn about the heart and blood    │
└─────────────────────────────────────┘

Available Tours:
┌──────────────────────────────────┐
│ BASIC                            │
│ Introduction to Cardiovascular   │
│ 15-20 min • No prerequisites     │
│ [Start Tour →]                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ INTERMEDIATE                     │
│ Cardiac Physiology               │
│ 25-30 min • Requires: Basic      │
│ [Start Tour →]                   │
└──────────────────────────────────┘
```

### 4.3 Tour Viewer with Stepper

**Route:** `/learn/tour/:tourId`

**Components:**
- Stepper (progress indicator)
- Current step content panel
- 3D anatomy viewer with highlights
- Navigation buttons (Previous/Next)
- Progress indicator
- Exit/Pause tour

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Step 2 of 6: The Heart Structure            │
│ ●──●──○──○──○──○ (progress dots)            │
└─────────────────────────────────────────────┘

┌───────────┬───────────────────────────────┐
│           │  3D Anatomy Viewer            │
│  Content  │                               │
│  Panel    │  [Heart rendered with         │
│           │   highlighted chambers]       │
│  [Text]   │                               │
│  [Images] │                               │
│           │                               │
│  Evidence │                               │
│  Level:   │                               │
│  HIGH     │                               │
└───────────┴───────────────────────────────┘

[← Previous]          [Pause]        [Next →]
```

### 4.4 Stepper Component

**File:** `frontend/src/components/Stepper.jsx`

**Props:**
```typescript
interface StepperProps {
  currentStep: number;    // Current step number (1-indexed)
  totalSteps: number;     // Total number of steps
  onStepClick?: (step: number) => void;  // Optional click handler
  completedSteps?: number[];  // Steps marked as completed
}
```

**Features:**
- Visual progress indicator
- Click to jump to steps (optional)
- Highlight current step
- Show completed steps
- Responsive design

### 4.5 TourViewer Component

**File:** `frontend/src/components/TourViewer.jsx`

**Props:**
```typescript
interface TourViewerProps {
  tour: Tour;
  initialStep?: number;
  onComplete?: () => void;
  onExit?: () => void;
}
```

**Features:**
- Load and display tour steps
- Integrate with 3D anatomy viewer
- Highlight specified nodes
- Navigate between steps
- Track progress
- Validate with SafetyLanguage

---

## 5. Tour Content Storage

### 5.1 Static JSON Files

**Location:** `frontend/public/tours/`

**Structure:**
```
tours/
├── cardiovascular-basic.json
├── cardiovascular-intermediate.json
├── cardiovascular-advanced.json
├── nervous-basic.json
├── nervous-intermediate.json
├── digestive-basic.json
└── ...
```

**Loading:**
```javascript
async function loadTour(tourId) {
  const response = await fetch(`/tours/${tourId}.json`);
  return await response.json();
}
```

### 5.2 Tour Index

**File:** `frontend/public/tours/index.json`

```json
{
  "tours": [
    {
      "id": "cardiovascular-basic",
      "systemId": "cardiovascular",
      "title": "Introduction to Cardiovascular System",
      "level": "basic",
      "estimatedMinutes": 15,
      "description": "Learn about the heart, blood vessels, and blood flow"
    },
    ...
  ],
  "systems": [
    {
      "id": "cardiovascular",
      "name": "Cardiovascular System",
      "description": "Heart and blood circulation",
      "tourCount": 3
    },
    ...
  ]
}
```

---

## 6. Testing Requirements

### 6.1 Tour JSON Schema Validation

**File:** `frontend/src/__tests__/tourSchema.test.js`

**Tests:**
- Validate tour structure matches schema
- Ensure all required fields present
- Check step numbering is sequential
- Verify highlightNodeIds reference valid nodes
- Validate no forbidden medical claims in text
- Check evidence levels present for biological claims

### 6.2 UI Component Tests

**File:** `frontend/src/components/__tests__/Stepper.test.jsx`

**Tests:**
- Renders correct number of steps
- Highlights current step
- Shows completed steps
- Handles step click events

**File:** `frontend/src/components/__tests__/TourViewer.test.jsx`

**Tests:**
- Loads tour content correctly
- Navigates between steps
- Highlights anatomy nodes
- Validates text with SafetyLanguage
- Handles tour completion

### 6.3 Integration Tests

**File:** `frontend/src/__tests__/LearnMode.integration.test.js`

**Tests:**
- Navigate from landing page to tour
- Complete full tour end-to-end
- Verify anatomy highlights update correctly
- Check progress tracking

---

## 7. Safety and Educational Standards

### 7.1 Content Safety

**All tour content must:**
- Pass SafetyLanguage validation
- Include appropriate disclaimers
- Label evidence levels for biological claims
- Avoid medical advice or recommendations
- Use educational/research framing

**Required Disclaimers:**
```
Educational content for learning anatomy and biology.
Not for medical diagnosis or treatment.
For medical questions, consult qualified healthcare professionals.
```

### 7.2 Educational Standards Alignment

**Optional alignment with:**
- **NGSS:** Next Generation Science Standards (US)
- **Common Core:** Science standards
- **IB Biology:** International Baccalaureate
- **AP Biology:** Advanced Placement

**Example tags:**
```json
"educationalStandards": [
  "NGSS HS-LS1-2: Develop and use a model to illustrate hierarchical organization",
  "AP Biology 4.A.1: Explain how organisms exchange matter with environment"
]
```

### 7.3 Accessibility

**Requirements:**
- Screen reader compatible
- Keyboard navigation for stepper
- Alt text for all images
- Sufficient color contrast (WCAG 2.1 AA)
- Captions for any video content

---

## 8. Future Enhancements

### 8.1 Interactive Elements

- **Quizzes:** Test understanding at end of tour
- **Annotations:** Students can take notes on steps
- **3D Manipulation:** Rotate, zoom, dissect structures
- **Comparisons:** Side-by-side views of different systems

### 8.2 Personalization

- **Progress Tracking:** Save completed tours
- **Adaptive Learning:** Suggest next tours based on history
- **Difficulty Adjustment:** Skip known concepts
- **Learning Paths:** Curated sequences of tours

### 8.3 Advanced Features

- **Video Integration:** Embedded educational videos
- **Simulations:** Interactive physiological simulations
- **Collaboration:** Share tours with classmates
- **Instructor Tools:** Create custom tours

### 8.4 Genomic Integration

- **Variant Overlays:** Show genomic associations on anatomy
- **Evidence-Based:** Label all claims with evidence levels
- **Research Context:** Current findings and limitations
- **No Medical Claims:** Strict educational framing only

---

## 9. Implementation Phases

### Phase 1: MVP (Current)
- [x] Learn Mode specification
- [ ] One complete system tour (Cardiovascular Basic)
- [ ] Stepper component
- [ ] TourViewer component
- [ ] Basic routing
- [ ] Schema validation tests

### Phase 2: Expansion
- [ ] Add 2 more system tours (Nervous, Digestive)
- [ ] Intermediate level tours
- [ ] Progress tracking
- [ ] Search and filter

### Phase 3: Enhancement
- [ ] Advanced level tours
- [ ] Interactive quizzes
- [ ] 3D manipulation tools
- [ ] Video integration

### Phase 4: Platform
- [ ] User accounts and progress
- [ ] Instructor tools
- [ ] Custom tour creation
- [ ] Collaborative features

---

## Appendix A: Example Tour Content

See actual tour JSON files in `frontend/public/tours/`

---

## Appendix B: Anatomical Node IDs

**Cardiovascular System:**
- `heart`
- `right-atrium`
- `right-ventricle`
- `left-atrium`
- `left-ventricle`
- `aorta`
- `vena-cava`
- `pulmonary-artery`
- `pulmonary-vein`

**Nervous System:**
- `brain`
- `cerebrum`
- `cerebellum`
- `brain-stem`
- `spinal-cord`
- `peripheral-nerves`

**Digestive System:**
- `mouth`
- `esophagus`
- `stomach`
- `small-intestine`
- `large-intestine`
- `liver`
- `gallbladder`
- `pancreas`

---

**END OF LEARN MODE SPECIFICATION**

**Version:** 1.0.0
**Last Updated:** 2025-01-09
**Review Schedule:** Quarterly
**Next Review:** 2025-04-09
