@echo off
echo ========================================
echo 🤖 AI-Driven Mobile App - Updated Data
echo ========================================
echo.

echo 🚀 Starting with your updated CSV data...
echo.

echo Step 1: Starting Backend Server with Updated Data...
start "Backend Server" cmd /k "cd backend-node && node app.js"
echo ✅ Backend server starting on port 5000

echo.
echo Step 2: Waiting for backend to load your data...
timeout /t 5 /nobreak >nul

echo.
echo Step 3: Starting Web Interface...
start "Web Interface" cmd /k "node web-server.js"
echo ✅ Web interface starting on port 3000

echo.
echo Step 4: Waiting for web server to start...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo 🎉 Application is Running with Your Data!
echo ========================================
echo.
echo ✅ Backend API: http://localhost:5000
echo ✅ Web Interface: http://localhost:3000
echo.
echo 🌐 Opening web interface in your browser...
start http://localhost:3000
echo.
echo 📊 Your Updated Data:
echo   - Customer records: 55+ customers
echo   - Product items: 339+ dry cleaning items
echo   - Order tickets: 336+ tickets
echo   - Detail records: 336+ individual items
echo.
echo 💡 Sample Questions to Try:
echo   - "What is the total revenue?"
echo   - "Show me all customers"
echo   - "What are the top products?"
echo   - "How many completed tickets?"
echo   - "Show ticket status distribution"
echo   - "Which customers have the most tickets?"
echo.
echo 🔧 To stop the servers, close the command windows.
echo.
pause
