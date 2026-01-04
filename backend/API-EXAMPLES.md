# DNA Integrator API Examples

This document provides comprehensive examples for interacting with the DNA Integrator Service API.

## Base URL

- **Development**: `http://localhost:8081`
- **Production**: Configure as needed

## Authentication Flow

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

**Response (200 OK):**
```json
{
  "message": "User registered successfully",
  "username": "testuser"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Username already exists"
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

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTY0MTIzNDU2NywiZXhwIjoxNjQxMzIwOTY3fQ.abc123...",
  "type": "Bearer",
  "username": "testuser",
  "email": "test@example.com",
  "roles": ["USER"]
}
```

**Save the token for subsequent requests:**
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Multi-Factor Authentication (MFA)

### 3. Enable MFA

```bash
curl -X POST http://localhost:8081/api/auth/mfa/enable \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "message": "MFA enabled. Scan QR code with Google Authenticator"
}
```

### 4. Verify MFA Code

```bash
curl -X POST http://localhost:8081/api/auth/mfa/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456"
  }'
```

**Response (200 OK):**
```json
{
  "message": "MFA verified successfully"
}
```

## Data Upload Operations

### 5. Upload VCF (Genomic Data)

```bash
curl -X POST http://localhost:8081/api/data/upload/vcf \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@backend/sample-data/sample.vcf" \
  -F "userId=testuser"
```

**Response (200 OK):**
```json
{
  "message": "VCF file uploaded and parsed successfully",
  "recordCount": 28,
  "userId": "testuser",
  "dataType": "genomic"
}
```

**Example VCF Format:**
```
##fileformat=VCFv4.2
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO
1	10177	rs367896724	A	AC	100	PASS	AF=0.425
1	11008	rs575272151	C	G	95	PASS	AF=0.169
```

### 6. Upload FHIR (Phenotypic/Health Data)

```bash
curl -X POST http://localhost:8081/api/data/upload/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @backend/sample-data/sample-fhir.json
```

**Response (200 OK):**
```json
{
  "message": "FHIR data parsed successfully",
  "recordCount": 4,
  "userId": "testuser",
  "dataType": "phenotypic"
}
```

**Example FHIR Resource:**
```json
{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "2339-0",
      "display": "Glucose [Mass/volume] in Blood"
    }]
  },
  "valueQuantity": {
    "value": 5.4,
    "unit": "mmol/L"
  }
}
```

### 7. Upload CSV (Environmental/Lifestyle Data)

```bash
curl -X POST http://localhost:8081/api/data/upload/csv \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@backend/sample-data/environmental.csv" \
  -F "userId=testuser"
```

**Response (200 OK):**
```json
{
  "message": "CSV data uploaded successfully",
  "recordCount": 1,
  "userId": "testuser",
  "dataType": "environmental"
}
```

**Example CSV Format:**
```csv
diet,exercise_frequency,smoking_status,alcohol_consumption,sleep_hours,stress_level,occupation,location
Mediterranean,5 times per week,Never,Moderate,7-8 hours,Low,Software Engineer,Urban
```

## Data Retrieval Operations

### 8. Get Genomic Data

```bash
curl -X GET http://localhost:8081/api/data/genomic/testuser \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": "testuser",
    "fileFormat": "VCF",
    "chromosome": "1",
    "position": 10177,
    "referenceAllele": "A",
    "alternateAllele": "AC",
    "quality": 100.0,
    "annotations": "{\"AF\":\"0.425\",\"DB\":\"true\"}",
    "uploadedAt": "2026-01-04T12:30:00"
  },
  {
    "id": 2,
    "userId": "testuser",
    "fileFormat": "VCF",
    "chromosome": "1",
    "position": 11008,
    "referenceAllele": "C",
    "alternateAllele": "G",
    "quality": 95.0,
    "annotations": "{\"AF\":\"0.169\",\"DB\":\"true\"}",
    "uploadedAt": "2026-01-04T12:30:00"
  }
]
```

### 9. Get Phenotypic Data

```bash
curl -X GET http://localhost:8081/api/data/phenotypic/testuser \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": "testuser",
    "resourceType": "Observation",
    "category": "laboratory",
    "code": "2339-0",
    "value": "5.4",
    "unit": "mmol/L",
    "recordedAt": "2026-01-04T09:30:00"
  },
  {
    "id": 2,
    "userId": "testuser",
    "resourceType": "Observation",
    "category": "vital-signs",
    "code": "85354-9",
    "value": "120/80",
    "unit": "mmHg",
    "recordedAt": "2026-01-04T09:30:00"
  }
]
```

### 10. Get Environmental Data

```bash
curl -X GET http://localhost:8081/api/data/environmental/testuser \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": "testuser",
    "diet": "Mediterranean",
    "exerciseFrequency": "5 times per week",
    "smokingStatus": "Never",
    "alcoholConsumption": "Moderate (1-2 drinks/week)",
    "sleepHours": "7-8 hours",
    "stressLevel": "Low",
    "occupation": "Software Engineer",
    "location": "Urban",
    "surveyedAt": "2026-01-04T12:35:00"
  }
]
```

