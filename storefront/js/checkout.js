// ============================================
// Checkout Page — Order Placement
// ============================================

import { initPage } from './components.js';
import { supabase } from './supabase.js';
import { getCart, getCartTotal, clearCart, formatPrice, showToast } from './cart.js';

initPage();

function renderOrderSummary() {
  const cart = getCart();
  const summary = document.getElementById('orderSummary');
  const total = getCartTotal();

  if (cart.length === 0) {
    window.location.href = '/cart.html';
    return;
  }

  summary.innerHTML = `
    <h3>Order Summary</h3>
    ${cart.map(item => `
      <div class="cart-summary-row">
        <span>${item.name} × ${item.quantity}</span>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('')}
    <div class="cart-summary-row">
      <span>Delivery</span>
      <span style="color:var(--success);font-weight:600;">FREE</span>
    </div>
    <div class="cart-summary-row total">
      <span>Total</span>
      <span>${formatPrice(total)}</span>
    </div>
  `;

  // Handle responsive
  const form = document.getElementById('checkoutForm');
  if (window.innerWidth <= 768) {
    form.style.gridTemplateColumns = '1fr';
  }
}

// Handle form submission
document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true;
  btn.textContent = 'Placing Order...';

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

  const cart = getCart();
  const total = getCartTotal();

  try {
    // 1. Upsert user (find by phone or create new)
    let userId;
    
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      userId = existingUsers[0].id;
      // Update user info
      await supabase
        .from('users')
        .update({ name, address, city })
        .eq('id', userId);
    } else {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({ name, phone, address, city })
        .select('id')
        .single();

      if (userError) throw userError;
      userId = newUser.id;
    }

    // 2. Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: total,
        status: 'pending',
        payment_method: paymentMethod
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    // 3. Create order items
    const orderItems = cart.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 4. Show confirmation
    clearCart();
    
    document.getElementById('checkoutForm').classList.add('hidden');
    document.getElementById('orderConfirmation').classList.remove('hidden');
    document.getElementById('confirmOrderId').textContent = order.id.slice(0, 8).toUpperCase();
    document.getElementById('confirmTotal').textContent = formatPrice(total);
    document.getElementById('confirmPayment').textContent = paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment';

  } catch (error) {
    console.error('Order placement error:', error);
    showToast('Failed to place order. Please try again or contact us on WhatsApp.', 'error');
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
});

renderOrderSummary();
window.addEventListener('resize', renderOrderSummary);
