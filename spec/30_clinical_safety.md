# Clinical Safety Specification

**Document Version:** 1.0.0
**Last Updated:** 2025-01-09
**Status:** Active
**Purpose:** Enforce safety constraints to prevent medical claims and maintain educational/research boundaries

---

## Overview

This specification defines the clinical safety guardrails for HumanDNAVisualizer. The system must maintain strict boundaries as an **educational/research visualization tool** and must never provide medical diagnosis, treatment recommendations, or health advice.

**Core Safety Principle:** This platform visualizes genomic-anatomic associations for educational purposes only. It does not, and must not, make medical claims.

---

## 1. Forbidden Features

The following features are **prohibited** from implementation:

### 1.1 Diagnostic Features

 **FORBIDDEN:**
- Disease diagnosis or detection
- Health condition identification
- Symptom analysis or correlation
- Medical test result interpretation beyond visualization
- Risk scoring or risk level assignment
- Disease prediction or prognosis
- Health status assessment
- Clinical decision support

 **ALLOWED:**
- Visualization of genomic variants
- Display of genomic-anatomic associations
- Evidence level labeling (HIGH/MEDIUM/LOW)
- Educational explanations of biological concepts

### 1.2 Treatment/Recommendation Features

 **FORBIDDEN:**
- Treatment recommendations or suggestions
- Therapy guidance
- Medication suggestions
- Lifestyle change recommendations (diet, exercise, supplements)
- Clinical intervention advice
- Preventive action recommendations
- Health optimization strategies
- Personalized health plans

 **ALLOWED:**
- General educational information about genomic concepts
- References to published research (with citations)
- Explanations of biological mechanisms
- Evidence-based association descriptions

### 1.3 Predictive/Prognostic Features

 **FORBIDDEN:**
- Future health predictions
- Disease onset probability
- Life expectancy calculations
- Health trajectory forecasting
- Risk stratification
- Genetic predisposition scoring beyond evidence labeling
- Outcomes prediction

 **ALLOWED:**
- Evidence level indicators (HIGH/MEDIUM/LOW)
- Association strength descriptions
- Research-based uncertainty labeling
- Statistical context from published literature

### 1.4 Medical Interpretation Features

 **FORBIDDEN:**
- Clinical significance determination
- Medical urgency assessment
- Action requirement statements ("you should see a doctor")
- Health prioritization
- Medical necessity evaluation

 **ALLOWED:**
- Genomic variant annotation
- Evidence quality indicators
- Educational context
- Standard disclaimer: "Consult healthcare professionals for medical decisions"

---

## 2. UI Copy Rules

### 2.1 Forbidden Terminology

The following terms are **prohibited** in all user-facing text:

**Medical Claims:**
- diagnose / diagnosis / diagnostic
- treat / treatment / treating / therapy
- cure / curing / heal / healing
- prescribe / prescription
- medical advice
- health advice
- lifestyle advice
- clinical recommendation

**Risk/Prediction Language:**
- risk score
- risk level
- disease risk
- health risk
- at risk for
- predicts disease
- likely to develop
- prognosis
- probability of disease

**Action-Oriented Health Terms:**
- prevent disease
- avoid condition
- improve health by
- reduce risk by
- optimize health
- you should (in health context)
- we recommend (in health context)

**Medical Authority Terms:**
- medical device
- clinical tool
- diagnostic platform
- health assessment
- medical-grade

### 2.2 Required Safe Terminology

Use these terms instead:

** APPROVED:**
- **association** (not "risk")
- **evidence level** (not "confidence score")
- **model** / **data model** (not "prediction")
- **visualization** / **educational visualization**
- **research purposes**
- **genomic-anatomic association**
- **variant** (not "mutation" in scary context)
- **structure** (anatomical)
- **overlay** (visualization term)
- **finding** (research term)
- **observation** (research term)

** APPROVED PHRASES:**
- "This visualization shows associations between genomic variants and anatomical structures"
- "Evidence quality: HIGH/MEDIUM/LOW"
- "For educational and research purposes only"
- "Not for medical diagnosis or treatment"
- "Consult qualified healthcare professionals for medical decisions"
- "Based on current research literature"
- "Association strength from published studies"

### 2.3 Context-Sensitive Language

Some terms require careful context:

**"Recommend"** -  WARNING
-  FORBIDDEN: "We recommend this treatment"
-  ALLOWED: "Recommended system requirements: 8GB RAM"
-  ALLOWED: "We recommend consulting healthcare professionals"

**"You should"** -  WARNING
-  FORBIDDEN: "You should take vitamin D"
-  ALLOWED: "You should back up your data"
-  ALLOWED: "You should consult a doctor for medical advice"

