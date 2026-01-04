# HumanDNAVisualizer - Demo Setup Guide

This guide will help you quickly set up and run the HumanDNAVisualizer backend in development mode for demonstration purposes.

## What's Been Added for Demo

The following improvements have been made to make the backend demo-ready:

### 1. Database Test Users
- **Location**: `database/postgres/test_users.sql`
- **Users Created**:
  - `admin` / `password123` (ADMIN, MODERATOR, USER roles)
  - `moderator` / `password123` (MODERATOR, USER roles)
  - `testuser` / `password123` (USER role)

### 2. User Entity Fix
- Made `firstName` and `lastName` fields nullable to allow demo registration without full user details
- **File Modified**: `backend/dna-integrator/src/main/java/com/dna/integrator/model/User.java`

### 3. Sample Data Files
- **Location**: `backend/sample-data/`
- **Files**:
  - `sample.vcf` - VCF genomic data with 28 genetic variants
  - `sample-fhir.json` - FHIR R4 health records (blood glucose, blood pressure, cholesterol, BMI)
  - `environmental.csv` - Lifestyle/environmental survey data

### 4. Development Scripts
- **Linux/Mac**: `backend/dna-integrator/run-dev.sh`
- **Windows**: `backend/dna-integrator/run-dev.bat`
- One-command startup with H2 in-memory database

### 5. Comprehensive Documentation
- **Backend README**: `backend/dna-integrator/README.md`
- **API Examples**: `backend/API-EXAMPLES.md`
- Complete API documentation with curl examples

### 6. Swagger/OpenAPI Integration
- Interactive API documentation at `http://localhost:8081/swagger-ui.html`
- Try endpoints directly from the browser
- Automatic JWT authentication support

### 7. Global Exception Handler
- Consistent error responses across all endpoints
- Custom exceptions for common scenarios
- Detailed validation error messages

## Quick Start (5 Minutes)

### Prerequisites

- **Java 17** or higher
- **Maven 3.6+**

Check your Java version:
```bash
java -version
```

### Step 1: Navigate to Backend

```bash
cd backend/dna-integrator
```

### Step 2: Run Development Server

**Linux/Mac:**
```bash
chmod +x run-dev.sh
./run-dev.sh
```

**Windows:**
```bash
run-dev.bat
```

**Or manually:**
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Step 3: Verify It's Running

Open your browser and check:
- **Health Check**: http://localhost:8081/actuator/health
- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **H2 Console**: http://localhost:8081/h2-console

Expected health check response:
```json
{
  "status": "UP"
}
```

## Demo Workflow

### Option 1: Using Swagger UI (Recommended for Demo)

1. **Open Swagger UI**: http://localhost:8081/swagger-ui.html

2. **Register a User**:
   - Expand `auth-controller` > `POST /api/auth/register`
   - Click "Try it out"
   - Use this JSON:
   ```json
   {
     "username": "demo",
     "email": "demo@example.com",
     "password": "demo123456"
   }
   ```
   - Click "Execute"

3. **Login**:
   - Expand `POST /api/auth/login`
   - Click "Try it out"
   - Use:
   ```json
   {
     "username": "demo",
     "password": "demo123456"
   }
   ```
   - Click "Execute"
   - **Copy the JWT token from the response**

4. **Authorize Swagger**:
   - Click the "Authorize" button at the top
   - Paste your token (just the token, not "Bearer ")
   - Click "Authorize"

5. **Upload Sample Data**:
   - Try `POST /api/data/upload/vcf`
   - Upload `backend/sample-data/sample.vcf`
   - Set userId to "demo"

6. **Retrieve Data**:
   - Try `GET /api/data/genomic/{userId}`
   - Use userId "demo"
   - See your genomic data!

### Option 2: Using cURL (Command Line)

Full workflow script available in `backend/API-EXAMPLES.md`, or run these commands:

```bash
# 1. Register
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com","password":"demo123456"}'

# 2. Login (save the token!)
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123456"}'

# 3. Set your token as environment variable
export TOKEN="your_jwt_token_here"

# 4. Upload VCF
curl -X POST http://localhost:8081/api/data/upload/vcf \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@backend/sample-data/sample.vcf" \
  -F "userId=demo"

# 5. Get genomic data
curl -X GET http://localhost:8081/api/data/genomic/demo \
  -H "Authorization: Bearer $TOKEN"
```

