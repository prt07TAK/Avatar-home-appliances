import { initPage } from './components.js';
import { supabase } from './supabase.js';
import { getSession, getProfile, logout } from './auth.js';

initPage();

let currentUserProfile = null;

// Ensure user is logged in
getSession().then(async (session) => {
  if (!session) {
    window.location.href = '/auth.html';
    return;
  }
  
  currentUserProfile = await getProfile();
  if (currentUserProfile) {
    document.getElementById('pName').value = currentUserProfile.name || '';
    document.getElementById('pPhone').value = currentUserProfile.phone || '';
    document.getElementById('pEmail').value = currentUserProfile.email || session.user.email;
    document.getElementById('pAddress').value = currentUserProfile.address || '';
    document.getElementById('pCity').value = currentUserProfile.city || '';
  }

  loadOrders();
});

// Tab switching
const btnTabProfile = document.getElementById('btnTabProfile');
const btnTabOrders = document.getElementById('btnTabOrders');
const tabProfile = document.getElementById('tabProfile');
const tabOrders = document.getElementById('tabOrders');

btnTabProfile.addEventListener('click', () => {
  btnTabProfile.classList.add('active');
  btnTabOrders.classList.remove('active');
  tabProfile.classList.add('active');
  tabOrders.classList.remove('active');
});

btnTabOrders.addEventListener('click', () => {
  btnTabOrders.classList.add('active');
  btnTabProfile.classList.remove('active');
  tabOrders.classList.add('active');
  tabProfile.classList.remove('active');
});

document.getElementById('btnLogout').addEventListener('click', logout);

// Save Profile
document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('saveProfileBtn');
  const msg = document.getElementById('profileMsg');
  
  btn.disabled = true;
  btn.textContent = 'Saving...';
  msg.textContent = '';

  const updates = {
    name: document.getElementById('pName').value.trim(),
    phone: document.getElementById('pPhone').value.trim(),
    address: document.getElementById('pAddress').value.trim(),
    city: document.getElementById('pCity').value.trim()
  };

  try {
    const session = await getSession();
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('auth_id', session.user.id);

    if (error) throw error;

    msg.style.color = 'var(--success)';
    msg.textContent = 'Profile updated successfully!';
  } catch (err) {
    msg.style.color = 'var(--danger)';
    msg.textContent = 'Error updating profile: ' + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
    setTimeout(() => { msg.textContent = ''; }, 3000);
  }
});

// Load Orders
async function loadOrders() {
  const container = document.getElementById('ordersList');
  if (!currentUserProfile) {
    container.innerHTML = '<p>No profile found.</p>';
    return;
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        quantity,
        price_at_purchase,
        products (name)
      )
    `)
    .eq('user_id', currentUserProfile.id)
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = '<p style="color:var(--danger)">Error loading orders.</p>';
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary)">You have not placed any orders yet.</p>';
    return;
  }

  container.innerHTML = data.map(order => {
    const date = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    
    let statusColor = 'var(--text-secondary)';
    if (order.status === 'confirmed' || order.status === 'dispatched') statusColor = 'var(--primary)';
    if (order.status === 'delivered') statusColor = 'var(--success)';
    if (order.status === 'cancelled') statusColor = 'var(--danger)';

    const itemsHtml = order.order_items.map(item => 
      `<div style="font-size:var(--text-sm); margin-bottom:4px;">
        ${item.quantity}x ${item.products?.name || 'Unknown Product'} - ₹${item.price_at_purchase}
      </div>`
    ).join('');

    return `
      <div class="order-card">
        <div class="order-header">
          <div>
            <strong>Order #${order.id.split('-')[0]}</strong>
            <div style="font-size:var(--text-xs); color:var(--text-light);">${date}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:bold; color:${statusColor}; text-transform:capitalize;">${order.status.replace('_', ' ')}</div>
            <div style="font-size:var(--text-sm);">Total: ₹${order.total_amount} (${order.payment_method.toUpperCase()})</div>
          </div>
        </div>
        <div>
          <strong style="font-size:var(--text-xs); color:var(--text-light); text-transform:uppercase;">Items</strong>
          <div style="margin-top:var(--space-xs);">
            ${itemsHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
}
