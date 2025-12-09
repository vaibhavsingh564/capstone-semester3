# Teacher - Teaching Platform

A full-stack Teaching Platform built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

### For Students:
- User registration and authentication
- Browse all published courses
- Enroll in courses
- View course lessons
- Track learning progress
- Mark lessons as complete
- View enrolled courses dashboard

### For Instructors:
- Create and manage courses
- Add lessons to courses
- Edit course details
- Publish/unpublish courses
- View enrolled students
- Delete courses and lessons

### General:
- Role-based access control (Student, Instructor, Admin)
- JWT-based authentication
- Responsive design
- Progress tracking
- Course management

## Tech Stack

### Backend:
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

### Frontend:
- React 18
- React Router DOM
- Axios for API calls
- Context API for state management

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/teacher
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
```

4. Start the backend server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/:id` - Get single course with lessons
- `GET /api/courses/my-courses` - Get instructor's courses (Protected - Instructor)
- `GET /api/courses/enrolled` - Get student's enrolled courses (Protected)
- `POST /api/courses` - Create a new course (Protected - Instructor)
- `PUT /api/courses/:id` - Update a course (Protected - Instructor/Owner)
- `DELETE /api/courses/:id` - Delete a course (Protected - Instructor/Owner)

### Lessons
- `GET /api/lessons/course/:courseId` - Get all lessons for a course
- `GET /api/lessons/:id` - Get single lesson
- `POST /api/lessons` - Create a new lesson (Protected - Instructor)
- `PUT /api/lessons/:id` - Update a lesson (Protected - Instructor)
- `DELETE /api/lessons/:id` - Delete a lesson (Protected - Instructor)

### Enrollments
- `POST /api/enrollments` - Enroll in a course (Protected)
- `GET /api/enrollments/:courseId` - Get enrollment for a course (Protected)
- `PUT /api/enrollments/:id/progress` - Update enrollment progress (Protected)

## User Roles

1. **Student**: Can browse courses, enroll, and track progress
2. **Instructor**: Can create and manage courses and lessons
3. **Admin**: Full access to all features

## Default Setup

When you first run the application:
1. Register a new user with role "instructor" to create courses
2. Register a new user with role "student" to enroll in courses
3. Or use the same account and switch roles as needed

## Project Structure

```
code/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Lesson.js
│   │   └── Enrollment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── lessons.js
│   │   └── enrollments.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Development

### Running in Development Mode

1. Start MongoDB (if running locally):
```bash
mongod
```

2. Start backend server (in backend directory):
```bash
npm run dev
```

3. Start frontend server (in frontend directory):
```bash
npm start
```

## Production Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Set environment variables in production
3. Use a process manager like PM2 for Node.js
4. Configure MongoDB Atlas or production MongoDB instance

## License

MIT License

## Contributing

Feel free to submit issues and enhancement requests!

