# Demo Mode Feature - Implementation Summary

## What Was Implemented

A comprehensive **Demo Mode** feature that allows easy user registration and login through the GUI for local development, while automatically disabling these features in production.

## Key Features

### 1. Auto-Created Demo Users

When the backend starts in dev mode, three users are automatically created:

| Username    | Password   | Roles                  |
| ----------- | ---------- | ---------------------- |
| `demo`      | `demo123`  | USER                   |
| `admin`     | `admin123` | ADMIN, MODERATOR, USER |
| `moderator` | `mod123`   | MODERATOR, USER        |

### 2. Quick Registration API

- **Endpoint**: `POST /api/demo/quick-register`
- **Input**: Just username and password (minimum 6 characters)
- **Output**: JWT token (user is auto-logged in)
- **Auto-generates**: Email address (`username@demo.local`)
- **Auto-assigns**: USER role

### 3. Demo Mode Detection

- **Endpoint**: `GET /api/demo/status`
- Frontend can check if demo mode is enabled
- Returns demo user credentials when enabled
- Returns `enabled: false` in production

### 4. Quick Login API

- **Endpoint**: `POST /api/demo/login-demo-user`
- Login with pre-created demo users
- Returns JWT token immediately

### 5. Environment-Based Configuration

- **Development** (`application-dev.yml`): Demo mode **ENABLED**
- **Production** (`application.yml`): Demo mode **DISABLED**
- Controlled by Spring profiles

## Files Created/Modified

### Backend Files Created:

1. **`config/DemoModeConfig.java`** - Configuration class for demo mode settings
2. **`service/DemoModeService.java`** - Business logic for demo features
3. **`controller/DemoController.java`** - REST endpoints for demo operations
4. **`dto/QuickRegisterRequest.java`** - DTO for quick registration
5. **`dto/LoginRequest.java`** - DTO for login requests

### Configuration Files Modified:

6. **`application-dev.yml`** - Added demo mode configuration (ENABLED)
7. **`application.yml`** - Added demo mode configuration (DISABLED)

### Documentation Created:

8. **`DEMO-MODE-GUIDE.md`** - Comprehensive guide for demo mode
9. **`DEMO-MODE-SUMMARY.md`** - This file
10. **`frontend/DEMO-MODE-INTEGRATION.md`** - Frontend integration guide with React examples

## How It Works

### Development Mode (Enabled)

```yaml
# application-dev.yml
app:
  demo-mode:
    enabled: true
    auto-create-demo-users: true
    relaxed-password-policy: true
    expose-demo-credentials: true
```

**On Startup:**

1. Demo users are automatically created
2. `/api/demo/*` endpoints become available
3. Demo credentials are exposed via API

**From Frontend:**

1. Check demo mode: `GET /api/demo/status`
2. Show "Quick Login" buttons if enabled
3. Allow quick registration with minimal fields
4. Users are auto-logged in after registration

### Production Mode (Disabled)

```yaml
# application.yml
app:
  demo-mode:
    enabled: false
    auto-create-demo-users: false
    relaxed-password-policy: false
    expose-demo-credentials: false
```

**Behavior:**

- All `/api/demo/*` endpoints return 403 Forbidden
- No demo users are created
- Regular authentication flow required
- Full password validation enforced

## API Endpoints

### 1. Check Demo Mode Status

```
GET /api/demo/status
```

**Response (Dev Mode):**

```json
{
  "enabled": true,
  "message": "DEMO MODE ACTIVE - For development and testing only",
  "demoUsers": {
    "demo": {
      "username": "demo",
      "password": "demo123",
      "role": "USER"
    },
    "admin": {
      "username": "admin",
      "password": "admin123",
      "role": "ADMIN"
    },
    "moderator": {
      "username": "moderator",
      "password": "mod123",
      "role": "MODERATOR"
    }
  }
}
```

**Response (Production):**

```json
{
  "enabled": false,
  "message": "Demo mode is disabled"
}
```

### 2. Quick Register

```
POST /api/demo/quick-register
Content-Type: application/json

{
  "username": "testuser",
  "password": "test123"
}
```

**Response:**

```json
{
  "message": "Demo user registered and logged in successfully",
  "username": "testuser",
  "email": "testuser@demo.local",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "type": "Bearer",
  "roles": ["USER"],
  "demoMode": true
}
```

### 3. Quick Login

```
POST /api/demo/login-demo-user
Content-Type: application/json

{
  "username": "demo",
  "password": "demo123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "type": "Bearer",
  "username": "demo",
  "email": "demo@example.com",
  "roles": ["USER"],
  "demoMode": true,
  "message": "Demo user logged in successfully"
}
```

## Frontend Integration

### Basic Usage

```javascript
// 1. Check if demo mode is available
const response = await fetch('http://localhost:8081/api/demo/status');
const { enabled, demoUsers } = await response.json();

if (enabled) {
  // 2. Show demo UI elements
  showDemoLoginButtons(demoUsers);
}

// 3. Quick login
const loginResponse = await fetch('http://localhost:8081/api/demo/login-demo-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'demo', password: 'demo123' })
});

const { token } = await loginResponse.json();
localStorage.setItem('token', token);

// 4. Quick register
const registerResponse = await fetch('http://localhost:8081/api/demo/quick-register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'myuser', password: 'pass123' })
});

const data = await registerResponse.json();
localStorage.setItem('token', data.token); // Auto-logged in!
```

### React Component Example

