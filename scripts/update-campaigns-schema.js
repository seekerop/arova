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

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase. Updating campaign schema...');

  await client.query(`
    ALTER TABLE reddit_campaigns
    ADD COLUMN IF NOT EXISTS product_brief TEXT,
    ADD COLUMN IF NOT EXISTS target_country TEXT DEFAULT 'India',
    ADD COLUMN IF NOT EXISTS website_url TEXT DEFAULT 'https://arova.arenova.in',
    ADD COLUMN IF NOT EXISTS auto_post BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS threads_found INT DEFAULT 0;

    ALTER TABLE reddit_opportunities
    ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES reddit_campaigns(id) ON DELETE SET NULL;

    ALTER TABLE reddit_content_drafts
    ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES reddit_campaigns(id) ON DELETE SET NULL;
  `);

  console.log('✔ Updated reddit_campaigns with product_brief, target_country, website_url, auto_post, threads_found!');
  await client.end();
}

main().catch(err => {
  console.error('Schema update failed:', err);
  process.exit(1);
});
