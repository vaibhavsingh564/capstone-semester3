# Teacher - Learning Management System

A modern, full-stack Learning Management System (LMS) built with React and Node.js, featuring a premium UI with glassmorphism effects and smooth animations.

![Platform](https://img.shields.io/badge/Platform-Web-blue)
![Frontend](https://img.shields.io/badge/Frontend-React-61dafb)
![Backend](https://img.shields.io/badge/Backend-Node.js-339933)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248)

## ✨ Features

### 🎓 For Students
- Browse and search courses with advanced filtering
- Enroll in courses and track progress
- Complete quizzes, assignments, and tests
- View performance analytics
- Earn certificates upon completion

### 👨‍🏫 For Instructors
- Create and manage courses
- Add lessons, quizzes, assignments, and tests
- Track student enrollment and progress
- Publish/unpublish courses
- Manage course pricing

### 🎨 Modern UI/UX
- **Premium Design**: Purple/blue gradient color scheme
- **Glassmorphism Effects**: Modern frosted glass aesthetics
- **Smooth Animations**: fadeIn, slideIn, scaleIn, and float effects
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Google Fonts**: Inter font family for premium typography

## 🚀 Tech Stack

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **CSS3** - Styling with modern effects

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Clone Repository
```bash
git clone https://github.com/vaibhavsingh564/capstone-semester3.git
cd capstone-semester3
```

### Backend Setup
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5001
MONGODB_URI=mongodb://localhost:27017/teacher
JWT_SECRET=your_jwt_secret_key_here
EOF

# Start backend server
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install

# Start frontend development server
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 📁 Project Structure

```
capstone-semester3/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Lesson.js
│   │   ├── Quiz.js
│   │   ├── Assignment.js
│   │   ├── Test.js
│   │   ├── Enrollment.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── lessons.js
│   │   ├── quizzes.js
│   │   ├── assignments.js
│   │   └── ...
│   ├── utils/
│   │   └── queryBuilder.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── Footer.js
    │   │   └── PrivateRoute.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── Courses.js
    │   │   ├── CourseDetail.js
    │   │   ├── MyCourses.js
    │   │   └── ...
    │   ├── App.js
    │   ├── index.css
    │   └── index.js
    └── package.json
```

## 🔐 Authentication

The system supports three user roles:
- **Student**: Can enroll in courses and track progress
- **Instructor**: Can create and manage courses
- **Admin**: Full system access

### Register
```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" // or "instructor"
}
```

### Login
```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

## 📚 API Endpoints

### Courses
- `GET /api/courses` - Get all courses (with filtering, pagination, sorting)
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Instructor only)
- `PUT /api/courses/:id` - Update course (Instructor only)
- `DELETE /api/courses/:id` - Delete course (Instructor only)
- `GET /api/courses/my-courses` - Get instructor's courses
- `GET /api/courses/enrolled` - Get student's enrolled courses

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/course/:courseId` - Check enrollment status
- `PUT /api/enrollments/:id/progress` - Update progress

### Lessons, Quizzes, Assignments, Tests
- Full CRUD operations for course content
- Progress tracking and submissions

## 🎨 Design System

### Color Palette
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#8b5cf6` (Purple)
- **Accent**: `#06b6d4` (Cyan)
- **Success**: `#10b981` (Green)
- **Danger**: `#ef4444` (Red)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800, 900

### Effects
- Glassmorphism with backdrop blur
- Gradient backgrounds
- Smooth transitions and animations
- Hover effects with scale and shadow

## 📸 Screenshots

### Home Page
Modern hero section with animated gradient background, statistics counter, features grid, testimonials, and call-to-action.

### Courses Page
Enhanced course cards with gradient thumbnails, advanced filtering, and pagination.

### Dashboard
Personalized dashboard with dynamic greeting, stats cards, and role-based actions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Vaibhav Singh**
- GitHub: [@vaibhavsingh564](https://github.com/vaibhavsingh564)

## 🙏 Acknowledgments

- Design inspiration from modern web applications
- Icons: Emoji icons for visual appeal
- Fonts: Google Fonts (Inter)

---

Made with ❤️ for learners
