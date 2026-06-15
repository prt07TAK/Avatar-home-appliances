-- Allow admins to read everything from orders, users, and order_items
DROP POLICY IF EXISTS "orders_admin_select" ON orders;
CREATE POLICY "orders_admin_select" ON orders
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_roles));

DROP POLICY IF EXISTS "users_admin_select" ON users;
CREATE POLICY "users_admin_select" ON users
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_roles));

DROP POLICY IF EXISTS "order_items_admin_select" ON order_items;
CREATE POLICY "order_items_admin_select" ON order_items
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_roles));
