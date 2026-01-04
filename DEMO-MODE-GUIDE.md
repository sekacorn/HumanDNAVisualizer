# Demo Mode - User Guide

## Overview

Demo Mode is a special feature designed for local development and demonstrations that simplifies user registration and provides pre-configured test users. This allows you to quickly showcase the application without going through complex registration flows.

## Security Notice

**IMPORTANT: Demo mode is DISABLED by default in production and MUST remain disabled in any production environment.**

## Features

When demo mode is enabled, you get:

- **Auto-created demo users** on application startup
- **Quick registration** with minimal validation
- **Relaxed password requirements** (6 characters minimum vs 8 in production)
- **Exposed credentials** via API for easy testing
- **Auto-assigned USER role** for new registrations
- **Skip email verification**

## Configuration

### Development Mode (Enabled)

Demo mode is **enabled by default** when running with the `dev` profile.

**File**: `src/main/resources/application-dev.yml`

```yaml
app:
  demo-mode:
    enabled: true                        # Enable demo mode
    skip-email-verification: true
    auto-assign-user-role: true
    relaxed-password-policy: true
    expose-demo-credentials: true
    auto-create-demo-users: true
    banner-message: "DEMO MODE ACTIVE - For development and testing only"
```

### Production Mode (Disabled)

Demo mode is **disabled by default** in production.

**File**: `src/main/resources/application.yml`

```yaml
app:
  demo-mode:
    enabled: false                       # MUST be false in production
    skip-email-verification: false
    auto-assign-user-role: false
    relaxed-password-policy: false
    expose-demo-credentials: false
    auto-create-demo-users: false
```

## Pre-Created Demo Users

When demo mode is enabled, three users are automatically created:

| Username | Password | Role(s) | Description |
|----------|----------|---------|-------------|
| `demo` | `demo123` | USER | Standard user for testing |
| `admin` | `admin123` | ADMIN, MODERATOR, USER | Full administrative access |
| `moderator` | `mod123` | MODERATOR, USER | Moderator privileges |

## API Endpoints

Demo mode provides special endpoints under `/api/demo`:

### 1. Check Demo Mode Status

```bash
GET /api/demo/status
```

**Response (Demo Mode Enabled):**
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

**Response (Demo Mode Disabled):**
```json
{
  "enabled": false,
  "message": "Demo mode is disabled"
}
```

### 2. Quick Register (Demo Mode Only)

```bash
POST /api/demo/quick-register
Content-Type: application/json

{
  "username": "myuser",
  "password": "pass123"
}
```

**Response:**
```json
{
  "message": "Demo user registered and logged in successfully",
  "username": "myuser",
  "email": "myuser@demo.local",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "roles": ["USER"],
  "demoMode": true
}
```

**Features:**
- Automatically generates email: `{username}@demo.local`
- Auto-assigns USER role
- Returns JWT token immediately (auto-login)
- Minimal validation (6 character password)

### 3. Login with Demo User

```bash
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "demo",
  "email": "demo@example.com",
  "roles": ["USER"],
  "demoMode": true,
  "message": "Demo user logged in successfully"
}
```

### 4. Get Demo Credentials

```bash
GET /api/demo/credentials
```

Returns all demo user credentials for easy reference.

### 5. Manually Create Demo Users

```bash
POST /api/demo/create-demo-users
```

Creates the standard demo users if they don't exist.

## Frontend Integration

### React Example

```javascript
// Check if demo mode is available
const checkDemoMode = async () => {
  const response = await fetch('http://localhost:8081/api/demo/status');
  const data = await response.json();

  if (data.enabled) {
    console.log('Demo mode is active!');
    console.log('Available users:', data.demoUsers);
    return true;
  }
  return false;
};

// Quick register in demo mode
const quickRegister = async (username, password) => {
  const response = await fetch('http://localhost:8081/api/demo/quick-register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok) {
    // User is automatically logged in
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    return data;
  } else {
    throw new Error(data.message || 'Registration failed');
  }
};

// Login with pre-created demo user
const loginDemoUser = async (username, password) => {
  const response = await fetch('http://localhost:8081/api/demo/login-demo-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    return data;
  } else {
    throw new Error(data.message || 'Login failed');
  }
};
```

### Demo Mode UI Component Example

```jsx
import React, { useState, useEffect } from 'react';

const DemoModeIndicator = () => {
  const [demoMode, setDemoMode] = useState(null);
  const [demoUsers, setDemoUsers] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8081/api/demo/status')
      .then(res => res.json())
      .then(data => {
        setDemoMode(data.enabled);
        setDemoUsers(data.demoUsers);
      });
  }, []);

  if (!demoMode) return null;

  return (
    <div className="demo-mode-banner">
      <h3>Demo Mode Active</h3>
      <p>Quick login with these credentials:</p>
      <ul>
        {Object.values(demoUsers || {}).map(user => (
          <li key={user.username}>
            <strong>{user.username}</strong> / {user.password} ({user.role})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DemoModeIndicator;
```