### Option 3: Using Postman

1. Import the curl commands from `backend/API-EXAMPLES.md`
2. Create a Postman environment with:
   - `base_url`: `http://localhost:8081`
   - `token`: (will be set automatically)
3. Follow the workflow in the API Examples documentation

## Database Access

### H2 Console (In-Memory Database)

While the dev server is running:

1. Open: http://localhost:8081/h2-console
2. **JDBC URL**: `jdbc:h2:mem:dna_db`
3. **Username**: `sa`
4. **Password**: (leave empty)
5. Click "Connect"

You can now query the database:

```sql
-- See all users
SELECT * FROM users;

-- See user roles
SELECT u.username, ur.role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id;

-- See genomic data
SELECT * FROM genomic_data;
```

## Demo Features to Showcase

### 1. Authentication & Security
- JWT-based authentication
- Role-based access control
- MFA/TOTP support (enable via `/api/auth/mfa/enable`)
- BCrypt password hashing

### 2. Data Ingestion
- **VCF Parser**: Handles genomic variants from 23andMe, AncestryDNA
- **FHIR Parser**: Processes health records (R4 compliant)
- **CSV Parser**: Environmental/lifestyle data

### 3. API Documentation
- Interactive Swagger UI
- Try endpoints without writing code
- Built-in authentication testing

### 4. Error Handling
- Consistent error responses
- Detailed validation messages
- User-friendly error descriptions

### 5. Monitoring
- Health checks at `/actuator/health`
- Application metrics at `/actuator/metrics`
- Prometheus integration ready

## Troubleshooting

### Port 8081 Already in Use

```bash
# Find what's using the port
# Windows
netstat -ano | findstr :8081

# Linux/Mac
lsof -i :8081

# Or change the port
mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dspring-boot.run.arguments=--server.port=8082
```

### Maven Not Found

Install Maven or use Maven wrapper (if available):
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Java Version Issues

Ensure Java 17 or higher:
```bash
java -version

# If wrong version, set JAVA_HOME
export JAVA_HOME=/path/to/java17
```

### H2 Console Not Loading

Ensure you're running with the `dev` profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Demo Talking Points

When demonstrating the backend:

1. **Zero Configuration**: "Works out of the box with H2 in-memory database"

2. **Production Ready**: "Same code runs in production with PostgreSQL, just change the profile"

3. **Security First**: "JWT authentication, role-based access, MFA support, BCrypt encryption"

4. **Standards Compliant**: "FHIR R4 for health data, VCF for genomics, fully interoperable"

5. **Developer Friendly**: "Swagger UI for testing, comprehensive error messages, detailed logging"

6. **Scalable Architecture**: "Microservice design, stateless authentication, ready for cloud deployment"

## Next Steps

After the demo:

1. **Add Tests**: Create unit and integration tests
2. **Complete Audit Logging**: Integrate audit logs into controllers
3. **Enable Encryption**: Hook up EncryptionService for genomic data
4. **Add GDPR Endpoints**: User data export/deletion
5. **Production Deployment**: Docker Compose with PostgreSQL
6. **Frontend Integration**: Connect to React frontend on port 3000

## Production Deployment

For production setup:

1. Set environment variables:
```bash
export SPRING_PROFILES_ACTIVE=prod
export DB_USERNAME=your_db_user
export DB_PASSWORD=your_db_password
export JWT_SECRET=your_secure_secret_key_min_256_bits
export ALLOWED_ORIGINS=https://yourdomain.com
```

2. Build and run:
```bash
mvn clean package
java -jar target/dna-integrator-1.0.0.jar
```

3. Or use Docker:
```bash
docker build -t dna-integrator .
docker run -p 8081:8081 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_USERNAME=dna_user \
  -e DB_PASSWORD=secure_password \
  dna-integrator
```

## Resources

- **Backend README**: `backend/dna-integrator/README.md`
- **API Examples**: `backend/API-EXAMPLES.md`
- **Sample Data**: `backend/sample-data/`
- **Test Users SQL**: `database/postgres/test_users.sql`
- **Main Project README**: `README.md`

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the comprehensive README files
- Check Swagger UI for API documentation
- Review logs in the console output

---

**Ready to Demo!** Start the server and navigate to http://localhost:8081/swagger-ui.html