```jsx
const DemoModeButtons = () => {
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8081/api/demo/status')
      .then(res => res.json())
      .then(data => setDemoMode(data.enabled));
  }, []);

  if (!demoMode) return null;

  return (
    <div className="demo-quick-actions">
      <button onClick={() => quickLogin('demo', 'demo123')}>
        Quick Login as Demo
      </button>
      <button onClick={() => quickLogin('admin', 'admin123')}>
        Quick Login as Admin
      </button>
    </div>
  );
};
```

## Security Features

### Development Safety

- Demo mode explicitly marked in responses
- Weak passwords allowed ONLY in demo mode
- Auto-generated emails use `.local` domain
- All demo features clearly labeled

### Production Security

- Demo mode disabled by default in production config
- All demo endpoints return 403 when disabled
- Strong password validation enforced
- No credential exposure
- No auto-user creation

## Testing

### Manual Testing

1. **Start in Dev Mode:**

   ```bash
   cd backend/dna-integrator
   ./run-dev.bat
   ```

2. **Check Demo Status:**

   ```bash
   curl http://localhost:8081/api/demo/status
   ```

   Should return `enabled: true`

3. **Quick Login:**

   ```bash
   curl -X POST http://localhost:8081/api/demo/login-demo-user \
     -H "Content-Type: application/json" \
     -d '{"username":"demo","password":"demo123"}'
   ```

4. **Quick Register:**
   ```bash
   curl -X POST http://localhost:8081/api/demo/quick-register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"test123"}'
   ```

### Swagger UI Testing

Visit: http://localhost:8081/swagger-ui.html

1. Expand **"Demo Mode"** section
2. Try `GET /api/demo/status`
3. Try `POST /api/demo/quick-register`
4. Copy the token from response
5. Click "Authorize" and paste token
6. Test authenticated endpoints

## Configuration Reference

### Demo Mode Settings

| Setting                   | Dev Value | Prod Value | Description              |
| ------------------------- | --------- | ---------- | ------------------------ |
| `enabled`                 | `true`    | `false`    | Enable/disable demo mode |
| `skip-email-verification` | `true`    | `false`    | Skip email verification  |
| `auto-assign-user-role`   | `true`    | `false`    | Auto-assign USER role    |
| `relaxed-password-policy` | `true`    | `false`    | Allow 6 char passwords   |
| `expose-demo-credentials` | `true`    | `false`    | Show credentials in API  |
| `auto-create-demo-users`  | `true`    | `false`    | Create users on startup  |

## Environment Variables

Override via environment variables if needed:

```bash
# Disable demo mode (overrides YAML)
export APP_DEMO_MODE_ENABLED=false

# Or in Docker
docker run -e APP_DEMO_MODE_ENABLED=false dna-integrator
```

## Benefits

### For Developers

- **Quick Setup**: Zero-config demo users on startup
- **Fast Testing**: Quick login without complex registration
- **Minimal Input**: Just username and password for demos
- **Auto-Login**: Users logged in immediately after registration

### For Demos/Presentations

- **Pre-Created Users**: Ready-to-use accounts for different roles
- **Quick Showcase**: Show features without setup delays
- **GUI Integration**: Easy frontend integration with detection API
- **Instant Access**: One-click login for presentations

### For Production

- **Secure by Default**: Demo mode disabled in production
- **No Backdoors**: All demo features properly locked down
- **Full Validation**: Strict password and registration rules
- **Clear Separation**: Development vs production configs

## Migration Path

### Existing Projects

1. **Add dependencies** (already in pom.xml)
2. **Copy config files**:

   - `DemoModeConfig.java`
   - `DemoModeService.java`
   - `DemoController.java`
   - `QuickRegisterRequest.java`
   - `LoginRequest.java`

3. **Update YAML files**:

   - Add demo mode config to `application.yml` (disabled)
   - Add demo mode config to `application-dev.yml` (enabled)

4. **Update frontend**:
   - Add demo mode detection
   - Show quick login buttons when enabled
   - Use quick register for simplified flow

## Future Enhancements

Potential additions:

- [ ] Demo mode toggle via admin UI
- [ ] Custom demo user creation via API
- [ ] Demo data auto-population
- [ ] Time-limited demo sessions
- [ ] Demo mode analytics/metrics

## Troubleshooting

### Demo Mode Not Working

**Symptom**: Demo endpoints return 403

**Solution**:

```bash
# Check active profile
curl http://localhost:8081/api/demo/status

# Ensure running with dev profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Demo Users Not Created

**Symptom**: Demo users don't exist

**Solution**:

```bash
# Manually trigger creation
curl -X POST http://localhost:8081/api/demo/create-demo-users
```

### Frontend Not Detecting Demo Mode

**Symptom**: UI doesn't show demo features

**Solution**:

```javascript
// Check CORS settings
// Verify backend is running on localhost:8081
// Check browser console for errors
fetch('http://localhost:8081/api/demo/status')
  .then(res => res.json())
  .then(console.log);
```

## Documentation

- **Complete Guide**: `DEMO-MODE-GUIDE.md`
- **Frontend Integration**: `frontend/DEMO-MODE-INTEGRATION.md`
- **API Examples**: `backend/API-EXAMPLES.md`
- **Backend README**: `backend/dna-integrator/README.md`

## Summary

Demo mode is now **fully implemented** and ready to use:

- Auto-creates demo users on startup (dev mode only)
- Provides quick registration API for GUI
- Quick login with pre-created users
- Frontend can detect and adapt to demo mode
- Completely disabled in production by default
- Fully documented with examples

**To use**: Just start the backend in dev mode and the frontend can detect demo mode via the status endpoint!
