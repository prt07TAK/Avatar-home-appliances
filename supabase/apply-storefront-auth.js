import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionString = 'postgresql://postgres:pulkit1907TAK@@db.qozxgozydhfcrkmfjrsr.supabase.co:5432/postgres';

async function setup() {
  const pgClient = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await pgClient.connect();
    
    console.log('Applying storefront auth SQL...');
    const sql = fs.readFileSync(join(__dirname, 'storefront-auth.sql'), 'utf-8');
    await pgClient.query(sql);
    console.log('✅ Storefront Auth Schema applied successfully!');

  } catch (err) {
    console.error('Error during setup:', err);
  } finally {
    await pgClient.end();
  }
}

setup();
