const pool = require('../config/db');

async function getProfile(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT u.name, u.email, s.student_number, s.course, s.year_level, s.section
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
      `SELECT g.subject, g.semester, g.grade, g.updated_at
       FROM grades g
       JOIN students s ON g.student_id = s.id
       WHERE s.user_id = $1
       ORDER BY g.semester, g.subject`,
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
      `SELECT sc.subject, sc.room, sc.day, sc.time_start, sc.time_end
       FROM schedules sc
       JOIN students s ON sc.student_id = s.id
       WHERE s.user_id = $1
       ORDER BY sc.day, sc.time_start`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, getGrades, getSchedule };
