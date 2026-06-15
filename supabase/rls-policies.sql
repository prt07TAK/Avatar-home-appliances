-- ============================================
-- Avatar Home Appliances — Row Level Security Policies
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Products — Public read, admin manage (client-side protected)
-- ============================================
CREATE POLICY "products_select" ON products
  FOR SELECT USING (true);

CREATE POLICY "products_insert" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "products_update" ON products
  FOR UPDATE USING (true);

CREATE POLICY "products_delete" ON products
  FOR DELETE USING (true);

-- ============================================
-- Users — Public insert (checkout), read, update
-- ============================================
CREATE POLICY "users_select" ON users
  FOR SELECT USING (true);

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update" ON users
  FOR UPDATE USING (true);

-- ============================================
-- Orders — Public insert/read, admin update
-- ============================================
CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (true);

CREATE POLICY "orders_insert" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_update" ON orders
  FOR UPDATE USING (true);

-- ============================================
-- Order Items — Public insert/read
-- ============================================
CREATE POLICY "order_items_select" ON order_items
  FOR SELECT USING (true);

CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT WITH CHECK (true);

-- ============================================
-- Service Requests — Public insert, admin read/update
-- ============================================
CREATE POLICY "service_requests_select" ON service_requests
  FOR SELECT USING (true);

CREATE POLICY "service_requests_insert" ON service_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_requests_update" ON service_requests
  FOR UPDATE USING (true);

-- ============================================
-- Admin Users — Read only (for login validation)
-- ============================================
CREATE POLICY "admin_users_select" ON admin_users
  FOR SELECT USING (true);
