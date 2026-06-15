// ============================================
// Order Tracking Page
// ============================================

import { initPage } from './components.js';
import { supabase } from './supabase.js';
import { formatPrice } from './cart.js';

initPage();

const STATUS_FLOW = ['pending', 'confirmed', 'dispatched', 'delivered'];
const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_repair: 'In Repair',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

document.getElementById('trackForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const phone = document.getElementById('trackPhone').value.trim();
  const orderIdInput = document.getElementById('trackOrderId').value.trim().toLowerCase();
  const btn = document.getElementById('trackBtn');
  const resultDiv = document.getElementById('trackingResult');

  btn.disabled = true;
  btn.textContent = 'Searching...';

  try {
    // Find user by phone
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone);

    if (!users || users.length === 0) {
      resultDiv.classList.remove('hidden');
      resultDiv.innerHTML = `
        <div class="card" style="padding:var(--space-xl);text-align:center;">
          <div style="font-size:3rem;margin-bottom:var(--space-md);">😕</div>
          <h3>No orders found</h3>
          <p>No orders were found for this phone number. Please check and try again.</p>
        </div>
      `;
      return;
    }

    const userIds = users.map(u => u.id);

    // Find matching order
    const { data: orders } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url))')
      .in('user_id', userIds);

    const order = orders?.find(o => o.id.toLowerCase().startsWith(orderIdInput));

    if (!order) {
      resultDiv.classList.remove('hidden');
      resultDiv.innerHTML = `
        <div class="card" style="padding:var(--space-xl);text-align:center;">
          <div style="font-size:3rem;margin-bottom:var(--space-md);">😕</div>
          <h3>Order not found</h3>
          <p>No order matching this ID was found. Please verify your Order ID.</p>
        </div>
      `;
      return;
    }

    // Render order details
    const currentStatus = order.status;
    const statusIndex = STATUS_FLOW.indexOf(currentStatus);
    const isCancelled = currentStatus === 'cancelled';

    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
      <div class="card" style="padding:var(--space-xl);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-xl);flex-wrap:wrap;gap:var(--space-md);">
          <div>
            <h3>Order #${order.id.slice(0, 8).toUpperCase()}</h3>
            <p style="margin:0;font-size:var(--text-sm);color:var(--text-light);">
              Placed on ${new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span class="badge badge-${currentStatus}">${STATUS_LABELS[currentStatus] || currentStatus}</span>
        </div>

        ${!isCancelled ? `
        <div class="tracking-timeline">
          ${STATUS_FLOW.map((status, i) => `
            <div class="tracking-step ${i <= statusIndex ? (i < statusIndex ? 'completed' : 'active') : ''}">
              <div class="step-dot">${i <= statusIndex ? '✓' : i + 1}</div>
              <span class="step-label">${STATUS_LABELS[status]}</span>
            </div>
          `).join('')}
        </div>
        ` : `
        <div style="text-align:center;padding:var(--space-xl);background:var(--danger-light);border-radius:var(--radius-md);margin-bottom:var(--space-xl);">
          <p style="color:#991b1b;font-weight:600;margin:0;">This order has been cancelled.</p>
        </div>
        `}

        <h4 style="margin-bottom:var(--space-md);">Order Items</h4>
        ${order.order_items.map(item => `
          <div style="display:flex;align-items:center;gap:var(--space-md);padding:var(--space-md) 0;border-bottom:1px solid var(--border-light);">
            <img src="${item.products?.image_url || 'https://placehold.co/80x60/e2e8f0/94a3b8?text=Item'}" alt="" style="width:60px;height:45px;object-fit:cover;border-radius:var(--radius-sm);">
            <div style="flex:1;">
              <div style="font-weight:500;">${item.products?.name || 'Product'}</div>
              <div style="font-size:var(--text-sm);color:var(--text-light);">Qty: ${item.quantity}</div>
            </div>
            <div style="font-weight:600;color:var(--primary);">${formatPrice(item.price_at_purchase * item.quantity)}</div>
          </div>
        `).join('')}

        <div style="display:flex;justify-content:space-between;padding:var(--space-lg) 0 0;margin-top:var(--space-md);border-top:2px solid var(--border);">
          <span style="font-family:var(--font-heading);font-weight:700;font-size:var(--text-lg);">Total</span>
          <span style="font-family:var(--font-heading);font-weight:700;font-size:var(--text-lg);color:var(--primary);">${formatPrice(order.total_amount)}</span>
        </div>

        <div style="margin-top:var(--space-xl);display:flex;gap:var(--space-md);flex-wrap:wrap;">
          <span style="font-size:var(--text-sm);color:var(--text-secondary);">
            💳 Payment: ${order.payment_method === 'cod' ? 'Cash on Delivery' : 'UPI'}
          </span>
        </div>
      </div>

      <div style="text-align:center;margin-top:var(--space-xl);">
        <a href="https://wa.me/919649383525?text=${encodeURIComponent(`Hi, I want to check on my order #${order.id.slice(0, 8).toUpperCase()}`)}" target="_blank" class="btn btn-whatsapp">
          💬 Contact Us About This Order
        </a>
      </div>
    `;
  } catch (error) {
    console.error('Tracking error:', error);
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
      <div class="card" style="padding:var(--space-xl);text-align:center;">
        <h3>Something went wrong</h3>
        <p>Please try again or contact us on WhatsApp.</p>
      </div>
    `;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Track Order';
  }
});
