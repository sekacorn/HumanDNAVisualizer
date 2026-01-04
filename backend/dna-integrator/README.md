# DNA Integrator Service - Backend

The DNA Integrator Service is a Spring Boot microservice that handles genomic data ingestion, user authentication, and security for the HumanDNAVisualizer platform.

## Features

- **JWT Authentication** with role-based access control (ADMIN, MODERATOR, USER)
- **Multi-Factor Authentication (MFA)** using TOTP/Google Authenticator
- **Data Parsers** for VCF, FHIR R4, and CSV formats
- **AES-256-GCM Encryption** service for sensitive data
- **Audit Logging** for compliance (HIPAA/GDPR)
- **H2 In-Memory Database** for local development
- **PostgreSQL** support for production

## Prerequisites

- **Java 17** or higher
- **Maven 3.6+** (or use the included Maven wrapper)
- **Docker** (optional, for PostgreSQL)

## Quick Start (Development Mode)

### 1. Clone and Navigate

```bash
cd backend/dna-integrator
```

### 2. Run with H2 In-Memory Database

```bash
# Linux/Mac
./run-dev.sh

# Windows
run-dev.bat

# Or manually with Maven
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The service will start on **http://localhost:8081**

### 3. Access H2 Console

While the application is running, access the H2 database console:

- **URL**: http://localhost:8081/h2-console
- **JDBC URL**: `jdbc:h2:mem:dna_db`
- **Username**: `sa`
- **Password**: (leave empty)

### 4. Test the API

See [API Examples](#api-examples) below for sample requests.

## Configuration

### Development Mode (application-dev.yml)

- **Database**: H2 in-memory (auto-creates schema)
- **Port**: 8081
- **CORS**: Allows localhost:3000, 3005, 3006
- **JWT Secret**: Development key (insecure, for testing only)
- **Logging**: DEBUG level for security and application code
- **Schema**: Auto-created on startup, dropped on shutdown

### Production Mode (application.yml)

- **Database**: PostgreSQL (requires Docker or external DB)
- **Port**: 8081
- **CORS**: Configurable via `ALLOWED_ORIGINS` environment variable
- **JWT Secret**: Must set `JWT_SECRET` environment variable
- **Schema**: Auto-updated (Hibernate ddl-auto: update)

## API Endpoints

### Authentication

| Method | Endpoint | Description | Public |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Yes |
| POST | `/api/auth/login` | Login and get JWT token | Yes |
| POST | `/api/auth/mfa/enable` | Enable MFA/TOTP | No |
| POST | `/api/auth/mfa/verify` | Verify MFA code | No |

### Data Upload

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/data/upload/vcf` | Upload VCF genomic data | Yes (JWT) |
| POST | `/api/data/upload/fhir` | Upload FHIR health records | Yes (JWT) |
| POST | `/api/data/upload/csv` | Upload environmental CSV | Yes (JWT) |
| GET | `/api/data/genomic/{userId}` | Get genomic data | Yes (JWT) |
| GET | `/api/data/phenotypic/{userId}` | Get phenotypic data | Yes (JWT) |
| GET | `/api/data/environmental/{userId}` | Get environmental data | Yes (JWT) |

### Health & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actuator/health` | Health check |
| GET | `/actuator/info` | Application info |
| GET | `/actuator/metrics` | Metrics (auth required) |

## API Examples

### 1. Register a New User

```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "username": "testuser"
}
```

### 2. Login

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "testuser",
  "email": "test@example.com",
  "roles": ["USER"]
}
```

### 3. Upload VCF File

```bash
# Save your JWT token from login
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:8081/api/data/upload/vcf \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@sample.vcf" \
  -F "userId=testuser"
```

**Response:**
```json
{
  "message": "VCF file uploaded and parsed successfully",
  "recordCount": 42,
  "userId": "testuser",
  "dataType": "genomic"
}
```

### 4. Upload FHIR JSON

```bash
curl -X POST http://localhost:8081/api/data/upload/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @sample-fhir.json
```

### 5. Upload Environmental CSV

```bash
curl -X POST http://localhost:8081/api/data/upload/csv \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@environmental.csv" \
  -F "userId=testuser"
