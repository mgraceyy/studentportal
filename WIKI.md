# Student Portal App — Project Wiki

Central knowledge base covering architecture, database schema, authentication flow, and development workflow.

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [System Architecture](#2-system-architecture)
3. [Module Breakdown](#3-module-breakdown)
4. [User Roles](#4-user-roles)
5. [Database Overview](#5-database-overview)
6. [Authentication Flow](#6-authentication-flow)
7. [Development Workflow](#7-development-workflow)

---

## 1. Project Summary

The Student Portal App is a full-stack academic information system. It consists of three components:

- **Android Mobile App** — for students to access their academic data
- **Web Admin Panel** — for school administrators to manage content
- **Backend REST API** — the central data layer connecting both interfaces

---

## 2. System Architecture

```
┌─────────────────────┐        ┌─────────────────────┐
│   Android Mobile    │        │   Web Admin Panel   │
│   (React Native)    │        │      (React)        │
└────────┬────────────┘        └──────────┬──────────┘
         │                                │
         └──────────────┬─────────────────┘
                        │ HTTP / REST
               ┌────────▼────────┐
               │   Backend API   │
               │  (Node/Express) │
               └────────┬────────┘
                        │
               ┌────────▼────────┐
               │   PostgreSQL    │
               └─────────────────┘
```

---

## 3. Module Breakdown

### Mobile App (Student-facing)

| Module | Screen(s) | Notes |
|---|---|---|
| Authentication | Login, Reset Password | JWT stored securely on device |
| Profile | Student Profile | Read-only view of student data |
| Enrollment | Available Subjects, My Enrollments | Browse and enroll in subjects with available slots |
| Grades | Grades List | Filtered by semester, linked to subjects |
| Announcements | Announcements Feed | Sorted by latest |
| Schedule | Class Schedule | Displayed in a timetable layout |
| Messaging | Inbox, Compose | Internal messaging only |

### Admin Panel (Administrator-facing)

| Module | Page(s) | Notes |
|---|---|---|
| Authentication | Admin Login | Separate credentials from students |
| Student Management | Student List, Edit Student | Full CRUD with enrollment status and tuition balance |
| Subject Management | Subject List, Create/Edit Subject | Manage subject code, units, schedule, max slots |
| Enrollment Records | Enrollment List | View all student enrollment records |
| Grades Management | Grade Entry Form | Per student, per subject |
| Announcements | Announcement List, Create/Edit | Rich text optional |
| Schedule Management | Schedule Editor | Assign rooms and time slots |
| Messaging | Message Center | View and reply to student messages |

---

## 4. User Roles

| Role | Interface | Access |
|---|---|---|
| **Student** | Android App | Read-only (own data only) |
| **Administrator** | Web Admin Panel | Full CRUD across all modules |

> There are no super-admin or multi-role hierarchies in v1.0.

---

## 5. Database Overview

The database has **10 tables**. Below is the full schema.

### Core Tables

```
users
├── id
├── first_name
├── middle_name
├── last_name
├── mobile_number
├── address
├── email
├── password_hash
├── role (student | admin)
└── created_at

students
├── id
├── user_id (FK → users)
├── student_number
├── course
├── year_level
├── section
├── status (enrolled | not_enrolled)
└── tuition_balance

subjects
├── id
├── code (unique)
├── name
├── description
├── units
├── semester
├── academic_year
├── room
├── day
├── time_start
├── time_end
├── max_slots
├── current_slots
├── created_by (FK → users)
└── created_at

subject_courses
├── id
├── subject_id (FK → subjects)
└── course
    (UNIQUE: subject_id + course)
    Links subjects to eligible courses.

enrollments
├── id
├── student_id (FK → students)
├── subject_id (FK → subjects)
├── semester
├── academic_year
└── enrolled_at
    (UNIQUE: student_id + subject_id + semester + academic_year)

grades
├── id
├── student_id (FK → students)
├── subject_id (FK → subjects)
├── semester
├── grade
└── updated_at

schedules
├── id
├── student_id (FK → students)
├── subject_id (FK → subjects)
├── room
├── day
├── time_start
└── time_end

enrollment_settings
├── id
├── enrollment_open (boolean)
├── enrollment_start (timestamp)
├── enrollment_end (timestamp)
├── updated_by (FK → users)
└── updated_at

announcements
├── id
├── title
├── body
├── posted_by (FK → users)
└── created_at

messages
├── id
├── sender_id (FK → users)
├── receiver_id (FK → users)
├── body
├── read_at
└── created_at
```

---

## 6. Authentication Flow

```
1. User submits credentials (email + password)
2. Backend verifies email exists in DB
3. bcrypt compares submitted password with stored hash
4. On success → generate JWT (signed with JWT_SECRET)
5. JWT returned to client and stored locally
6. All protected routes require Authorization: Bearer <token> header
7. Backend middleware validates token on every request
8. Token expires after 7 days — user must log in again
```

---

## 7. Development Workflow

```
main          ← production-ready, stable releases only
  └── dev     ← integration branch, all features merge here first
        ├── feature/student-login
        ├── feature/grades-screen
        └── fix/token-expiry-bug
```

- All new work branches off `dev`
- PRs must be reviewed before merging into `dev`
- `dev` is merged into `main` only at milestone completions
- See [CONTRIBUTING.md](CONTRIBUTING.md) for full branch and commit guidelines
