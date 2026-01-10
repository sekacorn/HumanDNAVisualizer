/**
 * Unit Tests for Legal Compliance Linter
 *
 * Tests the forbidden term detection, vendor name detection,
 * and context-aware exclusions.
 */

const fs = require('fs');
const path = require('path');
const { FORBIDDEN_MEDICAL_TERMS, VENDOR_NAMES } = require('../legal-lint');

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

// Test Suite
console.log('\n========================================');
console.log('  Legal Compliance Linter Tests');
console.log('========================================\n');

// Test 1: Configuration validation
console.log('Test Group: Configuration Validation');
assert(
  FORBIDDEN_MEDICAL_TERMS.length > 0,
  'FORBIDDEN_MEDICAL_TERMS should not be empty'
);
assert(
  FORBIDDEN_MEDICAL_TERMS.every(term => term.pattern && term.term && term.severity),
  'All forbidden terms should have pattern, term, and severity'
);
assert(
  VENDOR_NAMES.length > 0,
  'VENDOR_NAMES should not be empty'
);
assert(
  VENDOR_NAMES.every(vendor => vendor.pattern && vendor.name && vendor.severity),
  'All vendor entries should have pattern, name, and severity'
);

// Test 2: Regex pattern validation
console.log('\nTest Group: Regex Pattern Validation');
FORBIDDEN_MEDICAL_TERMS.forEach(({ pattern, term }) => {
  try {
    // Test that pattern is a valid regex
    assert(pattern instanceof RegExp, `"${term}" pattern should be a RegExp`);

    // Test that pattern has flags (case insensitive)
    assert(
      pattern.flags.includes('i'),
      `"${term}" pattern should be case-insensitive`
    );
  } catch (err) {
    assert(false, `Invalid regex for "${term}": ${err.message}`);
  }
});

// Test 3: Pattern matching tests
console.log('\nTest Group: Pattern Matching');

// Test diagnose detection
(() => {
  const diagnoseTerm = FORBIDDEN_MEDICAL_TERMS.find(t => t.term.includes('diagnose'));
  const testCases = [
    { text: 'can diagnose diseases', shouldMatch: true },
    { text: 'diagnosis is provided', shouldMatch: true },
    { text: 'DIAGNOSE', shouldMatch: true },
    { text: 'not for diagnosis', shouldMatch: true },  // Will be filtered by context
    { text: 'misdiagnose', shouldMatch: false }
  ];

  testCases.forEach(({ text, shouldMatch }) => {
    diagnoseTerm.pattern.lastIndex = 0;
    const matches = diagnoseTerm.pattern.test(text);
    if (shouldMatch) {
      assert(matches, `Should match "diagnose" in: "${text}"`);
    } else {
      assert(!matches, `Should not match "diagnose" in: "${text}"`);
    }
  });
})();

// Test treatment detection
(() => {
  const treatmentTerm = FORBIDDEN_MEDICAL_TERMS.find(t => t.term.includes('treat'));
  const testCases = [
    { text: 'provides treatment', shouldMatch: true },
    { text: 'treat diseases', shouldMatch: true },
    { text: 'treating patients', shouldMatch: true },
    { text: 'not provide treatment', shouldMatch: true }  // Will be filtered by context
  ];

  testCases.forEach(({ text, shouldMatch }) => {
    treatmentTerm.pattern.lastIndex = 0;
    const matches = treatmentTerm.pattern.test(text);
    if (shouldMatch) {
      assert(matches, `Should match "treat" in: "${text}"`);
    }
  });
})();

// Test risk detection
(() => {
  const riskScoreTerm = FORBIDDEN_MEDICAL_TERMS.find(t => t.term === 'risk score');
  const testCases = [
    { text: 'Your risk score is 85%', shouldMatch: true },
    { text: 'RISK SCORE calculation', shouldMatch: true },
    { text: 'risky scores', shouldMatch: false }
  ];

  testCases.forEach(({ text, shouldMatch }) => {
    riskScoreTerm.pattern.lastIndex = 0;
    const matches = riskScoreTerm.pattern.test(text);
    if (shouldMatch) {
      assert(matches, `Should match "risk score" in: "${text}"`);
    } else {
      assert(!matches, `Should not match "risk score" in: "${text}"`);
    }
  });
})();

// Test disease risk detection
(() => {
  const diseaseRiskTerm = FORBIDDEN_MEDICAL_TERMS.find(t => t.term === 'disease risk');
  const testCases = [
    { text: 'high disease risk', shouldMatch: true },
    { text: 'DISEASE RISK factors', shouldMatch: true },
    { text: 'study disease risk', shouldMatch: true }  // Will be filtered by context
  ];

  testCases.forEach(({ text, shouldMatch }) => {
    diseaseRiskTerm.pattern.lastIndex = 0;
    const matches = diseaseRiskTerm.pattern.test(text);
    if (shouldMatch) {
      assert(matches, `Should match "disease risk" in: "${text}"`);
    }
  });
})();

// Test 4: Vendor name matching
console.log('\nTest Group: Vendor Name Pattern Matching');

const vendorTestCases = [
  { name: '23andMe', texts: ['Upload your 23andMe data', '23andMe results', 'from 23andMe'] },
  { name: 'AncestryDNA', texts: ['AncestryDNA files', 'compatible with AncestryDNA'] },
  { name: 'MyHeritage', texts: ['MyHeritage export', 'import MyHeritage data'] }
];

