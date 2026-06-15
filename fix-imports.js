import fs from 'fs';
import path from 'path';

const jsDir = 'admin-app/js';
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(jsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix supabase import
  content = content.replace(/from '\.\.\/supabase\.js'/g, "from './supabase.js'");
  
  // Fix cart.js imports to utils.js
  content = content.replace(/from '\.\.\/cart\.js'/g, "from './utils.js'");

  // Fix whatsapp.js imports to utils.js
  content = content.replace(/from '\.\.\/whatsapp\.js'/g, "from './utils.js'");

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
