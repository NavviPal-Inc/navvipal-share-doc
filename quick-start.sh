#!/bin/bash

# Navvipal Document Viewer - Quick Start Script
# This script sets up and runs the application

echo "🚀 Navvipal Document Viewer - Quick Start"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
REACT_APP_API_BASE_URL=https://doc-service.navvipal.com
EOF
    echo "✅ .env file created with API base URL"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

echo "🎯 Starting development server..."
echo ""
echo "The app will open at: http://localhost:3000"
echo "To view a document, use: http://localhost:3000/doc?share_id=YOUR_SHARE_ID"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "=========================================="
echo ""

# Start the app
npm start

