# Quick Start Guide - AI-Driven Mobile App with CSV Integration

## 🚀 Get Started in 3 Steps

### Step 1: Prerequisites
Ensure you have installed:
- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **Python 3.9+** - [Download](https://www.python.org/downloads/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Android Studio** (for Android) or **Xcode** (for iOS)

### Step 2: Start the Backend
```bash
# Start the Python backend server using Docker
docker-compose up backend
```
✅ Backend will be available at: `http://localhost:5000`

### Step 3: Run the Mobile App
```bash
# Install dependencies
npm install

# Run on Android
npx react-native run-android

# OR Run on iOS (macOS only)
npx react-native run-ios
```

## 📱 What You Can Do

### Chat Interface
Ask questions like:
- "What is the total revenue?"
- "Show me all customers"
- "What are the top products?"
- "How many orders are there?"

### Quick Actions
Use the quick action buttons for:
- Customer analysis
- Revenue queries
- Product information
- Report generation

### Generate Reports
- **Text Reports**: Business summaries, customer analysis
- **Visual Charts**: Revenue charts, product sales, order status

## 🔧 Troubleshooting

### Backend Not Starting
```bash
# Check if Docker is running
docker --version

# Restart backend
docker-compose down
docker-compose up backend
```

### Mobile App Not Connecting
- **Android Emulator**: Use `http://10.0.2.2:5000`
- **iOS Simulator**: Use `http://localhost:5000`
- **Physical Device**: Use your computer's IP address

### Common Issues
- **Port 5000 busy**: Change port in `backend/app.py`
- **Metro bundler issues**: Run `npx react-native start --reset-cache`
- **Android build issues**: Run `cd android && ./gradlew clean && cd ..`

## 📊 Sample Data

The app comes with sample business data:
- **customers** 
- **details** 
- **inventory** 
- **price**

## 🎯 Key Features

### ✅ Implemented
- ✅ Chat-based AI interface
- ✅ CSV data integration
- ✅ Data validation (anti-hallucination)
- ✅ Report generation (text & visual)
- ✅ Modern React Native UI
- ✅ Python Flask backend
- ✅ Docker deployment
- ✅ Scalable architecture

### 🚀 Ready to Use
- Natural language querying
- Real-time data analysis
- Interactive charts and graphs
- Business intelligence reports
- Cross-platform mobile support


## 🎉 Success!

