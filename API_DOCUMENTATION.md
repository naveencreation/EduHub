# 📚 EduHub API Documentation

**Base URL:** `http://localhost:5000`

**Content-Type:** `application/json`

---

## 🔓 Public Routes (No Authentication)

### Health Check
```
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-17T10:30:00.000Z",
  "uptime": 123.456
}
```

---

## 📌 Public Topics

### Get All Topics
```
GET /api/topics?page=1&take=10&q=search
```
**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `take` (optional, number): Items per page (default: 20, max: 100)
- `q` (optional, string): Search query

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Mathematics",
    "slug": "mathematics",
    "description": "Learn mathematics",
    "thumbnailUrl": "https://...",
    "sortOrder": 1,
    "isPublished": true,
    "createdAt": "2026-03-17T10:00:00Z",
    "updatedAt": "2026-03-17T10:00:00Z"
  }
]
```

### Get Topic by ID
```
GET /api/topics/:id
```
**Path Parameters:**
- `id` (required, string): Topic UUID

---

## 📚 Public Courses

### Get All Courses
```
GET /api/courses?topicId=uuid&page=1&take=10&q=search
```
**Query Parameters:**
- `topicId` (optional, string): Filter by topic
- `page` (optional, number): Page number
- `take` (optional, number): Items per page
- `q` (optional, string): Search query

**Response:**
```json
[
  {
    "id": "uuid",
    "topicId": "uuid",
    "title": "Algebra 101",
    "slug": "algebra-101",
    "description": "Learn algebra basics",
    "thumbnailUrl": "https://...",
    "sortOrder": 1,
    "isPublished": true,
    "createdAt": "2026-03-17T10:00:00Z",
    "updatedAt": "2026-03-17T10:00:00Z"
  }
]
```

### Get Course by ID
```
GET /api/courses/:id
```
**Path Parameters:**
- `id` (required, string): Course UUID

### Get Course by Slug
```
GET /api/courses/slug/:slug
```
**Path Parameters:**
- `slug` (required, string): Course slug

---

## 📹 Public Content (Videos, Podcasts, etc.)

### Get All Content
```
GET /api/content?courseId=uuid&page=1&take=10&q=search
```
**Query Parameters:**
- `courseId` (optional, string): Filter by course
- `page` (optional, number): Page number
- `take` (optional, number): Items per page
- `q` (optional, string): Search query

**Response:**
```json
[
  {
    "id": "uuid",
    "courseId": "uuid",
    "type": "video|podcast",
    "title": "Algebra Basics",
    "slug": "algebra-basics",
    "description": "Introduction to algebra",
    "url": "https://...",
    "duration": 3600,
    "sortOrder": 1,
    "isPublished": true,
    "createdAt": "2026-03-17T10:00:00Z",
    "updatedAt": "2026-03-17T10:00:00Z"
  }
]
```

### Get Content by ID
```
GET /api/content/:id
```

---

## 🏷️ Public Tags

### Get All Tags
```
GET /api/tags
```
**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Beginner",
    "slug": "beginner",
    "color": "#FF5733"
  }
]
```

---

## 🔐 Admin Routes (Authentication Required)

### Admin Login
```
POST /api/admin/auth/login
```
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "email": "admin@eduhub.com",
  "password": "ChangeMe@SecurePassword123"
}
```
**Response:**
```json
{
  "message": "Login successful",
  "admin": {
    "id": "uuid",
    "email": "admin@eduhub.com",
    "createdAt": "2026-03-17T10:00:00Z"
  }
}
```
**Sets Cookie:** `admin_token` (HttpOnly)

---

## 📌 Admin Topics

### Get All Topics (Admin)
```
GET /api/admin/topics
```
*Requires authentication*

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Mathematics",
    "slug": "mathematics",
    "description": "...",
    "thumbnailUrl": "...",
    "sortOrder": 1,
    "isPublished": true,
    "_count": {
      "courses": 5,
      "content": 15
    }
  }
]
```

### Get Topic by ID (Admin)
```
GET /api/admin/topics/:id
```

### Create Topic
```
POST /api/admin/topics
```
*Requires authentication*

**Body:**
```json
{
  "name": "Physics",
  "description": "Learn physics fundamentals",
  "thumbnailUrl": "https://example.com/image.jpg",
  "slug": "physics",
  "sortOrder": 2,
  "isPublished": false
}
```
**Required Fields:** `name`

**Optional Fields:** `description`, `thumbnailUrl`, `slug`, `sortOrder`, `isPublished`

### Update Topic
```
PUT /api/admin/topics/:id
```
*Requires authentication*

**Body:**
```json
{
  "name": "Physics Updated",
  "isPublished": true
}
```

### Delete Topic
```
DELETE /api/admin/topics/:id
```
*Requires authentication*

**Response:**
```json
{
  "message": "Topic deleted successfully"
}
```

### Reorder Topics
```
PATCH /api/admin/topics/reorder
```
*Requires authentication*

**Body:**
```json
{
  "topicIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

---

## 📚 Admin Courses

### Get All Courses (Admin)
```
GET /api/admin/courses?topicId=uuid
```
*Requires authentication*

### Get Course by ID (Admin)
```
GET /api/admin/courses/:id
```

### Create Course
```
POST /api/admin/courses
```
*Requires authentication*

**Body:**
```json
{
  "topicId": "uuid",
  "title": "Algebra 201",
  "description": "Advanced algebra",
  "thumbnailUrl": "https://...",
  "slug": "algebra-201",
  "sortOrder": 2,
  "isPublished": false
}
```
**Required Fields:** `topicId`, `title`

### Update Course
```
PUT /api/admin/courses/:id
```
*Requires authentication*

**Body:**
```json
{
  "title": "Algebra 201 Updated",
  "description": "New description",
  "isPublished": true
}
```

### Delete Course
```
DELETE /api/admin/courses/:id
```
*Requires authentication*

### Reorder Courses
```
PATCH /api/admin/courses/reorder
```
*Requires authentication*

**Body:**
```json
{
  "courseIds": ["uuid-1", "uuid-2"]
}
```

---

## 📹 Admin Content

### Get All Content (Admin)
```
GET /api/admin/content?courseId=uuid
```
*Requires authentication*

### Get Content by ID (Admin)
```
GET /api/admin/content/:id
```

### Create Content
```
POST /api/admin/content
```
*Requires authentication*

**Body:**
```json
{
  "courseId": "uuid",
  "type": "video",
  "title": "Algebra Basics",
  "description": "Introduction video",
  "url": "https://...",
  "duration": 3600,
  "slug": "algebra-basics",
  "sortOrder": 1,
  "isPublished": false
}
```
**Required Fields:** `courseId`, `type`, `title`, `url`

### Update Content
```
PUT /api/admin/content/:id
```
*Requires authentication*

### Delete Content
```
DELETE /api/admin/content/:id
```
*Requires authentication*

### Reorder Content
```
PATCH /api/admin/content/reorder
```
*Requires authentication*

**Body:**
```json
{
  "contentIds": ["uuid-1", "uuid-2"]
}
```

---

## 🏷️ Admin Tags

### Get All Tags (Admin)
```
GET /api/admin/tags
```
*Requires authentication*

### Create Tag
```
POST /api/admin/tags
```
*Requires authentication*

**Body:**
```json
{
  "name": "Advanced",
  "color": "#FF5733"
}
```

### Update Tag
```
PUT /api/admin/tags/:id
```
*Requires authentication*

### Delete Tag
```
DELETE /api/admin/tags/:id
```
*Requires authentication*

---

## 🧪 Testing Workflow

### 1. Start with Health Check
```
GET http://localhost:5000/api/health
```

### 2. Get Public Topics
```
GET http://localhost:5000/api/topics
```

### 3. Login to Admin
```
POST http://localhost:5000/api/admin/auth/login
Body:
{
  "email": "admin@eduhub.com",
  "password": "ChangeMe@SecurePassword123"
}
```
✅ This sets the `admin_token` cookie

### 4. Create a Topic (requires auth)
```
POST http://localhost:5000/api/admin/topics
Body:
{
  "name": "Computer Science",
  "description": "CS fundamentals",
  "sortOrder": 1,
  "isPublished": false
}
```

### 5. Create a Course
```
POST http://localhost:5000/api/admin/courses
Body:
{
  "topicId": "{topic_id_from_step_4}",
  "title": "Introduction to Python",
  "description": "Learn Python basics",
  "sortOrder": 1,
  "isPublished": false
}
```

### 6. Create Content
```
POST http://localhost:5000/api/admin/content
Body:
{
  "courseId": "{course_id_from_step_5}",
  "type": "video",
  "title": "Variables and Data Types",
  "url": "https://example.com/video.mp4",
  "duration": 1800,
  "sortOrder": 1
}
```

---

## ⚙️ Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized: No token provided"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used for all resource IDs
- Slugs are auto-generated from titles if not provided
- Pagination defaults: `page=1`, `take=20`, `max=100`
- All data is validated with Zod schemas
