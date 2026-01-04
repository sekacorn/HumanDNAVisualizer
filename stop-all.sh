#!/bin/bash

# ============================================
# HumanDNAVisualizer - Stop All Services
# ============================================
# Cleanly stops Backend, AI Model, and Frontend
# Kills processes and cleans up memory

echo ""
echo "============================================"
echo "  HumanDNAVisualizer - Stopping All Services"
echo "============================================"
echo ""

echo "[1/5] Stopping Backend Service (Port 8081)..."
if command -v lsof &> /dev/null; then
    BACKEND_PIDS=$(lsof -ti:8081)
    if [ -n "$BACKEND_PIDS" ]; then
        echo "   Killing PIDs: $BACKEND_PIDS"
        kill -9 $BACKEND_PIDS 2>/dev/null
        echo "   Done!"
    else
        echo "   No process found on port 8081"
    fi
else
    # Git Bash/Windows: Use netstat and taskkill
    BACKEND_PIDS=$(netstat -ano | grep ":8081" | grep "LISTENING" | awk '{print $5}' | sort -u)
    if [ -n "$BACKEND_PIDS" ]; then
        echo "   Killing PIDs: $BACKEND_PIDS"
        for pid in $BACKEND_PIDS; do
            taskkill //PID $pid //F >/dev/null 2>&1
        done
        echo "   Done!"
    else
        echo "   No process found on port 8081"
    fi
fi
echo ""

echo "[2/5] Stopping AI Model Service (Port 8000)..."
if command -v lsof &> /dev/null; then
    AI_PIDS=$(lsof -ti:8000)
    if [ -n "$AI_PIDS" ]; then
        echo "   Killing PIDs: $AI_PIDS"
        kill -9 $AI_PIDS 2>/dev/null
        echo "   Done!"
    else
        echo "   No process found on port 8000"
    fi
else
    # Git Bash/Windows: Use netstat and taskkill
    AI_PIDS=$(netstat -ano | grep ":8000" | grep "LISTENING" | awk '{print $5}' | sort -u)
    if [ -n "$AI_PIDS" ]; then
        echo "   Killing PIDs: $AI_PIDS"
        for pid in $AI_PIDS; do
            taskkill //PID $pid //F >/dev/null 2>&1
        done
        echo "   Done!"
    else
        echo "   No process found on port 8000"
    fi
fi
echo ""

echo "[3/5] Stopping Frontend Service (Port 3000)..."
if command -v lsof &> /dev/null; then
    FRONTEND_PIDS=$(lsof -ti:3000)
    if [ -n "$FRONTEND_PIDS" ]; then
        echo "   Killing PIDs: $FRONTEND_PIDS"
        kill -9 $FRONTEND_PIDS 2>/dev/null
        echo "   Done!"
    else
        echo "   No process found on port 3000"
    fi
else
    # Git Bash/Windows: Use netstat and taskkill
    FRONTEND_PIDS=$(netstat -ano | grep ":3000" | grep "LISTENING" | awk '{print $5}' | sort -u)
    if [ -n "$FRONTEND_PIDS" ]; then
        echo "   Killing PIDs: $FRONTEND_PIDS"
        for pid in $FRONTEND_PIDS; do
            taskkill //PID $pid //F >/dev/null 2>&1
        done
        echo "   Done!"
    else
        echo "   No process found on port 3000"
    fi
fi
echo ""

echo "[4/5] Stopping related Node.js processes..."
# Kill any remaining Node.js processes from frontend
NODE_PIDS=$(pgrep -f "npm run dev" 2>/dev/null)
NODE_KILLED=0
if [ -n "$NODE_PIDS" ]; then
    echo "   Killing Node.js PIDs: $NODE_PIDS"
    kill -9 $NODE_PIDS 2>/dev/null
    NODE_KILLED=1
fi

# Also try to kill node processes by name
if command -v pkill &> /dev/null; then
    pkill -f "vite" 2>/dev/null && NODE_KILLED=1
fi

if [ $NODE_KILLED -eq 0 ]; then
    echo "   No Node.js processes found"
else
    echo "   Done!"
fi
echo ""

echo "[5/5] Stopping Python and Java processes..."
# Kill Python processes related to trait_predictor
PYTHON_PIDS=$(pgrep -f "trait_predictor.py" 2>/dev/null)
PYTHON_KILLED=0
if [ -n "$PYTHON_PIDS" ]; then
    echo "   Killing Python PIDs: $PYTHON_PIDS"
    kill -9 $PYTHON_PIDS 2>/dev/null
    PYTHON_KILLED=1
fi

# Kill Java processes related to Spring Boot
JAVA_PIDS=$(pgrep -f "spring-boot:run" 2>/dev/null)
JAVA_KILLED=0
if [ -n "$JAVA_PIDS" ]; then
    echo "   Killing Java PIDs: $JAVA_PIDS"
    kill -9 $JAVA_PIDS 2>/dev/null
    JAVA_KILLED=1
fi

if [ $PYTHON_KILLED -eq 0 ] && [ $JAVA_KILLED -eq 0 ]; then
    echo "   No Python or Java processes found"
else
    echo "   Done!"
fi
echo ""

# Wait for processes to fully terminate
sleep 2

# Verify ports are released
echo "Verifying ports are released..."
PORTS_CLEAR=1

# Check if lsof is available, otherwise use netstat
if command -v lsof &> /dev/null; then
    lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "   Warning: Port 8081 still in use" && PORTS_CLEAR=0
    lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "   Warning: Port 8000 still in use" && PORTS_CLEAR=0
    lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "   Warning: Port 3000 still in use" && PORTS_CLEAR=0
else
    # Git Bash/Windows: Use netstat with LISTENING state
    netstat -an 2>/dev/null | grep ":8081" | grep -q "LISTENING" && echo "   Warning: Port 8081 still in use" && PORTS_CLEAR=0
    netstat -an 2>/dev/null | grep ":8000" | grep -q "LISTENING" && echo "   Warning: Port 8000 still in use" && PORTS_CLEAR=0
    netstat -an 2>/dev/null | grep ":3000" | grep -q "LISTENING" && echo "   Warning: Port 3000 still in use" && PORTS_CLEAR=0
fi

if [ $PORTS_CLEAR -eq 1 ]; then
    echo "   All ports released successfully!"
fi

echo ""
echo "============================================"
echo "  All Services Stopped!"
echo "============================================"
echo ""
echo "  Ports checked: 8081, 8000, 3000"
echo ""
echo "  To restart services:"
echo "  - Demo mode: ./start-demo.sh"
echo "  - Development: ./start-all.sh"
echo "============================================"
echo ""

exit 0
