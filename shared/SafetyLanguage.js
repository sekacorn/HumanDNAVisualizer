/**
 * SafetyLanguage Module
 *
 * Centralized safety-compliant language generation for HumanDNAVisualizer.
 * Prevents medical claims and enforces educational/research boundaries.
 *
 * Based on: spec/30_clinical_safety.md
 *
 * Usage:
 *   const { isForbiddenPhrase, formatEvidenceLevel } = require('./SafetyLanguage');
 *   // or
 *   import { isForbiddenPhrase, formatEvidenceLevel } from './SafetyLanguage.js';
 */

// Forbidden medical claim phrases (from spec/30_clinical_safety.md Section 2.1)
const FORBIDDEN_PHRASES = [
  // Medical Claims
  { pattern: /\bdiagnos[ei]s?\b/gi, term: 'diagnose/diagnosis/diagnostic' },
  { pattern: /\btreat(ment|ing)?\b/gi, term: 'treat/treatment/treating' },
  { pattern: /\b(cure|curing|heal|healing)\b/gi, term: 'cure/heal' },
  { pattern: /\bprescrib[ei](d|ng)?\b/gi, term: 'prescribe/prescription' },
  { pattern: /\bmedical advice\b/gi, term: 'medical advice' },
  { pattern: /\bhealth advice\b/gi, term: 'health advice' },
  { pattern: /\blifestyle advice\b/gi, term: 'lifestyle advice' },
  { pattern: /\bclinical recommendation\b/gi, term: 'clinical recommendation' },

  // Risk/Prediction Language
  { pattern: /\brisk score\b/gi, term: 'risk score' },
  { pattern: /\brisk level\b/gi, term: 'risk level' },
  { pattern: /\bdisease risk\b/gi, term: 'disease risk' },
  { pattern: /\bhealth risk\b/gi, term: 'health risk' },
  { pattern: /\bat risk for\b/gi, term: 'at risk for' },
  { pattern: /\bpredicts disease\b/gi, term: 'predicts disease' },
  { pattern: /\blikely to develop\b/gi, term: 'likely to develop' },
  { pattern: /\bprognosis\b/gi, term: 'prognosis' },
  { pattern: /\bprobability of disease\b/gi, term: 'probability of disease' },

  // Action-Oriented Health Terms
  { pattern: /\bprevent disease\b/gi, term: 'prevent disease' },
  { pattern: /\bavoid condition\b/gi, term: 'avoid condition' },
  { pattern: /\bimprove health by\b/gi, term: 'improve health by' },
  { pattern: /\breduce risk by\b/gi, term: 'reduce risk by' },
  { pattern: /\boptimize health\b/gi, term: 'optimize health' },

  // Medical Authority Terms
  { pattern: /\bmedical device\b/gi, term: 'medical device' },
  { pattern: /\bclinical tool\b/gi, term: 'clinical tool' },
  { pattern: /\bdiagnostic platform\b/gi, term: 'diagnostic platform' },
  { pattern: /\bhealth assessment\b/gi, term: 'health assessment' },
  { pattern: /\bmedical-grade\b/gi, term: 'medical-grade' }
];

// Context patterns where forbidden phrases are allowed (in disclaimers, negations)
const ALLOWED_CONTEXTS = [
  // Disclaimer/negation text
  /not.*for.*diagnos/i,
  /not.*medical.*diagnos/i,
  /not.*provide.*diagnos/i,
  /does not.*diagnos/i,
  /is not.*diagnos/i,
  /not.*medical.*advice/i,
  /not.*health.*advice/i,
  /not.*provide.*treatment/i,
  /not.*a.*medical.*device/i,
  /does not.*provide.*treatment/i,

  // Educational context
  /educational.*purposes/i,
  /research.*purposes/i,
  /for.*educational/i,
  /for.*research/i,

  // Explanation/documentation context
  /forbidden.*phrase/i,
  /prohibited.*term/i,
  /not.*allowed/i,
  /do not.*use/i,
  /avoid.*using/i,

  // Directing to professionals (safe usage)
  /consult.*healthcare.*professionals/i,
  /consult.*qualified.*healthcare/i,
  /see.*healthcare.*professional/i,
  /talk.*to.*doctor/i,
  /speak.*with.*doctor/i
];

/**
 * Check if text is in an allowed context (disclaimer, negation, etc.)
 * @param {string} text - Text to check
 * @returns {boolean} - True if in allowed context
 */
function isAllowedContext(text) {
  return ALLOWED_CONTEXTS.some(pattern => pattern.test(text));
}

/**
 * Check if text contains forbidden medical claim phrases
 * @param {string} text - Text to check
 * @returns {boolean} - True if forbidden phrases found
 */
function isForbiddenPhrase(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Allow if in disclaimer/educational context
  if (isAllowedContext(text)) {
    return false;
  }

  // Check for forbidden patterns
  return FORBIDDEN_PHRASES.some(({ pattern }) => {
    pattern.lastIndex = 0; // Reset regex state
    return pattern.test(text);
  });
}

/**
 * Validate text and return list of violations
 * @param {string} text - Text to validate
 * @returns {{ safe: boolean, violations: string[] }}
 */
function validateSafeText(text) {
  if (!text || typeof text !== 'string') {
    return { safe: true, violations: [] };
  }

  // Allow if in disclaimer context
  if (isAllowedContext(text)) {
    return { safe: true, violations: [] };
  }

  const violations = [];

  FORBIDDEN_PHRASES.forEach(({ pattern, term }) => {
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      violations.push(term);
    }
  });

  return {
    safe: violations.length === 0,
    violations
  };
}

