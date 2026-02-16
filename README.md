# 🎓 Student Portal App

A full-stack academic portal system built for capstone project use. Includes an Android mobile app for students, a web-based admin panel, and a RESTful backend API.

---

## 📋 Project Overview

The Student Portal App allows students to access their academic information — grades, schedules, announcements, and messages — through a modern Android application. School administrators manage all content through a dedicated web-based admin panel.

| Detail | Info |
|---|---|
| Platform | Android (mobile) + Web (admin panel) |
| Budget | ₱25,000 (fixed price) |
| Timeline | 5 weeks |
| Post-Launch Support | 14-day bug fix window |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (Android) |
| Admin Panel | React (Web) |
| Backend API | Node.js + Express |
| Database | MySQL / PostgreSQL |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcrypt |
| Hosting | Free tier (development & testing phase) |

---

## 📁 Folder Structure

```
student-portal/
├── mobile/                  # React Native Android app
│   ├── src/
│   │   ├── screens/         # App screens (Login, Profile, Grades, etc.)
│   │   ├── components/      # Reusable UI components
│   │   ├── navigation/      # Stack & tab navigation config
│   │   ├── services/        # API call functions
│   │   └── utils/           # Helpers and constants
│   ├── android/             # Android-specific native files
│   └── package.json
│
├── admin-panel/             # React web admin interface
│   ├── src/
│   │   ├── pages/           # Admin pages (Dashboard, Students, Grades, etc.)
│   │   ├── components/      # Reusable UI components
│   │   └── services/        # API call functions
│   └── package.json
│
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Route handler logic
│   │   ├── routes/          # API route definitions
│   │   ├── models/          # Database models
│   │   ├── middleware/       # Auth, error handling middleware
│   │   └── config/          # DB and environment config
│   ├── .env.example         # Environment variable template
│   └── package.json
│
├── docs/                    # Documentation files
│   ├── PRD.md
│   └── API.md
│
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js v18+
- npm or yarn
- Android Studio (for mobile development)
- MySQL or PostgreSQL database

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/student-portal.git
cd student-portal
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # Fill in your environment variables
npm run migrate        # Run database migrations
npm run dev            # Start development server
```

Backend runs on: `http://localhost:5000`

---

### 3. Admin Panel Setup

```bash
cd admin-panel
npm install
npm start
```

Admin panel runs on: `http://localhost:3000`

---

### 4. Mobile App Setup

```bash
cd mobile
npm install
npx react-native run-android
```

> Make sure an Android emulator is running or a physical device is connected via USB debugging.

---

## 🔐 Environment Variables

Create a `.env` file inside the `/backend` directory based on `.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_portal
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=10
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/login` | Login (student or admin) | Public |
| POST | `/auth/logout` | Logout and invalidate token | Authenticated |
| POST | `/auth/reset-password` | Initiate password reset | Public |

### Students
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/students/me` | Get own profile | Student |
| GET | `/students/me/grades` | Get own grades | Student |
| GET | `/students/me/schedule` | Get own class schedule | Student |

### Announcements
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/announcements` | Get all announcements | Student |
| POST | `/announcements` | Create announcement | Admin |
| PUT | `/announcements/:id` | Update announcement | Admin |
| DELETE | `/announcements/:id` | Delete announcement | Admin |

### Messaging
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/messages` | Get all messages | Authenticated |
| POST | `/messages` | Send a message | Authenticated |

### Admin
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/admin/students` | Get all students | Admin |
| POST | `/admin/students` | Add a new student | Admin |
| PUT | `/admin/students/:id` | Update student info | Admin |
| DELETE | `/admin/students/:id` | Deactivate a student | Admin |
| PUT | `/admin/grades/:studentId` | Post or update grades | Admin |
| PUT | `/admin/schedules/:studentId` | Update class schedule | Admin |

---

## 📄 License

This project is intended for academic and capstone use only. All rights reserved by the project owners.
