// ============================================
// Admin Orders Management
// ============================================

import { initAdmin, formatDateTime } from './components.js';
import { supabase } from './supabase.js';
import { formatPrice, showToast } from './utils.js';
import { openCustomerWhatsApp } from './utils.js';

initAdmin('orders');

const STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', in_repair: 'In Repair',
  dispatched: 'Dispatched', delivered: 'Delivered', cancelled: 'Cancelled'
};

let allOrders = [];
let currentFilter = 'all';

async function loadOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, users(name, phone), order_items(*, products(name))')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  allOrders = data || [];
  renderOrders();
}

function renderOrders() {
  const tbody = document.getElementById('ordersBody');
  let filtered = allOrders;

  if (currentFilter !== 'all') {
    filtered = filtered.filter(o => o.status === currentFilter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:var(--space-xl);color:var(--text-light);">No orders found</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(order => `
    <tr class="order-row" data-id="${order.id}">
      <td><strong>${order.id.slice(0, 8).toUpperCase()}</strong></td>
      <td>${order.users?.name || 'N/A'}</td>
      <td>${order.users?.phone || 'N/A'}</td>
      <td><strong>${formatPrice(order.total_amount)}</strong></td>
      <td>${order.payment_method === 'cod' ? '💵 COD' : '📱 UPI'}</td>
      <td>
        <select class="status-select" data-id="${order.id}" data-current="${order.status}">
          ${Object.entries(STATUS_LABELS).map(([val, label]) => 
            `<option value="${val}" ${order.status === val ? 'selected' : ''}>${label}</option>`
          ).join('')}
        </select>
      </td>
      <td style="font-size:var(--text-xs);color:var(--text-light);">${formatDateTime(order.created_at)}</td>
      <td>
        <div class="actions">
          <button class="btn btn-ghost btn-sm toggle-details" data-id="${order.id}" title="View items">📋</button>
          ${order.users?.phone ? `<button class="btn btn-whatsapp btn-sm wa-btn" data-name="${order.users.name}" data-phone="${order.users.phone}" title="WhatsApp">💬</button>` : ''}
        </div>
      </td>
    </tr>
    <tr class="order-detail-row" id="detail-${order.id}">
      <td colspan="8">
        <div class="order-items-mini">
          <strong style="margin-bottom:var(--space-sm);display:block;">Order Items:</strong>
          ${order.order_items.map(item => `
            <div class="order-item-mini">
              <span>${item.products?.name || 'Product'} × ${item.quantity}</span>
              <span>${formatPrice(item.price_at_purchase * item.quantity)}</span>
            </div>
          `).join('')}
        </div>
      </td>
    </tr>
  `).join('');

  // Status change
  tbody.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: e.target.value })
        .eq('id', sel.dataset.id);
      if (error) {
        showToast('Failed to update status', 'error');
        e.target.value = sel.dataset.current;
      } else {
        showToast('Order status updated');
        sel.dataset.current = e.target.value;
      }
    });
  });

  // Toggle order details
  tbody.querySelectorAll('.toggle-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = document.getElementById(`detail-${btn.dataset.id}`);
      row.classList.toggle('open');
    });
  });

  // WhatsApp buttons
  tbody.querySelectorAll('.wa-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openCustomerWhatsApp(btn.dataset.name, btn.dataset.phone);
    });
  });
}

// Status filter
document.getElementById('statusFilter').addEventListener('click', (e) => {
  const pill = e.target.closest('.filter-pill');
  if (!pill) return;
  document.querySelectorAll('#statusFilter .filter-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  currentFilter = pill.dataset.status;
  renderOrders();
});

loadOrders();
