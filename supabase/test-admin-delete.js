import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qozxgozydhfcrkmfjrsr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvenhnb3p5ZGhmY3JrbWZqcnNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzgxMjUsImV4cCI6MjA5NzA1NDEyNX0.f_gf6FDuvdPrXw5fX5SVm2W-tiSoTGFVtEixcyM9pco';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'admin@avatarhome.com',
    password: 'avatar2024'
  });
  
  // Create a dummy product
  const { data: insertData, error: insertError } = await supabase
    .from('products')
    .insert({ name: 'Dummy Product', category: 'fan', price: 100 })
    .select('id')
    .single();

  if (insertError) {
    console.error('Insert failed:', insertError.message);
    return;
  }

  console.log('Inserted dummy product:', insertData.id);

  // Now try to delete it
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', insertData.id);

  if (deleteError) {
    console.error('Delete failed:', deleteError.message);
  } else {
    console.log('✅ Delete successful!');
  }
}

testDelete();
