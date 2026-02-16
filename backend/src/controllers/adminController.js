const bcrypt = require('bcrypt');
const pool = require('../config/db');

// ── Student Management ──

async function getAllStudents(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.middle_name, u.last_name, u.email,
              u.mobile_number, u.address,
              s.student_number, s.course, s.year_level, s.section,
              s.status, s.tuition_balance
       FROM students s
       JOIN users u ON s.user_id = u.id
       ORDER BY u.last_name, u.first_name`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function addStudent(req, res, next) {
  const client = await pool.connect();
  try {
    const {
      first_name, middle_name, last_name, mobile_number, address,
      email, password, student_number, course, year_level, section,
    } = req.body;

    await client.query('BEGIN');

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const userResult = await client.query(
      `INSERT INTO users (first_name, middle_name, last_name, mobile_number, address, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [first_name, middle_name || null, last_name, mobile_number || null, address || null, email, password_hash, 'student']
    );

    const userId = userResult.rows[0].id;

    const studentResult = await client.query(
      'INSERT INTO students (user_id, student_number, course, year_level, section) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, student_number, course, year_level, section]
    );

    await client.query('COMMIT');
    res.status(201).json(studentResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const {
      first_name, middle_name, last_name, mobile_number, address,
      email, course, year_level, section, status, tuition_balance,
    } = req.body;

    await pool.query(
      `UPDATE users SET first_name = $1, middle_name = $2, last_name = $3,
       mobile_number = $4, address = $5, email = $6 WHERE id = $7`,
      [first_name, middle_name || null, last_name, mobile_number || null, address || null, email, id]
    );

    const result = await pool.query(
      `UPDATE students SET course = $1, year_level = $2, section = $3,
       status = $4, tuition_balance = $5
       WHERE user_id = $6 RETURNING *`,
      [course, year_level, section, status || 'not_enrolled', tuition_balance || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deactivateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id', [id, 'student']);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    res.json({ message: 'Student deactivated.' });
  } catch (err) {
    next(err);
  }
}

async function updateGrades(req, res, next) {
  try {
    const { studentId } = req.params;
    const { subject_id, semester, grade } = req.body;

    const result = await pool.query(
      `INSERT INTO grades (student_id, subject_id, semester, grade)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [studentId, subject_id, semester, grade]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateSchedule(req, res, next) {
  try {
    const { studentId } = req.params;
    const { subject_id, room, day, time_start, time_end } = req.body;

    const result = await pool.query(
      `INSERT INTO schedules (student_id, subject_id, room, day, time_start, time_end)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [studentId, subject_id, room, day, time_start, time_end]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// ── Subject Management ──

async function getAllSubjects(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT s.*, u.first_name || ' ' || u.last_name AS created_by_name
       FROM subjects s
       LEFT JOIN users u ON s.created_by = u.id
       ORDER BY s.code`
    );

    const coursesResult = await pool.query(
      'SELECT subject_id, course FROM subject_courses ORDER BY course'
    );

    const courseMap = {};
    for (const row of coursesResult.rows) {
      if (!courseMap[row.subject_id]) courseMap[row.subject_id] = [];
      courseMap[row.subject_id].push(row.course);
    }

    const subjects = result.rows.map((s) => ({
      ...s,
      courses: courseMap[s.id] || [],
    }));

    res.json(subjects);
  } catch (err) {
    next(err);
  }
}

async function addSubject(req, res, next) {
  const client = await pool.connect();
  try {
    const {
      code, name, description, units, semester, academic_year,
      room, day, time_start, time_end, max_slots, courses,
    } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO subjects (code, name, description, units, semester, academic_year, room, day, time_start, time_end, max_slots, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [code, name, description || null, units || 3, semester, academic_year, room || null, day || null, time_start || null, time_end || null, max_slots || 40, req.user.id]
    );

    const subject = result.rows[0];

    if (courses && courses.length > 0) {
      for (const course of courses) {
        await client.query(
          'INSERT INTO subject_courses (subject_id, course) VALUES ($1, $2)',
          [subject.id, course]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ ...subject, courses: courses || [] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function updateSubject(req, res, next) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      code, name, description, units, semester, academic_year,
      room, day, time_start, time_end, max_slots, courses,
    } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE subjects SET code = $1, name = $2, description = $3, units = $4,
       semester = $5, academic_year = $6, room = $7, day = $8,
       time_start = $9, time_end = $10, max_slots = $11
       WHERE id = $12 RETURNING *`,
      [code, name, description || null, units, semester, academic_year, room || null, day || null, time_start || null, time_end || null, max_slots, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Subject not found.' });
    }

    if (courses !== undefined) {
      await client.query('DELETE FROM subject_courses WHERE subject_id = $1', [id]);
      for (const course of courses) {
        await client.query(
          'INSERT INTO subject_courses (subject_id, course) VALUES ($1, $2)',
          [id, course]
        );
      }
    }

    await client.query('COMMIT');

    const coursesResult = await pool.query(
      'SELECT course FROM subject_courses WHERE subject_id = $1 ORDER BY course',
      [id]
    );

    res.json({ ...result.rows[0], courses: coursesResult.rows.map((r) => r.course) });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function deleteSubject(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM subjects WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    res.json({ message: 'Subject deleted.' });
  } catch (err) {
    next(err);
  }
}

// ── Enrollment Management (admin view) ──

async function getEnrollments(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT e.id, e.semester, e.academic_year, e.enrolled_at,
              s.student_number, u.first_name, u.last_name,
              sub.code AS subject_code, sub.name AS subject_name
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN subjects sub ON e.subject_id = sub.id
       ORDER BY e.enrolled_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// ── Enrollment Settings ──

async function getEnrollmentSettings(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM enrollment_settings WHERE id = 1');
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateEnrollmentSettings(req, res, next) {
  try {
    const { enrollment_open, enrollment_start, enrollment_end } = req.body;

    const result = await pool.query(
      `UPDATE enrollment_settings
       SET enrollment_open = $1, enrollment_start = $2, enrollment_end = $3,
           updated_by = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = 1 RETURNING *`,
      [enrollment_open, enrollment_start || null, enrollment_end || null, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllStudents, addStudent, updateStudent, deactivateStudent,
  updateGrades, updateSchedule,
  getAllSubjects, addSubject, updateSubject, deleteSubject,
  getEnrollments,
  getEnrollmentSettings, updateEnrollmentSettings,
};
