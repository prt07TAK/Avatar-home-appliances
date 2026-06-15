// ============================================
// Admin Service Requests Management
// ============================================

import { initAdmin, formatDateTime } from './components.js';
import { supabase } from './supabase.js';
import { showToast } from './utils.js';

initAdmin('services');

const STATUS_LABELS = { pending: 'Pending', in_progress: 'In Progress', done: 'Done' };

let allRequests = [];
let currentFilter = 'all';

async function loadRequests() {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  allRequests = data || [];
  renderRequests();
}

function renderRequests() {
  const tbody = document.getElementById('servicesBody');
  let filtered = allRequests;

  if (currentFilter !== 'all') {
    filtered = filtered.filter(r => r.status === currentFilter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:var(--space-xl);color:var(--text-light);">No service requests found</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(req => `
    <tr>
      <td><strong>${req.name}</strong></td>
      <td>${req.phone}</td>
      <td><span class="badge badge-confirmed">${req.appliance_type}</span></td>
      <td style="max-width:250px;font-size:var(--text-sm);color:var(--text-secondary);">${req.issue_description || '—'}</td>
      <td>
        <select class="status-select" data-id="${req.id}" data-current="${req.status}">
          ${Object.entries(STATUS_LABELS).map(([val, label]) =>
            `<option value="${val}" ${req.status === val ? 'selected' : ''}>${label}</option>`
          ).join('')}
        </select>
      </td>
      <td style="font-size:var(--text-xs);color:var(--text-light);">${formatDateTime(req.created_at)}</td>
      <td>
        <a href="https://wa.me/91${req.phone}?text=${encodeURIComponent(`Hi ${req.name}, this is Avatar Home Appliances regarding your ${req.appliance_type} repair request.`)}" target="_blank" class="btn btn-whatsapp btn-sm">
          💬
        </a>
      </td>
    </tr>
  `).join('');

  // Status change
  tbody.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: e.target.value })
        .eq('id', sel.dataset.id);
      if (error) {
        showToast('Failed to update', 'error');
        e.target.value = sel.dataset.current;
      } else {
        showToast('Status updated');
        sel.dataset.current = e.target.value;
      }
    });
  });
}

// Filter
document.getElementById('statusFilter').addEventListener('click', (e) => {
  const pill = e.target.closest('.filter-pill');
  if (!pill) return;
  document.querySelectorAll('#statusFilter .filter-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  currentFilter = pill.dataset.status;
  renderRequests();
});

loadRequests();
