// ============================================
// Admin Dashboard — Stats + Recent Orders
// ============================================

import { initAdmin, formatDate } from './components.js';
import { supabase } from './supabase.js';
import { formatPrice } from './utils.js';

initAdmin('dashboard');

async function loadStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthISO = monthStart.toISOString();

  // Today's orders
  const { data: todayData } = await supabase
    .from('orders')
    .select('id')
    .gte('created_at', todayISO);
  document.getElementById('todayOrders').textContent = todayData?.length || 0;

  // Monthly revenue
  const { data: monthData } = await supabase
    .from('orders')
    .select('total_amount')
    .gte('created_at', monthISO)
    .neq('status', 'cancelled');
  const revenue = monthData?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
  document.getElementById('monthRevenue').textContent = formatPrice(revenue);

  // Pending orders
  const { data: pendingData } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'pending');
  document.getElementById('pendingOrders').textContent = pendingData?.length || 0;

  // New service requests
  const { data: serviceData } = await supabase
    .from('service_requests')
    .select('id')
    .eq('status', 'pending');
  document.getElementById('newServices').textContent = serviceData?.length || 0;
}

async function loadRecentOrders() {
  const tbody = document.getElementById('recentOrdersBody');

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, users(name, phone)')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:var(--space-xl);color:var(--text-light);">No orders yet</td></tr>';
    return;
  }

  const STATUS_LABELS = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_repair: 'In Repair',
    dispatched: 'Dispatched',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td><strong>${order.id.slice(0, 8).toUpperCase()}</strong></td>
      <td>
        <div>${order.users?.name || 'N/A'}</div>
        <div style="font-size:var(--text-xs);color:var(--text-light);">${order.users?.phone || ''}</div>
      </td>
      <td><strong>${formatPrice(order.total_amount)}</strong></td>
      <td><span class="badge badge-${order.status}">${STATUS_LABELS[order.status] || order.status}</span></td>
      <td style="color:var(--text-light);">${formatDate(order.created_at)}</td>
    </tr>
  `).join('');
}

loadStats();
loadRecentOrders();
