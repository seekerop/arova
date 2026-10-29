const { Client } = require('D:/Code/cold-outreach-agent/node_modules/pg');
const fs = require('fs');
const path = require('path');

async function setup() {
  const rootClient = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  });
  await rootClient.connect();
  const dbs = await rootClient.query("SELECT 1 FROM pg_database WHERE datname = 'arova'");
  if (dbs.rows.length === 0) {
    await rootClient.query('CREATE DATABASE arova');
    console.log('Created database arova');
  } else {
    console.log('Database arova already exists');
  }
  await rootClient.end();

  const arovaClient = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'arova'
  });
  await arovaClient.connect();
  console.log('Connected to arova DB');

  let sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20261030000000_arova_schema.sql'), 'utf8');

  // Supabase auth.users and auth.uid() simulation for standalone postgres if auth schema doesn't exist
  await arovaClient.query(`
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE IF NOT EXISTS auth.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
      SELECT NULL::UUID;
    $$ LANGUAGE sql STABLE;
  `);

  try {
    await arovaClient.query(sql);
    console.log('Successfully ran 20261030000000_arova_schema.sql!');
  } catch (e) {
    console.log('Migration note:', e.message);
  }

  const tables = await arovaClient.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables created:', tables.rows.map(r => r.table_name));

  const cats = await arovaClient.query("SELECT name FROM public.categories");
  console.log('Categories:', cats.rows.map(r => r.name));

  const plans = await arovaClient.query("SELECT name, price_paise, lead_allocation FROM public.plans");
  console.log('Plans:', plans.rows);

  await arovaClient.end();
}

setup().catch(err => {
  console.error('Setup error:', err);
});
