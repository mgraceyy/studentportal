const pool = require('../config/db');

async function getAll(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT a.id, a.title, a.body, u.name AS posted_by, a.created_at
       FROM announcements a
       JOIN users u ON a.posted_by = u.id
       ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { title, body } = req.body;
    const result = await pool.query(
      'INSERT INTO announcements (title, body, posted_by) VALUES ($1, $2, $3) RETURNING *',
      [title, body, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { title, body } = req.body;
    const result = await pool.query(
      'UPDATE announcements SET title = $1, body = $2 WHERE id = $3 RETURNING *',
      [title, body, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    res.json({ message: 'Announcement deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove };
