const pool = require('../config/db');

async function getMessages(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT m.id, m.body, m.read_at, m.created_at,
              s.name AS sender_name, r.name AS receiver_name
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { receiver_id, body } = req.body;
    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, body) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, receiver_id, body]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMessages, sendMessage };
