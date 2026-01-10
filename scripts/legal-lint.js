#!/usr/bin/env node

/**
 * Legal Compliance Linter
 *
 * Scans codebase for violations of legal compliance requirements:
 * - Forbidden medical language (diagnose, treat, cure, recommend, risk)
 * - Vendor names outside disclaimer contexts
 * - Medical claims in user-facing content
 *
 * Based on: spec/08_legal_compliance.md
 *
 * Usage:
 *   node scripts/legal-lint.js [--verbose]
 *   npm run lint:legal
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SEVERITY = {
  ERROR: 'ERROR',
  WARNING: 'WARNING'
};

// Forbidden medical terms (from spec/08_legal_compliance.md Section 1.1)
const FORBIDDEN_MEDICAL_TERMS = [
  // Medical Claims
  { pattern: /\bdiagnos[ei]s?\b/gi, term: 'diagnose/diagnosis/diagnostic', severity: SEVERITY.ERROR },
  { pattern: /\btreat(ment|ing)?\b/gi, term: 'treat/treatment/treating', severity: SEVERITY.ERROR },
  { pattern: /\b(cure|curing|healing)\b/gi, term: 'cure/healing', severity: SEVERITY.ERROR },
  { pattern: /\bprescrib[ei](d|ng)?\b/gi, term: 'prescribe/prescription', severity: SEVERITY.ERROR },
  { pattern: /\bmedical advice\b/gi, term: 'medical advice', severity: SEVERITY.ERROR },
  { pattern: /\bhealth advice\b/gi, term: 'health advice', severity: SEVERITY.ERROR },
  { pattern: /\blifestyle advice\b/gi, term: 'lifestyle advice', severity: SEVERITY.ERROR },

  // Risk/Prediction Language
  { pattern: /\brisk score\b/gi, term: 'risk score', severity: SEVERITY.ERROR },
  { pattern: /\brisk level\b/gi, term: 'risk level', severity: SEVERITY.ERROR },
  { pattern: /\bdisease risk\b/gi, term: 'disease risk', severity: SEVERITY.ERROR },
  { pattern: /\bhealth risk\b/gi, term: 'health risk', severity: SEVERITY.ERROR },
  { pattern: /\bat risk for\b/gi, term: 'at risk for', severity: SEVERITY.ERROR },
  { pattern: /\bpredicts disease\b/gi, term: 'predicts disease', severity: SEVERITY.ERROR },
  { pattern: /\blikely to develop\b/gi, term: 'likely to develop', severity: SEVERITY.ERROR },
  { pattern: /\bprognosis\b/gi, term: 'prognosis', severity: SEVERITY.ERROR },

  // Action-Oriented Health Terms
  { pattern: /\bprevent disease\b/gi, term: 'prevent disease', severity: SEVERITY.ERROR },
  { pattern: /\bavoid condition\b/gi, term: 'avoid condition', severity: SEVERITY.ERROR },
  { pattern: /\bimprove health by\b/gi, term: 'improve health by', severity: SEVERITY.ERROR },
  { pattern: /\breduce risk by\b/gi, term: 'reduce risk by', severity: SEVERITY.ERROR },

  // Context-sensitive terms (need more careful checking)
  { pattern: /\byou should\b/gi, term: 'you should (in health context)', severity: SEVERITY.WARNING },
  { pattern: /\brecommend(s|ed|ing|ation)?\b/gi, term: 'recommend (check context)', severity: SEVERITY.WARNING }
];

// Vendor names (from spec/08_legal_compliance.md Section 2.1)
const VENDOR_NAMES = [
  { pattern: /\b23andMe\b/g, name: '23andMe', severity: SEVERITY.WARNING },
  { pattern: /\bAncestryDNA\b/g, name: 'AncestryDNA', severity: SEVERITY.WARNING },
  { pattern: /\bMyHeritage\b/g, name: 'MyHeritage', severity: SEVERITY.WARNING },
  { pattern: /\bLiving DNA\b/g, name: 'Living DNA', severity: SEVERITY.WARNING },
  { pattern: /\bFamilyTreeDNA\b/g, name: 'FamilyTreeDNA', severity: SEVERITY.WARNING },
  { pattern: /\bNebula Genomics\b/g, name: 'Nebula Genomics', severity: SEVERITY.WARNING },
  { pattern: /\bColor Genomics\b/g, name: 'Color Genomics', severity: SEVERITY.WARNING },
  { pattern: /\bHelix\b/g, name: 'Helix (check context)', severity: SEVERITY.WARNING }
];

// Files to scan (extensions)
const SCAN_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.java', '.py', '.md', '.html'];

// Files/directories to exclude (from spec/08_legal_compliance.md Section 5.1)
const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  'target',
  '.git',
  'spec/08_legal_compliance.md',
  'LEGAL_COMPLIANCE.md',
  'PRIVACY_POLICY.md',
  'TERMS_OF_SERVICE.md',
  'safety_filter.py',  // This file defines forbidden terms
  'test_safety_filter.py',  // Safety filter tests
  '.test.js',
  '.test.jsx',
  '.test.ts',
  '.test.tsx',
  '.spec.js',
  '.spec.jsx',
  '.spec.ts',
  '.spec.tsx',
  'test_',
  '__tests__',
  'legal-lint.js'
];

// Special contexts where terms are allowed
const ALLOWED_CONTEXTS = [
  // Comments explaining what NOT to do
  /\/\/.*don't.*use/i,
  /\/\/.*avoid/i,
  /\/\*.*not.*for/i,
  /#.*don't.*use/i,
  /#.*avoid/i,

  // Disclaimer text (negations)
  /not.*for.*diagnos/i,
  /not.*medical.*diagnos/i,
  /not.*provide.*diagnos/i,
  /does not.*diagnos/i,
  /is not.*diagnos/i,
  /not.*medical.*advice/i,
  /not.*health.*advice/i,
  /not.*provide.*treatment/i,

  // Educational context
  /educational.*purposes/i,
  /research.*purposes/i,
  /for.*educational/i,
  /for.*research/i,

  // Safety/test context
  /safety.*filter/i,
  /forbidden.*term/i,
  /prohibited.*term/i,
  /test.*case/i,
  /detect.*forbidden/i,
  /check.*forbidden/i,

  // Pattern definitions (in safety filter files)
  /FORBIDDEN_PATTERNS/i,
  /FORBIDDEN_INTENTS/i,
  /SAFE_REPLACEMENT/i,
  /VIOLATION_PATTERNS/i,
  /pattern.*=/i,
  /r['"]\\b/i,  // Python regex patterns

  // Variable assignments with forbidden terms
  /SafetyViolation\./i,
  /DIAGNOSIS_REQUEST/i,
  /TREATMENT_REQUEST/i,
  /RECOMMENDATION_REQUEST/i
];

// Results tracking
const results = {
  errors: [],
  warnings: [],
  filesScanned: 0,
  filesWithIssues: 0
};

/**
 * Check if a line is in an allowed context (disclaimer, comment, etc.)
 */
