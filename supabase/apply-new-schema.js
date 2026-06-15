import pkg from 'pg';
const { Client } = pkg;
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://qozxgozydhfcrkmfjrsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvenhnb3p5ZGhmY3JrbWZqcnNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzgxMjUsImV4cCI6MjA5NzA1NDEyNX0.f_gf6FDuvdPrXw5fX5SVm2W-tiSoTGFVtEixcyM9pco';
const connectionString = 'postgresql://postgres:pulkit1907TAK@@db.qozxgozydhfcrkmfjrsr.supabase.co:5432/postgres';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setup() {
  const pgClient = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await pgClient.connect();
    
    console.log('1. Applying new schema and RLS policies...');
    const sql = fs.readFileSync(join(__dirname, 'new-schema.sql'), 'utf-8');
    await pgClient.query(sql);
    console.log('✅ Schema updated successfully!');

    console.log('\n2. Creating Admin User via Supabase Auth...');
    const email = 'admin@avatarhome.com';
    const password = 'avatar2024';

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('  ℹ️ Admin user already exists in auth.users.');
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Auth user created successfully!');
    }

    console.log('\n3. Auto-confirming email and assigning admin role...');
    // We update auth.users directly to confirm the email, just in case
    await pgClient.query(`
      UPDATE auth.users 
      SET email_confirmed_at = NOW() 
      WHERE email = $1;
    `, [email]);

    // Insert into admin_roles
    await pgClient.query(`
      INSERT INTO public.admin_roles (user_id)
      SELECT id FROM auth.users WHERE email = $1
      ON CONFLICT DO NOTHING;
    `, [email]);

    console.log('✅ Role assigned successfully!');
    
    console.log('\n🎉 Update Complete! You can now log into the new Admin Dashboard using:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

  } catch (err) {
    console.error('Error during setup:', err);
  } finally {
    await pgClient.end();
  }
}

setup();
