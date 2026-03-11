# Student Portal App

A full-stack academic portal system with an Android mobile app for students, a web-based admin panel for administrators, and a RESTful backend API.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native 0.76 (Android) |
| Admin Panel | React 18 (Web) |
| Backend API | Node.js + Express 4 |
| Database | PostgreSQL |
| Authentication | JWT + bcrypt |

---

## Prerequisites

Install the following tools before setting up the project. Versions listed are the minimum required.

| Tool | Version | Download |
|---|---|---|
| **Node.js** | v18+ | https://nodejs.org/ |
| **npm** | comes with Node.js | — |
| **Git** | latest | https://git-scm.com/downloads |
| **PostgreSQL** | v14+ | https://www.postgresql.org/download/ |
| **Android Studio** | latest (for mobile dev) | https://developer.android.com/studio |
| **JDK** | 17 (for React Native builds) | https://adoptium.net/ |

### Additional Setup for Mobile Development

1. Install **Android Studio** and during setup, make sure the following are checked:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)
2. Create an Android emulator via AVD Manager, or connect a physical device with USB debugging enabled.
3. Set the `ANDROID_HOME` environment variable to your Android SDK location.
4. Add `platform-tools` to your system PATH.

> Refer to the [React Native environment setup guide](https://reactnative.dev/docs/set-up-your-environment) if you run into issues.

---

## Project Structure

```
studentportal/
├── backend/                 # Node.js + Express REST API
│   ├── src/
│   │   ├── config/          # DB connection, migrations, seed
│   │   ├── controllers/     # Route handler logic
│   │   ├── middleware/       # Auth & error handling
│   │   ├── models/          # Database models
│   │   └── routes/          # API route definitions
│   ├── .env.example         # Environment variable template
│   └── package.json
│
├── admin-panel/             # React web admin interface
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Admin pages
│   │   └── services/        # API call functions
│   └── package.json
│
├── mobile/                  # React Native Android app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── navigation/      # Stack & tab navigation
│   │   ├── screens/         # App screens
│   │   ├── services/        # API call functions
│   │   └── utils/           # Helpers and constants
│   ├── android/             # Android native files
│   └── package.json
│
├── docs/                    # Documentation
│   ├── API.md               # Full API reference
│   └── PRD.md               # Product requirements
│
├── CONTRIBUTING.md           # Contribution guidelines
├── WIKI.md                   # Architecture & dev notes
└── README.md
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mgraceyy/studentportal.git
cd studentportal
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env        # Then fill in your values (see section below)
npm run migrate              # Create database tables
npm run seed                 # Seed initial data (admin account, etc.)
npm run dev                  # Start dev server with hot reload
```

The backend runs on **http://localhost:5000**.

### 3. Admin Panel Setup

```bash
cd admin-panel
npm install
npm start
```

The admin panel runs on **http://localhost:3000**.

### 4. Mobile App Setup

```bash
cd mobile
npm install
npm start                    # Start Metro bundler
# In a separate terminal:
npm run android              # Build and install on emulator/device
```

> Make sure an Android emulator is running or a physical device is connected via USB debugging.

---

## Environment Variables

Create a `.env` file inside `backend/` using the template:

```bash
cp backend/.env.example backend/.env
```

Then fill in the values:

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

> **Never commit your `.env` file.** It is already in `.gitignore`.

---

## API Endpoints

Base URL: `http://localhost:5000/api`

All protected endpoints require the header: `Authorization: Bearer <token>`

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
| GET | `/students/enrollment-status` | Check if enrollment is open | Student |
| GET | `/students/subjects/available` | List available subjects | Student |
| GET | `/students/me/enrollments` | Get enrolled subjects | Student |
| POST | `/students/me/enroll` | Enroll in a subject | Student |
| DELETE | `/students/me/enroll/:enrollmentId` | Drop a subject | Student |

### Announcements
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/announcements` | Get all announcements | Authenticated |
| POST | `/announcements` | Create announcement | Admin |
| PUT | `/announcements/:id` | Update announcement | Admin |
| DELETE | `/announcements/:id` | Delete announcement | Admin |

### Messages
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
| GET | `/admin/subjects` | Get all subjects | Admin |
| POST | `/admin/subjects` | Add a new subject | Admin |
| PUT | `/admin/subjects/:id` | Update a subject | Admin |
| DELETE | `/admin/subjects/:id` | Delete a subject | Admin |
| GET | `/admin/enrollments` | View all enrollments | Admin |
| GET | `/admin/enrollment-settings` | Get enrollment settings | Admin |
| PUT | `/admin/enrollment-settings` | Update enrollment window | Admin |

> For full request/response details, see [docs/API.md](docs/API.md).

---

## Documentation

| Document | Description |
|---|---|
| [docs/API.md](docs/API.md) | Full API reference with request/response examples |
| [docs/PRD.md](docs/PRD.md) | Product requirements and feature specs |
| [WIKI.md](WIKI.md) | Architecture, database schema, and dev notes |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Branch naming, commit format, and PR process |

---

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before making changes. Key points:

- Branch off `dev`, never push directly to `main` or `dev`
- Follow the commit message format: `feat:`, `fix:`, `chore:`, `docs:`
- Open PRs against `dev` and request a review before merging

---

## License

This project is intended for academic and capstone use only. All rights reserved by the project owners.
