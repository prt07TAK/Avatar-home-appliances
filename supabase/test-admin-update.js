import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qozxgozydhfcrkmfjrsr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvenhnb3p5ZGhmY3JrbWZqcnNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzgxMjUsImV4cCI6MjA5NzA1NDEyNX0.f_gf6FDuvdPrXw5fX5SVm2W-tiSoTGFVtEixcyM9pco';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  console.log('Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@avatarhome.com',
    password: 'avatar2024'
  });

  if (authError) {
    console.error('Login failed:', authError.message);
    return;
  }
  
  console.log('Logged in as Admin. UID:', authData.user.id);

  console.log('Fetching a product...');
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (fetchError || !products.length) {
    console.error('Fetch error or no products:', fetchError);
    return;
  }

  const product = products[0];
  console.log('Updating product:', product.id);

  const { data, error: updateError } = await supabase
    .from('products')
    .update({ description: 'Updated by test script' })
    .eq('id', product.id);

  if (updateError) {
    console.error('Update failed:', updateError.message);
  } else {
    console.log('✅ Update successful!');
  }
}

testUpdate();
