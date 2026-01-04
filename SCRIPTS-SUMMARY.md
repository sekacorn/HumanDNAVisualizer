# Startup Scripts - Quick Reference

## What Was Created

**6 Scripts** created at the project root to manage all services:

### Windows Scripts (.bat)

1. **start-demo.bat** - Start in demo mode (development)
2. **start-all.bat** - Start in production mode
3. **stop-all.bat** - Stop all services cleanly

### Linux/Mac Scripts (.sh)

4. **start-demo.sh** - Start in demo mode (development)
5. **start-all.sh** - Start in production mode
6. **stop-all.sh** - Stop all services cleanly

## Quick Commands

### For Demo/Development

**Windows:**

```bash
start-demo.bat  # Start all services with demo mode
stop-all.bat    # Stop everything
```

**Linux/Mac:**

```bash
./start-demo.sh  # Start all services with demo mode
./stop-all.sh    # Stop everything
```

### For Production

**Windows:**

```bash
start-all.bat   # Start all services in production
stop-all.bat    # Stop everything
```

**Linux/Mac:**

```bash
./start-all.sh  # Start all services in production
./stop-all.sh   # Stop everything
```

## What Each Mode Does

### Demo Mode (start-demo)

**Services Started:**

-  Backend API (Port 8081) - Development profile
  - H2 in-memory database
  - Demo mode enabled
  - uto-creates: demo/demo123, admin/admin123, moderator/mod123
- AI Model (Port 8000)
- Frontend (Port 3000) - if available

**Features:**

- Quick registration (6 char password)
- Pre-created demo users
- H2 console: http://localhost:8081/h2-console
- Demo API: http://localhost:8081/api/demo/status

### Production Mode (start-all)

**Services Started:**

- Backend API (Port 8081) - Production profile
  - PostgreSQL database (must be running)
  - Demo mode disabled
  - Full security validation
- AI Model (Port 8000)
- Frontend (Port 3000) - if available

**Requirements:**

- PostgreSQL running
- Database `dna_db` created
- User `dna_user` with password configured

### Stop Mode (stop-all)

**What It Does:**

1. Kills processes on ports 8081, 8000, 3000
2. Stops Java (Spring Boot) processes
3. Stops Python (AI model) processes
4. Stops Node.js (Frontend) processes
5. Cleans memory
6. Releases all ports

## Services & URLs

After starting, access:

| Service      | URL                                   | Description          |
| ------------ | ------------------------------------- | -------------------- |
| Backend API  | http://localhost:8081                 | Main REST API        |
| Swagger UI   | http://localhost:8081/swagger-ui.html | API Documentation    |
| AI Model     | http://localhost:8000                 | Trait Predictions    |
| AI Docs      | http://localhost:8000/docs            | AI API Docs          |
| Frontend     | http://localhost:3000                 | Web Interface        |
| H2 Console\* | http://localhost:8081/h2-console      | Database (demo only) |

\*Demo mode only

## Script Behavior

### Process Management

**Start Scripts:**

1. Clean up existing processes on ports 8081, 8000, 3000
2. Start backend in new terminal window
3. Wait 10 seconds for backend initialization
4. Start AI model in new terminal window
5. Wait 5 seconds for AI initialization
6. Start frontend in new terminal window
7. Display all URLs and credentials

**Stop Script:**

1. Find all processes using ports 8081, 8000, 3000
2. Kill each process forcefully
3. Kill remaining Node.js processes
4. Kill remaining Python processes (trait_predictor)
5. Kill remaining Java processes (Spring Boot)
6. Wait 2 seconds for cleanup
7. Confirm all services stopped

### Terminal Windows

Each service runs in its own terminal window:

- **Backend**: "DNA Backend - DEMO MODE" or "DNA Backend - Production"
- **AI Model**: "AI Model Service"
- **Frontend**: "DNA Frontend"

This allows you to see logs for each service independently.

## Demo Mode Features

When using `start-demo`:

### Auto-Created Users

