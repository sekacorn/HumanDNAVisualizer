#!/bin/bash

# DNA Integrator - Development Mode Launcher
# This script starts the backend service with H2 in-memory database

echo "========================================"
echo "  DNA Integrator - Development Mode"
echo "========================================"
echo ""
echo "Starting backend service..."
echo "- Profile: dev"
echo "- Database: H2 in-memory"
echo "- Port: 8081"
echo "- H2 Console: http://localhost:8081/h2-console"
echo ""
echo "Press Ctrl+C to stop"
echo "========================================"
echo ""

# Run with dev profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