/**
 * Format evidence level with educational description
 * @param {string} level - Evidence level: "HIGH", "MEDIUM", "LOW"
 * @returns {string} - Formatted evidence description
 */
function formatEvidenceLevel(level) {
  const levelUpper = String(level).toUpperCase();

  const descriptions = {
    HIGH: 'Evidence Level: HIGH (well-established, replicated findings)',
    MEDIUM: 'Evidence Level: MEDIUM (some evidence, requires validation)',
    LOW: 'Evidence Level: LOW (preliminary or indirect associations)'
  };

  return descriptions[levelUpper] || `Evidence Level: ${level}`;
}

/**
 * Format genomic-anatomic association description
 * @param {string} gene - Gene or variant name
 * @param {string} structure - Anatomical structure name
 * @param {string} [evidence] - Optional evidence level
 * @returns {string} - Safe association description
 */
function formatAssociation(gene, structure, evidence) {
  let description = `Association observed between ${gene} variant and ${structure} structure`;

  if (evidence) {
    description += ` (${formatEvidenceLevel(evidence)})`;
  }

  return description;
}

/**
 * Format overlay label for visualization
 * @param {number} intensity - Overlay intensity (0.0 to 1.0)
 * @param {string} evidence - Evidence level
 * @returns {string} - Safe overlay label
 */
function formatOverlayLabel(intensity, evidence) {
  const intensityPercent = Math.round(intensity * 100);
  return `Overlay strength: ${intensityPercent}% | Evidence: ${evidence}`;
}

/**
 * Get primary disclaimer text
 * @returns {string} - Primary disclaimer
 */
function getPrimaryDisclaimer() {
  return 'Educational/research purposes only. Not for medical diagnosis or treatment. Consult healthcare professionals for medical decisions.';
}

/**
 * Get detailed primary disclaimer for banner
 * @returns {string} - Detailed disclaimer
 */
function getDetailedPrimaryDisclaimer() {
  return `⚠️ EDUCATIONAL/RESEARCH USE ONLY

This platform provides educational visualizations of genomic data.
It is NOT a medical device and does NOT provide medical diagnosis,
treatment advice, or health recommendations. All associations are
labeled with evidence quality to indicate uncertainty. For medical
decisions, always consult qualified healthcare professionals.`;
}

/**
 * Get API response disclaimer
 * @returns {string} - API disclaimer
 */
function getAPIDisclaimer() {
  return 'Educational/research purposes only. Not for medical diagnosis or treatment. Consult healthcare professionals for medical decisions.';
}

/**
 * Get visualization disclaimer
 * @returns {string} - Visualization disclaimer
 */
function getVisualizationDisclaimer() {
  return `This 3D visualization shows genomic-anatomic associations from current data models. These are NOT medical predictions or diagnoses. Evidence levels (HIGH/MEDIUM/LOW) indicate association strength from research, not medical certainty. Educational and research purposes only.`;
}

/**
 * Get upload disclaimer
 * @returns {string} - Upload disclaimer
 */
function getUploadDisclaimer() {
  return `By uploading genomic data, you acknowledge:
• This is an educational/research tool, not a medical service
• Data is stored securely but you are responsible for its sensitivity
• You have the right to delete your data at any time
• We do not sell or share your data with third parties
• This platform does NOT provide medical advice or recommendations`;
}

/**
 * Get AI explanation disclaimer
 * @returns {string} - AI disclaimer
 */
function getAIDisclaimer() {
  return 'This explanation is generated for educational purposes. It describes associations from data models, not medical advice. The system has safety filters to prevent medical claims. For health decisions, consult qualified healthcare professionals.';
}

/**
 * Wrap API response with safety fields
 * @param {any} data - Response data
 * @param {object} [options] - Options
 * @param {boolean} [options.evidenceLabeled=false] - Whether evidence levels are included
 * @param {string} [options.version='1.0.0'] - API version
 * @returns {object} - Safe API response
 */
function wrapSafeAPIResponse(data, options = {}) {
  const {
    evidenceLabeled = false,
    version = '1.0.0'
  } = options;

  return {
    data,
    disclaimer: getAPIDisclaimer(),
    nonDiagnostic: true,
    evidenceLabeled,
    timestamp: new Date().toISOString(),
    version
  };
}

// Export for both CommonJS and ES modules
const SafetyLanguage = {
  // Validation
  isForbiddenPhrase,
  validateSafeText,
  isAllowedContext,

  // Formatters
  formatEvidenceLevel,
  formatAssociation,
  formatOverlayLabel,

  // Disclaimers
  getPrimaryDisclaimer,
  getDetailedPrimaryDisclaimer,
  getAPIDisclaimer,
  getVisualizationDisclaimer,
  getUploadDisclaimer,
  getAIDisclaimer,

  // API wrapper
  wrapSafeAPIResponse,

  // Constants (for testing)
  FORBIDDEN_PHRASES,
  ALLOWED_CONTEXTS
};

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SafetyLanguage;
}

// ES module export
if (typeof exports !== 'undefined') {
  Object.assign(exports, SafetyLanguage);
}

// Browser/default export
if (typeof window !== 'undefined') {
  window.SafetyLanguage = SafetyLanguage;
}

export default SafetyLanguage;
export {
  isForbiddenPhrase,
  validateSafeText,
  isAllowedContext,
  formatEvidenceLevel,
  formatAssociation,
  formatOverlayLabel,
  getPrimaryDisclaimer,
  getDetailedPrimaryDisclaimer,
  getAPIDisclaimer,
  getVisualizationDisclaimer,
  getUploadDisclaimer,
  getAIDisclaimer,
  wrapSafeAPIResponse,
  FORBIDDEN_PHRASES,
  ALLOWED_CONTEXTS
};
