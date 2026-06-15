// ============================================
// Avatar Home Appliances — Seed Script
// Run: npm run seed
// ============================================

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const SUPABASE_URL = 'https://qozxgozydhfcrkmfjrsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvenhnb3p5ZGhmY3JrbWZqcnNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzgxMjUsImV4cCI6MjA5NzA1NDEyNX0.f_gf6FDuvdPrXw5fX5SVm2W-tiSoTGFVtEixcyM9pco';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
  console.log('🌱 Seeding Avatar Home Appliances database...\n');

  // ---- 1. Seed Admin User ----
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
    console.log('  ✅ Admin user created (username: admin, password: avatar2024)');
  }

  // ---- 2. Seed Products ----
  console.log('\n📦 Adding sample products...');

  const products = [
    {
      name: 'Bajaj Frore 1200mm Ceiling Fan',
      description: 'High-speed ceiling fan with aerodynamic blades for powerful air delivery. Anti-dust feature keeps the fan clean longer. Energy efficient motor with smooth, silent operation. Available in elegant ivory finish.',
      category: 'fan',
      price: 1899,
      original_price: 2299,
      stock: 25,
      image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Bajaj+Ceiling+Fan',
      is_featured: true
    },
    {
      name: 'Havells Pacer 400mm Table Fan',
      description: 'Compact and powerful table fan with 3-speed motor. Jerk-free oscillation for uniform air distribution. Thermal overload protector ensures safety. Elegant design with powder-coated guard.',
      category: 'fan',
      price: 2499,
      original_price: 2999,
      stock: 15,
      image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Havells+Table+Fan',
      is_featured: false
    },
    {
      name: 'Crompton Energion HS 1200mm BLDC Fan',
      description: 'Premium BLDC motor ceiling fan consuming only 28W. Remote controlled with timer, sleep mode, and boost. Saves up to 65% energy compared to regular fans. Silent operation with 5-star rating.',
      category: 'fan',
      price: 3299,
      original_price: 3999,
      stock: 10,
      image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Crompton+BLDC+Fan',
      is_featured: true
    },
    {
      name: 'Samsung 32" HD Ready Smart LED TV',
      description: 'Crystal clear HD Ready display with vibrant colors. Built-in WiFi with Samsung Smart Hub for streaming apps. Dolby Digital Plus sound for immersive audio. Ultra Clean View for enhanced clarity.',
      category: 'tv',
      price: 14999,
      original_price: 18999,
      stock: 8,
      image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Samsung+32+TV',
      is_featured: true
    },
    {
      name: 'LG 43" 4K Ultra HD Smart TV',
      description: 'Stunning 4K UHD resolution with AI ThinQ for smart features. WebOS with Magic Remote for easy navigation. Active HDR for lifelike picture quality. Quad Core Processor for fast performance.',
      category: 'tv',
      price: 29999,
      original_price: 36990,
      stock: 5,
      image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=LG+43+4K+TV',
      is_featured: true
    },
    {
      name: 'Symphony Diet 12T Personal Cooler',
      description: 'Compact 12-litre personal air cooler perfect for small rooms. Multi-directional wheels for easy portability. Honeycomb cooling pad for superior cooling. Low power consumption with powerful air throw.',
      category: 'cooler',
      price: 5999,
      original_price: 7499,
      stock: 12,
      image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Symphony+Cooler',
      is_featured: true
    },
    {
      name: 'Bajaj DMH 95L Desert Cooler',
      description: 'Large 95-litre tank capacity for extended cooling. Powerful air throw up to 60 feet. TurboFan technology for maximum air delivery. Hexacool honeycomb pads with anti-bacterial coating.',
      category: 'cooler',
      price: 11499,
      original_price: 13999,
      stock: 6,
      image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Bajaj+Desert+Cooler',
      is_featured: false
    },
    {
      name: 'Honeycomb Cooling Pad Set (Full Kit)',
      description: 'High-quality honeycomb cooling pads compatible with most desert coolers. Set of 3 pads (2 side + 1 back). Superior water absorption for maximum cooling. Easy to install, long-lasting material.',
      category: 'cooler_parts',
      price: 499,
      original_price: 699,
      stock: 50,
      image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Cooling+Pad+Set',
      is_featured: false
    },
    {
      name: 'Cooler Pump Motor (Universal Fit)',
      description: 'High-performance submersible pump motor for air coolers. Universal fit compatible with all major brands. 18W power consumption with strong water flow. Copper winding for durability.',
      category: 'cooler_parts',
      price: 349,
      original_price: 499,
      stock: 40,
      image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Cooler+Pump+Motor',
      is_featured: false
    },
    {
      name: 'Cooler Fan Blade (15 inch)',
      description: 'Replacement fan blade for desert and personal coolers. 15-inch metal blade with balanced design. High air delivery with low noise. Compatible with standard motor shafts.',
      category: 'cooler_parts',
      price: 299,
      original_price: 399,
      stock: 30,
      image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Cooler+Fan+Blade',
      is_featured: false
    },
    {
      name: 'Singer Start 1306 Sewing Machine',
      description: 'Beginner-friendly mechanical sewing machine with 6 built-in stitches. Free arm for sewing cuffs and sleeves. Easy stitch selection dial. Includes darning plate, needles, and bobbins.',
      category: 'sewing_machine',
      price: 7999,
      original_price: 9999,
      stock: 7,
      image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Singer+1306',
      is_featured: true
    },
    {
      name: 'Usha Janome Dream Stitch Sewing Machine',
      description: 'Automatic sewing machine with 14 built-in stitches including buttonhole. LED sewing light for clear visibility. Free arm for circular sewing. Comes with hard cover and complete accessory kit.',
      category: 'sewing_machine',
      price: 12499,
      original_price: 15999,
      stock: 4,
      image_url: 'https://placehold.co/600x400/1a237e/ffffff?text=Usha+Janome',
      is_featured: false
    }
  ];

  const { error: productsError } = await supabase
    .from('products')
    .insert(products);

  if (productsError) {
    console.error('  ❌ Products error:', productsError.message);
  } else {
    console.log(`  ✅ ${products.length} products added successfully`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin Login Credentials:');
  console.log('  Username: admin');
  console.log('  Password: avatar2024');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

seed().catch(console.error);
