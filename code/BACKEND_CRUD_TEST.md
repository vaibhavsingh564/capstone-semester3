# Backend CRUD Operations Test Guide

## ✅ All CRUD Operations with Filtering, Pagination, Sorting, Searching

### Test in Browser Network Tab

All API calls are visible in the Network Tab. Here's how to test:

## 📚 Courses API

### GET - List Courses (with filtering, pagination, sorting, searching)
```
GET /api/courses?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=test&category=Programming&minPrice=0&maxPrice=100&isPublished=true
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Field to sort by (createdAt, title, price, category)
- `sortOrder` - asc or desc (default: desc)
- `search` - Search in title, description, category
- `category` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `isPublished` - Filter by published status (true/false/all)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {...},
  "sort": {...}
}
```

### POST - Create Course
```
POST /api/courses
Headers: Authorization: Bearer <token>
Body: {
  "title": "New Course",
  "description": "Description",
  "category": "Programming",
  "price": 99.99
}
```

### PUT - Update Course
```
PUT /api/courses/:id
Headers: Authorization: Bearer <token>
Body: {
  "title": "Updated Title",
  "isPublished": true
}
```

### DELETE - Delete Course
```
DELETE /api/courses/:id
Headers: Authorization: Bearer <token>
```

## ❓ Quizzes API

### GET - List Quizzes (with filtering, pagination, sorting, searching)
```
GET /api/quizzes/course/:courseId?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=quiz&isPublished=true&minTimeLimit=10&maxTimeLimit=60
```

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder` - Standard pagination/sorting
- `search` - Search in title, description
- `isPublished` - Filter by published status
- `minTimeLimit` - Minimum time limit filter
- `maxTimeLimit` - Maximum time limit filter

### POST - Create Quiz
```
POST /api/quizzes
Headers: Authorization: Bearer <token>
Body: {
  "title": "Quiz Title",
  "description": "Description",
  "course": "courseId",
  "questions": [...],
  "timeLimit": 30,
  "passingScore": 60
}
```

### PUT - Update Quiz
```
PUT /api/quizzes/:id
Headers: Authorization: Bearer <token>
```

### DELETE - Delete Quiz
```
DELETE /api/quizzes/:id
Headers: Authorization: Bearer <token>
```

## 📝 Assignments API

### GET - List Assignments (with filtering, pagination, sorting, searching)
```
GET /api/assignments/course/:courseId?page=1&limit=10&sortBy=dueDate&sortOrder=asc&search=assignment&isPublished=true&minPoints=50&maxPoints=100&dueDateAfter=2024-01-01&dueDateBefore=2024-12-31
```

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder` - Standard pagination/sorting
- `search` - Search in title, description
- `isPublished` - Filter by published status
- `minPoints` - Minimum points filter
- `maxPoints` - Maximum points filter
- `dueDateAfter` - Filter assignments due after date
- `dueDateBefore` - Filter assignments due before date

### POST - Create Assignment
```
POST /api/assignments
Headers: Authorization: Bearer <token>
Body: {
  "title": "Assignment Title",
  "description": "Description",
  "course": "courseId",
  "dueDate": "2024-12-31",
  "maxPoints": 100
}
```

### PUT - Update Assignment
```
PUT /api/assignments/:id
Headers: Authorization: Bearer <token>
```

### DELETE - Delete Assignment
```
DELETE /api/assignments/:id
Headers: Authorization: Bearer <token>
```

## 📋 Tests API

### GET - List Tests (with filtering, pagination, sorting, searching)
```
GET /api/tests/course/:courseId?page=1&limit=10&sortBy=startDate&sortOrder=asc&search=test&isPublished=true&startDateAfter=2024-01-01&endDateBefore=2024-12-31&minTimeLimit=30&maxTimeLimit=120
```

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder` - Standard pagination/sorting
- `search` - Search in title, description
- `isPublished` - Filter by published status
- `startDateAfter` - Filter tests starting after date
- `endDateBefore` - Filter tests ending before date
- `minTimeLimit` - Minimum time limit filter
- `maxTimeLimit` - Maximum time limit filter

### POST - Create Test
```
POST /api/tests
Headers: Authorization: Bearer <token>
Body: {
  "title": "Test Title",
  "description": "Description",
  "course": "courseId",
  "questions": [...],
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "timeLimit": 60
}
```

### PUT - Update Test
```
PUT /api/tests/:id
Headers: Authorization: Bearer <token>
```

### DELETE - Delete Test
```
DELETE /api/tests/:id
Headers: Authorization: Bearer <token>
```

## 🧪 Testing in Browser

### Step 1: Open Browser DevTools
1. Press F12 or Right-click → Inspect
2. Go to "Network" tab
3. Filter by "XHR" or "Fetch"

### Step 2: Test GET Operations
1. Navigate to `/courses` page
2. Use filters, search, pagination
3. See all API calls in Network tab:
   - Request URL with query parameters
   - Request Method (GET)
   - Response Status (200)
   - Response Data (JSON)

### Step 3: Test POST Operations
1. Create a course/quiz/assignment/test
2. See POST request in Network tab:
   - Request URL
   - Request Method (POST)
   - Request Payload (body data)
   - Response Status (201)
   - Response Data

### Step 4: Test PUT Operations
1. Edit a course/quiz/assignment/test
2. See PUT request in Network tab:
   - Request URL with ID
   - Request Method (PUT)
   - Request Payload (updated data)
   - Response Status (200)
   - Response Data

### Step 5: Test DELETE Operations
1. Delete a course/quiz/assignment/test
2. See DELETE request in Network tab:
   - Request URL with ID
   - Request Method (DELETE)
   - Response Status (200)
   - Response Data

## ✅ All Features Working

- ✅ Filtering - All endpoints support multiple filters
- ✅ Pagination - All list endpoints support pagination
- ✅ Sorting - All list endpoints support sorting
- ✅ Searching - All list endpoints support text search
- ✅ CRUD Operations - Create, Read, Update, Delete all working
- ✅ Network Tab Visibility - All requests visible in browser Network tab
- ✅ Consistent Response Format - All responses follow same structure

## 📊 Response Format

All responses follow this format:
```json
{
  "success": true,
  "data": {...},
  "pagination": {...},  // For list endpoints
  "filters": {...},     // For list endpoints
  "sort": {...}         // For list endpoints
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message"
}
```