### Demo Button Component

```jsx
const DemoLoginButton = ({ username, password }) => {
  const handleDemoLogin = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/demo/login-demo-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Demo login failed:', error);
    }
  };

  return (
    <button onClick={handleDemoLogin} className="demo-login-btn">
      Quick Login as {username}
    </button>
  );
};
```

## Using Demo Mode

### Scenario 1: Quick Demo with Pre-Created Users

1. **Start the backend** in dev mode:
   ```bash
   cd backend/dna-integrator
   ./run-dev.bat  # or run-dev.sh on Linux/Mac
   ```

2. **Users are auto-created** on startup:
   - `demo` / `demo123`
   - `admin` / `admin123`
   - `moderator` / `mod123`

3. **Login via Swagger UI**:
   - Go to http://localhost:8081/swagger-ui.html
   - Use `POST /api/demo/login-demo-user`
   - Enter credentials: `{"username":"demo","password":"demo123"}`
   - Copy the JWT token
   - Click "Authorize" and paste the token

4. **Or login from your frontend** using the demo login API

### Scenario 2: Quick Registration from GUI

1. **Check demo mode status** from your frontend:
   ```javascript
   GET http://localhost:8081/api/demo/status
   ```

2. **Show a "Quick Register" form** if demo mode is enabled

3. **User enters** just username and password (no email required)

4. **Call quick register endpoint**:
   ```javascript
   POST http://localhost:8081/api/demo/quick-register
   {
     "username": "testuser",
     "password": "test123"
   }
   ```

5. **User is automatically logged in** and receives a JWT token

6. **Redirect to dashboard** with the token

### Scenario 3: Demo Mode Button in UI

Add a special button in your login page:

```jsx
{demoMode && (
  <div className="demo-quick-actions">
    <h3>Demo Mode - Quick Start</h3>
    <button onClick={() => loginAs('demo', 'demo123')}>
      Login as Demo User
    </button>
    <button onClick={() => loginAs('admin', 'admin123')}>
      Login as Admin
    </button>
    <button onClick={() => showQuickRegister()}>
      Quick Register New User
    </button>
  </div>
)}
```

## Swagger UI Integration

When you visit http://localhost:8081/swagger-ui.html in demo mode:

1. You'll see a new **"Demo Mode"** section in the API documentation
2. All demo endpoints are listed with examples
3. You can try quick registration directly from the browser
4. Demo user credentials are displayed in the API description

## Troubleshooting

### Demo Mode Not Working

**Problem**: Demo endpoints return 403 Forbidden

**Solution**: Check that you're running with the `dev` profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Demo Users Not Created

**Problem**: Demo users don't exist after startup

**Solution**:
1. Check logs for "Demo mode enabled - Creating demo users..."
2. Verify `auto-create-demo-users: true` in `application-dev.yml`
3. Manually create users:
   ```bash
   POST http://localhost:8081/api/demo/create-demo-users
   ```

### Quick Registration Fails

**Problem**: Quick registration returns "Demo mode is disabled"

**Solution**:
1. Verify `app.demo-mode.enabled: true` in active profile
2. Check which profile is active in startup logs
3. Explicitly set profile: `export SPRING_PROFILES_ACTIVE=dev`

### Demo Mode Active in Production

**Problem**: Demo mode features accessible in production

**Solution**:
1. **IMMEDIATELY** check `application.yml` has `enabled: false`
2. Restart with production profile: `--spring.profiles.active=prod`
3. Verify with: `GET /api/demo/status` should return `enabled: false`

## Security Considerations

### Development
- Demo mode enabled for convenience
- Weak passwords allowed (6 characters)
- Auto-created users for testing
- Credentials exposed via API

### Production
- Demo mode MUST be disabled
- Strong passwords required (8+ characters)
- No auto-created users
- No credential exposure
- Email verification required

### Best Practices

1. **Never enable demo mode in production**
2. **Use environment variables** to control demo mode if needed
3. **Monitor demo mode status** in production deployments
4. **Remove demo users** before production deployment
5. **Audit logs** will show when demo features are used

## Environment Variable Override

You can override demo mode settings via environment variables:

```bash
# Disable demo mode via environment variable (overrides YAML)
export APP_DEMO_MODE_ENABLED=false

# Or in Docker
docker run -e APP_DEMO_MODE_ENABLED=false dna-integrator
```

## Summary

Demo mode provides a streamlined experience for local development and demonstrations:

- **For Development**: Auto-creates test users, simplifies registration
- **For Demos**: Quick user creation from GUI, no complex forms
- **For Production**: Completely disabled, full security enforced

The frontend can detect demo mode via the `/api/demo/status` endpoint and show appropriate UI elements (quick login buttons, simplified registration) when demo mode is active.

---

**Remember**: Demo mode is a development convenience feature. Always ensure it's disabled in production!
