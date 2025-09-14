# Setup Instructions for AI-Driven Mobile App with CSV Integration

This document provides detailed setup instructions for running the AI-driven mobile application.

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python 3.9+** - [Download](https://www.python.org/downloads/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/downloads)

### Mobile Development Setup
Choose one or both based on your target platform:

#### For Android Development
- **Android Studio** - [Download](https://developer.android.com/studio)
- **Android SDK** (API Level 33 or higher)
- **Java Development Kit (JDK)** 11 or higher

#### For iOS Development (macOS only)
- **Xcode** (latest version) - Available on Mac App Store
- **iOS Simulator** (comes with Xcode)
- **CocoaPods** - `sudo gem install cocoapods`

## Installation Methods

### Method 1: Docker Setup (Recommended - Easiest)

This method uses Docker to handle all dependencies and setup automatically.

#### Step 1: Clone and Setup
```bash
# Clone the repository
git clone <your-repository-url>
cd ai-mobile-app-csv

# Start the backend server
docker-compose up backend
```

The backend will be available at `http://localhost:5000`

#### Step 2: Install Mobile Dependencies
```bash
# Install Node.js dependencies
npm install

# For iOS (macOS only), install CocoaPods dependencies
cd ios && pod install && cd ..
```

#### Step 3: Run the Mobile App
```bash
# For Android
npx react-native run-android

# For iOS (macOS only)
npx react-native run-ios
```

### Method 2: Manual Setup

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python app.py
```

#### Frontend Setup
```bash
# Install Node.js dependencies
npm install

# For iOS (macOS only), install CocoaPods dependencies
cd ios && pod install && cd ..

# Start Metro bundler
npx react-native start

# In a new terminal, run the app
npx react-native run-android  # or run-ios
```

### Method 3: Development Environment with Docker

```bash
# Start the complete development environment
docker-compose up development

# Follow the instructions provided in the terminal
# Then run the mobile app in a separate terminal
npx react-native run-android  # or run-ios
```

## Configuration

### Backend Configuration

The backend server runs on `http://localhost:5000` by default. If you need to change this:

1. Edit `backend/app.py`:
   ```python
   app.run(debug=True, host='0.0.0.0', port=5000)  # Change port here
   ```

2. Update the API URL in `App.js`:
   ```javascript
   const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator
   // For iOS simulator: 'http://localhost:5000/api'
   // For physical device: 'http://YOUR_COMPUTER_IP:5000/api'
   ```

### Mobile App Configuration

#### For Android Emulator
- Use `http://10.0.2.2:5000/api` as the API base URL
- Ensure the emulator can access the host machine

#### For iOS Simulator
- Use `http://localhost:5000/api` as the API base URL
- Ensure localhost is accessible from the simulator

#### For Physical Device
- Find your computer's IP address
- Use `http://YOUR_IP_ADDRESS:5000/api` as the API base URL
- Ensure both devices are on the same network

## Data Setup

The application comes with sample CSV data in the `data/` directory:

- `Customer.csv` - Customer information
- `Inventory.csv` - Order information
- `Detail.csv` - Order details
- `Pricelist.csv` - Product pricing

### Using Your Own Data

1. Replace the CSV files in the `data/` directory
2. Ensure the column headers match the expected schema
3. Restart the backend server to load new data

## Testing the Setup

### Test Backend API
```bash
# Health check
curl http://localhost:5000/api/health

# Test query
curl -X POST http://localhost:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the total revenue?"}'
```

### Test Mobile App
1. Open the app on your device/emulator
2. Try the quick action buttons
3. Ask questions in the chat interface
4. Generate reports using the Reports button

## Troubleshooting

### Common Issues

#### Backend Won't Start
- **Port already in use**: Change the port in `backend/app.py`
- **Python dependencies**: Ensure all requirements are installed
- **CSV files**: Check that CSV files exist in the `data/` directory

#### Mobile App Won't Connect to Backend
- **Network connectivity**: Check if both devices are on the same network
- **Firewall**: Ensure firewall allows connections on port 5000
- **API URL**: Verify the API URL is correct for your setup

#### Metro Bundler Issues
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear npm cache
npm start -- --reset-cache
```

#### Android Build Issues
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

#### iOS Build Issues
```bash
# Clean and rebuild
cd ios
xcodebuild clean
cd ..
npx react-native run-ios
```

### Docker Issues

#### Container Won't Start
```bash
# Check Docker is running
docker --version

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up
```

#### Permission Issues (Linux/macOS)
```bash
# Fix permissions
sudo chown -R $USER:$USER .
```

## Development Tips

### Hot Reloading
- The React Native app supports hot reloading
- Changes to JavaScript code will automatically reload
- Backend changes require server restart

### Debugging
- Use React Native Debugger for mobile app debugging
- Use browser developer tools for backend API debugging
- Check console logs for error messages

### Performance
- For large datasets, consider implementing pagination
- Use React Native's Performance Monitor for mobile app optimization
- Monitor backend API response times

## Next Steps

After successful setup:

1. **Explore the Data**: Try different queries to understand the data structure
2. **Customize Queries**: Add new query types in the backend
3. **Enhance UI**: Modify the mobile app interface
4. **Add Features**: Implement additional reporting capabilities
5. **Deploy**: Set up production deployment

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all prerequisites are properly installed
4. Try the different setup methods
5. Check the GitHub issues for similar problems

## Environment Variables

Create a `.env` file in the backend directory for configuration:

```env
FLASK_ENV=development
FLASK_DEBUG=1
API_HOST=0.0.0.0
API_PORT=5000
DATA_PATH=../data
```

This completes the setup instructions. The application should now be running and ready for use!
