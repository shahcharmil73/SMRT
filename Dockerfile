# Multi-stage Dockerfile for AI Mobile App with CSV Integration

# Stage 1: Backend
FROM python:3.9-slim as backend

WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and data
COPY backend/ .
COPY data/ ../data/

# Expose backend port
EXPOSE 5000

# Start backend server
CMD ["python", "app.py"]

# Stage 2: Frontend (React Native development server)
FROM node:18-alpine as frontend

WORKDIR /app/frontend

# Install React Native CLI and dependencies
RUN npm install -g @react-native-community/cli

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend code
COPY . .

# Expose Metro bundler port
EXPOSE 8081

# Start Metro bundler
CMD ["npm", "start"]

# Stage 3: Production (Combined)
FROM python:3.9-slim as production

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application code
COPY backend/ ./backend/
COPY data/ ./data/

# Create startup script
RUN echo '#!/bin/bash\n\
cd /app/backend\n\
python app.py & \n\
sleep 5\n\
echo "Backend server started on port 5000"\n\
echo "To run the mobile app, use: npx react-native run-android or npx react-native run-ios"\n\
wait' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 5000

CMD ["/app/start.sh"]
