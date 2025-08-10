# Online Exam Platform

A comprehensive full-stack exam-taking application built with React.js, Node.js/Express, and PostgreSQL (Supabase). This platform provides a secure and user-friendly interface for conducting online examinations with features like JWT authentication, timed exams, and real-time score calculation.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure JWT-based registration and login system
- **Exam Interface**: Clean, intuitive interface for taking exams
- **Question Management**: Randomized question fetching from database
- **Navigation**: Smooth navigation between questions with Next/Previous buttons
- **Timer System**: 30-minute countdown timer with auto-submit functionality
- **Score Calculation**: Real-time score calculation and result display
- **Responsive Design**: Optimized for all devices (mobile, tablet, desktop)

### Technical Features
- **Secure Authentication**: JWT token-based authentication
- **Database Integration**: PostgreSQL with Supabase
- **RESTful API**: Well-structured backend API with Express.js
- **State Management**: React hooks and context for state management
- **Real-time Updates**: Live timer and progress tracking
- **Auto-submit**: Automatic exam submission when time expires

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

### Database
- **PostgreSQL** - Via Supabase
- **Supabase** - Backend as a Service

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Supabase account

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd exam-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 4. Database Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration script from `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor
3. Update your `.env.local` file with your Supabase URL and anon key

### 5. Start the Development Servers
```bash
# Start both frontend and backend servers
npm run dev:full

# Or start them separately:
# Backend server (port 5000)
npm run server

# Frontend development server (port 5173)
npm run dev
```

## 🏗️ Project Structure

```
exam-platform/
├── src/
│   ├── components/           # React components
│   │   ├── Login.tsx        # Authentication component
│   │   ├── StartExam.tsx    # Pre-exam interface
│   │   ├── ExamInterface.tsx # Main exam component
│   │   └── Results.tsx      # Results display
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── types/               # TypeScript definitions
│   │   └── index.ts
│   ├── App.tsx              # Main app component
│   └── main.tsx             # App entry point
├── server/
│   └── index.js             # Express.js server
├── supabase/
│   └── migrations/          # Database migrations
└── package.json
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Exam Management
- `GET /api/exam/questions` - Fetch randomized questions (requires auth)
- `POST /api/exam/submit` - Submit exam answers (requires auth)
- `GET /api/exam/results/:attemptId` - Get exam results (requires auth)

## 🧪 API Testing

### Using Postman

1. **Register a new user:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

2. **Login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

3. **Get Questions (requires JWT token):**
```
GET http://localhost:5000/api/exam/questions
Authorization: Bearer <your-jwt-token>
```

4. **Submit Exam:**
```
POST http://localhost:5000/api/exam/submit
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "answers": {
    "question-id-1": 0,
    "question-id-2": 2
  },
  "timeTaken": 1200
}
```

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Questions (replace TOKEN with actual JWT)
curl -X GET http://localhost:5000/api/exam/questions \
  -H "Authorization: Bearer TOKEN"
```

## 🎨 Features Overview

### Authentication System
- Secure user registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes and API endpoints

### Exam Interface
- Clean, professional UI design
- Question navigation with progress tracking
- Visual feedback for answered/unanswered questions
- Responsive design for all devices

### Timer System
- 30-minute countdown timer
- Visual warnings (color changes) as time runs low
- Automatic exam submission when time expires
- Time tracking for performance analysis

### Results & Analytics
- Immediate score calculation
- Percentage-based grading system
- Performance feedback and recommendations
- Grade categorization (A+, A, B, C, F)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers (1024px+)
- Tablets (768px - 1024px)
- Mobile phones (<768px)

## 🚀 Production Deployment

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
JWT_SECRET=your_very_secure_production_jwt_secret
```

### Build for Production
```bash
npm run build
```

