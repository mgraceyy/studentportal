# Product Requirements Document

## Overview

The Student Portal App is a full-stack academic information system. Students use an Android app to view their profile, enroll in subjects, check grades and schedules, read announcements, and message administrators. Admins use a web panel to manage all content.

---

## User Roles

| Role | Interface | Capabilities |
|---|---|---|
| Student | Android App | View profile, enroll/drop subjects, view grades, schedule, announcements, messaging |
| Admin | Web Panel | Manage students, subjects, enrollments, grades, schedules, announcements, messaging |

---

## Core Features

### 1. Authentication
- Email + password login for both students and admins
- JWT-based session management (7-day expiry)
- Password reset flow (placeholder for email integration)

### 2. Student Profile
- Displays: first name, middle name, last name, email, mobile number, address
- Academic info: student number, course, year level, section
- Status: enrolled / not enrolled
- Tuition balance

### 3. Subject Management (Admin)
- Admins create subjects with: code, name, description, units, semester, academic year
- Each subject has optional schedule info: room, day, time start/end
- Max slots limit controls enrollment capacity
- Current slots tracked automatically
- **Course eligibility**: each subject is assigned one or more courses (e.g., BSCS, BSIT) via the `subject_courses` table. Only students whose course matches can see and enroll in the subject.

### 4. Enrollment (Student)
- Students only see subjects available for their course
- Students enroll in subjects for a given semester/academic year
- Duplicate enrollment prevention (unique constraint)
- Students can drop subjects (frees up slots)
- Admin can view all enrollment records
- **Enrollment Window**: Admin controls when enrollment is allowed via:
  - **Manual toggle**: on/off switch to instantly open or close enrollment
  - **Date range**: optional start and end dates for the enrollment period
  - Enrollment is only allowed when the toggle is ON **and** the current time is within the date range (if set)
  - Admin can force-close enrollment at any time by turning off the toggle
  - Students see a banner indicating whether enrollment is open or closed

### 5. Grades
- Admin posts grades per student, per subject, per semester
- Students view their own grades linked to subject code/name

### 6. Class Schedule
- Admin assigns schedule entries per student linked to subjects
- Students view their schedule with subject code, room, day, and time

### 7. Announcements
- Admin creates, edits, and deletes announcements
- All authenticated users can view announcements

### 8. Messaging
- Any authenticated user can send and receive messages
- Messages show sender name, body, and timestamp

---

## Database Tables

10 tables: `users`, `students`, `subjects`, `subject_courses`, `enrollments`, `grades`, `schedules`, `announcements`, `messages`, `enrollment_settings`

See [WIKI.md](../WIKI.md#5-database-overview) for full schema details.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (Android) |
| Admin Panel | React (Web) |
| Backend API | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |

---

## Non-Functional Requirements

- Passwords hashed with bcrypt (configurable salt rounds)
- JWT tokens expire after 7 days
- CORS enabled for cross-origin requests
- Error handling middleware catches all unhandled errors
- Database transactions used for multi-table operations (student creation, enrollment)
