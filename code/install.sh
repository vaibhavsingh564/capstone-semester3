#!/bin/bash

echo "🚀 Setting up Teacher Project..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Create backend/.env file with:"
echo "   PORT=5000"
echo "   MONGODB_URI=mongodb://localhost:27017/teacher"
echo "   JWT_SECRET=your_secret_key_here"
echo "   JWT_EXPIRE=7d"
echo ""
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm start"

