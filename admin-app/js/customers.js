// ============================================
// Admin Customers / Leads Management
// ============================================

import { initAdmin, formatDate } from './components.js';
import { supabase } from './supabase.js';
import { formatPrice } from './utils.js';

initAdmin('customers');

let allCustomers = [];

async function loadCustomers() {
  const tbody = document.getElementById('customersBody');

  // Fetch users with their orders
  const { data: users, error } = await supabase
    .from('users')
    .select('*, orders(total_amount, status)')
    .order('created_at', { ascending: false });

  if (error) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--danger);">Error loading</td></tr>';
    return;
  }

  allCustomers = (users || []).map(user => {
    const validOrders = (user.orders || []).filter(o => o.status !== 'cancelled');
    return {
      ...user,
      orderCount: validOrders.length,
      totalSpent: validOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
    };
  });

  renderCustomers(allCustomers);
}

function renderCustomers(customers) {
  const tbody = document.getElementById('customersBody');

  if (customers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:var(--space-xl);color:var(--text-light);">No customers yet</td></tr>';
    return;
  }

  tbody.innerHTML = customers.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.phone}</td>
      <td>${c.city || '—'}</td>
      <td><span class="badge badge-confirmed">${c.orderCount}</span></td>
      <td><strong>${formatPrice(c.totalSpent)}</strong></td>
      <td style="font-size:var(--text-xs);color:var(--text-light);">${formatDate(c.created_at)}</td>
      <td>
        <a href="https://wa.me/91${c.phone}?text=${encodeURIComponent(`Hi ${c.name}, this is Avatar Home Appliances, Sujangarh. How can we help you today?`)}" target="_blank" class="btn btn-whatsapp btn-sm">
          💬 WhatsApp
        </a>
      </td>
    </tr>
  `).join('');
}

async function loadLeads() {
  const tbody = document.getElementById('leadsBody');

  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:var(--space-xl);color:var(--text-light);">No leads yet</td></tr>';
    return;
  }

  const STATUS_LABELS = { pending: 'Pending', in_progress: 'In Progress', done: 'Done' };

  tbody.innerHTML = data.map(lead => `
    <tr>
      <td><strong>${lead.name}</strong></td>
      <td>${lead.phone}</td>
      <td>${lead.appliance_type}</td>
      <td><span class="badge badge-${lead.status}">${STATUS_LABELS[lead.status] || lead.status}</span></td>
      <td>
        <a href="https://wa.me/91${lead.phone}?text=${encodeURIComponent(`Hi ${lead.name}, this is Avatar Home Appliances regarding your ${lead.appliance_type} service request.`)}" target="_blank" class="btn btn-whatsapp btn-sm">
          💬 Follow Up
        </a>
      </td>
    </tr>
  `).join('');
}

// Search
let searchTimeout;
document.getElementById('customerSearch').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = q
      ? allCustomers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q))
      : allCustomers;
    renderCustomers(filtered);
  }, 300);
});

loadCustomers();
loadLeads();