## Health & Monitoring

### 11. Health Check

```bash
curl -X GET http://localhost:8081/actuator/health
```

**Response (200 OK):**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    },
    "diskSpace": {
      "status": "UP"
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

### 12. Application Info

```bash
curl -X GET http://localhost:8081/actuator/info
```

**Response (200 OK):**
```json
{
  "app": {
    "name": "DNA Integrator Service",
    "version": "0.0.1-SNAPSHOT",
    "description": "Genomic data integration and authentication service"
  }
}
```

## Testing with Postman

### Import cURL as Request

1. Open Postman
2. Click "Import" > "Raw text"
3. Paste any cURL command from above
4. Click "Import"

### Create Environment Variables

Create a Postman environment with:

```json
{
  "name": "DNA Integrator Dev",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:8081",
      "enabled": true
    },
    {
      "key": "token",
      "value": "",
      "enabled": true
    }
  ]
}
```

### Auto-Update Token After Login

In the login request, add to "Tests" tab:

```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
```

## Error Responses

### 401 Unauthorized

```json
{
  "timestamp": "2026-01-04T12:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired JWT token",
  "path": "/api/data/genomic/testuser"
}
```

### 403 Forbidden

```json
{
  "timestamp": "2026-01-04T12:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. Insufficient permissions.",
  "path": "/api/admin/users"
}
```

### 400 Bad Request

```json
{
  "timestamp": "2026-01-04T12:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": {
    "password": "must be at least 8 characters",
    "email": "must be a valid email address"
  }
}
```

## Rate Limiting

Current implementation: No rate limiting (planned for future)

Recommended limits for production:
- Authentication endpoints: 5 requests/minute
- Data upload: 10 requests/minute
- Data retrieval: 100 requests/minute

## CORS Configuration

**Development**: Allows `localhost:3000`, `localhost:3005`, `localhost:3006`

**Production**: Set via `ALLOWED_ORIGINS` environment variable:

```bash
export ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## Complete Workflow Example

Here's a complete workflow from registration to data analysis:

```bash
#!/bin/bash

BASE_URL="http://localhost:8081"

# 1. Register
echo "Registering user..."
curl -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com","password":"demo123456"}'

# 2. Login and save token
echo "Logging in..."
RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123456"}')

TOKEN=$(echo $RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

# 3. Upload VCF
echo "Uploading genomic data..."
curl -X POST $BASE_URL/api/data/upload/vcf \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@backend/sample-data/sample.vcf" \
  -F "userId=demo"

# 4. Upload FHIR
echo "Uploading health records..."
curl -X POST $BASE_URL/api/data/upload/fhir \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @backend/sample-data/sample-fhir.json

# 5. Upload CSV
echo "Uploading environmental data..."
curl -X POST $BASE_URL/api/data/upload/csv \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@backend/sample-data/environmental.csv" \
  -F "userId=demo"

# 6. Retrieve all data
echo "Fetching genomic data..."
curl -X GET $BASE_URL/api/data/genomic/demo \
  -H "Authorization: Bearer $TOKEN"

echo "Fetching phenotypic data..."
curl -X GET $BASE_URL/api/data/phenotypic/demo \
  -H "Authorization: Bearer $TOKEN"

echo "Fetching environmental data..."
curl -X GET $BASE_URL/api/data/environmental/demo \
  -H "Authorization: Bearer $TOKEN"

echo "Workflow complete!"
```

Save as `test-workflow.sh` and run:

```bash
chmod +x test-workflow.sh
./test-workflow.sh
```

## Security Best Practices

1. **Never commit JWT tokens** to version control
2. **Use HTTPS** in production
3. **Rotate JWT secrets** regularly
4. **Enable MFA** for sensitive accounts
5. **Set token expiration** appropriately (default: 24 hours)
6. **Validate file uploads** on client and server
7. **Use environment variables** for sensitive configuration

## Troubleshooting

### Token Expired
**Error**: "Invalid or expired JWT token"
**Solution**: Login again to get a new token

### CORS Error
**Error**: "Access to fetch blocked by CORS policy"
**Solution**: Ensure your frontend origin is in the allowed origins list

### File Too Large
**Error**: "Maximum upload size exceeded"
**Solution**: Current limit is 100MB. Split large files or adjust `spring.servlet.multipart.max-file-size`

### Database Connection Failed
**Error**: "Failed to connect to database"
**Solution**: In dev mode, ensure H2 is enabled. In prod mode, check PostgreSQL is running

## Additional Resources

- [FHIR R4 Documentation](https://hl7.org/fhir/R4/)
- [VCF Format Specification](https://samtools.github.io/hts-specs/VCFv4.2.pdf)
- [Spring Boot Security](https://spring.io/guides/gs/securing-web/)
- [JWT.io](https://jwt.io/) - Decode and verify JWT tokens
