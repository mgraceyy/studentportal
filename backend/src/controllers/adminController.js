const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function getAllStudents(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, s.student_number, s.course, s.year_level, s.section
       FROM students s
       JOIN users u ON s.user_id = u.id
       ORDER BY u.name`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function addStudent(req, res, next) {
  const client = await pool.connect();
  try {
    const { name, email, password, student_number, course, year_level, section } = req.body;

    await client.query('BEGIN');

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const userResult = await client.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, password_hash, 'student']
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
    const { name, email, course, year_level, section } = req.body;

    await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email, id]);

    const result = await pool.query(
      `UPDATE students SET course = $1, year_level = $2, section = $3
       WHERE user_id = $4 RETURNING *`,
      [course, year_level, section, id]
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
    const { subject, semester, grade } = req.body;

    const result = await pool.query(
      `INSERT INTO grades (student_id, subject, semester, grade)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET grade = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [studentId, subject, semester, grade]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateSchedule(req, res, next) {
  try {
    const { studentId } = req.params;
    const { subject, room, day, time_start, time_end } = req.body;

    const result = await pool.query(
      `INSERT INTO schedules (student_id, subject, room, day, time_start, time_end)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [studentId, subject, room, day, time_start, time_end]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllStudents, addStudent, updateStudent, deactivateStudent, updateGrades, updateSchedule };