```

### 6. Get Genomic Data

```bash
curl -X GET http://localhost:8081/api/data/genomic/testuser \
  -H "Authorization: Bearer $TOKEN"
```

## Sample Data Files

Sample data files are located in `backend/sample-data/`:

- **sample.vcf** - Small VCF file with genomic variants
- **sample-fhir.json** - FHIR R4 Observation resource
- **environmental.csv** - Environmental/lifestyle survey data

## Database Schema

The application uses the following tables:

- **users** - User accounts and authentication
- **user_roles** - User role mappings (USER, MODERATOR, ADMIN)
- **genomic_data** - Parsed VCF/FASTA/PDB genomic data
- **phenotypic_data** - FHIR health records
- **environmental_data** - Lifestyle and environmental surveys
- **audit_logs** - Security and compliance audit trail

Schema is automatically created in H2 mode. For PostgreSQL, see `database/postgres/schema.sql`.

## Security Features

### Authentication & Authorization

- **JWT Tokens**: 24-hour expiration
- **Password Hashing**: BCrypt with strength 10
- **Role-Based Access**: USER, MODERATOR, ADMIN roles
- **MFA/TOTP**: Optional two-factor authentication

### Data Protection

- **Encryption**: AES-256-GCM for sensitive genomic data (service available, integration pending)
- **CORS**: Configurable allowed origins
- **Input Validation**: Bean validation on all DTOs
- **SQL Injection Protection**: JPA/Hibernate parameterized queries

### Compliance

- **HIPAA Aligned**: Audit logging, encryption at rest/transit
- **GDPR Ready**: User data export/deletion capabilities (endpoints pending)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | `dev` | Active Spring profile (dev/prod) |
| `DB_USERNAME` | `dna_user` | PostgreSQL username |
| `DB_PASSWORD` | `dna_password` | PostgreSQL password |
| `JWT_SECRET` | (dev key) | JWT signing secret (MUST set in prod) |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allowed origins |
| `SERVER_PORT` | `8081` | Application port |

## Troubleshooting

### Port Already in Use

If port 8081 is already in use:

```bash
# Change port
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8082

# Or set environment variable
export SERVER_PORT=8082
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Database Connection Failed

In dev mode, ensure you're using the `dev` profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

For PostgreSQL production mode, ensure Docker container is running:

```bash
docker-compose up -d postgres
```

### JWT Token Invalid

Tokens expire after 24 hours. Login again to get a new token.

### H2 Console Access Denied

Ensure the application is running with the `dev` profile. H2 console is disabled in production.

## Development

### Project Structure

```
src/main/java/com/dna/integrator/
├── DNAIntegratorApp.java       # Main application
├── config/
│   └── SecurityConfig.java     # Security & CORS
├── controller/
│   ├── AuthController.java     # Authentication endpoints
│   └── DataUploadController.java
├── dto/
│   └── DataUploadResponse.java
├── model/
│   ├── User.java               # User entity
│   ├── Role.java               # Role enum
│   ├── GenomicData.java
│   ├── PhenotypicData.java
│   ├── EnvData.java
│   └── AuditLog.java
├── repository/                 # JPA repositories
├── security/
│   ├── JwtUtil.java
│   ├── JwtAuthenticationFilter.java
│   ├── CustomUserDetailsService.java
│   └── EncryptionService.java
└── service/
    ├── VCFParserService.java
    ├── FHIRParserService.java
    ├── CSVParserService.java
    └── MFAService.java
```

### Running Tests

```bash
mvn test
```

### Building for Production

```bash
mvn clean package
java -jar target/dna-integrator-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Docker Build

```bash
docker build -t dna-integrator .
docker run -p 8081:8081 -e SPRING_PROFILES_ACTIVE=prod dna-integrator
```

## Roadmap

- [ ] Complete audit logging integration
- [ ] Integrate encryption service for genomic data
- [ ] Add global exception handler
- [ ] Implement account lockout logic
- [ ] Add Swagger/OpenAPI documentation
- [ ] Create comprehensive test suite
- [ ] Add GDPR data export/deletion endpoints
- [ ] Implement SSO integration (OAuth2)

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Submit a pull request

## License

MIT License - See parent project for details

## Support

For issues or questions, see the main project documentation or create an issue on GitHub.
