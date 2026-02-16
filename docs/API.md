# API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require the header: `Authorization: Bearer <token>`

Refer to the [README.md](../README.md#-api-endpoints) for the endpoint summary table.

---

## Auth

### POST `/auth/login`
Login with email and password. Returns a JWT token.

**Body:**
```json
{ "email": "string", "password": "string" }
```

**Response:**
```json
{ "token": "string", "role": "student|admin", "first_name": "string", "last_name": "string" }
```

### POST `/auth/logout`
Logout (client removes token). **Requires auth.**

### POST `/auth/reset-password`
Initiate password reset.

**Body:**
```json
{ "email": "string" }
```

---

## Student Endpoints (role: student)

### GET `/students/me`
Returns the logged-in student's profile (first_name, middle_name, last_name, email, mobile_number, address, student_number, course, year_level, section, status, tuition_balance).

### GET `/students/me/grades`
Returns the student's grades with subject_code and subject_name.

### GET `/students/me/schedule`
Returns the student's class schedule with subject_code and subject_name.

### GET `/students/subjects/available`
Lists all subjects with available slots (`current_slots < max_slots`).

### GET `/students/me/enrollments`
Lists all subjects the student is enrolled in.

### GET `/students/enrollment-status`
Check if enrollment is currently open. Returns toggle state, date range, and a human-readable message.

**Response:**
```json
{ "enrollment_open": true, "enrollment_start": "2026-01-15T00:00:00", "enrollment_end": "2026-02-15T23:59:59", "is_open": true, "message": "Enrollment is open." }
```

### POST `/students/me/enroll`
Enroll in a subject. Blocked with 403 if enrollment is closed.

**Body:**
```json
{ "subject_id": 1, "semester": "1st", "academic_year": "2025-2026" }
```

**Errors:** 400 (full), 403 (enrollment closed), 404 (not found), 409 (already enrolled)

### DELETE `/students/me/enroll/:enrollmentId`
Drop an enrolled subject. Frees up one slot. Blocked with 403 if enrollment is closed.

---

## Admin Endpoints (role: admin)

### GET `/admin/students`
List all students with full user and student info.

### POST `/admin/students`
Add a new student.

**Body:**
```json
{
  "first_name": "string", "middle_name": "string", "last_name": "string",
  "mobile_number": "string", "address": "string",
  "email": "string", "password": "string",
  "student_number": "string", "course": "string",
  "year_level": 1, "section": "string"
}
```

### PUT `/admin/students/:id`
Update student info (user fields + course, year_level, section, status, tuition_balance).

### DELETE `/admin/students/:id`
Deactivate (delete) a student.

### PUT `/admin/grades/:studentId`
Add a grade record.

**Body:**
```json
{ "subject_id": 1, "semester": "1st", "grade": 1.25 }
```

### PUT `/admin/schedules/:studentId`
Add a schedule entry.

**Body:**
```json
{ "subject_id": 1, "room": "Room 301", "day": "Monday", "time_start": "08:00", "time_end": "09:30" }
```

### GET `/admin/subjects`
List all subjects.

### POST `/admin/subjects`
Create a subject.

**Body:**
```json
{
  "code": "CS101", "name": "Intro to Computer Science",
  "description": "string", "units": 3,
  "semester": "1st", "academic_year": "2025-2026",
  "room": "Room 301", "day": "Monday",
  "time_start": "08:00", "time_end": "09:30",
  "max_slots": 40
}
```

### PUT `/admin/subjects/:id`
Update a subject.

### DELETE `/admin/subjects/:id`
Delete a subject.

### GET `/admin/enrollments`
View all enrollment records across all students.

### GET `/admin/enrollment-settings`
Get the current enrollment window settings (toggle + date range).

### PUT `/admin/enrollment-settings`
Update enrollment window. Admin can toggle on/off and set start/end dates.

**Body:**
```json
{ "enrollment_open": true, "enrollment_start": "2026-01-15T00:00:00", "enrollment_end": "2026-02-15T23:59:59" }
```

Logic: Enrollment is allowed when **both** conditions are met:
1. `enrollment_open` is `true` (manual toggle)
2. Current time is between `enrollment_start` and `enrollment_end` (if dates are set)

The admin can force-close enrollment at any time by setting `enrollment_open` to `false`, even within the date range.

---

## Announcements

### GET `/announcements`
List all announcements. **Requires auth.**

### POST `/announcements`
Create an announcement. **Admin only.**

**Body:**
```json
{ "title": "string", "body": "string" }
```

### PUT `/announcements/:id`
Update an announcement. **Admin only.**

### DELETE `/announcements/:id`
Delete an announcement. **Admin only.**

---

## Messages

### GET `/messages`
Get all messages for the logged-in user. **Requires auth.**

### POST `/messages`
Send a message. **Requires auth.**

**Body:**
```json
{ "receiver_id": 1, "body": "string" }
```
