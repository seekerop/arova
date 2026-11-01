const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.join(__dirname, '..', '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
let dbUrl = '';
for (const line of env.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('DATABASE_URL=')) {
    dbUrl = trimmed.substring('DATABASE_URL='.length).trim();
    if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
      dbUrl = dbUrl.slice(1, -1);
    }
  }
}

const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '20261101000000_reddit_growth.sql');
const sql = fs.readFileSync(migrationFile, 'utf8');

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase. Applying Reddit Growth migration...');
  await client.query(sql);

  // Add Groq AI configuration support
  await client.query(`
    ALTER TABLE reddit_settings 
    ADD COLUMN IF NOT EXISTS groq_api_key TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'llama-3.3-70b-versatile';
    UPDATE reddit_settings SET ai_model = 'llama-3.3-70b-versatile' WHERE id = 1 AND (ai_model IS NULL OR ai_model = 'gemini-1.5-flash');
  `);
  console.log('✔ Groq AI configuration added to reddit_settings!');

  const res = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'reddit_%' ORDER BY table_name"
  );
  console.log('Active Reddit tables:');
  res.rows.forEach(r => console.log('  •', r.table_name));

  const countRes = await client.query("SELECT COUNT(*) FROM reddit_communities");
  console.log(`Seeded ${countRes.rows[0].count} communities.`);

  await client.end();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
