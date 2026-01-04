> # HumanDNAVisualizer - Startup Scripts Guide

Quick reference for starting and stopping all services with a single command.

## Available Scripts

### Windows (.bat files)

| Script           | Description                           | Mode                    |
| ---------------- | ------------------------------------- | ----------------------- |
| `start-demo.bat` | Start all services in demo mode       | Development + Demo Mode |
| `start-all.bat`  | Start all services in production mode | Production              |
| `stop-all.bat`   | Stop all services and clean up memory | N/A                     |

### Linux/Mac (.sh files)

| Script          | Description                           | Mode                    |
| --------------- | ------------------------------------- | ----------------------- |
| `start-demo.sh` | Start all services in demo mode       | Development + Demo Mode |
| `start-all.sh`  | Start all services in production mode | Production              |
| `stop-all.sh`   | Stop all services and clean up memory | N/A                     |

## Quick Start

### Demo Mode (Recommended for Development)

**Windows:**

```bash
start-demo.bat
```

**Linux/Mac:**

```bash
chmod +x start-demo.sh
./start-demo.sh
```

**What it does:**

-  Starts backend with H2 in-memory database
-  Enables demo mode (auto-creates demo users)
-  Starts AI model service
-  Starts frontend (if available)
-  Opens 3 separate terminal windows

**Demo Features Enabled:**

- Auto-created users: `demo/demo123`, `admin/admin123`, `moderator/mod123`
- Quick registration API
- Relaxed password validation (6 chars minimum)
- H2 console accessible

### Production Mode

**Windows:**

```bash
start-all.bat
```

**Linux/Mac:**

```bash
chmod +x start-all.sh
./start-all.sh
```

**What it does:**

-  Starts backend with PostgreSQL (must be running)
-  Demo mode disabled
-  Starts AI model service
-  Starts frontend (if available)
-  Full production security

### Stop All Services

**Windows:**

```bash
stop-all.bat
```

**Linux/Mac:**

```bash
chmod +x stop-all.sh
./stop-all.sh
```

**What it does:**

-  Kills all processes on ports 8081, 8000, 3000
-  Stops Java (Spring Boot) processes
-  Stops Python (AI model) processes
-  Stops Node.js (Frontend) processes
-  Cleans up memory
-  Releases all ports

## Services Started

After running start scripts, the following services will be available:

| Service         | Port | URL                                   | Description              |
| --------------- | ---- | ------------------------------------- | ------------------------ |
| **Backend API** | 8081 | http://localhost:8081                 | Main API server          |
| **Swagger UI**  | 8081 | http://localhost:8081/swagger-ui.html | API documentation        |
| **AI Model**    | 8000 | http://localhost:8000                 | Trait prediction service |
| **AI Docs**     | 8000 | http://localhost:8000/docs            | AI API documentation     |
| **Frontend**    | 3000 | http://localhost:3000                 | React web application    |

### Demo Mode Only:

| Service         | Port | URL                                   | Description     |
| --------------- | ---- | ------------------------------------- | --------------- |
| **H2 Console**  | 8081 | http://localhost:8081/h2-console      | Database viewer |
| **Demo Status** | 8081 | http://localhost:8081/api/demo/status | Demo mode info  |

## What Each Script Does

### start-demo.bat / start-demo.sh

1. **Cleanup**: Kills existing processes on ports 8081, 8000, 3000
2. **Backend**: Starts with profile `dev` (H2 database, demo mode enabled)
3. **AI Model**: Starts trait predictor on port 8000
4. **Frontend**: Starts React dev server on port 3000
5. **Output**: Shows all URLs and demo credentials

**Demo Users Auto-Created:**

- Username: `demo`, Password: `demo123`, Role: USER
- Username: `admin`, Password: `admin123`, Roles: ADMIN, MODERATOR, USER
- Username: `moderator`, Password: `mod123`, Roles: MODERATOR, USER

### start-all.bat / start-all.sh

1. **Cleanup**: Kills existing processes on ports 8081, 8000, 3000
2. **Backend**: Starts with profile `prod` (PostgreSQL, demo mode disabled)
3. **AI Model**: Starts trait predictor on port 8000
4. **Frontend**: Starts React production build on port 3000
5. **Output**: Shows all URLs

**Requirements for Production:**

- PostgreSQL must be running
- Database `dna_db` must exist
- User `dna_user` with password `dna_password` configured

### stop-all.bat / stop-all.sh

**Windows Process:**

