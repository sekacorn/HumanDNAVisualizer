@echo off
setlocal enabledelayedexpansion
REM ============================================
REM HumanDNAVisualizer - Stop All Services
REM ============================================
REM Cleanly stops Backend, AI Model, and Frontend
REM Kills processes and cleans up memory

echo.
echo ============================================
echo   HumanDNAVisualizer - Stopping All Services
echo ============================================
echo.

echo [1/5] Stopping Backend Service (Port 8081)...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :8081') DO (
    echo    Killing PID: %%P
    taskkill /PID %%P /F >nul 2>&1
)
echo    Done!
echo.

echo [2/5] Stopping AI Model Service (Port 8000)...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :8000') DO (
    echo    Killing PID: %%P
    taskkill /PID %%P /F >nul 2>&1
)
echo    Done!
echo.

echo [3/5] Stopping Frontend Service (Port 3000)...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3000') DO (
    echo    Killing PID: %%P
    taskkill /PID %%P /F >nul 2>&1
)
echo    Done!
echo.

echo [4/5] Stopping related processes by name...
REM Kill any remaining Node.js processes
set NODE_KILLED=0
tasklist | findstr node.exe >nul 2>&1
if !errorlevel! equ 0 (
    echo    Killing Node.js processes...
    taskkill /IM node.exe /F >nul 2>&1
    set NODE_KILLED=1
)

REM Kill any remaining Python processes running trait_predictor
set PYTHON_KILLED=0
for /F "tokens=2" %%P IN ('tasklist ^| findstr python.exe 2^>nul') DO (
    wmic process where "ProcessId=%%P" get CommandLine 2>nul | findstr trait_predictor >nul 2>&1
    if !errorlevel! equ 0 (
        echo    Killing Python process: %%P
        taskkill /PID %%P /F >nul 2>&1
        set PYTHON_KILLED=1
    )
)
if !NODE_KILLED! equ 0 if !PYTHON_KILLED! equ 0 (
    echo    No additional processes to stop
)
echo    Done!
echo.

echo [5/5] Cleaning up Java processes (Maven/Spring Boot)...
REM Kill Java processes related to Spring Boot
set JAVA_KILLED=0
for /F "tokens=2" %%P IN ('tasklist ^| findstr java.exe 2^>nul') DO (
    wmic process where "ProcessId=%%P" get CommandLine 2>nul | findstr "spring-boot" >nul 2>&1
    if !errorlevel! equ 0 (
        echo    Killing Java process: %%P
        taskkill /PID %%P /F >nul 2>&1
        set JAVA_KILLED=1
    )
)
if !JAVA_KILLED! equ 0 (
    echo    No Java processes to stop
)
echo    Done!
echo.

REM Wait for processes to fully terminate
timeout /t 2 /nobreak >nul

REM Verify ports are released
echo Verifying ports are released...
set PORTS_CLEAR=1
netstat -ano | findstr :8081 | findstr LISTENING >nul 2>&1
if !errorlevel! equ 0 (
    echo    Warning: Port 8081 still in use
    set PORTS_CLEAR=0
)
netstat -ano | findstr :8000 | findstr LISTENING >nul 2>&1
if !errorlevel! equ 0 (
    echo    Warning: Port 8000 still in use
    set PORTS_CLEAR=0
)
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if !errorlevel! equ 0 (
    echo    Warning: Port 3000 still in use
    set PORTS_CLEAR=0
)
if !PORTS_CLEAR! equ 1 (
    echo    All ports released successfully!
)

echo.
echo ============================================
echo   All Services Stopped!
echo ============================================
echo.
echo   Ports checked: 8081, 8000, 3000
echo.
echo   To restart services:
echo   - Demo mode: start-demo.bat
echo   - Development: start-all.bat
echo ============================================
echo.
pause
exit /b 0
