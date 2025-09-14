@echo off
echo ========================================
echo 🤖 AI-Driven Mobile App with CSV Integration
echo ========================================
echo.

echo 🚀 Starting the application...
echo.

echo Step 1: Starting Backend Server...
start "Backend Server" cmd /k "cd backend-node && node app.js"
echo ✅ Backend server starting on port 5000

echo.
echo Step 2: Waiting for backend to initialize...
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
echo 🎉 Application is Running!
echo ========================================
echo.
echo ✅ Backend API: http://10.0.2.2:5000


echo ✅ Web Interface: http://localhost:3000
echo.
echo 🌐 Opening web interface in your browser...
start http://localhost:3000
echo.
echo 📱 Features Available:
echo   - Chat with AI about your business data
echo   - Ask questions like "What is the total revenue?"
echo   - View business summaries and reports
echo   - Analyze customer and product data
echo.
echo 💡 Sample Questions to Try:
echo   - "What is the total revenue?"
echo   - "Show me all customers"
echo   - "What are the top products?"
echo   - "How many premium customers?"
echo   - "Order status distribution"
echo.
echo 🔧 To stop the servers, close the command windows.
echo.
pause
