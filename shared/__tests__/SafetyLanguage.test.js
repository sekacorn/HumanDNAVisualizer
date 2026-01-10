/**
 * SafetyLanguage Module Tests
 *
 * Comprehensive test suite for forbidden phrase detection,
 * safe label formatting, and disclaimer generation.
 *
 * Based on: spec/30_clinical_safety.md Section 7
 */

const SafetyLanguage = require('../SafetyLanguage.js');

const {
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
  wrapSafeAPIResponse
} = SafetyLanguage;

// Test utilities
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function assert(condition, message) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    console.log(`  ✓ ${message}`);
  } else {
    testResults.failed++;
    console.error(`  ✗ ${message}`);
  }
}

function assertEquals(actual, expected, message) {
  testResults.total++;
  if (actual === expected) {
    testResults.passed++;
    console.log(`  ✓ ${message}`);
  } else {
    testResults.failed++;
    console.error(`  ✗ ${message}`);
    console.error(`    Expected: ${expected}`);
    console.error(`    Actual: ${actual}`);
  }
}

// Test Suite
console.log('\n========================================');
console.log('  SafetyLanguage Module Tests');
console.log('========================================\n');

// Test Group 1: Forbidden Phrase Detection
console.log('Test Group 1: Forbidden Medical Claims Detection');

(() => {
  const forbiddenCases = [
    'This tool can diagnose diseases',
    'We provide treatment recommendations',
    'This will cure your condition',
    'Your risk score is 85%',
    'You have a high disease risk',
    'This predicts disease onset',
    'Likely to develop cancer',
    'Medical advice is available',
    'This is a medical device',
    'Clinical tool for diagnosis'
  ];

  forbiddenCases.forEach(text => {
    assert(
      isForbiddenPhrase(text),
      `Should detect forbidden phrase in: "${text}"`
    );
  });
})();

// Test Group 2: Allowed Context Detection
console.log('\nTest Group 2: Allowed Context (Disclaimers)');

(() => {
  const allowedCases = [
    'This tool is NOT for medical diagnosis',
    'Does not provide medical diagnosis or treatment',
    'For educational purposes only - not medical advice',
    'Not a medical device',
    'This platform does NOT provide treatment',
    'Educational and research purposes only',
    'Forbidden phrase: diagnose',
    'Do not use "risk score" in UI'
  ];

  allowedCases.forEach(text => {
    assert(
      !isForbiddenPhrase(text),
      `Should allow disclaimer text: "${text}"`
    );
  });
})();

// Test Group 3: Context-Sensitive Detection
console.log('\nTest Group 3: Context-Sensitive Detection');

(() => {
  // Should detect in medical context
  assert(
    isForbiddenPhrase('We recommend this treatment'),
    'Should detect "recommend" in medical context'
  );

  // Should allow in non-medical context
  assert(
    !isForbiddenPhrase('We recommend consulting healthcare professionals'),
    'Should allow "recommend" when directing to professionals'
  );

  assert(
    !isForbiddenPhrase('Recommended system requirements: 8GB RAM'),
    'Should allow "recommend" in technical context'
  );
})();

// Test Group 4: validateSafeText Function
console.log('\nTest Group 4: validateSafeText Function');

(() => {
  const result1 = validateSafeText('This visualization shows associations');
  assert(
    result1.safe === true && result1.violations.length === 0,
    'Safe text should pass validation'
  );

  const result2 = validateSafeText('Your risk score for heart disease is 78%');
  assert(
    result2.safe === false && result2.violations.length > 0,
    'Unsafe text should fail validation'
  );
  assert(
    result2.violations.includes('risk score'),
    'Should identify "risk score" as violation'
  );

  const result3 = validateSafeText('Not for medical diagnosis or treatment');
  assert(
    result3.safe === true,
    'Disclaimer text should pass validation'
  );
})();

// Test Group 5: Evidence Level Formatting
console.log('\nTest Group 5: Evidence Level Formatting');

(() => {
  const high = formatEvidenceLevel('HIGH');
  assert(
    high.includes('HIGH') && high.includes('well-established'),
    'HIGH evidence should include descriptive text'
  );

  const medium = formatEvidenceLevel('MEDIUM');
  assert(
    medium.includes('MEDIUM') && medium.includes('some evidence'),
    'MEDIUM evidence should include descriptive text'
  );

  const low = formatEvidenceLevel('LOW');
  assert(
    low.includes('LOW') && low.includes('preliminary'),
    'LOW evidence should include descriptive text'
  );

  // Case insensitive
  const highLower = formatEvidenceLevel('high');
  assert(
    highLower.includes('HIGH'),
    'Should handle lowercase evidence levels'
  );
})();

