#!/bin/bash

# AI-Driven Mobile App with CSV Integration - Startup Script

echo "🚀 Starting AI-Driven Mobile App with CSV Integration"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Start backend with Docker
echo "🐳 Starting backend server with Docker..."
docker-compose up -d backend

# Wait for backend to be ready
echo "⏳ Waiting for backend server to be ready..."
sleep 10

# Check if backend is responding
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend server is running on http://localhost:5000"
else
    echo "❌ Backend server failed to start. Check Docker logs."
    exit 1
fi

echo ""
echo "🎉 Setup complete! Choose your next step:"
echo ""
echo "1. Run Android app: npx react-native run-android"
echo "2. Run iOS app: npx react-native run-ios"
echo "3. Start Metro bundler only: npm start"
echo ""
echo "📱 Mobile app will connect to backend at:"
echo "   - Android emulator: http://10.0.2.2:5000"
echo "   - iOS simulator: http://localhost:5000"
echo "   - Physical device: http://YOUR_COMPUTER_IP:5000"
echo ""
echo "🔧 Backend API available at: http://localhost:5000"
echo "📊 Health check: http://localhost:5000/api/health"
echo ""
echo "To stop the backend: docker-compose down"
