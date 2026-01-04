@echo off
REM AI Model Service - Development Mode Launcher (Windows)
REM This script starts the AI trait prediction service

echo ========================================
echo   AI Trait Predictor - Development Mode
echo ========================================
echo.
echo Starting AI model service...
echo - Port: 8000
echo - API: http://localhost:8000
echo - Health: http://localhost:8000/health
echo - Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

REM Run the service
python trait_predictor.py