// Test Group 6: Association Formatting
console.log('\nTest Group 6: Association Formatting');

(() => {
  const assoc1 = formatAssociation('BRCA1', 'Breast');
  assert(
    assoc1.includes('Association') && assoc1.includes('BRCA1') && assoc1.includes('Breast'),
    'Should format basic association'
  );
  assert(
    !isForbiddenPhrase(assoc1),
    'Formatted association should not contain forbidden phrases'
  );

  const assoc2 = formatAssociation('TP53', 'Brain', 'HIGH');
  assert(
    assoc2.includes('TP53') && assoc2.includes('Brain') && assoc2.includes('HIGH'),
    'Should include evidence level in association'
  );
  assert(
    !isForbiddenPhrase(assoc2),
    'Association with evidence should not contain forbidden phrases'
  );
})();

// Test Group 7: Overlay Label Formatting
console.log('\nTest Group 7: Overlay Label Formatting');

(() => {
  const label1 = formatOverlayLabel(0.85, 'HIGH');
  assert(
    label1.includes('85%') && label1.includes('HIGH'),
    'Should format overlay label with percentage'
  );
  assert(
    !isForbiddenPhrase(label1),
    'Overlay label should not contain forbidden phrases'
  );

  const label2 = formatOverlayLabel(0.5, 'MEDIUM');
  assert(
    label2.includes('50%') && label2.includes('MEDIUM'),
    'Should format overlay with different values'
  );
})();

// Test Group 8: Disclaimer Generation
console.log('\nTest Group 8: Disclaimer Generation');

(() => {
  const primary = getPrimaryDisclaimer();
  assert(
    primary.length > 0,
    'Primary disclaimer should not be empty'
  );
  assert(
    primary.includes('Educational') || primary.includes('educational'),
    'Primary disclaimer should mention educational use'
  );

  const detailed = getDetailedPrimaryDisclaimer();
  assert(
    detailed.length > primary.length,
    'Detailed disclaimer should be longer'
  );
  assert(
    detailed.includes('NOT'),
    'Detailed disclaimer should emphasize NOT'
  );

  const api = getAPIDisclaimer();
  assert(
    api.length > 0,
    'API disclaimer should not be empty'
  );

  const viz = getVisualizationDisclaimer();
  assert(
    viz.includes('NOT medical predictions'),
    'Visualization disclaimer should clarify not predictions'
  );

  const upload = getUploadDisclaimer();
  assert(
    upload.includes('educational/research tool'),
    'Upload disclaimer should mention tool type'
  );

  const ai = getAIDisclaimer();
  assert(
    ai.includes('not medical advice'),
    'AI disclaimer should clarify not medical advice'
  );
})();

// Test Group 9: API Response Wrapping
console.log('\nTest Group 9: API Response Wrapping');

(() => {
  const testData = { nodes: [], overlays: [] };
  const wrapped = wrapSafeAPIResponse(testData, { evidenceLabeled: true });

  assert(
    wrapped.data === testData,
    'Should preserve original data'
  );

  assert(
    wrapped.disclaimer && wrapped.disclaimer.length > 0,
    'Should include disclaimer field'
  );

  assertEquals(
    wrapped.nonDiagnostic,
    true,
    'Should have nonDiagnostic: true'
  );

  assertEquals(
    wrapped.evidenceLabeled,
    true,
    'Should have evidenceLabeled: true when specified'
  );

  assert(
    wrapped.timestamp && typeof wrapped.timestamp === 'string',
    'Should include timestamp'
  );

  assert(
    wrapped.version && typeof wrapped.version === 'string',
    'Should include version'
  );
})();

// Test Group 10: Case Insensitivity
console.log('\nTest Group 10: Case Insensitivity');

(() => {
  const cases = [
    'DIAGNOSE diseases',
    'Diagnose Diseases',
    'diagnose diseases',
    'DiAgNoSe diseases',
    'TREATMENT options',
    'treatment OPTIONS',
    'RISK SCORE calculation',
    'Risk Score calculation'
  ];

  cases.forEach(text => {
    assert(
      isForbiddenPhrase(text),
      `Should detect regardless of case: "${text}"`
    );
  });
})();