**"Treatment"** -  WARNING
-  FORBIDDEN: "This variant affects treatment response"
-  ALLOWED: "Data treatment and processing steps"
-  ALLOWED: "In disclaimer: not for treatment decisions"

---

## 3. Required Disclaimer Text

### 3.1 Primary Disclaimer

**Location:** All pages, top banner or header

```
 EDUCATIONAL/RESEARCH USE ONLY

This platform provides educational visualizations of genomic data.
It is NOT a medical device and does NOT provide medical diagnosis,
treatment advice, or health recommendations. All associations are
labeled with evidence quality to indicate uncertainty. For medical
decisions, always consult qualified healthcare professionals.
```

### 3.2 API Response Disclaimer

**Location:** All API responses containing genomic/anatomic data

**Format:**
```json
{
  "data": { ... },
  "disclaimer": "Educational/research purposes only. Not for medical diagnosis or treatment. Consult healthcare professionals for medical decisions.",
  "nonDiagnostic": true,
  "evidenceLabeled": true
}
```

**Required Fields:**
- `disclaimer` (string): Full disclaimer text
- `nonDiagnostic` (boolean): Always `true`
- `evidenceLabeled` (boolean): `true` if evidence levels included

### 3.3 Visualization Disclaimer

**Location:** 3D anatomy viewer, charts, graphs

```
📊 VISUALIZATION DISCLAIMER

This 3D visualization shows genomic-anatomic associations from current
data models. These are NOT medical predictions or diagnoses. Evidence
levels (HIGH/MEDIUM/LOW) indicate association strength from research,
not medical certainty. Educational and research purposes only.
```

### 3.4 Upload Disclaimer

**Location:** File upload pages

```
📋 DATA PRIVACY & EDUCATIONAL USE NOTICE

By uploading genomic data, you acknowledge:
• This is an educational/research tool, not a medical service
• Data is stored securely but you are responsible for its sensitivity
• You have the right to delete your data at any time
• We do not sell or share your data with third parties
• Genetic data may have implications for family members
• This platform does NOT provide medical advice or recommendations

By proceeding, you consent to our Terms of Service and Privacy Policy.
```

### 3.5 AI Explanation Disclaimer

**Location:** AI-generated explanation modals

```
🤖 AI-ASSISTED EXPLANATION

This explanation is generated for educational purposes. It describes
associations from data models, not medical advice. The system has
safety filters to prevent medical claims. For health decisions,
consult qualified healthcare professionals.
```

---

## 4. SafetyLanguage Helper Specification

### 4.1 Purpose

Centralized module for safety-compliant language generation across frontend and backend.

### 4.2 Required Functions

**Forbidden Phrase Detection:**
```javascript
isForbiddenPhrase(text: string): boolean
// Returns true if text contains forbidden medical claims
```

**Safe Label Formatting:**
```javascript
formatEvidenceLevel(level: string): string
// Input: "HIGH", "MEDIUM", "LOW"
// Output: "Evidence Level: HIGH (well-established findings)"

formatAssociation(gene: string, structure: string): string
// Input: "BRCA1", "Breast"
// Output: "Association observed between BRCA1 variant and breast structure"

formatOverlayLabel(intensity: number, evidence: string): string
// Input: 0.8, "HIGH"
// Output: "Overlay strength: 0.8 | Evidence: HIGH"
```

**Disclaimer Generation:**
```javascript
getPrimaryDisclaimer(): string
getAPIDisclaimer(): string
getVisualizationDisclaimer(): string
getUploadDisclaimer(): string
getAIDisclaimer(): string
```

**Safe Text Validation:**
```javascript
validateSafeText(text: string): { safe: boolean, violations: string[] }
// Returns list of forbidden phrases found in text
```

### 4.3 Implementation Requirements

- Must be usable in both Node.js (backend) and browser (frontend)
- No external dependencies (pure JavaScript/TypeScript)
- Comprehensive test coverage (>95%)
- Exported as ES module and CommonJS
- TypeScript definitions included

---

## 5. Backend Response Headers/Fields

### 5.1 Required API Response Structure

All endpoints returning genomic or anatomic data must include:

```typescript
interface SafeAPIResponse<T> {
  data: T;
  disclaimer: string;
  nonDiagnostic: true;  // Always literal true
  evidenceLabeled: boolean;
  timestamp: string;
  version: string;
}
```

### 5.2 Specific Endpoint Requirements

