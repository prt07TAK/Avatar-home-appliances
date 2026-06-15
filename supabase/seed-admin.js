import pkg from 'pg';
const { Client } = pkg;
import bcrypt from 'bcryptjs';

const connectionString = 'postgresql://postgres:pulkit1907TAK@@db.qozxgozydhfcrkmfjrsr.supabase.co:5432/postgres';

async function seedAdmin() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    console.log('Seeding admin user...');
    const passwordHash = await bcrypt.hash('avatar2024', 10);

    await client.query(`
      INSERT INTO admin_users (username, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;
    `, ['admin', passwordHash]);

    console.log('✅ Admin user created/updated successfully!');
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    await client.end();
  }
}

seedAdmin();
