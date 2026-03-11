const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'student_portal',
  user: 'postgres',
  password: 'kali'
});

async function createStudent() {
  const hash = await bcrypt.hash('password', 10);
  await pool.query(
    "INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES ($1, $2, 'student', 'Grace', 'Test')",
    ['student@test.com', hash]
  );
  console.log('Student created: student@test.com / password');
  pool.end();
}

createStudent().catch(e => { console.error(e); pool.end(); });