// Test Group 11: Word Boundary Detection
console.log('\nTest Group 11: Word Boundary Detection');

(() => {
  // Should detect
  const shouldDetect = [
    'can diagnose',
    'the diagnosis',
    'provides treatment'
  ];

  shouldDetect.forEach(text => {
    assert(
      isForbiddenPhrase(text),
      `Should detect with word boundaries: "${text}"`
    );
  });

  // Should NOT detect (no false positives)
  const shouldNotDetect = [
    'misdiagnose' // has prefix - should NOT match due to \b
  ];

  shouldNotDetect.forEach(text => {
    assert(
      !isForbiddenPhrase(text),
      `Should not falsely detect: "${text}"`
    );
  });
})();

// Test Group 12: Edge Cases
console.log('\nTest Group 12: Edge Cases');

(() => {
  assert(
    !isForbiddenPhrase(''),
    'Empty string should be safe'
  );

  assert(
    !isForbiddenPhrase(null),
    'Null should be safe'
  );

  assert(
    !isForbiddenPhrase(undefined),
    'Undefined should be safe'
  );

  const validation = validateSafeText('');
  assert(
    validation.safe === true,
    'Empty string validation should be safe'
  );
})();

// Test Group 13: Multiple Violations
console.log('\nTest Group 13: Multiple Violations Detection');

(() => {
  const multiViolation = 'This medical device can diagnose diseases and provide treatment recommendations with high risk score';
  const result = validateSafeText(multiViolation);

  assert(
    !result.safe,
    'Text with multiple violations should fail'
  );

  assert(
    result.violations.length >= 3,
    'Should detect multiple violations'
  );

  assert(
    result.violations.some(v => v.includes('diagnose')),
    'Should include diagnose violation'
  );

  assert(
    result.violations.some(v => v.includes('risk score') || v.includes('medical device')),
    'Should include risk score or medical device violation'
  );
})();

// Test Group 14: No False Positives in Safe Medical Context
console.log('\nTest Group 14: Safe Medical Context');

(() => {
  const safeCases = [
    'Association observed between variant and structure',
    'Evidence level: HIGH',
    'For research and educational purposes',
    'Genomic overlay visualization',
    'Data model representation',
    'Consult healthcare professionals for medical advice'
  ];

  safeCases.forEach(text => {
    assert(
      !isForbiddenPhrase(text),
      `Should allow safe medical context: "${text}"`
    );
  });
})();

// Test Group 15: Forbidden Phrases List Completeness
console.log('\nTest Group 15: Configuration Completeness');

(() => {
  assert(
    SafetyLanguage.FORBIDDEN_PHRASES.length > 0,
    'FORBIDDEN_PHRASES should not be empty'
  );

  assert(
    SafetyLanguage.FORBIDDEN_PHRASES.every(item => item.pattern && item.term),
    'All forbidden phrases should have pattern and term'
  );

  assert(
    SafetyLanguage.ALLOWED_CONTEXTS.length > 0,
    'ALLOWED_CONTEXTS should not be empty'
  );

  assert(
    SafetyLanguage.ALLOWED_CONTEXTS.every(pattern => pattern instanceof RegExp),
    'All allowed contexts should be RegExp'
  );
})();

// Test Group 16: Required Terms Coverage
console.log('\nTest Group 16: Required Forbidden Terms Coverage');

(() => {
  const requiredTerms = [
    'diagnose',
    'treatment',
    'cure',
    'prescribe',
    'medical advice',
    'risk score',
    'disease risk',
    'health risk',
    'medical device'
  ];

  requiredTerms.forEach(term => {
    const found = SafetyLanguage.FORBIDDEN_PHRASES.some(item =>
      item.term.toLowerCase().includes(term.toLowerCase())
    );
    assert(
      found,
      `Should have forbidden phrase for: "${term}"`
    );
  });
})();

// Print results
console.log('\n========================================');
console.log('  Test Results');
console.log('========================================\n');
console.log(`Total tests: ${testResults.total}`);
console.log(`Passed: ${testResults.passed}`);
console.log(`Failed: ${testResults.failed}\n`);

if (testResults.failed === 0) {
  console.log('✅ All tests passed!\n');
  process.exit(0);
} else {
  console.log(`❌ ${testResults.failed} test(s) failed\n`);
  process.exit(1);
}
