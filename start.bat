@echo off
REM AI-Driven Mobile App with CSV Integration - Startup Script for Windows

echo 🚀 Starting AI-Driven Mobile App with CSV Integration
echo ==================================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js and try again.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python and try again.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
npm install

REM Start backend with Docker
echo 🐳 Starting backend server with Docker...
docker-compose up -d backend

REM Wait for backend to be ready
echo ⏳ Waiting for backend server to be ready...
timeout /t 10 /nobreak >nul

REM Check if backend is responding
curl -s http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend server failed to start. Check Docker logs.
    pause
    exit /b 1
) else (
    echo ✅ Backend server is running on http://localhost:5000
)

echo.
echo 🎉 Setup complete! Choose your next step:
echo.
echo 1. Run Android app: npx react-native run-android
echo 2. Run iOS app: npx react-native run-ios
echo 3. Start Metro bundler only: npm start
echo.
echo 📱 Mobile app will connect to backend at:
echo    - Android emulator: http://10.0.2.2:5000
echo    - iOS simulator: http://localhost:5000
echo    - Physical device: http://YOUR_COMPUTER_IP:5000
echo.
echo 🔧 Backend API available at: http://localhost:5000
echo 📊 Health check: http://localhost:5000/api/health
echo.
echo To stop the backend: docker-compose down
pause
