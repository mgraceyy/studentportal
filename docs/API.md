# API Reference

Base URL: `http://localhost:5000/api`

All protected endpoints require the header:
```
Authorization: Bearer <token>
```

For the endpoint summary table, see the [README](../README.md#api-endpoints).

---

## Auth

### POST `/auth/login`

Login with email and password. Returns a JWT token.

**Request Body:**
```json
{ "email": "string", "password": "string" }
```

**Response (200):**
```json
{
  "token": "string",
  "role": "student|admin",
  "first_name": "string",
  "last_name": "string"
}
```

### POST `/auth/logout`

Logout (client removes token). Requires authentication.

### POST `/auth/reset-password`

Initiate password reset.

**Request Body:**
```json
{ "email": "string" }
```

---

## Student Endpoints

> Role required: `student`

### GET `/students/me`

Returns the logged-in student's profile: name, email, mobile, address, student number, course, year level, section, status, tuition balance.

### GET `/students/me/grades`

Returns the student's grades with `subject_code` and `subject_name`.

### GET `/students/me/schedule`

Returns the student's class schedule with `subject_code` and `subject_name`.

### GET `/students/subjects/available`

Lists subjects with available slots, filtered by the student's course. Only subjects linked via `subject_courses` are returned.

### GET `/students/me/enrollments`

Lists all subjects the student is currently enrolled in.

### GET `/students/enrollment-status`

Check if enrollment is currently open.

**Response (200):**
```json
{
  "enrollment_open": true,
  "enrollment_start": "2026-01-15T00:00:00",
  "enrollment_end": "2026-02-15T23:59:59",
  "is_open": true,
  "message": "Enrollment is open."
}
```

### POST `/students/me/enroll`

Enroll in a subject. Blocked with `403` if enrollment is closed or subject is not available for the student's course.

**Request Body:**
```json
{
  "subject_id": 1,
  "semester": "1st",
  "academic_year": "2025-2026"
}
```

**Error Codes:** `400` (full), `403` (closed/course mismatch), `404` (not found), `409` (already enrolled)

### DELETE `/students/me/enroll/:enrollmentId`

Drop an enrolled subject. Frees up one slot. Blocked with `403` if enrollment is closed.

---

## Admin Endpoints

> Role required: `admin`

### GET `/admin/students`

List all students with full user and student info.

### POST `/admin/students`

Add a new student.

**Request Body:**
```json
{
  "first_name": "string",
  "middle_name": "string",
  "last_name": "string",
  "mobile_number": "string",
  "address": "string",
  "email": "string",
  "password": "string",
  "student_number": "string",
  "course": "string",
  "year_level": 1,
  "section": "string"
}
```

### PUT `/admin/students/:id`

Update student info (user fields + course, year level, section, status, tuition balance).

### DELETE `/admin/students/:id`

Deactivate (delete) a student.

### PUT `/admin/grades/:studentId`

Add or update a grade record.

**Request Body:**
```json
{ "subject_id": 1, "semester": "1st", "grade": 1.25 }
```

### PUT `/admin/schedules/:studentId`

Add a schedule entry.

**Request Body:**
```json
{
  "subject_id": 1,
  "room": "Room 301",
  "day": "Monday",
  "time_start": "08:00",
  "time_end": "09:30"
}
```

### GET `/admin/subjects`

List all subjects. Each subject includes a `courses` array listing eligible courses.

### POST `/admin/subjects`

Create a subject. Pass a `courses` array to specify eligible courses.

**Request Body:**
```json
{
  "code": "CS101",
  "name": "Intro to Computer Science",
  "description": "string",
  "units": 3,
  "semester": "1st",
  "academic_year": "2025-2026",
  "room": "Room 301",
  "day": "Monday",
  "time_start": "08:00",
  "time_end": "09:30",
  "max_slots": 40,
  "courses": ["BSCS", "BSIT"]
}
```

### PUT `/admin/subjects/:id`

Update a subject. If `courses` array is provided, it replaces the existing course list.

### DELETE `/admin/subjects/:id`

Delete a subject.

### GET `/admin/enrollments`

View all enrollment records across all students.

### GET `/admin/enrollment-settings`

Get the current enrollment window settings (toggle + date range).

### PUT `/admin/enrollment-settings`

Update enrollment window. Admin can toggle on/off and set start/end dates.

**Request Body:**
```json
{
  "enrollment_open": true,
  "enrollment_start": "2026-01-15T00:00:00",
  "enrollment_end": "2026-02-15T23:59:59"
}
```

**Enrollment Logic:** Enrollment is allowed when **both** conditions are met:
1. `enrollment_open` is `true` (manual toggle)
2. Current time is between `enrollment_start` and `enrollment_end` (if dates are set)

The admin can force-close enrollment at any time by setting `enrollment_open` to `false`.

---

## Announcements

### GET `/announcements`

List all announcements. Requires authentication.

### POST `/announcements`

Create an announcement. Admin only.

**Request Body:**
```json
{ "title": "string", "body": "string" }
```

### PUT `/announcements/:id`

Update an announcement. Admin only.

### DELETE `/announcements/:id`

Delete an announcement. Admin only.

---

## Messages

### GET `/messages`

Get all messages for the logged-in user. Requires authentication.

### POST `/messages`

Send a message. Requires authentication.

**Request Body:**
```json
{ "receiver_id": 1, "body": "string" }
```
