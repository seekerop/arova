const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// 1. Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let databaseUrl = process.env.DATABASE_URL;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=') && !trimmed.startsWith('#')) {
      databaseUrl = trimmed.substring('DATABASE_URL='.length).trim();
      // Remove any surrounding quotes
      if ((databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) ||
          (databaseUrl.startsWith("'") && databaseUrl.endsWith("'"))) {
        databaseUrl = databaseUrl.slice(1, -1);
      }
    }
  }
}

if (!databaseUrl) {
  console.error('\x1b[31m[ERROR] DATABASE_URL is not set in .env.local\x1b[0m');
  console.log('\nPlease add your Supabase connection string to .env.local:');
  console.log('\x1b[33mDATABASE_URL=postgresql://postgres.hcyudsqcvfjpytrqtajw:[YOUR-DATABASE-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres\x1b[0m\n');
  console.log('You can find your database password from when you created the project in Supabase.');
  console.log('Alternatively, you can run supabase/full_schema_migration.sql directly in your Supabase SQL Editor.');
  process.exit(1);
}

async function runMigrations() {
  console.log('\x1b[36mConnecting to Supabase PostgreSQL...\x1b[0m');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('\x1b[32m✔ Connected to Supabase!\x1b[0m');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'full_schema_migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('\x1b[36mApplying all database migrations to Supabase...\x1b[0m');
    await client.query(sql);
    console.log('\x1b[32m✔ All database migrations applied successfully!\x1b[0m\n');

    // Verify created tables
    const tablesRes = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('\x1b[34mActive public tables in Supabase:\x1b[0m');
    tablesRes.rows.forEach(r => console.log(`  • ${r.table_name}`));

    // Verify categories
    const catsRes = await client.query("SELECT name, slug FROM public.categories ORDER BY display_order");
    console.log('\n\x1b[34mSeeded approved categories:\x1b[0m');
    catsRes.rows.forEach(c => console.log(`  • ${c.name} (${c.slug})`));

    // Verify plans
    const plansRes = await client.query("SELECT name, price_paise, lead_allocation FROM public.plans");
    console.log('\n\x1b[34mSeeded subscription plans:\x1b[0m');
    plansRes.rows.forEach(p => console.log(`  • ${p.name}: ₹${p.price_paise / 100} (${p.lead_allocation} leads)`));

  } catch (err) {
    console.error('\x1b[31mMigration error:\x1b[0m', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();

