import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
});


async function initializeDatabase() {
  try {
    await db.query('SELECT 1');
    console.log('Database connection established');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    throw err;
  }
}

export { initializeDatabase, db };