vendorTestCases.forEach(({ name, texts }) => {
  const vendor = VENDOR_NAMES.find(v => v.name === name);
  texts.forEach(text => {
    vendor.pattern.lastIndex = 0;
    const matches = vendor.pattern.test(text);
    assert(matches, `Should match vendor "${name}" in: "${text}"`);
  });
});

// Test 5: Severity levels
console.log('\nTest Group: Severity Levels');

const errorTerms = FORBIDDEN_MEDICAL_TERMS.filter(t =>
  t.term.includes('diagnose') ||
  t.term.includes('treat') ||
  t.term.includes('cure') ||
  t.term.includes('risk score') ||
  t.term.includes('disease risk')
);

assert(
  errorTerms.length > 0,
  'Should have ERROR-level medical terms'
);

assert(
  errorTerms.every(t => t.severity === 'ERROR'),
  'Medical claim terms should have ERROR severity'
);

const warningTerms = FORBIDDEN_MEDICAL_TERMS.filter(t =>
  t.term.includes('recommend') || t.term.includes('you should')
);

assert(
  warningTerms.length > 0,
  'Should have WARNING-level terms'
);

assert(
  warningTerms.every(t => t.severity === 'WARNING'),
  'Context-sensitive terms should have WARNING severity'
);

// Test 6: Case insensitivity
console.log('\nTest Group: Case Insensitivity');

const diagnoseTerm = FORBIDDEN_MEDICAL_TERMS.find(t => t.term.includes('diagnose'));
const caseVariations = ['DIAGNOSE', 'Diagnose', 'diagnose', 'DiAgNoSe', 'DIAGNOSIS', 'diagnosis'];

caseVariations.forEach(variation => {
  diagnoseTerm.pattern.lastIndex = 0;
  const matches = diagnoseTerm.pattern.test(variation);
  assert(matches, `Should match "${variation}" (case-insensitive)`);
});

// Test 7: Word boundary detection
console.log('\nTest Group: Word Boundary Detection');

(() => {
  const diagnoseTerm = FORBIDDEN_MEDICAL_TERMS.find(t => t.term.includes('diagnose'));

  // Should match (word boundaries)
  const shouldMatch = [
    'can diagnose',
    'diagnose diseases',
    'the diagnosis'
  ];

  shouldMatch.forEach(text => {
    diagnoseTerm.pattern.lastIndex = 0;
    const matches = diagnoseTerm.pattern.test(text);
    assert(matches, `Should match word boundary in: "${text}"`);
  });

  // Should NOT match (no word boundary)
  const shouldNotMatch = [
    'misdiagnose'  // has prefix
  ];

  shouldNotMatch.forEach(text => {
    diagnoseTerm.pattern.lastIndex = 0;
    const matches = diagnoseTerm.pattern.test(text);
    assert(!matches, `Should NOT match (no word boundary): "${text}"`);
  });
})();

// Test 8: Comprehensive term coverage
console.log('\nTest Group: Comprehensive Term Coverage');

const requiredMedicalTerms = [
  'diagnose', 'treatment', 'cure', 'prescribe', 'medical advice',
  'risk score', 'disease risk', 'health risk'
];

requiredMedicalTerms.forEach(termText => {
  const found = FORBIDDEN_MEDICAL_TERMS.some(t => t.term.includes(termText));
  assert(found, `Should have forbidden term for: "${termText}"`);
});

const requiredVendors = ['23andMe', 'AncestryDNA', 'MyHeritage', 'FamilyTreeDNA'];

requiredVendors.forEach(vendorName => {
  const found = VENDOR_NAMES.some(v => v.name.includes(vendorName));
  assert(found, `Should have vendor name for: "${vendorName}"`);
});

// Test 9: Exclusion pattern validation
console.log('\nTest Group: Exclusion Patterns');

// Import the exclusion patterns from the linter
const linterModule = require('../legal-lint.js');
const linterCode = fs.readFileSync(path.join(__dirname, '../legal-lint.js'), 'utf-8');

// Check that safety_filter.py is excluded
assert(
  linterCode.includes('safety_filter.py'),
  'Should exclude safety_filter.py'
);

// Check that spec/08_legal_compliance.md is excluded
assert(
  linterCode.includes('spec/08_legal_compliance.md'),
  'Should exclude spec/08_legal_compliance.md'
);

// Check that test files are excluded
assert(
  linterCode.includes('.test.js') || linterCode.includes('test_'),
  'Should exclude test files'
);

// Test 10: Context detection patterns
console.log('\nTest Group: Context Detection Patterns');

// Check that ALLOWED_CONTEXTS includes key patterns
assert(
  linterCode.includes('/not.*for.*diagnos/i') || linterCode.includes('not.*for.*diagnos'),
  'Should have "not for diagnosis" context pattern'
);

assert(
  linterCode.includes('/educational.*purposes/i') || linterCode.includes('educational.*purposes'),
  'Should have "educational purposes" context pattern'
);

assert(
  linterCode.includes('/research.*purposes/i') || linterCode.includes('research.*purposes'),
  'Should have "research purposes" context pattern'
);

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
