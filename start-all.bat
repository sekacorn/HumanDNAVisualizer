@echo off
setlocal enabledelayedexpansion
REM ============================================
REM HumanDNAVisualizer - Start All Services
REM ============================================
REM Starts Backend, AI Model, and Frontend
REM Mode: Development (Demo mode enabled, H2 in-memory database)

echo.
echo ============================================
echo   HumanDNAVisualizer - Starting All Services
echo ============================================
echo.
echo Mode: DEVELOPMENT
echo Demo Mode: ENABLED (H2 in-memory database)
echo.

REM Kill any existing processes on the required ports
echo [1/4] Cleaning up existing processes...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :8081') DO taskkill /PID %%P /F >nul 2>&1
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :8000') DO taskkill /PID %%P /F >nul 2>&1
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3000') DO taskkill /PID %%P /F >nul 2>&1
timeout /t 2 /nobreak >nul
echo    Done!
echo.

REM Start Backend (Development mode with H2 database)
echo [2/4] Starting Backend Service (Port 8081)...
cd "%~dp0backend\dna-integrator"
if not exist "pom.xml" (
    echo    ERROR: Backend pom.xml not found!
    echo    Please ensure you're in the correct directory.
    goto :error
)
start "DNA Backend - Development" cmd /k "mvn spring-boot:run -Dspring-boot.run.profiles=dev"
echo    Backend starting in new window...
echo    Waiting for backend to initialize (up to 30 seconds)...
echo.

REM Wait for backend to be ready (check port 8081)
set BACKEND_READY=0
for /L %%i in (1,1,30) do (
    timeout /t 1 /nobreak >nul
    netstat -ano | findstr :8081 | findstr LISTENING >nul 2>&1
    if !errorlevel! equ 0 (
        set BACKEND_READY=1
        echo    Backend is ready! ^(took %%i seconds^)
        goto :backend_ready
    )
    if %%i equ 30 (
        echo    Warning: Backend may not be ready yet. Continuing anyway...
    )
)
:backend_ready
echo.

REM Start AI Model Service
echo [3/4] Starting AI Model Service (Port 8000)...
cd "%~dp0ai-model"
if not exist "trait_predictor.py" (
    echo    ERROR: trait_predictor.py not found!
    echo    Please ensure the AI model directory exists.
    goto :error
)
start "AI Model Service" cmd /k "python trait_predictor.py"
echo    AI Model starting in new window...
echo    Waiting for AI service to initialize (up to 20 seconds)...
echo.

REM Wait for AI service to be ready (check port 8000)
set AI_READY=0
for /L %%i in (1,1,20) do (
    timeout /t 1 /nobreak >nul
    netstat -ano | findstr :8000 | findstr LISTENING >nul 2>&1
    if !errorlevel! equ 0 (
        set AI_READY=1
        echo    AI Model is ready! ^(took %%i seconds^)
        goto :ai_ready
    )
    if %%i equ 20 (
        echo    Warning: AI Model may not be ready yet. Continuing anyway...
    )
)
:ai_ready
echo.

REM Start Frontend
echo [4/4] Starting Frontend (Port 3000)...
cd "%~dp0frontend"
if not exist "package.json" (
    echo    ERROR: Frontend package.json not found!
    echo    Please ensure the frontend directory exists.
    goto :error
)
if not exist "node_modules\" (
    echo    Warning: node_modules not found. Running npm install...
    call npm install
    if !errorlevel! neq 0 (
        echo    ERROR: npm install failed!
        goto :error
    )
)
start "DNA Frontend" cmd /k "npm run dev"
echo    Frontend starting in new window...
echo    Waiting for frontend to initialize (up to 15 seconds)...
echo.

REM Wait for frontend to be ready (check port 3000)
set FRONTEND_READY=0
for /L %%i in (1,1,15) do (
    timeout /t 1 /nobreak >nul
    netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
    if !errorlevel! equ 0 (
        set FRONTEND_READY=1
        echo    Frontend is ready! ^(took %%i seconds^)
        goto :frontend_ready
    )
    if %%i equ 15 (
        echo    Warning: Frontend may not be ready yet. Continuing anyway...
    )
)
:frontend_ready
echo.

echo ============================================
echo   All Services Started!
echo ============================================
echo.
echo   Backend:  http://localhost:8081
echo   AI Model: http://localhost:8000
echo   Frontend: http://localhost:3000
echo.
echo   Swagger:  http://localhost:8081/swagger-ui.html
echo   AI Docs:  http://localhost:8000/docs
echo.
echo   Mode: DEVELOPMENT (Demo mode enabled, H2 database)
echo.
echo   To stop all services, run: stop-all.bat
echo ============================================
echo.
goto :end

:error
echo.
echo ============================================
echo   ERROR: Failed to start services!
echo ============================================
echo.
echo   Please check the error messages above.
echo   Common issues:
echo   - Missing dependencies (npm install, pip install)
echo   - Port conflicts (another service using the ports)
echo   - Java/Maven/Python not installed
echo ============================================
echo.
pause
exit /b 1

:end
pause
exit /b 0