**GET /api/anatomygraph/{sampleId}:**
```json
{
  "data": {
    "nodes": [...],
    "overlays": [...],
    "rulesVersion": "1.0"
  },
  "disclaimer": "Educational/research purposes only. Not for medical diagnosis or treatment. Consult healthcare professionals for medical decisions.",
  "nonDiagnostic": true,
  "evidenceLabeled": true,
  "timestamp": "2025-01-09T14:00:00Z",
  "version": "1.0.0"
}
```

**POST /explain:**
```json
{
  "explanationText": "...",
  "disclaimer": "This explanation is for educational purposes only. Not medical advice.",
  "nonDiagnostic": true,
  "safetyLabels": ["Educational only", "No medical claims"],
  "method": "deterministic",
  "timestamp": "2025-01-09T14:00:00Z"
}
```

### 5.3 HTTP Headers

**Recommended (optional):**
```
X-Content-Type: educational-visualization
X-Non-Diagnostic: true
X-Disclaimer: Educational/research purposes only
```

---

## 6. Anatomical Consistency Rules

### 6.1 Standard Anatomy Hierarchy

Must maintain consistent anatomical structure:

```
System (e.g., Cardiovascular System)
  └─ Organ (e.g., Heart)
       └─ Substructure (e.g., Left Ventricle)
            └─ Tissue/Cell Type (optional)
```

### 6.2 Required Anatomical Properties

Each anatomical node must have:
- `id` (string): Unique identifier
- `name` (string): Standard anatomical name
- `type` (enum): "SYSTEM" | "ORGAN" | "SUBSTRUCTURE" | "TISSUE"
- `parentId` (string | null): Parent node ID
- `standardTermId` (string): Reference to standard ontology (e.g., UBERON, FMA)

### 6.3 Forbidden Anatomical Terms

Avoid disease-specific or clinical terminology:
-  "diseased heart"
-  "cancerous tissue"
-  "inflamed organ"
-  "heart structure"
-  "tissue sample"
-  "organ system"

### 6.4 Anatomical Reference Standards

Use standard ontologies:
- **UBERON** (Uber-anatomy ontology)
- **FMA** (Foundational Model of Anatomy)
- **Cell Ontology** (for cell types)

Include ontology IDs in data:
```json
{
  "id": "heart",
  "name": "Heart",
  "type": "ORGAN",
  "ontologyRef": {
    "source": "UBERON",
    "id": "UBERON:0000948"
  }
}
```

---

## 7. Testing Requirements

### 7.1 Forbidden Phrase Tests

**Test Suite:** `safety-language.test.js`

Required tests:
1. Detect all forbidden medical claim phrases
2. Detect risk/prediction language
3. Detect action-oriented health terms
4. Allow safe terminology
5. Allow disclaimer text containing forbidden words in negative context
6. Case-insensitive detection
7. Word boundary detection (avoid false positives)

**Example:**
```javascript
describe('SafetyLanguage - Forbidden Phrases', () => {
  test('should detect "diagnose" in medical claim', () => {
    expect(isForbiddenPhrase("This tool can diagnose diseases")).toBe(true);
  });

  test('should allow "diagnose" in disclaimer', () => {
    expect(isForbiddenPhrase("Not for medical diagnosis")).toBe(false);
  });

  test('should detect "risk score"', () => {
    expect(isForbiddenPhrase("Your risk score is 85%")).toBe(true);
  });
});
```

### 7.2 API Disclaimer Tests

**Test Suite:** `api-disclaimer.test.js`

Required tests:
1. All genomic/anatomic API responses include `disclaimer` field
2. All responses have `nonDiagnostic: true`
3. Responses with evidence levels have `evidenceLabeled: true`
4. Disclaimer text contains no forbidden phrases
5. Disclaimer text is non-empty

**Example:**
```javascript
describe('API Disclaimers', () => {
  test('GET /api/anatomygraph/{id} includes disclaimer', async () => {
    const response = await request(app).get('/api/anatomygraph/1');
    expect(response.body).toHaveProperty('disclaimer');
    expect(response.body.nonDiagnostic).toBe(true);
    expect(response.body.disclaimer.length).toBeGreaterThan(0);
  });
});
```

### 7.3 UI Copy Tests

**Test Suite:** `ui-copy-safety.test.js`

Required tests:
1. Scan all React components for forbidden phrases
2. Check that evidence levels use approved terminology
3. Verify disclaimers are displayed on key pages
4. Ensure no medical claim language in default component text

### 7.4 Template Output Tests

**Test Suite:** `template-safety.test.js`

Required tests:
1. Default explanation templates emit no forbidden phrases
2. AI-generated explanations are validated by safety filter
3. Overlay labels use safe terminology
4. Node detail panels use approved language

---

## 8. Implementation Checklist

### Phase 1: Core Safety Module

