#!/bin/bash

# ============================================
# HumanDNAVisualizer - Start All Services
# ============================================
# Starts Backend, AI Model, and Frontend
# Mode: Development (Demo mode enabled, H2 in-memory database)

echo ""
echo "============================================"
echo "  HumanDNAVisualizer - Starting All Services"
echo "============================================"
echo ""
echo "Mode: DEVELOPMENT"
echo "Demo Mode: ENABLED (H2 in-memory database)"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Kill any existing processes on the required ports
echo "[1/4] Cleaning up existing processes..."
# Use netstat for Git Bash/Windows compatibility
if command -v lsof &> /dev/null; then
    lsof -ti:8081 | xargs kill -9 2>/dev/null
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    lsof -ti:3000 | xargs kill -9 2>/dev/null
else
    # Git Bash/Windows: Use netstat and taskkill
    netstat -ano | grep ":8081" | awk '{print $5}' | xargs -r taskkill //PID //F 2>/dev/null
    netstat -ano | grep ":8000" | awk '{print $5}' | xargs -r taskkill //PID //F 2>/dev/null
    netstat -ano | grep ":3000" | awk '{print $5}' | xargs -r taskkill //PID //F 2>/dev/null
fi
sleep 2
echo "   Done!"
echo ""

# Start Backend (Development mode with H2 database)
echo "[2/4] Starting Backend Service (Port 8081)..."
cd "$SCRIPT_DIR/backend/dna-integrator"

# Check if pom.xml exists
if [ ! -f "pom.xml" ]; then
    echo "   ERROR: Backend pom.xml not found!"
    echo "   Please ensure you're in the correct directory."
    exit 1
fi

gnome-terminal --title="DNA Backend - Development" -- bash -c "mvn spring-boot:run -Dspring-boot.run.profiles=dev; exec bash" 2>/dev/null || \
xterm -T "DNA Backend - Development" -e "mvn spring-boot:run -Dspring-boot.run.profiles=dev; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$SCRIPT_DIR"'/backend/dna-integrator && mvn spring-boot:run -Dspring-boot.run.profiles=dev"' 2>/dev/null || \
nohup mvn spring-boot:run -Dspring-boot.run.profiles=dev > backend.log 2>&1 &

echo "   Backend starting..."
echo "   Waiting for backend to initialize (up to 30 seconds)..."
echo ""

# Wait for backend to be ready (check port 8081) - optimized timeout
BACKEND_READY=0
for i in {1..20}; do
    sleep 1
    if command -v lsof &> /dev/null; then
        lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1 && BACKEND_READY=1
    else
        netstat -an 2>/dev/null | grep -q ":8081.*LISTENING" && BACKEND_READY=1
    fi
    if [ $BACKEND_READY -eq 1 ]; then
        echo "   Backend is ready! (took $i seconds)"
        break
    fi
    if [ $i -eq 20 ]; then
        echo "   Warning: Backend may not be ready yet (waited 20s). Continuing anyway..."
    fi
done
echo ""

# Start AI Model Service
echo "[3/4] Starting AI Model Service (Port 8000)..."
cd "$SCRIPT_DIR/ai-model"

# Check if trait_predictor.py exists
if [ ! -f "trait_predictor.py" ]; then
    echo "   ERROR: trait_predictor.py not found!"
    echo "   Please ensure the AI model directory exists."
    exit 1
fi

gnome-terminal --title="AI Model Service" -- bash -c "python trait_predictor.py; exec bash" 2>/dev/null || \
xterm -T "AI Model Service" -e "python trait_predictor.py; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$SCRIPT_DIR"'/ai-model && python trait_predictor.py"' 2>/dev/null || \
nohup python trait_predictor.py > ai-model.log 2>&1 &

echo "   AI Model starting..."
echo "   Waiting for AI service to initialize (up to 20 seconds)..."
echo ""

# Wait for AI service to be ready (check port 8000) - optimized timeout
AI_READY=0
for i in {1..15}; do
    sleep 1
    if command -v lsof &> /dev/null; then
        lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 && AI_READY=1
    else
        netstat -an 2>/dev/null | grep -q ":8000.*LISTENING" && AI_READY=1
    fi
    if [ $AI_READY -eq 1 ]; then
        echo "   AI Model is ready! (took $i seconds)"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "   Warning: AI Model may not be ready yet (waited 15s). Continuing anyway..."
    fi
done
echo ""

# Start Frontend
echo "[4/4] Starting Frontend (Port 3000)..."
cd "$SCRIPT_DIR/frontend"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "   ERROR: Frontend package.json not found!"
    echo "   Please ensure the frontend directory exists."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "   Warning: node_modules not found. Running npm install..."
    npm install
    if [ $? -ne 0 ]; then
        echo "   ERROR: npm install failed!"
        exit 1
    fi
fi

gnome-terminal --title="DNA Frontend" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -T "DNA Frontend" -e "npm run dev; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$SCRIPT_DIR"'/frontend && npm run dev"' 2>/dev/null || \
nohup npm run dev > frontend.log 2>&1 &

echo "   Frontend starting..."
echo "   Waiting for frontend to initialize (up to 15 seconds)..."
echo ""

# Wait for frontend to be ready (check port 3000) - optimized timeout
FRONTEND_READY=0
for i in {1..10}; do
    sleep 1
    if command -v lsof &> /dev/null; then
        lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && FRONTEND_READY=1
    else
        netstat -an 2>/dev/null | grep -q ":3000.*LISTENING" && FRONTEND_READY=1
    fi
    if [ $FRONTEND_READY -eq 1 ]; then
        echo "   Frontend is ready! (took $i seconds)"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "   Warning: Frontend may not be ready yet (waited 10s). Continuing anyway..."
    fi
done
echo ""

echo "============================================"
echo "  All Services Started!"
echo "============================================"
echo ""
echo "  Backend:  http://localhost:8081"
echo "  AI Model: http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "  Swagger:  http://localhost:8081/swagger-ui.html"
echo "  AI Docs:  http://localhost:8000/docs"
echo ""
echo "  Mode: DEVELOPMENT (Demo mode enabled, H2 database)"
echo ""
echo "  To stop all services, run: ./stop-all.sh"
echo "============================================"
echo ""
echo "Note: If services fail to start, check:"
echo "  - Java/Maven is installed (for backend)"
echo "  - Python 3.10+ is installed (for AI service)"
echo "  - Node.js 18+ is installed (for frontend)"
echo "  - Ports 8081, 8000, 3000 are not in use"
echo ""
