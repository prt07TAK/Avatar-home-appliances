// ============================================
// Cart Page Logic
// ============================================

import { initPage } from './components.js';
import { getCart, removeFromCart, updateQuantity, getCartTotal, formatPrice } from './cart.js';
import { getSession } from './auth.js';

initPage();

function renderCart() {
  const cart = getCart();
  const cartContent = document.getElementById('cartContent');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartItems = document.getElementById('cartItems');
  const cartSummary = document.getElementById('cartSummary');

  if (cart.length === 0) {
    cartContent.classList.add('hidden');
    cartEmpty.classList.remove('hidden');
    return;
  }

  cartContent.classList.remove('hidden');
  cartEmpty.classList.add('hidden');

  // Render items
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img class="cart-item-image" src="${item.image_url || 'https://placehold.co/200x150/e2e8f0/94a3b8?text=No+Image'}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
      </div>
      <div class="quantity-control">
        <button class="qty-minus" data-id="${item.id}">−</button>
        <span>${item.quantity}</span>
        <button class="qty-plus" data-id="${item.id}">+</button>
      </div>
      <div style="font-family:var(--font-heading);font-weight:700;color:var(--primary);min-width:80px;text-align:right;">
        ${formatPrice(item.price * item.quantity)}
      </div>
      <button class="cart-item-remove" data-id="${item.id}" title="Remove item">✕</button>
    </div>
  `).join('');

  // Render summary
  const total = getCartTotal();
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  cartSummary.innerHTML = `
    <h3>Order Summary</h3>
    <div class="cart-summary-row">
      <span>Items (${itemCount})</span>
      <span>${formatPrice(total)}</span>
    </div>
    <div class="cart-summary-row">
      <span>Delivery</span>
      <span style="color:var(--success);font-weight:600;">FREE</span>
    </div>
    <div class="cart-summary-row total">
      <span>Total</span>
      <span>${formatPrice(total)}</span>
    </div>
    <button id="checkoutBtn" class="btn btn-accent btn-block" style="margin-top:var(--space-lg);">
      Proceed to Checkout →
    </button>
    <a href="/products.html" class="btn btn-ghost btn-block" style="margin-top:var(--space-sm);">
      ← Continue Shopping
    </a>
  `;

  // Checkout Button Logic
  document.getElementById('checkoutBtn').addEventListener('click', async () => {
    const session = await getSession();
    if (session) {
      window.location.href = '/checkout.html';
    } else {
      window.location.href = '/auth.html?redirect=/checkout.html';
    }
  });

  // Event listeners
  cartItems.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = cart.find(i => i.id === btn.dataset.id);
      if (item) {
        updateQuantity(btn.dataset.id, item.quantity - 1);
        renderCart();
      }
    });
  });

  cartItems.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = cart.find(i => i.id === btn.dataset.id);
      if (item) {
        updateQuantity(btn.dataset.id, item.quantity + 1);
        renderCart();
      }
    });
  });

  cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.id);
      renderCart();
    });
  });
}

// Handle responsive layout
function handleResponsive() {
  const cartContent = document.getElementById('cartContent');
  if (window.innerWidth <= 768) {
    cartContent.style.gridTemplateColumns = '1fr';
  } else {
    cartContent.style.gridTemplateColumns = '1fr 360px';
  }
}

renderCart();
handleResponsive();
window.addEventListener('resize', handleResponsive);
window.addEventListener('cart-updated', renderCart);
