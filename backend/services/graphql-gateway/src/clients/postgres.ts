import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://newsmaker:newsmaker_dev_password@localhost:5432/newsmaker';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ PostgreSQL connected directly');
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err);
    return false;
  }
}