- [ ] Create `shared/SafetyLanguage.js` module
- [ ] Implement forbidden phrase detection
- [ ] Implement safe label formatters
- [ ] Implement disclaimer generators
- [ ] Add TypeScript definitions
- [ ] Write unit tests (>95% coverage)

### Phase 2: Backend Integration

- [ ] Update AnatomyGraph API response structure
- [ ] Add disclaimer field to all relevant endpoints
- [ ] Add `nonDiagnostic` and `evidenceLabeled` flags
- [ ] Update API documentation
- [ ] Write API disclaimer tests

### Phase 3: Frontend Integration

- [ ] Import SafetyLanguage in frontend
- [ ] Update API client to expect disclaimer fields
- [ ] Display disclaimers in UI where appropriate
- [ ] Update component copy to use safe terminology
- [ ] Write UI copy safety tests

### Phase 4: Validation & Testing

- [ ] Run full test suite
- [ ] Scan all code for forbidden phrases (use legal linter)
- [ ] Manual review of all user-facing text
- [ ] Accessibility check for disclaimers
- [ ] Document safety architecture

---

## 9. Enforcement Mechanisms

### 9.1 Pre-Commit Hooks

Use legal linter (from Legal Analyst Agent) to catch forbidden phrases:

```bash
npm run lint:legal
```

Fails commit if violations found.

### 9.2 CI/CD Pipeline

GitHub Actions workflow includes:
1. Legal compliance linter
2. Safety language tests
3. API disclaimer validation
4. UI copy scanning

### 9.3 Runtime Validation

Backend middleware validates:
- API responses include required disclaimer fields
- Generated text passes safety filter
- Evidence levels are properly labeled

Frontend validation:
- Check API responses for disclaimer presence
- Log warning if disclaimer missing
- Display fallback disclaimer if API fails

---

## 10. Incident Response

### 10.1 Medical Claim in Production

**Severity:** CRITICAL
**Response Time:** 4 hours

1. **Immediate:** Remove violating content/feature
2. **Investigation:** Determine bypass mechanism
3. **Fix:** Update safety filters to catch similar violations
4. **User Notice:** If users exposed, send correction notice
5. **Document:** Incident report and remediation

### 10.2 Missing Disclaimer

**Severity:** HIGH
**Response Time:** 24 hours

1. **Identify:** Which endpoints/pages missing disclaimers
2. **Fix:** Add disclaimer fields/components
3. **Test:** Verify disclaimer presence
4. **Deploy:** Hotfix release
5. **Monitor:** Ensure disclaimers appear correctly

### 10.3 Forbidden Phrase Detected

**Severity:** MEDIUM (if caught before production)
**Response Time:** Next release

1. **Review:** Context of forbidden phrase
2. **Replace:** Use approved terminology
3. **Test:** Run safety tests
4. **Update:** Filters if needed
5. **Deploy:** Include in next release

---

## 11. Maintenance

### Quarterly Review

- Review forbidden phrase list for new medical claims
- Update approved terminology based on field standards
- Audit all API responses for disclaimer compliance
- Check UI copy for safety violations
- Update tests to cover new scenarios

### Annual Review

- Full legal/medical review (if budget allows)
- Update disclaimers based on regulatory changes
- Review anatomical ontology references
- Assess need for additional safety measures

---

## 12. References

- **Legal Compliance Spec:** `spec/08_legal_compliance.md`
- **AI Safety Spec:** `llm-service/safety_filter.py`
- **Anatomical Ontologies:**
  - UBERON: http://uberon.github.io/
  - FMA: http://si.washington.edu/projects/fma
- **Evidence Standards:**
  - ClinGen: https://www.clinicalgenome.org/
  - ClinVar: https://www.ncbi.nlm.nih.gov/clinvar/

---

## Appendix A: Example Safe vs. Unsafe Copy

### Unsafe Examples (FORBIDDEN)

 "Your risk score for heart disease is 78%"
 "This genetic variant may lead to cancer"
 "We recommend increasing vitamin D intake"
 "You should get genetic counseling immediately"
 "This tool can diagnose genetic conditions"
 "Treatment options for this variant include..."

### Safe Examples (APPROVED)

 "Association observed between variant and cardiovascular structures (Evidence: MEDIUM)"
 "This variant has been reported in research literature with mixed evidence"
 "For personalized medical advice, consult qualified healthcare professionals"
 "Consult genetic counselors to understand your genomic information"
 "This educational tool visualizes genomic-anatomic associations"
 "Research publications describe various biological mechanisms"

---

**END OF CLINICAL SAFETY SPECIFICATION**

**Version:** 1.0.0
**Last Updated:** 2025-01-09
**Review Schedule:** Quarterly
**Next Review:** 2025-04-09
