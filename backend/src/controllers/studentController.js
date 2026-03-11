const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function getProfile(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT u.first_name, u.middle_name, u.last_name, u.email,
              u.mobile_number, u.address,
              s.student_number, s.course, s.year_level, s.section,
              s.status
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getGrades(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT sub.code AS subject_code, sub.name AS subject_name,
              g.semester, g.grade, g.updated_at
       FROM grades g
       JOIN students s ON g.student_id = s.id
       LEFT JOIN subjects sub ON g.subject_id = sub.id
       WHERE s.user_id = $1
       ORDER BY g.semester, sub.code`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getSchedule(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT sub.code AS subject_code, sub.name AS subject_name,
              sc.room, sc.day, sc.time_start, sc.time_end
       FROM schedules sc
       JOIN students s ON sc.student_id = s.id
       LEFT JOIN subjects sub ON sc.subject_id = sub.id
       WHERE s.user_id = $1
       ORDER BY sc.day, sc.time_start`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// ── Enrollment ──

async function isEnrollmentOpen() {
  const result = await pool.query('SELECT * FROM enrollment_settings WHERE id = 1');
  if (result.rows.length === 0) return { open: false, message: 'Enrollment settings not configured.' };

  const settings = result.rows[0];

  if (!settings.enrollment_open) {
    return { open: false, message: 'Enrollment is currently closed by the administrator.' };
  }

  const now = new Date();
  if (settings.enrollment_start && now < new Date(settings.enrollment_start)) {
    return { open: false, message: `Enrollment has not started yet. It opens on ${new Date(settings.enrollment_start).toLocaleString()}.` };
  }
  if (settings.enrollment_end && now > new Date(settings.enrollment_end)) {
    return { open: false, message: `Enrollment period has ended (closed on ${new Date(settings.enrollment_end).toLocaleString()}).` };
  }

  return { open: true, settings };
}

async function getEnrollmentStatus(req, res, next) {
  try {
    const result = await pool.query('SELECT enrollment_open, enrollment_start, enrollment_end FROM enrollment_settings WHERE id = 1');
    const settings = result.rows[0] || { enrollment_open: false };
    const status = await isEnrollmentOpen();
    res.json({ ...settings, is_open: status.open, message: status.open ? 'Enrollment is open.' : status.message });
  } catch (err) {
    next(err);
  }
}

async function getAvailableSubjects(req, res, next) {
  try {
    const studentResult = await pool.query(
      'SELECT course FROM students WHERE user_id = $1',
      [req.user.id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    const studentCourse = studentResult.rows[0].course;

    const result = await pool.query(
      `SELECT id, code, name, description, units, semester, academic_year,
              room, day, time_start, time_end, max_slots, current_slots
       FROM subjects
       WHERE current_slots < max_slots
       ORDER BY code`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getMyEnrollments(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT e.id, e.semester, e.academic_year, e.enrolled_at,
              sub.code AS subject_code, sub.name AS subject_name,
              sub.units, sub.room, sub.day, sub.time_start, sub.time_end
       FROM enrollments e
       JOIN subjects sub ON e.subject_id = sub.id
       JOIN students s ON e.student_id = s.id
       WHERE s.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function enrollSubject(req, res, next) {
  const enrollmentCheck = await isEnrollmentOpen();
  if (!enrollmentCheck.open) {
    return res.status(403).json({ error: enrollmentCheck.message });
  }

  const client = await pool.connect();
  try {
    const { subject_id, semester, academic_year } = req.body;

    await client.query('BEGIN');

    const studentResult = await client.query(
      'SELECT id, course FROM students WHERE user_id = $1',
      [req.user.id]
    );

    if (studentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Student record not found.' });
    }

    const studentId = studentResult.rows[0].id;

    const subjectResult = await client.query(
      'SELECT * FROM subjects WHERE id = $1',
      [subject_id]
    );

    if (subjectResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Subject not found.' });
    }

    const subject = subjectResult.rows[0];

    if (subject.current_slots >= subject.max_slots) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Subject is full. No available slots.' });
    }

    const enrollment = await client.query(
      `INSERT INTO enrollments (student_id, subject_id, semester, academic_year)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [studentId, subject_id, semester, academic_year]
    );

    await client.query(
      'UPDATE subjects SET current_slots = current_slots + 1 WHERE id = $1',
      [subject_id]
    );

    await client.query(
      "UPDATE students SET status = 'enrolled' WHERE id = $1",
      [studentId]
    );

    await client.query('COMMIT');
    res.status(201).json(enrollment.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Already enrolled in this subject for this semester.' });
    }
    next(err);
  } finally {
    client.release();
  }
}

async function dropSubject(req, res, next) {
  const enrollmentCheck = await isEnrollmentOpen();
  if (!enrollmentCheck.open) {
    return res.status(403).json({ error: enrollmentCheck.message });
  }

  const client = await pool.connect();
  try {
    const { enrollmentId } = req.params;

    await client.query('BEGIN');

    const studentResult = await client.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user.id]
    );

    if (studentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Student record not found.' });
    }

    const studentId = studentResult.rows[0].id;

    const enrollment = await client.query(
      'DELETE FROM enrollments WHERE id = $1 AND student_id = $2 RETURNING subject_id',
      [enrollmentId, studentId]
    );

    if (enrollment.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Enrollment not found.' });
    }

    await client.query(
      'UPDATE subjects SET current_slots = GREATEST(current_slots - 1, 0) WHERE id = $1',
      [enrollment.rows[0].subject_id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Subject dropped successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const valid = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const newHash = await bcrypt.hash(new_password, saltRounds);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile, getGrades, getSchedule, changePassword,
  getEnrollmentStatus, getAvailableSubjects, getMyEnrollments, enrollSubject, dropSubject,
};
