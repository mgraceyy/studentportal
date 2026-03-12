require('dotenv').config();
const { Client } = require('pg');

async function createDatabaseIfMissing() {
  const dbName = process.env.DB_NAME;
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);

    if (existing.rowCount > 0) {
      console.log('Database already exists:', dbName);
      return;
    }

    const safeDbName = dbName.replace(/"/g, '""');
    await client.query(`CREATE DATABASE "${safeDbName}"`);
    console.log('Database created:', dbName);
  } catch (err) {
    console.error('Create database failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

createDatabaseIfMissing();
