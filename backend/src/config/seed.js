const bcrypt = require('bcrypt');
const pool = require('./db');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

async function seed() {
  try {
    const passwordHash = await bcrypt.hash('password', SALT_ROUNDS);

    await pool.query(
      `INSERT INTO users (first_name, middle_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      ['Admin', 'Test', 'User', 'admin@test.com', passwordHash, 'admin']
    );

    console.log('Seed completed. Admin account created:');
    console.log('  Email:    admin@test.com');
    console.log('  Password: password');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
