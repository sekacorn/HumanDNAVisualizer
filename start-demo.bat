@echo off
REM ============================================
REM HumanDNAVisualizer - Start Demo Mode
REM ============================================
REM Starts Backend (with demo mode), AI Model, and Frontend
REM Demo Features: Auto-created users, Quick registration, Relaxed validation

echo.
echo ============================================
echo   HumanDNAVisualizer - Starting DEMO MODE
echo ============================================
echo.
echo Mode: DEVELOPMENT
echo Demo Mode: ENABLED
echo.
echo Demo Users:
echo   - demo / demo123 (USER)
echo   - admin / admin123 (ADMIN)
echo   - moderator / mod123 (MODERATOR)
echo.

REM Kill any existing processes on the required ports
echo [1/4] Cleaning up existing processes...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :8081') DO taskkill /PID %%P /F >nul 2>&1
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :8000') DO taskkill /PID %%P /F >nul 2>&1
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3000') DO taskkill /PID %%P /F >nul 2>&1
timeout /t 2 /nobreak >nul
echo    Done!
echo.

REM Start Backend (Development mode with demo features)
echo [2/4] Starting Backend Service (Port 8081) - DEMO MODE...
cd "%~dp0backend\dna-integrator"
start "DNA Backend - DEMO MODE" cmd /k "mvn spring-boot:run -Dspring-boot.run.profiles=dev"
echo    Backend starting in new window...
echo    - H2 Console: http://localhost:8081/h2-console
echo    - Demo API: http://localhost:8081/api/demo/status
echo.

REM Wait for backend to initialize
timeout /t 10 /nobreak >nul

REM Start AI Model Service
echo [3/4] Starting AI Model Service (Port 8000)...
cd "%~dp0ai-model"
start "AI Model Service" cmd /k "python trait_predictor.py"
echo    AI Model starting in new window...
echo.

REM Wait for AI service to initialize
timeout /t 5 /nobreak >nul

REM Start Frontend
echo [4/4] Starting Frontend (Port 3000)...
cd "%~dp0frontend"
if exist "package.json" (
    start "DNA Frontend" cmd /k "npm run dev"
    echo    Frontend starting in new window...
) else (
    echo    Warning: Frontend package.json not found!
    echo    Please run 'npm install' in the frontend directory first.
)
echo.

echo ============================================
echo   DEMO MODE - All Services Started!
echo ============================================
echo.
echo   Backend:  http://localhost:8081
echo   AI Model: http://localhost:8000
echo   Frontend: http://localhost:3000
echo.
echo   Swagger:  http://localhost:8081/swagger-ui.html
echo   AI Docs:  http://localhost:8000/docs
echo   H2 DB:    http://localhost:8081/h2-console
echo.
echo   Demo Features:
echo   - Quick Login: http://localhost:8081/api/demo/login-demo-user
echo   - Quick Register: http://localhost:8081/api/demo/quick-register
echo   - Demo Status: http://localhost:8081/api/demo/status
echo.
echo   Demo Users (auto-created):
echo   - demo / demo123 (USER)
echo   - admin / admin123 (ADMIN)
echo   - moderator / mod123 (MODERATOR)
echo.
echo   Mode: DEVELOPMENT (Demo mode enabled)
echo.
echo   To stop all services, run: stop-all.bat
echo ============================================
echo.
pause
