import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionString = 'postgresql://postgres:pulkit1907TAK@@db.qozxgozydhfcrkmfjrsr.supabase.co:5432/postgres';

async function applyFix() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    console.log('Applying admin-read-access.sql...');
    const sql = fs.readFileSync(join(__dirname, 'admin-read-access.sql'), 'utf-8');
    await client.query(sql);
    console.log('Admin Read Access policies applied successfully.');

  } catch (err) {
    console.error('Error applying schemas:', err);
  } finally {
    await client.end();
  }
}

applyFix();