1. Finds processes on ports 8081, 8000, 3000 using `netstat`
2. Kills each process with `taskkill /F`
3. Kills remaining Node.js processes
4. Kills remaining Python processes (trait_predictor)
5. Kills remaining Java processes (Spring Boot)
6. Waits 2 seconds for cleanup

**Linux/Mac Process:**

1. Finds processes on ports using `lsof`
2. Kills each process with `kill -9`
3. Kills remaining Node.js processes using `pgrep`
4. Kills remaining Python processes (trait_predictor)
5. Kills remaining Java processes (Spring Boot)
6. Waits 2 seconds for cleanup

## Troubleshooting

### Ports Already in Use

**Symptom**: "Port already in use" error

**Solution**: Run stop script first:

```bash
stop-all.bat  # Windows
./stop-all.sh  # Linux/Mac
```

Then start again.

### Backend Fails to Start

**Symptom**: Backend window closes immediately

**Possible Causes:**

1. Java 17 not installed
2. Maven not installed
3. PostgreSQL not running (production mode)

**Solution**:

```bash
# Check Java version
java -version  # Should be 17+

# Check Maven
mvn -version

# For production mode, start PostgreSQL
docker-compose up -d postgres
```

### AI Model Fails to Start

**Symptom**: AI model window closes immediately

**Possible Causes:**

1. Python not installed
2. Dependencies not installed
3. Port 8000 already in use

**Solution**:

```bash
# Check Python
python --version  # Should be 3.8+

# Install dependencies
cd ai-model
pip install -r requirements.txt

# Check port
netstat -ano | findstr :8000  # Windows
lsof -i:8000  # Linux/Mac
```

### Frontend Fails to Start

**Symptom**: "package.json not found" warning

**Solution**:

```bash
cd frontend
npm install
```

### Script Doesn't Run (Linux/Mac)

**Symptom**: "Permission denied"

**Solution**:

```bash
chmod +x start-demo.sh
chmod +x start-all.sh
chmod +x stop-all.sh
```

### Services Don't Stop Cleanly

**Symptom**: Ports still in use after running stop script

**Solution**:

**Windows:**

```bash
# Manually kill processes
FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :8081') DO taskkill /PID %P /F
FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :8000') DO taskkill /PID %P /F
FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :3000') DO taskkill /PID %P /F
```

**Linux/Mac:**

```bash
# Manually kill processes
lsof -ti:8081 | xargs kill -9
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

## Development Workflow

### Typical Demo Workflow

1. **Start services:**

   ```bash
   start-demo.bat
   ```

2. **Work on your features**

3. **Test in browser:**

   - Frontend: http://localhost:3000
   - Swagger: http://localhost:8081/swagger-ui.html

4. **Stop when done:**
   ```bash
   stop-all.bat
   ```

### Hot Reload Support

**Frontend**: Changes auto-reload (npm run dev)
**Backend**: Restart required (or use Spring DevTools)
**AI Model**: Restart required

## Environment Variables

The scripts use default configurations, but you can override:

**Backend:**

- Profile set via `-Dspring-boot.run.profiles=dev` or `prod`
- Other vars in `.env` file

**AI Model:**

- Uses default port 8000
- Modify in `trait_predictor.py`

**Frontend:**

- Uses default port 3000
- Configure in `vite.config.js` or `package.json`

## Advanced Usage

### Run Individual Services

If you want to start services separately:

**Backend Only:**

```bash
cd backend/dna-integrator
run-dev.bat  # or run-dev.sh
```

**AI Model Only:**

```bash
cd ai-model
run-dev.bat  # or run-dev.sh
```

**Frontend Only:**

```bash
cd frontend
npm run dev
```

### Background Execution (Linux/Mac)

To run services in background without terminals:

```bash
# Start backend
cd backend/dna-integrator
nohup mvn spring-boot:run -Dspring-boot.run.profiles=dev > backend.log 2>&1 &

# Start AI model
cd ai-model
nohup python trait_predictor.py > ai-model.log 2>&1 &

# Start frontend
cd frontend
nohup npm run dev > frontend.log 2>&1 &
```

Check logs:

```bash
tail -f backend/dna-integrator/backend.log
tail -f ai-model/ai-model.log
tail -f frontend/frontend.log
```

## Summary

**For Quick Demo:**

```bash
start-demo.bat  # Auto-creates demo users, enables quick features
```

**For Production Testing:**

```bash
start-all.bat  # Full security, requires PostgreSQL
```

**To Clean Up:**

```bash
stop-all.bat  # Kills all processes, releases ports
```

All scripts are idempotent - safe to run multiple times!
