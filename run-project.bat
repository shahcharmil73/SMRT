@echo off
echo ========================================
echo AI-Driven Mobile App with CSV Integration
echo ========================================
echo.

echo Step 1: Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo ✅ Node.js dependencies installed

echo.
echo Step 2: Installing backend dependencies...
cd backend-node
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

echo.
echo Step 3: Starting backend server...
start "Backend Server" cmd /k "node app.js"
echo ✅ Backend server starting...

echo.
echo Step 4: Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Step 5: Testing backend...
cd ..
node test-backend.js

echo.
echo ========================================
echo 🎉 Setup Complete!
echo ========================================
echo.
echo ✅ Backend server is running on http://localhost:5000
echo ✅ Mobile app dependencies are installed
echo.
echo Next steps:
echo 1. Open a new terminal/command prompt
echo 2. Run: npx react-native run-android (for Android)
echo 3. Or run: npx react-native run-ios (for iOS)
echo.
echo The mobile app will connect to the backend automatically.
echo.
pause