- **demo** / **demo123** - Regular user (USER role)
- **admin** / **admin123** - Administrator (ADMIN, MODERATOR, USER roles)
- **moderator** / **mod123** - Moderator (MODERATOR, USER roles)

### Demo Endpoints

- `GET /api/demo/status` - Check demo mode status and get credentials
- `POST /api/demo/quick-register` - Register with just username+password
- `POST /api/demo/login-demo-user` - Quick login with demo user

### Database Access

- **H2 Console**: http://localhost:8081/h2-console
- **JDBC URL**: `jdbc:h2:mem:dna_db`
- **Username**: `sa`
- **Password**: (empty)

## Common Issues

### Port Already in Use

**Error**: "Port 8081 is already in use"

**Solution**:

```bash
stop-all.bat  # or ./stop-all.sh
# Then start again
```

### Backend Won't Start

**Check:**

1. Java 17+ installed: `java -version`
2. Maven installed: `mvn -version`
3. For production: PostgreSQL running

### AI Model Won't Start

**Check:**

1. Python 3.8+ installed: `python --version`
2. Dependencies installed: `pip install -r ai-model/requirements.txt`

### Frontend Won't Start

**Check:**

1. Node.js 18+ installed: `node -v`
2. Dependencies installed: `cd frontend && npm install`

### Script Won't Run (Linux/Mac)

**Error**: "Permission denied"

**Solution**:

```bash
chmod +x start-demo.sh
chmod +x start-all.sh
chmod +x stop-all.sh
```

## File Locations

All scripts are at the **project root**:

```
HumanDNAVisualizer/
├── start-demo.bat       # Windows demo mode
├── start-demo.sh        # Linux/Mac demo mode
├── start-all.bat        # Windows production
├── start-all.sh         # Linux/Mac production
├── stop-all.bat         # Windows stop
├── stop-all.sh          # Linux/Mac stop
├── STARTUP-SCRIPTS-GUIDE.md  # Detailed guide
└── SCRIPTS-SUMMARY.md   # This file
```

## Integration with Existing Scripts

Individual service scripts still work:

**Backend:**

```bash
cd backend/dna-integrator
run-dev.bat  # or ./run-dev.sh
```

**AI Model:**

```bash
cd ai-model
run-dev.bat  # or ./run-dev.sh
```

**Frontend:**

```bash
cd frontend
npm run dev
```

The root-level scripts just orchestrate all of these together.

## Development Workflow

**Typical workflow:**

1. **Start services:**

   ```bash
   start-demo.bat
   ```

2. **Work on your code**

   - Backend changes require restart
   - Frontend has hot reload
   - AI model changes require restart

3. **Test in browser:**

   - Frontend: http://localhost:3000
   - Swagger: http://localhost:8081/swagger-ui.html
   - AI Docs: http://localhost:8000/docs

4. **Stop when done:**
   ```bash
   stop-all.bat
   ```

## Memory Management

The stop script ensures clean shutdown:

1. **Process Termination**: All processes killed with force flag
2. **Port Release**: Ports 8081, 8000, 3000 freed immediately
3. **Memory Cleanup**: OS reclaims memory from terminated processes
4. **No Orphans**: Searches for and kills related child processes

**Safe to run multiple times** - Script is idempotent.

## Documentation

- **Detailed Guide**: [STARTUP-SCRIPTS-GUIDE.md](STARTUP-SCRIPTS-GUIDE.md)
- **Demo Mode**: [DEMO-MODE-GUIDE.md](DEMO-MODE-GUIDE.md)
- **Quick Start**: [QUICK-START-DEMO.md](QUICK-START-DEMO.md)
- **Main README**: [README.md](README.md)

## Summary

**One command to start everything:**

- `start-demo.bat` for development with demo features
- `start-all.bat` for production testing

**One command to stop everything:**

- `stop-all.bat` for clean shutdown

**Cross-platform support:**

- `.bat` files for Windows
- `.sh` files for Linux/Mac

All scripts handle:

-  Port cleanup
-  Process management
-  Memory cleanup
-  Error handling
-  Clear status messages


