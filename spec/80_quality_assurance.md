# Quality Assurance & Testing Specification

**Version:** 1.0.0
**Last Updated:** 2025-01-09
**Agent:** QA / Verification Agent

## Table of Contents

1. [Overview](#overview)
2. [Testing Strategy](#testing-strategy)
3. [Golden File Testing](#golden-file-testing)
4. [Determinism Testing](#determinism-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Regression Gates](#regression-gates)
7. [Release Checklist](#release-checklist)
8. [Test Fixtures](#test-fixtures)
9. [Continuous Integration](#continuous-integration)
10. [Quality Metrics](#quality-metrics)

---

## Overview

### Purpose

This specification defines quality assurance requirements for HumanDNAVisualizer to prevent silent breakage and ensure reliable, deterministic behavior. The system is educational/research software that must produce consistent, verifiable results.

### Quality Goals

-  **Deterministic Processing**: Same input → same output (always)
-  **Regression Prevention**: Golden files detect unintended changes
-  **End-to-End Validation**: Full workflow testing
-  **Release Gates**: Automated checks before deployment
-  **Educational Accuracy**: Correct biological associations

### Scope

**In Scope:**
- Import determinism (VCF/TSV → JSON)
- Anatomy graph generation (variants → overlays)
- Frontend rendering (graph → 3D scene)
- API contract stability
- Educational content accuracy

**Out of Scope:**
- Performance testing (separate spec)
- Load testing (separate spec)
- Security testing (see spec/70_security_privacy.md)
- User acceptance testing (manual)

---

## Testing Strategy

### Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E (5%)  │  Smoke tests, full workflow
                    ├─────────────┤
                    │ Integration │  API tests, component interaction
                    │    (15%)    │
                    ├─────────────┤
                    │    Unit     │  Business logic, parsers, utilities
                    │    (80%)    │
                    └─────────────┘
```

### Test Types

| Type | Purpose | Coverage | Speed | Stability |
|------|---------|----------|-------|-----------|
| **Unit** | Test individual functions | 80% | Fast (ms) | High |
| **Integration** | Test component interaction | 15% | Medium (sec) | Medium |
| **E2E** | Test full workflow | 5% | Slow (min) | Low |
| **Golden** | Prevent regression | Critical paths | Fast | High |
| **Determinism** | Ensure consistency | All processing | Fast | High |

### Testing Requirements

#### Educational Software Standards

-  **Biological Accuracy**: Anatomy mappings validated against ontologies
-  **Evidence Labeling**: All associations marked with confidence
-  **Reproducibility**: Same data → same visualization
-  **Transparency**: Test fixtures publicly available
-  **Non-Diagnostic**: Clear disclaimers in output

#### Technical Standards

-  **Code Coverage**: >80% for business logic
-  **Mutation Testing**: >70% mutation score
-  **Golden Files**: 100% critical paths covered
-  **Determinism**: 100% of processing pipelines
-  **E2E Tests**: All major user workflows

---

## Golden File Testing

### Concept

**Golden files** are known-good outputs for specific inputs. Tests compare current output against golden files to detect unintended changes.

**Benefits:**
- Catches silent regression
- Documents expected behavior
- Enables refactoring with confidence
- Validates educational accuracy

### Golden File Types

#### 1. Import Golden Files

**Purpose:** Validate VCF/TSV parsing produces correct variant objects

**Structure:**
```
test-fixtures/
├── golden-inputs/
│   ├── simple.vcf              # Minimal valid VCF
│   ├── complex.vcf             # Real-world example
│   ├── genotype.tsv            # Generic format
│   └── edge-cases.vcf          # Corner cases
└── golden-outputs/
    ├── simple.json             # Expected variants
    ├── complex.json            # Expected variants
    ├── genotype.json           # Expected variants
    └── edge-cases.json         # Expected variants
```

**Test Flow:**
```java
@Test
public void testVCFImport_GoldenFile_Simple() {
    // 1. Load golden input
    byte[] vcfInput = loadFixture("golden-inputs/simple.vcf");

    // 2. Load expected output
    String expectedJson = loadFixture("golden-outputs/simple.json");
    List<VariantCall> expected = parseJson(expectedJson);

    // 3. Process input
    ImportResult result = vcfImporter.importVCF("test", vcfInput, "simple.vcf", true);

    // 4. Compare
    assertEquals(expected.size(), result.getVariants().size());
    for (int i = 0; i < expected.size(); i++) {
        assertVariantEquals(expected.get(i), result.getVariants().get(i));
    }
}
```

**Assertion Details:**
```java
private void assertVariantEquals(VariantCall expected, VariantCall actual) {
    assertEquals(expected.getChrom(), actual.getChrom(), "Chromosome");
    assertEquals(expected.getPos(), actual.getPos(), "Position");
    assertEquals(expected.getRef(), actual.getRef(), "Reference allele");
    assertEquals(expected.getAlt(), actual.getAlt(), "Alternate allele");
    assertEquals(expected.getGenotype(), actual.getGenotype(), "Genotype");
    // Quality may be null - handle gracefully
    if (expected.getQuality() != null && actual.getQuality() != null) {
        assertEquals(expected.getQuality(), actual.getQuality(), 0.001, "Quality");
    }
}
```

#### 2. Anatomy Graph Golden Files

**Purpose:** Validate variant → anatomy mapping produces correct overlays

**Structure:**
```
test-fixtures/
├── golden-inputs/
│   └── variants-for-anatomy.json   # Known variants
└── golden-outputs/
    └── anatomy-graph.json          # Expected graph
```

**Test Flow:**
```java
@Test
public void testAnatomyGraph_GoldenFile() {
    // 1. Load variants
    List<VariantCall> variants = loadVariants("golden-inputs/variants-for-anatomy.json");

    // 2. Load expected graph
    AnatomyGraph expected = loadAnatomyGraph("golden-outputs/anatomy-graph.json");

    // 3. Generate graph
    AnatomyGraph actual = anatomyGraphService.generateGraph("test", variants);

    // 4. Compare
    assertAnatomyGraphEquals(expected, actual);
}

private void assertAnatomyGraphEquals(AnatomyGraph expected, AnatomyGraph actual) {
    // Nodes
    assertEquals(expected.getNodes().size(), actual.getNodes().size());
    for (int i = 0; i < expected.getNodes().size(); i++) {
        assertNodeEquals(expected.getNodes().get(i), actual.getNodes().get(i));
    }

    // Overlays
    assertEquals(expected.getOverlays().size(), actual.getOverlays().size());
    for (int i = 0; i < expected.getOverlays().size(); i++) {
        assertOverlayEquals(expected.getOverlays().get(i), actual.getOverlays().get(i));
    }

    // Metadata
    assertEquals(expected.getRulesVersion(), actual.getRulesVersion());
}
```

#### 3. Frontend Rendering Golden Files

**Purpose:** Validate 3D scene generation from anatomy graph

**Structure:**
```
test-fixtures/
├── golden-inputs/
│   └── anatomy-graph-for-render.json
└── golden-outputs/
    └── scene-structure.json         # Expected 3D objects
```

**Test Flow:**
```javascript
test('Frontend renders anatomy graph correctly', () => {
  // 1. Load anatomy graph
  const graph = loadFixture('golden-inputs/anatomy-graph-for-render.json');

  // 2. Load expected scene structure
  const expectedScene = loadFixture('golden-outputs/scene-structure.json');

  // 3. Render (mocked Three.js)
  const { getByTestId } = render(<AnatomyScene anatomyGraph={graph} />);

  // 4. Verify scene structure
  const scene = captureSceneStructure(getByTestId('3d-canvas'));
  expect(scene).toMatchObject(expectedScene);
});
```

### Golden File Maintenance

#### When to Update Golden Files

**Update golden files when:**
-  Intentional feature change (documented in PR)
-  Bug fix changes output (documented in commit)
-  Educational content correction (reviewed by expert)
-  Format migration (versioned)

**Do NOT update for:**
-  Random changes to make tests pass
-  Undocumented behavior changes
-  Flaky test fixes (fix the flakiness instead)

#### Golden File Review Process

```
1. Developer changes code
2. Golden file test fails
3. Developer reviews diff:
   - Is change intentional? Yes → Update golden file + document
   - Is change unintentional? No → Fix code
4. PR review includes golden file changes
5. Reviewer verifies change is correct and documented
```

#### Golden File Versioning

```
golden-outputs/
├── v1.0/
│   └── anatomy-graph.json
├── v1.1/
│   └── anatomy-graph.json    # New field added
└── current -> v1.1            # Symlink
```

**Version Compatibility Test:**
```java
@Test
public void testBackwardCompatibility_v1_0() {
    // Ensure old golden files still parse
    AnatomyGraph graph = loadAnatomyGraph("golden-outputs/v1.0/anatomy-graph.json");
    assertNotNull(graph);
    assertTrue(graph.getNodes().size() > 0);
}
```

---

## Determinism Testing

### Concept

**Determinism:** Given identical input, system produces identical output every time.

**Why Critical for Educational Software:**
- Reproducibility for research
- Consistency for learning
- Trust in results
- Debuggability

### Determinism Requirements

#### DR-1: Import Determinism

**Requirement:** Parsing VCF/TSV multiple times produces identical variant lists

**Test:**
```java
@Test
public void testVCFImport_Deterministic() {
    byte[] vcfInput = loadFixture("test-data/sample.vcf");

    // Import same file 5 times
    List<ImportResult> results = new ArrayList<>();
    for (int i = 0; i < 5; i++) {
        ImportResult result = vcfImporter.importVCF("test", vcfInput, "sample.vcf", true);
        results.add(result);
    }

    // All results must be identical
    ImportResult first = results.get(0);
    for (int i = 1; i < results.size(); i++) {
        assertImportResultEquals(first, results.get(i),
            "Import #" + (i+1) + " differs from first import");
    }
}

private void assertImportResultEquals(ImportResult expected, ImportResult actual, String message) {
    assertEquals(expected.isSuccess(), actual.isSuccess(), message);
    assertEquals(expected.getImportedVariantsCount(), actual.getImportedVariantsCount(), message);
    assertEquals(expected.getVariants().size(), actual.getVariants().size(), message);

    // Compare each variant
    for (int i = 0; i < expected.getVariants().size(); i++) {
        assertVariantEquals(expected.getVariants().get(i),
                          actual.getVariants().get(i));
    }
}
```

**Common Determinism Violations:**
-  Using `HashMap` (iteration order undefined)
-  Using `System.currentTimeMillis()` in output
-  Thread race conditions
-  Random number generation
-  Floating point rounding inconsistencies

**Determinism Patterns:**
-  Use `LinkedHashMap` for predictable order
-  Sort collections before output
-  Use fixed timestamp in tests
-  Synchronize shared state
-  Use BigDecimal for precision

#### DR-2: Anatomy Graph Determinism

**Requirement:** Generating anatomy graph multiple times produces identical overlays

**Test:**
```java
@Test
public void testAnatomyGraph_Deterministic() {
    List<VariantCall> variants = loadTestVariants();

    // Generate graph 10 times
    List<AnatomyGraph> graphs = new ArrayList<>();
    for (int i = 0; i < 10; i++) {
        AnatomyGraph graph = anatomyGraphService.generateGraph("test", variants);
        graphs.add(graph);
    }

    // All graphs must be identical
    AnatomyGraph first = graphs.get(0);
    for (int i = 1; i < graphs.size(); i++) {
        assertAnatomyGraphEquals(first, graphs.get(i),
            "Graph #" + (i+1) + " differs from first graph");
    }
}
```

#### DR-3: JSON Serialization Determinism

**Requirement:** Converting objects to JSON produces identical strings

**Test:**
```java
@Test
public void testJSON_Deterministic() {
    VariantCall variant = createTestVariant();

    // Serialize 100 times
    Set<String> jsonOutputs = new HashSet<>();
    for (int i = 0; i < 100; i++) {
        String json = objectMapper.writeValueAsString(variant);
        jsonOutputs.add(json);
    }

    // Should be exactly one unique output
    assertEquals(1, jsonOutputs.size(),
        "JSON serialization produced different outputs");
}
```

**Jackson Configuration for Determinism:**
```java
@Bean
public ObjectMapper objectMapper() {
    ObjectMapper mapper = new ObjectMapper();

    // Sort properties alphabetically for deterministic output
    mapper.configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true);

    // Sort JSON object keys
    mapper.configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);

    return mapper;
}
```

#### DR-4: Database Query Determinism

**Requirement:** Queries return results in consistent order

**Test:**
```java
@Test
public void testDatabaseQuery_Deterministic() {
    // Insert test data
    insertTestGenomicData();

    // Query 20 times
    List<List<GenomicData>> queryResults = new ArrayList<>();
    for (int i = 0; i < 20; i++) {
        List<GenomicData> data = genomicDataRepository.findByUserId("test");
        queryResults.add(data);
    }

    // All results must be in same order
    List<GenomicData> first = queryResults.get(0);
    for (int i = 1; i < queryResults.size(); i++) {
        assertSameOrder(first, queryResults.get(i));
    }
}
```

**SQL for Determinism:**
```sql
-- Bad: Undefined order
SELECT * FROM genomic_data WHERE user_id = ?;

-- Good: Explicit ordering
SELECT * FROM genomic_data
WHERE user_id = ?
ORDER BY chromosome, position, id;
```

### Determinism Monitoring

**Flakiness Detection:**
```bash
# Run same test 100 times
for i in {1..100}; do
  mvn test -Dtest=VCFImporterTest#testImportSimpleVCF >> test-results.log
done

# Check for failures
grep "FAILURE" test-results.log
# Expected: 0 failures (100% pass rate)
```

**CI Integration:**
```yaml
# .github/workflows/determinism.yml
name: Determinism Tests
on: [push, pull_request]
jobs:
  determinism:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests 10 times
        run: |
          for i in {1..10}; do
            mvn test -Dtest=*DeterminismTest || exit 1
          done
```

---

## End-to-End Testing

### E2E Test Strategy

**Goals:**
- Validate full user workflows
- Catch integration issues
- Verify UI/API contracts
- Smoke test critical paths

**Anti-patterns to avoid:**
-  Testing implementation details
-  Fragile UI selectors
-  Testing too many scenarios (slow)
-  Replacing unit tests with E2E

### E2E Test Scenarios

#### E2E-1: Full Import Workflow

**Scenario:** User uploads VCF → variants stored → anatomy graph generated → frontend displays overlays

**Test Implementation:**
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class E2EImportWorkflowTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private GenomicDataRepository genomicDataRepository;

    private static String testUserId = "e2e-test-user";
    private static String fileHash;

    @Test
    @Order(1)
    public void step1_uploadVCF() {
        // 1. Load test VCF
        byte[] vcfContent = loadTestVCF("test-fixtures/e2e/sample.vcf");

        // 2. Upload via API
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(vcfContent) {
            @Override
            public String getFilename() {
                return "sample.vcf";
            }
        });
        body.add("userId", testUserId);
        body.add("strictMode", "true");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<ImportResult> response = restTemplate.postForEntity(
            "/api/import/vcf", request, ImportResult.class);

        // 3. Verify success
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertTrue(response.getBody().getImportedVariantsCount() > 0);

        fileHash = response.getBody().getFileHash();
        assertNotNull(fileHash);
    }

    @Test
    @Order(2)
    public void step2_verifyDatabaseStorage() {
        // Verify variants stored in database
        List<GenomicData> storedData = genomicDataRepository.findByUserId(testUserId);

        assertFalse(storedData.isEmpty(), "Variants should be stored");
        assertTrue(storedData.size() > 0, "At least one variant stored");

        // Verify file hash is stored
        GenomicData first = storedData.get(0);
        assertTrue(first.getAnnotations().contains(fileHash),
            "File hash should be in annotations");
    }

    @Test
    @Order(3)
    public void step3_generateAnatomyGraph() {
        // Generate anatomy graph
        ResponseEntity<AnatomyGraph> response = restTemplate.getForEntity(
            "/api/anatomy/graph?userId=" + testUserId, AnatomyGraph.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        AnatomyGraph graph = response.getBody();
        assertFalse(graph.getNodes().isEmpty(), "Graph should have nodes");
        assertFalse(graph.getOverlays().isEmpty(), "Graph should have overlays");
    }

    @Test
    @Order(4)
    public void step4_verifyFrontendCanLoad() {
        // Fetch anatomy graph (simulating frontend)
        ResponseEntity<String> response = restTemplate.getForEntity(
            "/api/anatomy/graph?userId=" + testUserId, String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());

        // Verify JSON is valid and parseable
        String json = response.getBody();
        assertNotNull(json);
        assertTrue(json.contains("nodes"));
        assertTrue(json.contains("overlays"));
        assertTrue(json.contains("rulesVersion"));
    }

    @AfterAll
    public static void cleanup(@Autowired GenomicDataRepository repository) {
        // Clean up test data
        repository.deleteAll(repository.findByUserId(testUserId));
    }
}
```

#### E2E-2: Authentication Flow

**Scenario:** User registers → logs in → uploads file → logs out

**Test (High-Level):**
```java
@Test
public void testAuthenticationWorkflow() {
    // 1. Register
    ResponseEntity<User> registerResponse = register("e2e@test.com", "password123!");
    assertEquals(HttpStatus.CREATED, registerResponse.getStatusCode());

    // 2. Login
    ResponseEntity<JWTResponse> loginResponse = login("e2e@test.com", "password123!");
    assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
    String token = loginResponse.getBody().getToken();

    // 3. Upload with auth token
    ResponseEntity<ImportResult> uploadResponse = uploadVCF(token, testVCF);
    assertEquals(HttpStatus.OK, uploadResponse.getStatusCode());

    // 4. Logout
    ResponseEntity<Void> logoutResponse = logout(token);
    assertEquals(HttpStatus.OK, logoutResponse.getStatusCode());

    // 5. Verify token invalid after logout
    ResponseEntity<AnatomyGraph> unauthorizedResponse =
        getAnatomyGraph(token, "testuser");
    assertEquals(HttpStatus.UNAUTHORIZED, unauthorizedResponse.getStatusCode());
}
```

#### E2E-3: Learn Mode Tour

**Scenario:** User navigates learn mode → selects tour → completes steps

**Test (Frontend - Jest/React Testing Library):**
```javascript
describe('Learn Mode E2E', () => {
  it('should complete cardiovascular tour', async () => {
    // 1. Navigate to learn mode
    const { getByText, getByRole } = render(<App />);
    fireEvent.click(getByText('Learn'));

    // 2. Select cardiovascular tour
    await waitFor(() => {
      expect(getByText('Introduction to the Cardiovascular System')).toBeInTheDocument();
    });
    fireEvent.click(getByText('Introduction to the Cardiovascular System'));

    // 3. Verify tour loaded
    await waitFor(() => {
      expect(getByText('Step 1:')).toBeInTheDocument();
    });

    // 4. Navigate through all steps
    for (let i = 1; i < 6; i++) {
      fireEvent.click(getByRole('button', { name: 'Next' }));
      await waitFor(() => {
        expect(getByText(`Step ${i + 1}:`)).toBeInTheDocument();
      });
    }

    // 5. Complete tour
    fireEvent.click(getByRole('button', { name: 'Complete Tour' }));
    await waitFor(() => {
      expect(getByText('Learn Mode')).toBeInTheDocument();
    });
  });
});
```

### E2E Test Infrastructure

**Test Environment Setup:**
```yaml
# docker-compose.test.yml
version: '3.8'
services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: dna_db_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - "5433:5432"

  backend-test:
    build: ./backend
    environment:
      SPRING_PROFILES_ACTIVE: test
      DB_HOST: postgres-test
      DB_PORT: 5432
    depends_on:
      - postgres-test
    ports:
      - "8081:8080"

  frontend-test:
    build: ./frontend
    environment:
      REACT_APP_API_URL: http://backend-test:8080
    depends_on:
      - backend-test
    ports:
      - "3001:3000"
```

**Running E2E Tests:**
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run E2E tests
mvn test -Dtest=*E2ETest

# Shutdown test environment
docker-compose -f docker-compose.test.yml down -v
```

---

## Regression Gates

### Pre-Commit Gates

**Fast checks before commit:**

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running pre-commit checks..."

# 1. Format check
mvn spotless:check || exit 1

# 2. Unit tests (fast)
mvn test -Dtest=*UtilTest,*ParserTest || exit 1

# 3. Security lint
cd frontend && npm run lint:legal || exit 1

echo " Pre-commit checks passed"
```

### Pre-Push Gates

**More comprehensive checks before push:**

```bash
#!/bin/bash
# .git/hooks/pre-push

echo "Running pre-push checks..."

# 1. All unit tests
mvn test || exit 1

# 2. Golden file tests
mvn test -Dtest=*GoldenTest || exit 1

# 3. Determinism tests
mvn test -Dtest=*DeterminismTest || exit 1

# 4. Frontend tests
cd frontend && npm test -- --watchAll=false || exit 1

echo " Pre-push checks passed"
```

### Pull Request Gates

**Required checks for PR merge:**

```yaml
# .github/workflows/pr-gates.yml
name: PR Quality Gates
on: [pull_request]

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Backend Unit Tests
        run: mvn test

      - name: Golden File Tests
        run: mvn test -Dtest=*GoldenTest

      - name: Determinism Tests
        run: mvn test -Dtest=*DeterminismTest

      - name: Security Tests
        run: mvn test -Dtest=*SecurityTest

      - name: Frontend Tests
        run: |
          cd frontend
          npm install
          npm test -- --watchAll=false

      - name: Code Coverage
        run: mvn jacoco:report

      - name: Upload Coverage
        uses: codecov/codecov-action@v2

  golden-file-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Check for golden file changes
        id: golden-changes
        run: |
          CHANGED=$(git diff --name-only origin/main... | grep "golden-outputs/")
          if [ ! -z "$CHANGED" ]; then
            echo "::warning::Golden files changed - requires explicit review"
            echo "changed=true" >> $GITHUB_OUTPUT
          fi

      - name: Require review comment
        if: steps.golden-changes.outputs.changed == 'true'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ **Golden files changed** - Reviewer must verify changes are intentional and documented.'
            })
```

### Release Gates

**Required checks before release:**

1.  All unit tests pass (100%)
2.  All integration tests pass (100%)
3.  All E2E tests pass (100%)
4.  All golden file tests pass (100%)
5.  All determinism tests pass (100%)
6.  Code coverage >80%
7.  No critical security vulnerabilities
8.  No legal compliance violations
9.  Documentation updated
10.  Release notes prepared

---

## Release Checklist

### Pre-Release Checklist

**1 Week Before Release:**

- [ ]  Review all open PRs
- [ ]  Merge feature branches
- [ ]  Update dependencies
- [ ]  Run full test suite
- [ ]  Review golden file changes
- [ ]  Update version numbers
- [ ]  Draft release notes

**3 Days Before Release:**

- [ ]  Code freeze (no new features)
- [ ]  Run E2E tests on staging
- [ ]  Manual smoke testing
- [ ]  Performance testing
- [ ]  Security audit
- [ ]  Documentation review

**1 Day Before Release:**

- [ ]  Final test run (all gates)
- [ ]  Build artifacts
- [ ]  Tag release in git
- [ ]  Prepare rollback plan
- [ ]  Schedule deployment window

### Release Day Checklist

**Pre-Deployment:**

- [ ]  Backup production database
- [ ]  Verify staging environment matches production
- [ ]  Review deployment steps
- [ ]  Notify team of deployment
- [ ]  Put maintenance page (if needed)

**Deployment:**

- [ ]  Deploy database migrations
- [ ]  Deploy backend services
- [ ]  Deploy frontend assets
- [ ]  Run smoke tests on production
- [ ]  Monitor error logs

**Post-Deployment:**

- [ ]  Verify all critical workflows
- [ ]  Check metrics/monitoring
- [ ]  Remove maintenance page
- [ ]  Announce release
- [ ]  Monitor for 24 hours

### Rollback Criteria

**Rollback immediately if:**

-  Critical bug affecting all users
-  Data corruption detected
-  Security vulnerability introduced
-  System unusable (500 errors >10%)
-  Database migration failed

**Rollback Procedure:**

```bash
# 1. Revert to previous version
git checkout v1.0.0
mvn clean package
docker build -t humanvisualizer:v1.0.0 .

# 2. Rollback database
psql -U dna_user -d dna_db < backup-v1.0.0.sql

# 3. Deploy previous version
docker-compose up -d

# 4. Verify rollback successful
curl http://localhost:8080/actuator/health
```

---

## Test Fixtures

### Fixture Organization

```
test-fixtures/
├── golden-inputs/           # Known-good inputs
│   ├── vcf/
│   │   ├── minimal.vcf      # Minimal valid VCF
│   │   ├── realistic.vcf    # Real-world example
│   │   └── edge-cases.vcf   # Corner cases
│   ├── tsv/
│   │   ├── 23andme.txt      # 23andMe format
│   │   └── generic.tsv      # Generic format
│   └── variants/
│       └── variants.json    # Pre-parsed variants
├── golden-outputs/          # Expected outputs
│   ├── vcf/
│   │   ├── minimal.json
│   │   ├── realistic.json
│   │   └── edge-cases.json
│   └── anatomy/
│       └── anatomy-graph.json
├── e2e/                     # End-to-end scenarios
│   ├── full-workflow.vcf
│   └── multi-user.vcf
└── README.md                # Fixture documentation
```

### Fixture Requirements

**VCF Fixtures:**
- Minimal: <10 variants, all standard fields
- Realistic: 100+ variants, with INFO/FORMAT fields
- Edge cases: Missing fields, unusual values

**TSV Fixtures:**
- All supported vendor formats
- Various column arrangements
- Missing optional columns

**Anatomy Graph Fixtures:**
- All node types (system, organ, substructure)
- All evidence levels (HIGH, MEDIUM, LOW)
- Multiple overlays per node

### Generating Golden Files

```java
/**
 * Utility to generate new golden files.
 * Run once, review output, commit golden files.
 */
@Test
@Disabled("Run manually to generate golden files")
public void generateGoldenFiles() throws IOException {
    // 1. Process input
    byte[] vcfInput = Files.readAllBytes(Paths.get("test-fixtures/golden-inputs/vcf/realistic.vcf"));
    ImportResult result = vcfImporter.importVCF("test", vcfInput, "realistic.vcf", true);

    // 2. Write golden output
    String json = objectMapper.writerWithDefaultPrettyPrinter()
                             .writeValueAsString(result.getVariants());
    Files.write(Paths.get("test-fixtures/golden-outputs/vcf/realistic.json"),
                json.getBytes());

    System.out.println(" Golden file generated: realistic.json");
    System.out.println("⚠️  REVIEW OUTPUT BEFORE COMMITTING");
}
```

---

## Continuous Integration

### CI/CD Pipeline

```
┌────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline                          │
└────────────────────────────────────────────────────────────┘

1. CODE PUSH
   ├─ Trigger: git push
   └─ Actions: Lint, format check

2. UNIT TESTS (5 min)
   ├─ Backend unit tests
   ├─ Frontend unit tests
   └─ Code coverage report

3. INTEGRATION TESTS (10 min)
   ├─ API integration tests
   ├─ Database integration tests
   └─ Component integration tests

4. QUALITY GATES (5 min)
   ├─ Golden file tests
   ├─ Determinism tests
   ├─ Security tests
   └─ Legal compliance tests

5. E2E TESTS (15 min)
   ├─ Full workflow tests
   ├─ Authentication tests
   └─ Frontend smoke tests

6. BUILD ARTIFACTS (5 min)
   ├─ Docker images
   ├─ JAR files
   └─ Frontend bundle

7. DEPLOY (varies)
   ├─ Staging environment
   ├─ Production (manual approval)
   └─ Smoke tests post-deploy
```

### GitHub Actions Configuration

```yaml
# .github/workflows/ci.yml
name: Continuous Integration

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v2

      - name: Set up JDK 17
        uses: actions/setup-java@v2
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Cache Maven packages
        uses: actions/cache@v2
        with:
          path: ~/.m2
          key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}

      - name: Run unit tests
        run: mvn test

      - name: Generate coverage report
        run: mvn jacoco:report

      - name: Upload coverage
        uses: codecov/codecov-action@v2

  golden-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
      - name: Run golden file tests
        run: mvn test -Dtest=*GoldenTest
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: golden-test-results
          path: target/surefire-reports/

  determinism-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
      - name: Run determinism tests 10 times
        run: |
          for i in {1..10}; do
            mvn test -Dtest=*DeterminismTest || exit 1
          done

  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2

      - name: Start test environment
        run: docker-compose -f docker-compose.test.yml up -d

      - name: Wait for services
        run: |
          sleep 30
          curl --retry 10 --retry-delay 5 http://localhost:8081/actuator/health

      - name: Run E2E tests
        run: mvn test -Dtest=*E2ETest

      - name: Shutdown test environment
        if: always()
        run: docker-compose -f docker-compose.test.yml down -v
```

---

## Quality Metrics

### Code Quality Metrics

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| **Unit Test Coverage** | >80% | TBD | 📈 |
| **Integration Test Coverage** | >60% | TBD | 📈 |
| **E2E Test Coverage** | 100% critical paths | TBD | 📈 |
| **Mutation Score** | >70% | TBD | 📊 |
| **Code Duplication** | <5% | TBD | 📉 |
| **Technical Debt Ratio** | <5% | TBD | 📉 |

### Test Execution Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **Unit Test Time** | <5 min | TBD |
| **Integration Test Time** | <10 min | TBD |
| **E2E Test Time** | <20 min | TBD |
| **Total CI Time** | <30 min | TBD |
| **Test Flakiness Rate** | <1% | TBD |

### Reliability Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **Uptime** | >99.9% | System availability |
| **MTBF** | >720h | Mean time between failures |
| **MTTR** | <1h | Mean time to recovery |
| **Error Rate** | <0.1% | Percentage of failed requests |
| **Rollback Rate** | <5% | Percentage of releases rolled back |

---

## Appendix A: Test Naming Conventions

### Backend (Java/JUnit)

```java
// Pattern: test<Method>_<Scenario>_<ExpectedResult>

@Test
public void testVCFImport_ValidFile_Success() { }

@Test
public void testVCFImport_EmptyFile_ThrowsException() { }

@Test
public void testVCFImport_MalformedHeader_ReturnsErrors() { }
```

### Frontend (JavaScript/Jest)

```javascript
// Pattern: should <expected behavior> when <scenario>

test('should render anatomy scene when graph is loaded', () => { });

test('should show error message when import fails', () => { });

test('should navigate to next step when next button clicked', () => { });
```

---

## Appendix B: Troubleshooting

### Golden File Test Failures

**Problem:** Golden file test fails after code change

**Steps:**
1. Review diff between expected and actual output
2. Determine if change is intentional:
   - **Yes:** Update golden file, document in commit
   - **No:** Fix code to match expected behavior
3. Re-run test to verify fix

**Example:**
```bash
# Show diff
mvn test -Dtest=VCFGoldenTest#testSimpleVCF 2>&1 | grep "expected:"

# If change is intentional, regenerate golden file
mvn test -Dtest=VCFGoldenTest#generateGoldenFiles -D disabled=false
```

### Flaky Tests

**Problem:** Test passes sometimes, fails sometimes

**Common Causes:**
- Race conditions (threading)
- Timing issues (delays, polling)
- External dependencies (network, database)
- Shared state between tests

**Solutions:**
```java
// Bad: Race condition
Thread.sleep(1000);  // Flaky

// Good: Explicit wait
await().atMost(5, SECONDS)
       .until(() -> result.isComplete());

// Bad: Shared state
private static List<Data> cache = new ArrayList<>();  // Flaky

// Good: Test isolation
@BeforeEach
public void setUp() {
    cache = new ArrayList<>();
}
```

---

**End of Specification**

**Version:** 1.0.0
**Author:** QA / Verification Agent
**Date:** 2025-01-09
