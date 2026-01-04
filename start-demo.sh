#!/bin/bash

# ============================================
# HumanDNAVisualizer - Start Demo Mode
# ============================================
# Starts Backend (with demo mode), AI Model, and Frontend
# Demo Features: Auto-created users, Quick registration, Relaxed validation

echo ""
echo "============================================"
echo "  HumanDNAVisualizer - Starting DEMO MODE"
echo "============================================"
echo ""
echo "Mode: DEVELOPMENT"
echo "Demo Mode: ENABLED"
echo ""
echo "Demo Users:"
echo "  - demo / demo123 (USER)"
echo "  - admin / admin123 (ADMIN)"
echo "  - moderator / mod123 (MODERATOR)"
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

# Start Backend (Development mode with demo features)
echo "[2/4] Starting Backend Service (Port 8081) - DEMO MODE..."
cd "$SCRIPT_DIR/backend/dna-integrator"
gnome-terminal --title="DNA Backend - DEMO MODE" -- bash -c "mvn spring-boot:run -Dspring-boot.run.profiles=dev; exec bash" 2>/dev/null || \
xterm -T "DNA Backend - DEMO MODE" -e "mvn spring-boot:run -Dspring-boot.run.profiles=dev; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$SCRIPT_DIR"'/backend/dna-integrator && mvn spring-boot:run -Dspring-boot.run.profiles=dev"' 2>/dev/null || \
nohup mvn spring-boot:run -Dspring-boot.run.profiles=dev > backend.log 2>&1 &
echo "   Backend starting..."
echo "   - H2 Console: http://localhost:8081/h2-console"
echo "   - Demo API: http://localhost:8081/api/demo/status"
echo ""

# Wait for backend to initialize (reduced from 10s to 5s for faster startup)
echo "   Waiting for backend to start..."
sleep 5

# Start AI Model Service
echo "[3/4] Starting AI Model Service (Port 8000)..."
cd "$SCRIPT_DIR/ai-model"
gnome-terminal --title="AI Model Service" -- bash -c "python trait_predictor.py; exec bash" 2>/dev/null || \
xterm -T "AI Model Service" -e "python trait_predictor.py; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$SCRIPT_DIR"'/ai-model && python trait_predictor.py"' 2>/dev/null || \
nohup python trait_predictor.py > ai-model.log 2>&1 &
echo "   AI Model starting..."
echo ""

# Wait for AI service to initialize (reduced from 5s to 3s)
echo "   Waiting for AI service to start..."
sleep 3

# Start Frontend
echo "[4/4] Starting Frontend (Port 3000)..."
cd "$SCRIPT_DIR/frontend"
if [ -f "package.json" ]; then
    gnome-terminal --title="DNA Frontend" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
    xterm -T "DNA Frontend" -e "npm run dev; bash" 2>/dev/null || \
    osascript -e 'tell app "Terminal" to do script "cd '"$SCRIPT_DIR"'/frontend && npm run dev"' 2>/dev/null || \
    nohup npm run dev > frontend.log 2>&1 &
    echo "   Frontend starting..."
else
    echo "   Warning: Frontend package.json not found!"
    echo "   Please run 'npm install' in the frontend directory first."
fi
echo ""

echo "============================================"
echo "  DEMO MODE - All Services Started!"
echo "============================================"
echo ""
echo "  Backend:  http://localhost:8081"
echo "  AI Model: http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "  Swagger:  http://localhost:8081/swagger-ui.html"
echo "  AI Docs:  http://localhost:8000/docs"
echo "  H2 DB:    http://localhost:8081/h2-console"
echo ""
echo "  Demo Features:"
echo "  - Quick Login: http://localhost:8081/api/demo/login-demo-user"
echo "  - Quick Register: http://localhost:8081/api/demo/quick-register"
echo "  - Demo Status: http://localhost:8081/api/demo/status"
echo ""
echo "  Demo Users (auto-created):"
echo "  - demo / demo123 (USER)"
echo "  - admin / admin123 (ADMIN)"
echo "  - moderator / mod123 (MODERATOR)"
echo ""
echo "  Mode: DEVELOPMENT (Demo mode enabled)"
echo ""
echo "  To stop all services, run: ./stop-all.sh"
echo "============================================"
echo ""
