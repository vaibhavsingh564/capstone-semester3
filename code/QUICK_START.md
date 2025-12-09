# 🚀 Quick Start Guide

## Prerequisites
- Node.js (v14 or higher) installed
- MongoDB running locally or MongoDB Atlas account
- npm or yarn package manager

## Step-by-Step Instructions

### 1. Check MongoDB
Make sure MongoDB is running:
```bash
# Check if MongoDB is running
pgrep -x mongod

# If not running, start it:
# macOS (Homebrew):
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Or run directly:
mongod
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Setup Backend Environment
The `.env` file should already exist. If not, create it:
```bash
cd backend
cat > .env << 'EOF'
PORT=5001
MONGODB_URI=mongodb://localhost:27017/teacher
JWT_SECRET=your_jwt_secret_key_here_change_in_production_12345
JWT_EXPIRE=7d
EOF
```

### 4. Start Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
MongoDB Connected
Server running on port 5001
```

**Keep this terminal open!**

### 5. Install Frontend Dependencies
Open a **NEW terminal window**:
```bash
cd frontend
npm install
```

### 6. Start Frontend Server
```bash
cd frontend
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

## ✅ You're Ready!

### Access Points:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Docs**: Check `BACKEND_CRUD_TEST.md` for all endpoints

## 🧪 Test the Application

### 1. Register as Instructor
1. Go to http://localhost:3000/register
2. Fill in details
3. Select "Instructor" role
4. Register

### 2. Create a Course
1. After registration, you'll be redirected to Dashboard
2. Click "Create New Course"
3. Fill in course details
4. Click "Create Course"

### 3. Add Content
1. Click "Edit Course"
2. Add lessons
3. Create quizzes
4. Upload assignments
5. Create tests
6. Publish the course

### 4. Register as Student
1. Logout
2. Register a new account with "Student" role
3. Browse courses
4. Purchase/enroll in courses
5. Take quizzes, submit assignments, take tests

## 🔍 View API Calls in Network Tab

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Filter by "XHR" or "Fetch"
4. Navigate through the app
5. See all API calls with:
   - Request URL with query parameters
   - Request method (GET, POST, PUT, DELETE)
   - Request/Response data
   - Status codes

## 🛠️ Troubleshooting

### Port 5001 already in use?
Change the port in `backend/.env`:
```
PORT=5002
```

### Port 3000 already in use?
React will automatically use the next available port (3001, 3002, etc.)

### MongoDB connection error?
- Make sure MongoDB is running
- Check `MONGODB_URI` in `backend/.env`
- For MongoDB Atlas, update the connection string

### Frontend can't connect to backend?
- Make sure backend is running on port 5001
- Check `proxy` in `frontend/package.json` points to correct port
- Check CORS settings in backend

## 📝 Quick Commands Reference

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server

# Frontend
cd frontend
npm install          # Install dependencies
npm start            # Start development server
npm run build        # Build for production
```

## 🎯 What to Test

1. **CRUD Operations**:
   - Create courses, quizzes, assignments, tests
   - Read/list with filtering, pagination, sorting
   - Update existing items
   - Delete items

2. **Filtering & Search**:
   - Use search box
   - Apply filters (category, price, etc.)
   - Change sorting
   - Use pagination

3. **Network Tab**:
   - See all GET requests with query parameters
   - See POST requests with body data
   - See PUT requests with updated data
   - See DELETE requests

Everything is ready to go! 🎉