function isAllowedContext(line) {
  return ALLOWED_CONTEXTS.some(ctx => ctx.test(line));
}

/**
 * Check if a file should be excluded
 */
function shouldExclude(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return EXCLUDE_PATTERNS.some(pattern => normalized.includes(pattern));
}

/**
 * Check if file is in spec/ directory
 */
function isSpecFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.includes('/spec/') || normalized.startsWith('spec/');
}

/**
 * Scan a single file for violations
 */
function scanFile(filePath) {
  if (shouldExclude(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const fileIssues = [];

  lines.forEach((line, lineNum) => {
    const lineNumber = lineNum + 1;

    // Skip if line is in an allowed context
    if (isAllowedContext(line)) {
      return;
    }

    // Check for forbidden medical terms
    FORBIDDEN_MEDICAL_TERMS.forEach(({ pattern, term, severity }) => {
      // Reset regex lastIndex to avoid state issues
      pattern.lastIndex = 0;
      const matches = line.match(pattern);
      if (matches) {
        fileIssues.push({
          file: filePath,
          line: lineNumber,
          severity,
          type: 'FORBIDDEN_TERM',
          term,
          match: matches[0],
          context: line.trim()
        });
      }
    });

    // Check for vendor names (only if not in spec/ directory)
    if (!isSpecFile(filePath)) {
      VENDOR_NAMES.forEach(({ pattern, name, severity }) => {
        // Reset regex lastIndex
        pattern.lastIndex = 0;
        const matches = line.match(pattern);
        if (matches) {
          fileIssues.push({
            file: filePath,
            line: lineNumber,
            severity,
            type: 'VENDOR_NAME',
            term: name,
            match: matches[0],
            context: line.trim()
          });
        }
      });
    }
  });

  if (fileIssues.length > 0) {
    results.filesWithIssues++;
    fileIssues.forEach(issue => {
      if (issue.severity === SEVERITY.ERROR) {
        results.errors.push(issue);
      } else {
        results.warnings.push(issue);
      }
    });
  }

  results.filesScanned++;
}

/**
 * Recursively walk directory and scan files
 */
function walkDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (shouldExclude(fullPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      walkDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (SCAN_EXTENSIONS.includes(ext)) {
        scanFile(fullPath);
      }
    }
  }
}

/**
 * Format and print results
 */
function printResults(verbose = false) {
  console.log('\n========================================');
  console.log('  Legal Compliance Linter Results');
  console.log('========================================\n');

  console.log(`Files scanned: ${results.filesScanned}`);
  console.log(`Files with issues: ${results.filesWithIssues}`);
  console.log(`Errors: ${results.errors.length}`);
  console.log(`Warnings: ${results.warnings.length}\n`);

  // Print errors
  if (results.errors.length > 0) {
    console.log('❌ ERRORS (will fail CI):');
    console.log('─'.repeat(80));
    results.errors.forEach(issue => {
      console.log(`\n${issue.file}:${issue.line}`);
      console.log(`  Type: ${issue.type}`);
      console.log(`  Term: "${issue.term}"`);
      console.log(`  Match: "${issue.match}"`);
      if (verbose) {
        console.log(`  Context: ${issue.context}`);
      }
    });
    console.log();
  }

  // Print warnings
  if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS (please review):');
    console.log('─'.repeat(80));
    results.warnings.forEach(issue => {
      console.log(`\n${issue.file}:${issue.line}`);
      console.log(`  Type: ${issue.type}`);
      console.log(`  Term: "${issue.term}"`);
      console.log(`  Match: "${issue.match}"`);
      if (verbose) {
        console.log(`  Context: ${issue.context}`);
      }
    });
    console.log();
  }

  // Print summary
  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log('✅ No legal compliance issues found!\n');
  } else {
    console.log('\n📋 Recommendations:');
    console.log('  - Replace medical terms with approved alternatives (see spec/08_legal_compliance.md)');
    console.log('  - Use "association" instead of "risk"');
    console.log('  - Use "evidence level" instead of "confidence"');
    console.log('  - Remove vendor names or move to disclaimer sections');
    console.log();
  }

  // Exit code
  if (results.errors.length > 0) {
    console.log('❌ FAILED: Legal compliance violations found\n');
    process.exit(1);
  } else if (results.warnings.length > 0) {
    console.log('⚠️  PASSED with warnings\n');
    process.exit(0);
  } else {
    console.log('✅ PASSED: All checks successful\n');
    process.exit(0);
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  console.log('Starting legal compliance scan...\n');

  try {
    // Scan from project root
    const projectRoot = path.resolve(__dirname, '..');

    // Scan key directories
    const dirsToScan = ['frontend', 'backend', 'llm-service', 'ai-model', 'spec'];

    dirsToScan.forEach(dir => {
      const fullPath = path.join(projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        console.log(`Scanning ${dir}/...`);
        walkDirectory(fullPath);
      }
    });

    // Scan root markdown files
    const rootFiles = fs.readdirSync(projectRoot);
    rootFiles.forEach(file => {
      if (file.endsWith('.md')) {
        const fullPath = path.join(projectRoot, file);
        if (!shouldExclude(fullPath)) {
          scanFile(fullPath);
        }
      }
    });

    console.log();

    // Print results
    printResults(verbose);

  } catch (error) {
    console.error('Error running legal linter:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { scanFile, FORBIDDEN_MEDICAL_TERMS, VENDOR_NAMES };
