const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token, role: user.role, first_name: user.first_name, last_name: user.last_name });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  // Client-side token removal; server can optionally blacklist the token
  res.json({ message: 'Logged out successfully.' });
}

async function resetPassword(req, res, next) {
  try {
    const { email } = req.body;
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found.' });
    }

    // TODO: Implement email-based password reset flow
    res.json({ message: 'Password reset instructions sent to your email.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, resetPassword };
