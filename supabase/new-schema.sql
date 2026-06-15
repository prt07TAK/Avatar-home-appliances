-- Drop old table
DROP TABLE IF EXISTS admin_users;

-- Create admin_roles linking to Supabase auth.users
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admin_roles table
DROP POLICY IF EXISTS "admin_roles_select" ON admin_roles;
CREATE POLICY "admin_roles_select" ON admin_roles
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_roles)
  );

-- Update Products RLS
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;

CREATE POLICY "products_insert" ON products
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_roles));

CREATE POLICY "products_update" ON products
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admin_roles));

CREATE POLICY "products_delete" ON products
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM admin_roles));

-- Orders RLS (Admins can update)
DROP POLICY IF EXISTS "orders_update" ON orders;
CREATE POLICY "orders_update" ON orders
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admin_roles));

-- Service Requests RLS (Admins can update)
DROP POLICY IF EXISTS "service_requests_update" ON service_requests;
CREATE POLICY "service_requests_update" ON service_requests
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admin_roles));

-- ============================================
-- Create Storage Bucket for Images
-- ============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Public can read images
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Admins can insert/update/delete images
DROP POLICY IF EXISTS "product_images_admin_insert" ON storage.objects;
CREATE POLICY "product_images_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND 
    auth.uid() IN (SELECT user_id FROM admin_roles)
  );

DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
CREATE POLICY "product_images_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND 
    auth.uid() IN (SELECT user_id FROM admin_roles)
  );

DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
CREATE POLICY "product_images_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND 
    auth.uid() IN (SELECT user_id FROM admin_roles)
  );
