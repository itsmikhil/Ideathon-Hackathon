import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
});

pool.query('DELETE FROM online_resources').then(r => {
    console.log('✅ Cleared', r.rowCount, 'stale cached resources from DB');
    pool.end();
}).catch(e => {
    console.error('Error:', e.message);
    pool.end();
});
