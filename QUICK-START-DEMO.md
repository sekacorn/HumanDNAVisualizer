# Quick Start Guide - Demo Mode

Get your demo running in **under 5 minutes**!

## Step 1: Start the Backend (1 minute)

```bash
cd backend/dna-integrator
./run-dev.bat  # Windows
# or
./run-dev.sh   # Linux/Mac
```

**What happens:**
- Backend starts on http://localhost:8081
- Demo mode is automatically enabled
- Three demo users are auto-created:
  - `demo` / `demo123` (USER)
  - `admin` / `admin123` (ADMIN)
  - `moderator` / `mod123` (MODERATOR)

## Step 2: Verify Demo Mode (30 seconds)

Open your browser and visit:
```
http://localhost:8081/api/demo/status
```

You should see:
```json
{
  "enabled": true,
  "message": "DEMO MODE ACTIVE - For development and testing only",
  "demoUsers": {
    "demo": { "username": "demo", "password": "demo123", "role": "USER" },
    "admin": { "username": "admin", "password": "admin123", "role": "ADMIN" },
    "moderator": { "username": "moderator", "password": "mod123", "role": "MODERATOR" }
  }
}
```

## Step 3: Try the Demo Features (3 minutes)

### Option A: Use Swagger UI (Easiest)

1. **Open Swagger**: http://localhost:8081/swagger-ui.html

2. **Find Demo Mode section** (scroll down)

3. **Try Quick Login**:
   - Expand `POST /api/demo/login-demo-user`
   - Click "Try it out"
   - Enter:
     ```json
     {
       "username": "demo",
       "password": "demo123"
     }
     ```
   - Click "Execute"
   - **Copy the JWT token** from the response

4. **Authorize with the token**:
   - Click the "Authorize" button (top of page)
   - Paste your token
   - Click "Authorize"

5. **Try uploading data**:
   - Find `POST /api/data/upload/vcf`
   - Upload `backend/sample-data/sample.vcf`
   - Set userId to "demo"
   - Execute!

### Option B: Use Frontend (If Available)

1. **Add demo mode detection** to your login page:

```javascript
// Check if demo mode is available
fetch('http://localhost:8081/api/demo/status')
  .then(res => res.json())
  .then(data => {
    if (data.enabled) {
      console.log('Demo mode active!');
      console.log('Demo users:', data.demoUsers);
    }
  });
```

2. **Add quick login button**:

```jsx
<button onClick={async () => {
  const response = await fetch('http://localhost:8081/api/demo/login-demo-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'demo', password: 'demo123' })
  });

  const data = await response.json();
  localStorage.setItem('token', data.token);
  window.location.href = '/dashboard';
}}>
  Quick Login (Demo)
</button>
```

3. **Add quick registration**:

```jsx
<button onClick={async () => {
  const response = await fetch('http://localhost:8081/api/demo/quick-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'myuser',
      password: 'pass123'
    })
  });

  const data = await response.json();
  localStorage.setItem('token', data.token);
  window.location.href = '/dashboard';
}}>
  Quick Register (Demo)
</button>
```

### Option C: Use cURL

```bash
# 1. Quick login
curl -X POST http://localhost:8081/api/demo/login-demo-user \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'

# 2. Copy the token from the response

# 3. Use the token to upload data
TOKEN="your_token_here"

curl -X POST http://localhost:8081/api/data/upload/vcf \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@backend/sample-data/sample.vcf" \
  -F "userId=demo"
```

## Common Demo Scenarios

### Scenario 1: Demo Presentation

**Goal**: Show the app to stakeholders

1. Start backend: `./run-dev.bat`
2. Open Swagger UI: http://localhost:8081/swagger-ui.html
3. Login as admin: `admin` / `admin123`
4. Show data upload feature
5. Show different user roles (demo, moderator, admin)

### Scenario 2: Frontend Development

**Goal**: Test frontend without complex registration

1. Start backend in dev mode
2. Check demo mode: `GET /api/demo/status`
3. Use quick register to create test users on-the-fly
4. Test different user flows

### Scenario 3: Quick Testing

**Goal**: Test new features quickly

1. Login as demo user: `demo` / `demo123`
2. Or create new user: Quick register with any username
3. Test your feature
4. Restart backend to reset data (H2 in-memory)

## Frontend Integration Checklist

- [ ] Add demo mode detection on app load
- [ ] Show demo mode banner when enabled
- [ ] Add "Quick Login" buttons for demo users
- [ ] Add "Quick Register" option
- [ ] Hide demo features when demo mode is disabled
- [ ] Store JWT token after login/registration
- [ ] Redirect to dashboard after successful auth

## Quick Frontend Example

```jsx
import { useState, useEffect } from 'react';

function App() {
  const [demoMode, setDemoMode] = useState(false);
  const [demoUsers, setDemoUsers] = useState(null);

  useEffect(() => {
    // Check demo mode on load
    fetch('http://localhost:8081/api/demo/status')
      .then(res => res.json())
      .then(data => {
        setDemoMode(data.enabled);
        setDemoUsers(data.demoUsers);
      });
  }, []);

  const quickLogin = async (username, password) => {
    const response = await fetch('http://localhost:8081/api/demo/login-demo-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    localStorage.setItem('token', data.token);
    // Redirect to dashboard
  };

  return (
    <div>
      {demoMode && (
        <div className="demo-banner">
          <h3>Demo Mode Active</h3>
          {demoUsers && Object.values(demoUsers).map(user => (
            <button
              key={user.username}
              onClick={() => quickLogin(user.username, user.password)}
            >
              Login as {user.username}
            </button>
          ))}
        </div>
      )}

      {/* Rest of your app */}
    </div>
  );
}
```

## Production Deployment

**IMPORTANT**: Demo mode is automatically disabled in production!

When you deploy:

1. Use production profile: `--spring.profiles.active=prod`
2. Demo mode will be disabled automatically
3. All demo endpoints return 403 Forbidden
4. Frontend should hide demo UI (check `enabled: false`)

Verify in production:
```bash
curl https://your-production-url/api/demo/status
# Should return: { "enabled": false }
```

## Need More Help?

- **Comprehensive Guide**: See `DEMO-MODE-GUIDE.md`
- **Frontend Integration**: See `frontend/DEMO-MODE-INTEGRATION.md`
- **API Documentation**: Visit http://localhost:8081/swagger-ui.html
- **All API Examples**: See `backend/API-EXAMPLES.md`

## Summary

Demo mode gives you:
- **Pre-created users** for instant testing
- **Quick registration** from your GUI
- **Easy detection** via status endpoint
- **Auto-disabled** in production
- **Zero configuration** needed

**You're ready to demo!**
