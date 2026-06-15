import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionString = 'postgresql://postgres:pulkit1907TAK@@db.qozxgozydhfcrkmfjrsr.supabase.co:5432/postgres';

async function applySchemas() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    
    console.log('Applying schema.sql...');
    const schemaSql = fs.readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSql);
    console.log('Schema applied successfully.');

    console.log('Applying rls-policies.sql...');
    const rlsSql = fs.readFileSync(join(__dirname, 'rls-policies.sql'), 'utf-8');
    await client.query(rlsSql);
    console.log('RLS policies applied successfully.');

  } catch (err) {
    console.error('Error applying schemas:', err);
  } finally {
    await client.end();
  }
}

applySchemas();
