const pool = require('../config/db');

// Get all conversations for the logged-in user
// Returns one entry per unique conversation partner with the latest message
async function getConversations(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT
          t.partner_id,
          t.partner_name,
          t.body AS last_message,
          t.created_at AS last_message_at,
          COALESCE(u.cnt, 0) AS unread_count
       FROM (
           SELECT
               CASE WHEN m.sender_id = $1::int THEN m.receiver_id ELSE m.sender_id END AS partner_id,
               CASE WHEN m.sender_id = $1::int
                   THEN CONCAT(r.first_name, ' ', r.last_name)
                   ELSE CONCAT(s.first_name, ' ', s.last_name)
               END AS partner_name,
               m.body,
               m.created_at,
               ROW_NUMBER() OVER (
                   PARTITION BY CASE WHEN m.sender_id = $1::int THEN m.receiver_id ELSE m.sender_id END
                   ORDER BY m.created_at DESC
               ) AS rn
           FROM messages m
           JOIN users s ON m.sender_id = s.id
           JOIN users r ON m.receiver_id = r.id
           WHERE m.sender_id = $1::int OR m.receiver_id = $1::int
       ) t
       LEFT JOIN (
           SELECT sender_id, COUNT(*) AS cnt
           FROM messages
           WHERE receiver_id = $1::int AND read_at IS NULL
           GROUP BY sender_id
       ) u ON u.sender_id = t.partner_id
       WHERE t.rn = 1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// Get full message thread between logged-in user and a specific partner
async function getThread(req, res, next) {
  try {
    const { partnerId } = req.params;

    // Mark messages from partner as read
    await pool.query(
      `UPDATE messages SET read_at = NOW()
       WHERE sender_id = $1 AND receiver_id = $2 AND read_at IS NULL`,
      [partnerId, req.user.id]
    );

    const result = await pool.query(
      `SELECT m.id, m.body, m.created_at, m.read_at,
              m.sender_id, m.receiver_id,
              CONCAT(s.first_name, ' ', s.last_name) AS sender_name
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC`,
      [req.user.id, partnerId]
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

async function searchUsers(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const result = await pool.query(
      `SELECT id, first_name, last_name, role
       FROM users
       WHERE id != $1
         AND (
           LOWER(first_name || ' ' || last_name) LIKE LOWER($2)
           OR LOWER(first_name) LIKE LOWER($2)
           OR LOWER(last_name) LIKE LOWER($2)
         )
       ORDER BY first_name, last_name
       LIMIT 10`,
      [req.user.id, `%${q}%`]
    );
    res.json(result.rows.map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      role: u.role,
    })));
  } catch (err) {
    next(err);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) AS count FROM messages WHERE receiver_id = $1 AND read_at IS NULL',
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getConversations, getThread, sendMessage, searchUsers, getUnreadCount };
