# Quick Setup Guide

## Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

## Step 2: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Step 3: Start MongoDB

Make sure MongoDB is running on your system. If you have MongoDB installed locally:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# Or run directly
mongod
```

If you're using MongoDB Atlas, update the `MONGODB_URI` in `backend/.env` with your connection string.

## Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

## Step 5: Start Frontend Server

Open a new terminal:

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## Testing the Application

1. **Register as Instructor:**
   - Go to Register page
   - Fill in details
   - Select "Instructor" role
   - Register

2. **Create a Course:**
   - After registration, you'll be redirected to Dashboard
   - Click "Create New Course"
   - Fill in course details
   - Click "Create Course"

3. **Add Lessons:**
   - In the course edit page, click "Add New Lesson"
   - Fill in lesson details
   - Save

4. **Publish Course:**
   - In the course edit page, check "Publish Course"
   - Click "Update Course"

5. **Register as Student:**
   - Logout
   - Register a new account with "Student" role

6. **Enroll in Course:**
   - Browse courses
   - Click on a course
   - Click "Enroll Now"
   - Start learning!

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check the `MONGODB_URI` in `backend/.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change the PORT in `backend/.env` if 5000 is taken
- React dev server will automatically use another port if 3000 is taken

### CORS Errors
- Make sure backend is running on port 5000
- Check that the proxy in `frontend/package.json` points to the correct backend URL

## Default Configuration

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017/teacher`

