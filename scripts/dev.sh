#!/bin/bash

# Development startup script for StyleGenie

set -e

echo "🎨 StyleGenie Development Environment"
echo "====================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Please edit .env with your API keys"
fi

# Start services
echo ""
echo "Starting services..."
echo ""

# Start API Gateway
echo "🚀 Starting API Gateway (port 8000)..."
cd services/api-gateway
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
python main.py &
API_GATEWAY_PID=$!
cd ../..

# Start Image Generation Service
echo "🎨 Starting Image Generation Service (port 8001)..."
cd services/image-generation
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
python main.py &
IMAGE_GEN_PID=$!
cd ../..

# Start Search Engine Service
echo "🔍 Starting Search Engine Service (port 8002)..."
cd services/search-engine
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
python main.py &
SEARCH_PID=$!
cd ../..

# Start Atelier Matching Service
echo "✂️  Starting Atelier Matching Service (port 8003)..."
cd services/atelier-matching
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
python main.py &
ATELIER_PID=$!
cd ../..

# Wait a bit for services to start
sleep 3

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Service URLs:"
echo "   - API Gateway: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo "   - Image Generation: http://localhost:8001"
echo "   - Search Engine: http://localhost:8002"
echo "   - Atelier Matching: http://localhost:8003"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C and kill all background processes
trap "echo ''; echo 'Stopping services...'; kill $API_GATEWAY_PID $IMAGE_GEN_PID $SEARCH_PID $ATELIER_PID; exit" INT

# Wait for all processes
wait
