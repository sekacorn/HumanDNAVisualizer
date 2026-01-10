# Security & Privacy Specification

**Version:** 1.0.0
**Last Updated:** 2025-01-09
**Agent:** Security & Privacy Agent

## Table of Contents

1. [Overview](#overview)
2. [Threat Model](#threat-model)
3. [Security Principles](#security-principles)
4. [File Handling Security](#file-handling-security)
5. [Data Encryption](#data-encryption)
6. [Configuration Security](#configuration-security)
7. [Network Security](#network-security)
8. [Database Security](#database-security)
9. [Authentication & Authorization](#authentication--authorization)
10. [Audit & Logging](#audit--logging)
11. [Privacy Protections](#privacy-protections)
12. [Testing Requirements](#testing-requirements)
13. [Compliance](#compliance)

---

## Overview

### Purpose

This specification defines security and privacy requirements for HumanDNAVisualizer, a local-first genomic visualization tool. The system prioritizes:

- **Local-first architecture**: Data stays on user's infrastructure
- **Privacy by default**: No external data transmission unless explicitly enabled
- **Secure file handling**: Uploaded files are processed and discarded by default
- **Encryption at rest**: Sensitive metadata is encrypted in database
- **Vendor neutrality**: No proprietary SDKs or external APIs

### Scope

This specification covers:

-  File upload and processing lifecycle
-  Data encryption (at rest and in transit)
-  Configuration security with safe defaults
-  Database security
-  Network security posture
-  Privacy-preserving defaults
-  Audit logging

Out of scope:
-  Encryption in transit (TLS) - infrastructure concern
-  Container security - deployment concern
-  Operating system hardening - infrastructure concern

---

## Threat Model

### Threat Actors

1. **Malicious Insider**
   - Database administrator with direct DB access
   - System administrator with file system access
   - Mitigation: Encryption at rest, minimal data retention

2. **External Attacker**
   - Network attacker attempting to intercept data
   - Attacker with physical access to storage
   - Mitigation: Encryption, no-default-network mode

3. **Accidental Disclosure**
   - Developer accidentally commits sensitive data
   - Backup system exposes unencrypted data
   - Mitigation: Config flags prevent storage, field-level encryption

### Assets to Protect

**Critical:**
- Genomic variant data (chromosome, position, alleles)
- User authentication credentials
- File hashes (fingerprints of uploaded files)

**Important:**
- User metadata (email, username)
- Import metadata (filenames, timestamps)
- Audit logs

**Low Priority:**
- Application logs (non-sensitive)
- Configuration files (no secrets)

### Attack Vectors

1. **File Upload Attacks**
   - Malicious file content (e.g., zip bombs)
   - Path traversal via filename
   - Memory exhaustion via large files
   - Mitigation: File size limits, filename sanitization, streaming processing

2. **Data Exfiltration**
   - Database dump exposes genetic data
   - Log files contain sensitive data
   - Backup files not encrypted
   - Mitigation: Field-level encryption, minimal logging, secure defaults

3. **Unauthorized Access**
   - SQL injection
   - Authentication bypass
   - Authorization bypass
   - Mitigation: Prepared statements, JWT validation, role-based access

---

## Security Principles

### 1. Privacy by Default

**Principle:** No data leaves the system unless explicitly configured.

**Implementation:**
- `ENABLE_REMOTE_LLM=false` by default
- `STORE_RAW_UPLOADS=false` by default
- `ENABLE_EXTERNAL_APIS=false` by default
- No analytics, no telemetry, no external requests

### 2. Minimal Data Retention

**Principle:** Keep only what's necessary for functionality.

**Implementation:**
- Raw uploaded files discarded after parsing (default)
- Only parsed variants stored in database
- File hash stored for deduplication (SHA-256)
- Session data cleared on logout

### 3. Defense in Depth

**Principle:** Multiple layers of security controls.

**Layers:**
1. **Network:** CORS, allowed origins, no default external access
2. **Application:** Input validation, file size limits, strict mode parsing
3. **Data:** Field-level encryption, parameterized queries
4. **Audit:** Comprehensive logging of security events

### 4. Secure by Default

**Principle:** Default configuration is secure.

**Defaults:**
-  Demo mode disabled
-  Raw file storage disabled
-  Remote LLM disabled
-  Strict validation mode enabled
-  Password complexity required
-  Email verification required

### 5. Fail Securely

**Principle:** Errors don't expose sensitive information.

**Implementation:**
- Generic error messages to users
- Detailed errors only in logs (not responses)
- Import fails if validation errors in strict mode
- Authentication fails closed (deny by default)

---

## File Handling Security

### File Upload Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                     File Upload Lifecycle                        │
└─────────────────────────────────────────────────────────────────┘

1. UPLOAD
   ├─ User uploads file via HTTP POST
   ├─ File received as MultipartFile (in-memory or temp file)
   ├─ Filename sanitized (path traversal prevention)
   └─ File size validated (max 100MB)

2. PROCESSING
   ├─ File content read to byte[] (single pass)
   ├─ SHA-256 hash computed
   ├─ Parser processes byte[] → VariantCall objects
   ├─ Validation applied (strict or lenient mode)
   └─ ImportResult created

3. STORAGE (Conditional)
   ├─ IF STORE_RAW_UPLOADS=true:
   │  └─ Raw file saved to filesystem (encrypted if enabled)
   └─ IF STORE_RAW_UPLOADS=false (default):
      └─ Raw file DISCARDED (byte[] eligible for GC)

4. DATABASE PERSISTENCE
   ├─ Parsed variants stored in genomic_data table
   ├─ File hash stored (for deduplication)
   ├─ Original filename stored (metadata only)
   ├─ Sensitive fields encrypted at rest
   └─ Timestamp recorded

5. CLEANUP
   ├─ MultipartFile temp file deleted (Spring automatic)
   ├─ byte[] garbage collected
   ├─ ImportResult returned to client
   └─ Audit log entry created
```

### File Security Requirements

#### FR-1: File Size Limits

**Requirement:** Enforce maximum file sizes to prevent resource exhaustion.

```yaml
# application.yml
spring:
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 100MB

upload:
  max-vcf-size: 50MB
  max-fhir-size: 10MB
  max-csv-size: 5MB
```

**Validation:**
- Spring automatically rejects files exceeding limits
- Controller validates before processing
- Returns `413 Payload Too Large` on rejection

#### FR-2: Filename Sanitization

**Requirement:** Prevent path traversal attacks via malicious filenames.

**Implementation:**
```java
public class FileSecurityUtil {
    public static String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "upload.dat";
        }

        // Remove path separators
        String sanitized = filename.replaceAll("[/\\\\]", "_");

        // Remove null bytes
        sanitized = sanitized.replace("\0", "");

        // Limit length
        if (sanitized.length() > 255) {
            sanitized = sanitized.substring(0, 255);
        }

        return sanitized;
    }
}
```

**Test Cases:**
- `../../etc/passwd` → `.._.._ etc_passwd`
- `file\0.txt` → `file.txt`
- Long filename → Truncated to 255 chars

#### FR-3: File Hash Computation

**Requirement:** Compute SHA-256 hash of uploaded file for integrity and deduplication.

**Implementation:**
```java
public class FileHashUtil {
    public static String computeSHA256(byte[] fileContent)
            throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(fileContent);
        return bytesToHex(hash);
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
```

**Storage:**
- Hash stored in `import_metadata` table
- Used for deduplication (check before import)
- Included in ImportResult for audit trail

#### FR-4: Raw File Disposal

**Requirement:** By default, raw uploaded files must NOT be persisted.

**Configuration Flag:**
```yaml
security:
  file-handling:
    store-raw-uploads: false  # DEFAULT: false
    raw-file-storage-path: /secure/genomic-uploads
    encrypt-stored-files: true
```

**Implementation:**
```java
@Service
public class FileLifecycleManager {
    @Value("${security.file-handling.store-raw-uploads:false}")
    private boolean storeRawUploads;

    public void handleFileAfterImport(byte[] fileContent,
                                      String filename,
                                      String fileHash) {
        if (storeRawUploads) {
            // Explicitly enabled - store encrypted file
            storeEncryptedFile(fileContent, filename, fileHash);
        }
        // else: fileContent byte[] discarded (no explicit action needed)
        //       MultipartFile temp file automatically deleted by Spring
    }
}
```

**Verification Test:**
```java
@Test
public void testRawFileNotStoredByDefault() {
    // Given: STORE_RAW_UPLOADS=false (default)
    // When: Import VCF file
    ImportResult result = importController.importVCF(file, userId, true);

    // Then: File hash is stored
    assertNotNull(result.getFileHash());

    // And: Raw file does NOT exist on filesystem
    File rawFile = new File(storagePath + "/" + result.getFileHash());
    assertFalse(rawFile.exists());
}
```

#### FR-5: Memory Safety

**Requirement:** Process files in a memory-safe manner to prevent OOM.

**Strategy:**
- Read file to `byte[]` once
- Use streaming parsers where possible (VCF)
- Discard byte[] after processing
- No in-memory accumulation of full file

**Implementation:**
```java
// Good: Single-pass streaming
try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(
            new ByteArrayInputStream(fileContent)))) {
    String line;
    while ((line = reader.readLine()) != null) {
        processLine(line);  // Process immediately, don't accumulate
    }
}

// Bad: Loading entire file into memory structures
List<String> allLines = Files.readAllLines(path);  //  OOM risk
```

---

## Data Encryption

### Encryption at Rest

#### ER-1: Field-Level Encryption

**Requirement:** Encrypt sensitive genomic data fields in database.

**Sensitive Fields:**
- `genomic_data.raw_data` (variant data)
- `genomic_data.parsed_variants` (JSON)
- `genomic_data.annotations` (metadata)
- `users.email` (PII)

**Encryption Strategy: AES-256-GCM**

```java
@Configuration
public class EncryptionConfig {
    @Bean
    public FieldEncryptor fieldEncryptor() {
        String encryptionKey = System.getenv("DB_ENCRYPTION_KEY");
        if (encryptionKey == null) {
            throw new IllegalStateException(
                "DB_ENCRYPTION_KEY environment variable not set");
        }
        return new AESFieldEncryptor(encryptionKey);
    }
}

public interface FieldEncryptor {
    String encrypt(String plaintext) throws EncryptionException;
    String decrypt(String ciphertext) throws EncryptionException;
}

@Service
public class AESFieldEncryptor implements FieldEncryptor {
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int IV_LENGTH = 12;

    private final SecretKey key;

    public AESFieldEncryptor(String base64Key) {
        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
        this.key = new SecretKeySpec(keyBytes, "AES");
    }

    @Override
    public String encrypt(String plaintext) throws EncryptionException {
        try {
            byte[] iv = new byte[IV_LENGTH];
            SecureRandom.getInstanceStrong().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, key, spec);

            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(UTF_8));

            // Format: IV || ciphertext (IV is 12 bytes)
            byte[] combined = new byte[IV_LENGTH + ciphertext.length];
            System.arraycopy(iv, 0, combined, 0, IV_LENGTH);
            System.arraycopy(ciphertext, 0, combined, IV_LENGTH, ciphertext.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new EncryptionException("Encryption failed", e);
        }
    }

    @Override
    public String decrypt(String ciphertextBase64) throws EncryptionException {
        try {
            byte[] combined = Base64.getDecoder().decode(ciphertextBase64);

            byte[] iv = new byte[IV_LENGTH];
            byte[] ciphertext = new byte[combined.length - IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, IV_LENGTH);
            System.arraycopy(combined, IV_LENGTH, ciphertext, 0, ciphertext.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, key, spec);

            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, UTF_8);
        } catch (Exception e) {
            throw new EncryptionException("Decryption failed", e);
        }
    }
}
```

**Entity Integration:**

```java
@Entity
@Table(name = "genomic_data")
public class GenomicData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "raw_data", columnDefinition = "TEXT")
    @Convert(converter = EncryptedStringConverter.class)
    private String rawData;  // Encrypted at rest

    @Column(name = "parsed_variants", columnDefinition = "TEXT")
    @Convert(converter = EncryptedStringConverter.class)
    private String parsedVariants;  // Encrypted at rest

    // ... other fields
}

@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {
    @Autowired
    private FieldEncryptor encryptor;

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return encryptor.encrypt(attribute);
        } catch (EncryptionException e) {
            throw new RuntimeException("Failed to encrypt field", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            return encryptor.decrypt(dbData);
        } catch (EncryptionException e) {
            throw new RuntimeException("Failed to decrypt field", e);
        }
    }
}
```

#### ER-2: Key Management

**Requirement:** Encryption keys must be managed securely.

**Strategy:**

1. **Development:** Environment variable
   ```bash
   export DB_ENCRYPTION_KEY=$(openssl rand -base64 32)
   ```

2. **Production:** External secrets manager
   - AWS Secrets Manager
   - HashiCorp Vault
   - Kubernetes Secrets

**Key Rotation:**
```java
public interface KeyRotationService {
    void rotateKey(String newKey);
    // Re-encrypts all existing data with new key
}
```

**Configuration:**
```yaml
security:
  encryption:
    enabled: true
    algorithm: AES-256-GCM
    key-source: environment  # or: vault, aws-secrets
    key-rotation-days: 90
```

#### ER-3: Encryption Performance

**Consideration:** Field-level encryption adds latency.

**Mitigation:**
- Lazy loading of encrypted fields
- Connection pooling for DB
- Caching for frequently accessed data (if appropriate)

**Benchmarks:**
- Encryption: ~0.5ms per field (AES-GCM)
- Decryption: ~0.5ms per field
- Acceptable for import workflow (batch operations)

---

## Configuration Security

### Security Configuration Flags

```yaml
# application.yml
security:
  file-handling:
    store-raw-uploads: false              # DEFAULT: false
    encrypt-stored-files: true            # Only used if storing
    max-storage-days: 30                  # Auto-delete old files

  network:
    enable-remote-llm: false              # DEFAULT: false
    enable-external-apis: false           # DEFAULT: false
    allowed-origins: ${ALLOWED_ORIGINS:http://localhost:3000}

  encryption:
    enabled: true                         # Encrypt sensitive DB fields
    algorithm: AES-256-GCM
    key-source: environment

  privacy:
    minimal-logging: true                 # Don't log sensitive data
    anonymize-audit-logs: false           # Keep user IDs in audit
    gdpr-mode: true                       # Enable data deletion requests

  authentication:
    require-email-verification: true      # DEFAULT: true
    password-min-length: 12
    session-timeout-minutes: 60
    max-login-attempts: 5
```

### Configuration Validation

**Startup Validation:**
```java
@Configuration
@Validated
public class SecurityProperties {
    @NotNull
    @Value("${security.file-handling.store-raw-uploads:false}")
    private Boolean storeRawUploads;

    @NotNull
    @Value("${security.network.enable-remote-llm:false}")
    private Boolean enableRemoteLLM;

    @PostConstruct
    public void validateConfig() {
        // Log security posture on startup
        log.info("=== Security Configuration ===");
        log.info("Store raw uploads: {}", storeRawUploads);
        log.info("Enable remote LLM: {}", enableRemoteLLM);
        log.info("Encryption enabled: {}", encryptionEnabled);
        log.info("==============================");

        // Fail fast if insecure defaults in production
        if (isProduction() && enableRemoteLLM) {
            throw new IllegalStateException(
                "ENABLE_REMOTE_LLM must be false in production");
        }
    }

    private boolean isProduction() {
        String profile = System.getProperty("spring.profiles.active");
        return "prod".equals(profile) || "production".equals(profile);
    }
}
```

---

## Network Security

### NS-1: No Default External Connections

**Requirement:** System must NOT make external network requests by default.

**Prohibited by Default:**
-  LLM API calls (OpenAI, Anthropic, etc.)
-  External annotation databases (NCBI, Ensembl, etc.)
-  Analytics/telemetry services
-  Update checks
-  CDN requests

**Allowed:**
-  Database connections (localhost or configured)
-  Frontend API calls (same origin or CORS-configured)

**Implementation:**
```java
@Service
public class ExternalAPIService {
    @Value("${security.network.enable-external-apis:false}")
    private boolean enableExternalAPIs;

    public AnnotationResult fetchExternalAnnotation(String variantId) {
        if (!enableExternalAPIs) {
            throw new SecurityException(
                "External API calls disabled. " +
                "Set security.network.enable-external-apis=true to enable.");
        }
        // ... actual API call
    }
}
```

### NS-2: CORS Configuration

**Requirement:** Strict CORS policy by default.

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Value("${security.allowed-origins:http://localhost:3000}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### NS-3: Rate Limiting

**Requirement:** Prevent abuse via rate limiting.

```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private final LoadingCache<String, Integer> requestCounts =
        CacheBuilder.newBuilder()
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .build(new CacheLoader<String, Integer>() {
                @Override
                public Integer load(String key) {
                    return 0;
                }
            });

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String clientId = getClientId(request);
        int count = requestCounts.get(clientId);

        if (count >= 100) {  // 100 requests per minute
            response.setStatus(429);  // Too Many Requests
            response.getWriter().write("Rate limit exceeded");
            return;
        }

        requestCounts.put(clientId, count + 1);
        filterChain.doFilter(request, response);
    }
}
```

---

## Database Security

### DB-1: Connection Security

**Requirement:** Database connections must use secure credentials.

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:5432/dna_db
    username: ${DB_USERNAME}  # No default - must be set
    password: ${DB_PASSWORD}  # No default - must be set
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 30000
```

**Validation:**
```java
@PostConstruct
public void validateDatabaseConfig() {
    if (dataSource.getUsername() == null ||
        dataSource.getPassword() == null) {
        throw new IllegalStateException(
            "DB_USERNAME and DB_PASSWORD must be set");
    }
}
```

### DB-2: SQL Injection Prevention

**Requirement:** All database queries use parameterized statements.

```java
// Good: Parameterized query
@Query("SELECT g FROM GenomicData g WHERE g.userId = :userId")
List<GenomicData> findByUserId(@Param("userId") String userId);

// Bad: String concatenation (SQL injection risk)
// NEVER DO THIS:
String sql = "SELECT * FROM genomic_data WHERE user_id = '" + userId + "'";
```

### DB-3: Principle of Least Privilege

**Requirement:** Database user has minimal required permissions.

```sql
-- Create restricted database user
CREATE USER dna_user WITH PASSWORD 'secure_password';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE genomic_data TO dna_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO dna_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dna_user;

-- Explicitly DENY dangerous permissions
REVOKE CREATE ON SCHEMA public FROM dna_user;
REVOKE DROP ON ALL TABLES IN SCHEMA public FROM dna_user;
```

---

## Authentication & Authorization

### AA-1: Password Security

**Requirements:**
- Minimum length: 12 characters
- Must contain: uppercase, lowercase, digit, special char
- Hashed with bcrypt (work factor 12)
- No password reuse (last 5 passwords)

**Implementation:**
```java
@Service
public class PasswordService {
    private static final int BCRYPT_WORK_FACTOR = 12;
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{12,}$"
    );

    public String hashPassword(String plaintext) {
        return BCrypt.hashpw(plaintext, BCrypt.gensalt(BCRYPT_WORK_FACTOR));
    }

    public boolean verifyPassword(String plaintext, String hashed) {
        return BCrypt.checkpw(plaintext, hashed);
    }

    public void validatePasswordStrength(String password) {
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new WeakPasswordException(
                "Password must be at least 12 characters and contain " +
                "uppercase, lowercase, digit, and special character");
        }
    }
}
```

### AA-2: Session Management

**Requirements:**
- JWT-based sessions
- 60-minute expiration (configurable)
- Refresh token rotation
- Logout invalidates token

```java
@Service
public class JWTService {
    @Value("${security.authentication.session-timeout-minutes:60}")
    private int sessionTimeoutMinutes;

    public String generateToken(User user) {
        Date expiration = Date.from(
            Instant.now().plus(sessionTimeoutMinutes, ChronoUnit.MINUTES)
        );

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("userId", user.getId())
                .claim("roles", user.getRoles())
                .setIssuedAt(new Date())
                .setExpiration(expiration)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}
```

---

## Audit & Logging

### AL-1: Security Event Logging

**Events to Log:**
-  Authentication attempts (success and failure)
-  File uploads (hash, size, user)
-  Data access (who accessed what)
-  Configuration changes
-  Encryption key usage
-  Failed authorization attempts

**Do NOT Log:**
-  Passwords (plaintext or hashed)
-  Genomic data content
-  Encryption keys
-  Session tokens

**Implementation:**
```java
@Service
@Slf4j
public class SecurityAuditLogger {
    public void logFileUpload(String userId, String filename,
                              String fileHash, long fileSize) {
        log.info("AUDIT: File uploaded - user={}, filename={}, hash={}, size={}",
                 userId, sanitizeFilename(filename), fileHash, fileSize);
    }

    public void logAuthenticationSuccess(String username, String ipAddress) {
        log.info("AUDIT: Authentication success - user={}, ip={}",
                 username, ipAddress);
    }

    public void logAuthenticationFailure(String username, String ipAddress,
                                        String reason) {
        log.warn("AUDIT: Authentication failure - user={}, ip={}, reason={}",
                 username, ipAddress, reason);
    }

    public void logDataAccess(String userId, String dataType, int recordCount) {
        log.info("AUDIT: Data access - user={}, type={}, count={}",
                 userId, dataType, recordCount);
    }
}
```

### AL-2: Audit Log Retention

**Requirements:**
- Retention period: 90 days (configurable)
- Tamper-evident (write-once storage)
- Searchable by user, date, event type

---

## Privacy Protections

### PP-1: GDPR Compliance

**Right to Erasure:**
```java
@Service
public class GDPRService {
    public void deleteUserData(String userId) {
        // Delete all user genomic data
        genomicDataRepository.deleteByUserId(userId);

        // Delete user account
        userRepository.deleteById(userId);

        // Audit log retention (required for legal compliance)
        // Audit logs anonymized after 90 days

        log.info("AUDIT: User data deleted - userId={}", userId);
    }
}
```

**Right to Data Portability:**
```java
public GenomicDataExport exportUserData(String userId) {
    List<GenomicData> data = genomicDataRepository.findByUserId(userId);
    return GenomicDataExport.builder()
            .userId(userId)
            .exportDate(LocalDateTime.now())
            .variants(data)
            .format("JSON")
            .build();
}
```

### PP-2: Data Minimization

**Principle:** Collect only what's necessary.

**Implementation:**
-  Don't store full VCF file (default)
-  Store only parsed variants
-  Store file hash (for deduplication)
-  Don't store IP addresses in database
-  Store user ID for audit (required)

---

## Testing Requirements

### Security Test Suite

```java
@SpringBootTest
public class SecurityTests {

    @Test
    public void testRawFileNotStoredByDefault() {
        // Verify STORE_RAW_UPLOADS=false works
    }

    @Test
    public void testFileHashComputed() {
        // Verify SHA-256 hash is computed correctly
    }

    @Test
    public void testFieldEncryption() {
        // Verify sensitive fields are encrypted at rest
    }

    @Test
    public void testRemoteLLMDisabledByDefault() {
        // Verify ENABLE_REMOTE_LLM=false prevents API calls
    }

    @Test
    public void testFileSizeLimitsEnforced() {
        // Verify large files are rejected
    }

    @Test
    public void testFilenameSanitization() {
        // Verify path traversal is prevented
    }

    @Test
    public void testPasswordStrengthValidation() {
        // Verify weak passwords are rejected
    }

    @Test
    public void testRateLimiting() {
        // Verify rate limits are enforced
    }

    @Test
    public void testSQLInjectionPrevention() {
        // Verify parameterized queries prevent injection
    }

    @Test
    public void testAuditLogging() {
        // Verify security events are logged
    }
}
```

---

## Compliance

### Educational/Research Use Only

**Disclaimer:** Required on all pages.

```
This tool is for educational and research purposes only.
Not for medical diagnosis, treatment, or clinical decision-making.
```

### No Medical Device Claims

-  Not FDA-approved
-  Not CE-marked
-  Not CLIA-certified
-  Explicitly labeled as non-diagnostic

### Data Protection

-  Local-first (data stays with user)
-  Encryption at rest
-  No external transmission (default)
-  User controls data export/deletion

---

## Implementation Checklist

### Phase 1: File Security 
- [ ] Implement file hash computation (SHA-256)
- [ ] Add STORE_RAW_UPLOADS configuration flag
- [ ] Implement file lifecycle manager
- [ ] Add filename sanitization
- [ ] Create security tests for file handling

### Phase 2: Encryption 
- [ ] Implement AESFieldEncryptor
- [ ] Add @Convert annotations to sensitive fields
- [ ] Configure encryption key management
- [ ] Test encryption/decryption performance

### Phase 3: Configuration 
- [ ] Add ENABLE_REMOTE_LLM flag
- [ ] Add ENABLE_EXTERNAL_APIS flag
- [ ] Validate configuration on startup
- [ ] Document all security flags

### Phase 4: Testing 
- [ ] Write 10+ security tests
- [ ] Test file disposal
- [ ] Test encryption
- [ ] Test configuration flags
- [ ] Test audit logging

### Phase 5: Documentation 
- [ ] Complete this specification
- [ ] Add security README
- [ ] Document key management
- [ ] Create security runbook

---

## Appendix A: Threat Scenarios

### Scenario 1: Database Dump Leaked

**Attack:** Database backup file leaked to public.

**Protections:**
-  Sensitive fields encrypted at rest
-  Passwords hashed with bcrypt
-  Attacker cannot read genomic data without encryption key
-  Attacker cannot use password hashes (bcrypt slow)

**Residual Risk:** LOW (if encryption key not leaked)

### Scenario 2: Insider Threat

**Attack:** Database administrator attempts to access user data.

**Protections:**
-  Field-level encryption prevents plaintext access
-  Audit logs record all data access
-  DBA can see encrypted data (useless without key)
-  DBA can see file hashes (not sensitive)

**Residual Risk:** MEDIUM (DBA could potentially access encryption key)

### Scenario 3: Malicious File Upload

**Attack:** User uploads malicious VCF file (e.g., zip bomb, XXE).

**Protections:**
-  File size limits prevent resource exhaustion
-  Parser only reads text files (no XML, no archives)
-  Streaming processing prevents memory exhaustion
-  Filename sanitization prevents path traversal

**Residual Risk:** LOW

---

## Appendix B: Key Rotation Procedure

1. Generate new encryption key
   ```bash
   openssl rand -base64 32
   ```

2. Set new key in environment
   ```bash
   export DB_ENCRYPTION_KEY_NEW=<new-key>
   ```

3. Run key rotation service
   ```java
   keyRotationService.rotateKey(newKey);
   ```

4. Service re-encrypts all data with new key

5. Remove old key from environment

---

**End of Specification**

**Version:** 1.0.0
**Author:** Security & Privacy Agent
**Date:** 2025-01-09
