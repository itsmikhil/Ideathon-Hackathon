import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'edugap',
});

// check all topic counts grouped by source
const r1 = await pool.query("SELECT source, COUNT(*) as cnt FROM ai_generated_topics GROUP BY source ORDER BY source");
console.log('Topics by source:', JSON.stringify(r1.rows));

// check a specific domain
const r2 = await pool.query("SELECT d.name, d.slug FROM domains d");
for (const domain of r2.rows) {
    const r = await pool.query(
        `SELECT COUNT(*) as cnt FROM ai_generated_topics WHERE domain_id = (SELECT id FROM domains WHERE slug=$1) AND source IN ('vit','both')`,
        [domain.slug]
    );
    console.log(`  ${domain.slug}: ${r.rows[0].cnt} VIT topics`);
}

await pool.end();
