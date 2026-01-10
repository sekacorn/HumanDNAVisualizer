# Test Fixtures

This directory contains golden files and test data for regression testing.

## Directory Structure

```
test-fixtures/
├── golden-inputs/           # Known-good inputs for testing
│   ├── vcf/                # VCF test files
│   ├── tsv/                # TSV/CSV test files
│   └── variants/           # Pre-parsed variant JSON
├── golden-outputs/          # Expected outputs (golden files)
│   ├── vcf/                # Expected VCF parse results
│   ├── tsv/                # Expected TSV parse results
│   └── anatomy/            # Expected anatomy graphs
└── e2e/                    # End-to-end test scenarios
```

## Golden File Purpose

Golden files serve as regression tests. They contain known-good outputs for specific inputs. If code changes cause output to differ from golden files, tests fail, preventing silent breakage.

## When to Update Golden Files

✅ **Update when:**
- Intentional feature change (document in PR)
- Bug fix that changes output (document in commit)
- Educational content correction (review required)
- Format migration (version appropriately)

❌ **Do NOT update for:**
- Random changes to make tests pass
- Undocumented behavior changes
- Flaky test fixes

## Fixture Guidelines

### VCF Fixtures

**minimal.vcf**: Absolute minimum valid VCF
- 1-5 variants
- Only required fields
- Standard chromosomes (1-22, X, Y)
- Purpose: Fast smoke test

**realistic.vcf**: Real-world example
- 100-1000 variants
- INFO and FORMAT fields
- Various variant types (SNP, indel)
- Purpose: Comprehensive testing

**edge-cases.vcf**: Corner cases
- Missing optional fields
- Unusual but valid values
- Boundary conditions
- Purpose: Robustness testing

### TSV Fixtures

**23andme.txt**: 23andMe format
- Actual 23andMe column headers
- SNP rsIDs
- Purpose: Vendor compatibility

**generic.tsv**: Generic format
- Flexible column mapping
- Various delimiter formats
- Purpose: Format flexibility

### Variants JSON

**variants.json**: Pre-parsed variants
- Used for anatomy graph tests
- Known chromosome/position/alleles
- Purpose: Isolate anatomy logic from parsing

## Generating New Golden Files

To create new golden files:

1. Write input fixture (e.g., `new-test.vcf`)
2. Run generator test (see test class comments)
3. Review generated output carefully
4. Commit both input and output
5. Document in PR what the fixture tests

## Fixture Versioning

When output format changes:

```
golden-outputs/
├── v1.0/
│   └── minimal.json
├── v1.1/
│   └── minimal.json      # Updated format
└── current -> v1.1        # Symlink
```

Maintain backward compatibility tests for old versions.

## Educational Content

All fixtures must:
- ✅ Be vendor-neutral (no proprietary data)
- ✅ Use realistic biological data
- ✅ Include evidence quality labels
- ✅ Contain educational disclaimers
- ❌ NOT include real patient data
- ❌ NOT make diagnostic claims

## License

Test fixtures are provided for educational/research purposes only.
Not for medical diagnosis or clinical decision-making.
