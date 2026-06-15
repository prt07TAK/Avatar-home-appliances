// ============================================
// Database Setup Script — Runs schema + RLS + seed
// Run: node supabase/setup.js
// ============================================

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://qozxgozydhfcrkmfjrsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvenhnb3p5ZGhmY3JrbWZqcnNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzgxMjUsImV4cCI6MjA5NzA1NDEyNX0.f_gf6FDuvdPrXw5fX5SVm2W-tiSoTGFVtEixcyM9pco';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setup() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚡ Avatar Home Appliances — DB Setup');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Note: Schema and RLS must be run via Supabase SQL Editor
  console.log('⚠️  IMPORTANT: Before running this script, you must run the following');
  console.log('   SQL files in Supabase Dashboard → SQL Editor → New Query:');
  console.log('   1. supabase/schema.sql');
  console.log('   2. supabase/rls-policies.sql\n');
  console.log('   After running those, this script will seed the database.\n');

  // Test connection
  console.log('🔌 Testing connection...');
  const { data: testData, error: testError } = await supabase
    .from('products')
    .select('count')
    .limit(1);

  if (testError) {
    if (testError.message.includes('relation') || testError.code === '42P01') {
      console.error('❌ Tables not found! Please run schema.sql first in Supabase SQL Editor.');
      console.log('\n📋 Steps:');
      console.log('   1. Go to https://supabase.com/dashboard → your project');
      console.log('   2. Click "SQL Editor" in the left sidebar');
      console.log('   3. Click "New Query"');
      console.log('   4. Copy-paste contents of supabase/schema.sql and run');
      console.log('   5. Copy-paste contents of supabase/rls-policies.sql and run');
      console.log('   6. Then run this script again: node supabase/setup.js');
      process.exit(1);
    }
    console.error('❌ Connection error:', testError.message);
    process.exit(1);
  }

  console.log('✅ Connected to Supabase!\n');

  // ---- Seed Admin User ----
  console.log('👤 Creating admin user...');
  const passwordHash = await bcrypt.hash('avatar2024', 10);

  const { error: adminError } = await supabase
    .from('admin_users')
    .upsert({
      username: 'admin',
      password_hash: passwordHash
    }, { onConflict: 'username' });

  if (adminError) {
    console.error('  ❌ Admin user error:', adminError.message);
  } else {
    console.log('  ✅ Admin user ready (username: admin, password: avatar2024)');
  }

  // ---- Seed Products ----
  console.log('\n📦 Adding sample products...');

  // Check if products already exist
  const { data: existing } = await supabase.from('products').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('  ℹ️  Products already exist. Skipping seed.');
  } else {
    const products = [
      {
        name: 'Bajaj Frore 1200mm Ceiling Fan',
        description: 'High-speed ceiling fan with aerodynamic blades for powerful air delivery. Anti-dust feature keeps the fan clean longer. Energy efficient motor with smooth, silent operation.',
        category: 'fan',
        price: 1899,
        original_price: 2299,
        stock: 25,
        image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Bajaj+Ceiling+Fan',
        is_featured: true
      },
      {
        name: 'Havells Pacer 400mm Table Fan',
        description: 'Compact and powerful table fan with 3-speed motor. Jerk-free oscillation for uniform air distribution. Thermal overload protector ensures safety.',
        category: 'fan',
        price: 2499,
        original_price: 2999,
        stock: 15,
        image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Havells+Table+Fan',
        is_featured: false
      },
      {
        name: 'Crompton Energion HS 1200mm BLDC Fan',
        description: 'Premium BLDC motor ceiling fan consuming only 28W. Remote controlled with timer, sleep mode, and boost. Saves up to 65% energy.',
        category: 'fan',
        price: 3299,
        original_price: 3999,
        stock: 10,
        image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Crompton+BLDC+Fan',
        is_featured: true
      },
      {
        name: 'Samsung 32" HD Ready Smart LED TV',
        description: 'Crystal clear HD Ready display with vibrant colors. Built-in WiFi with Samsung Smart Hub. Dolby Digital Plus sound for immersive audio.',
        category: 'tv',
        price: 14999,
        original_price: 18999,
        stock: 8,
        image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Samsung+32+TV',
        is_featured: true
      },
      {
        name: 'LG 43" 4K Ultra HD Smart TV',
        description: 'Stunning 4K UHD resolution with AI ThinQ smart features. WebOS with Magic Remote. Active HDR for lifelike picture quality.',
        category: 'tv',
        price: 29999,
        original_price: 36990,
        stock: 5,
        image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=LG+43+4K+TV',
        is_featured: true
      },
      {
        name: 'Symphony Diet 12T Personal Cooler',
        description: 'Compact 12-litre personal air cooler perfect for small rooms. Multi-directional wheels for easy portability. Honeycomb cooling pad.',
        category: 'cooler',
        price: 5999,
        original_price: 7499,
        stock: 12,
        image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Symphony+Cooler',
        is_featured: true
      },
      {
        name: 'Bajaj DMH 95L Desert Cooler',
        description: 'Large 95-litre tank capacity for extended cooling. Powerful air throw up to 60 feet. TurboFan technology for maximum air delivery.',
        category: 'cooler',
        price: 11499,
        original_price: 13999,
        stock: 6,
        image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Bajaj+Desert+Cooler',
        is_featured: false
      },
      {
        name: 'Honeycomb Cooling Pad Set (Full Kit)',
        description: 'High-quality honeycomb cooling pads for desert coolers. Set of 3 pads (2 side + 1 back). Superior water absorption for maximum cooling.',
        category: 'cooler_parts',
        price: 499,
        original_price: 699,
        stock: 50,
        image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Cooling+Pad+Set',
        is_featured: false
      },
      {
        name: 'Cooler Pump Motor (Universal Fit)',
        description: 'High-performance submersible pump motor for air coolers. Universal fit compatible with all major brands. 18W power consumption.',
        category: 'cooler_parts',
        price: 349,
        original_price: 499,
        stock: 40,
        image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Cooler+Pump+Motor',
        is_featured: false
      },
      {
        name: 'Cooler Fan Blade (15 inch)',
        description: 'Replacement fan blade for desert and personal coolers. 15-inch metal blade with balanced design. High air delivery with low noise.',
        category: 'cooler_parts',
        price: 299,
        original_price: 399,
        stock: 30,
        image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Cooler+Fan+Blade',
        is_featured: false
      },
      {
        name: 'Singer Start 1306 Sewing Machine',
        description: 'Beginner-friendly mechanical sewing machine with 6 built-in stitches. Free arm for sewing cuffs and sleeves. Easy stitch selection dial.',
        category: 'sewing_machine',
        price: 7999,
        original_price: 9999,
        stock: 7,
        image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Singer+1306',
        is_featured: true
      },
      {
        name: 'Usha Janome Dream Stitch Sewing Machine',
        description: 'Automatic sewing machine with 14 built-in stitches including buttonhole. LED sewing light for clear visibility. Free arm for circular sewing.',
        category: 'sewing_machine',
        price: 12499,
        original_price: 15999,
        stock: 4,
        image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Usha+Janome',
        is_featured: false
      }
    ];

    const { error: productsError } = await supabase.from('products').insert(products);

    if (productsError) {
      console.error('  ❌ Products error:', productsError.message);
    } else {
      console.log(`  ✅ ${products.length} products added successfully`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Setup complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Admin Login Credentials:');
  console.log('   Username: admin');
  console.log('   Password: avatar2024');
  console.log('\n🚀 Start the dev server: npm run dev');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

setup().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
