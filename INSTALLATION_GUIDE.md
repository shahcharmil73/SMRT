# Installation Guide - AI-Driven Mobile App with CSV Integration

## 🚀 Quick Installation (Recommended)

### Option 1: Automated Setup (Windows)
1. **Double-click** `run-project.bat` in the project folder
2. Wait for all dependencies to install automatically
3. The backend server will start automatically
4. Open a new terminal and run: `npx react-native run-android`

### Option 2: Manual Setup

#### Prerequisites Required:
- **Node.js** (v18+) - [Download here](https://nodejs.org/)
- **React Native CLI** - `npm install -g @react-native-community/cli`
- **Android Studio** (for Android) or **Xcode** (for iOS)

## 📋 Step-by-Step Installation

### Step 1: Install Prerequisites

#### Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (v18 or higher)
3. Run the installer and follow the setup wizard
4. Verify installation: Open terminal and run `node --version`

#### Install React Native CLI
```bash
npm install -g @react-native-community/cli
```

#### For Android Development:
1. Download and install [Android Studio](https://developer.android.com/studio)
2. Set up Android SDK and emulator
3. Add Android SDK to your PATH

#### For iOS Development (macOS only):
1. Install [Xcode](https://developer.apple.com/xcode/) from App Store
2. Install Xcode command line tools: `xcode-select --install`
3. Install CocoaPods: `sudo gem install cocoapods`

### Step 2: Install Project Dependencies

#### Install Mobile App Dependencies
```bash
# In the project root directory
npm install
```

#### Install Backend Dependencies
```bash
# Install backend dependencies
cd backend-node
npm install
cd ..
```

### Step 3: Start the Backend Server

```bash
# Start the Node.js backend server
cd backend-node
node app.js
```

The backend will start on `http://localhost:5000`

### Step 4: Run the Mobile App

#### For Android:
```bash
# In a new terminal, from project root
npx react-native run-android
```

#### For iOS (macOS only):
```bash
# In a new terminal, from project root
npx react-native run-ios
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. PowerShell Execution Policy Error
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. Backend Server Not Starting
- Check if port 5000 is already in use
- Make sure all backend dependencies are installed
- Verify CSV files exist in the `data/` folder

#### 3. Mobile App Not Connecting to Backend
- **Android Emulator**: Backend should be accessible at `http://10.0.2.2:5000`
- **iOS Simulator**: Backend should be accessible at `http://localhost:5000`
- **Physical Device**: Use your computer's IP address

#### 4. Metro Bundler Issues
```bash
npx react-native start --reset-cache
```

#### 5. Android Build Issues
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

#### 6. iOS Build Issues
```bash
cd ios
xcodebuild clean
cd ..
npx react-native run-ios
```

## 🧪 Testing the Installation

### Test Backend Server
```bash
# Run the test script
node test-backend.js
```

Expected output:
```
✅ Backend is running! Status: 200
📊 Backend Response: {"status":"healthy","timestamp":"..."}
✅ Query test successful! Status: 200
🤖 AI Response: { total_revenue: 4567.89 }
🎉 Backend is fully functional!
```

### Test Mobile App
1. Open the app on your device/emulator
2. Try the quick action buttons
3. Ask questions like "What is the total revenue?"
4. Generate reports using the Reports button

## 📱 Running on Different Platforms

### Android Emulator
- Start Android Studio
- Open AVD Manager
- Create/start an Android virtual device
- Run: `npx react-native run-android`

### iOS Simulator (macOS only)
- Open Xcode
- Go to Xcode > Open Developer Tool > Simulator
- Run: `npx react-native run-ios`

### Physical Device
- Connect your device via USB
- Enable Developer Options and USB Debugging (Android)
- Run the appropriate command for your platform

## 🎯 What to Expect

### Backend Features
- ✅ CSV data loading and processing
- ✅ Natural language query processing
- ✅ Data validation and anti-hallucination measures
- ✅ Report generation (text and visual)
- ✅ RESTful API endpoints

### Mobile App Features
- ✅ Chat-based interface for data queries
- ✅ Quick action buttons for common queries
- ✅ Business dashboard with key metrics
- ✅ Report generation with charts
- ✅ Real-time data analysis

### Sample Queries That Work
- "What is the total revenue?"
- "Show me all customers"
- "What are the top products?"
- "How many premium customers?"
- "Order status distribution"
- "Generate business summary report"

## 🚀 Success!

Once everything is running, you'll have:
- A fully functional AI-powered mobile app
- Backend server processing CSV data
- Natural language querying capabilities
- Business intelligence reports
- Cross-platform mobile support

## 📞 Getting Help

If you encounter issues:
1. Check this troubleshooting guide
2. Verify all prerequisites are installed
3. Check the console logs for error messages
4. Ensure all dependencies are properly installed
5. Try the automated setup script (`run-project.bat`)

The application is ready to analyze your CSV data through natural language queries! 🎉
