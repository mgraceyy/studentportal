const bcrypt = require('bcrypt');
const pool = require('../config/db');

// ── Student Management ──

async function getAllStudents(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.middle_name, u.last_name, u.email,
              u.mobile_number, u.address, u.created_at,
              s.student_number, s.course, s.year_level, s.section,
              s.status
       FROM students s
       JOIN users u ON s.user_id = u.id
       ORDER BY u.created_at DESC`
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
      email, student_number, course, year_level, section,
    } = req.body;

    await client.query('BEGIN');

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const DEFAULT_PASSWORD = 'student@pass';
    const password_hash = await bcrypt.hash(DEFAULT_PASSWORD, saltRounds);

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
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Student number already exists.' });
    }
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
      email, course, year_level, section, status,
    } = req.body;

    await pool.query(
      `UPDATE users SET first_name = $1, middle_name = $2, last_name = $3,
       mobile_number = $4, address = $5, email = $6 WHERE id = $7`,
      [first_name, middle_name || null, last_name, mobile_number || null, address || null, email, id]
    );

    const result = await pool.query(
      `UPDATE students SET course = $1, year_level = $2, section = $3,
       status = $4
       WHERE user_id = $5 RETURNING *`,
      [course, year_level, section, status || 'not_enrolled', id]
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
    const result = await pool.query(
      `UPDATE students SET status = 'deactivated' WHERE user_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    res.json({ message: 'Student deactivated.' });
  } catch (err) {
    next(err);
  }
}

async function getAllGrades(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT g.id, g.semester, g.grade, g.updated_at,
              s.student_number, u.first_name, u.last_name, s.course,
              sub.code AS subject_code, sub.name AS subject_name
       FROM grades g
       JOIN students s ON g.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN subjects sub ON g.subject_id = sub.id
       ORDER BY g.updated_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function addGrade(req, res, next) {
  try {
    const { student_id, subject_id, semester, grade } = req.body;

    // student_id from frontend is u.id (user id); resolve to students.id
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [student_id]
    );
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    const actualStudentId = studentResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO grades (student_id, subject_id, semester, grade)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [actualStudentId, subject_id, semester, grade]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateGrade(req, res, next) {
  try {
    const { id } = req.params;
    const { grade } = req.body;

    const result = await pool.query(
      `UPDATE grades SET grade = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [grade, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grade record not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteGrade(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM grades WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grade record not found.' });
    }

    res.json({ message: 'Grade deleted.' });
  } catch (err) {
    next(err);
  }
}

async function getSchedules(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT sc.id, sc.room, sc.day, sc.time_start, sc.time_end,
              s.student_number, u.first_name, u.last_name,
              sub.id AS subject_id, sub.code AS subject_code, sub.name AS subject_name
       FROM schedules sc
       JOIN students s ON sc.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN subjects sub ON sc.subject_id = sub.id
       ORDER BY u.last_name, u.first_name, sc.time_start`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function addSchedule(req, res, next) {
  try {
    const { user_id, subject_id, room, day, time_start, time_end } = req.body;

    const result = await pool.query(
      `INSERT INTO schedules (student_id, subject_id, room, day, time_start, time_end)
       SELECT s.id, $2, $3, $4, $5, $6
       FROM students s WHERE s.user_id = $1
       RETURNING *`,
      [user_id, subject_id || null, room, day, time_start, time_end]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteSchedule(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM schedules WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }

    res.json({ message: 'Schedule deleted.' });
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
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function addSubject(req, res, next) {
  try {
    const {
      code, name, description, units, semester, academic_year,
      room, day, time_start, time_end, max_slots, prospectus_code,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO subjects (code, name, description, units, semester, academic_year, room, day, time_start, time_end, max_slots, created_by, prospectus_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [code, name, description || null, units || 3, semester, academic_year, room || null, day || null, time_start || null, time_end || null, max_slots || 40, req.user.id, prospectus_code || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateSubject(req, res, next) {
  try {
    const { id } = req.params;
    const {
      code, name, description, units, semester, academic_year,
      room, day, time_start, time_end, max_slots, prospectus_code,
    } = req.body;

    const result = await pool.query(
      `UPDATE subjects SET code = $1, name = $2, description = $3, units = $4,
       semester = $5, academic_year = $6, room = $7, day = $8,
       time_start = $9, time_end = $10, max_slots = $11, prospectus_code = $12
       WHERE id = $13 RETURNING *`,
      [code, name, description || null, units, semester, academic_year, room || null, day || null, time_start || null, time_end || null, max_slots, prospectus_code || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
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

// ── Admin Profile ──

async function getProfile(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, first_name, middle_name, last_name, email, mobile_number, address
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { first_name, last_name, email, mobile_number, address } = req.body;

    const result = await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, email = $3,
       mobile_number = $4, address = $5
       WHERE id = $6 RETURNING id, first_name, last_name, email, mobile_number, address`,
      [first_name, last_name, email, mobile_number || null, address || null, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;

    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const valid = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect.' });

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hash = await bcrypt.hash(new_password, saltRounds);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
}

// ── Prospectus ──

async function getProspectus(req, res, next) {
  try {
    const { course } = req.query;
    const result = await pool.query(
      `SELECT * FROM prospectus
       ${course ? 'WHERE course = $1' : ''}
       ORDER BY semester, code`,
      course ? [course] : []
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function addProspectus(req, res, next) {
  try {
    const { course, code, name, units, semester } = req.body;
    if (!course || !code || !name || !units || !semester) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const result = await pool.query(
      `INSERT INTO prospectus (course, code, name, units, semester)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [course, code.trim().toUpperCase(), name.trim(), parseInt(units), semester]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteProspectus(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM prospectus WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prospectus entry not found.' });
    }
    res.json({ message: 'Entry deleted.' });
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
  getAllGrades, addGrade, updateGrade, deleteGrade,
  getSchedules, addSchedule, deleteSchedule,
  getAllSubjects, addSubject, updateSubject, deleteSubject,
  getEnrollments,
  getProspectus, addProspectus, deleteProspectus,
  getEnrollmentSettings, updateEnrollmentSettings,
  getProfile, updateProfile, changePassword,
};
