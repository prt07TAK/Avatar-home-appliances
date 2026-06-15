// ============================================
// Shared UI Components — Navbar, Footer, WhatsApp Button
// ============================================

import { updateCartBadge } from './cart.js';
import { openGeneralWhatsApp } from './whatsapp.js';

const CATEGORY_LABELS = {
  fan: 'Fans',
  tv: 'TVs',
  cooler: 'Coolers',
  cooler_parts: 'Cooler Parts',
  sewing_machine: 'Sewing Machines'
};

// Determine active page for nav highlighting
function getActivePage() {
  const path = window.location.pathname;
  if (path === '/' || path.endsWith('index.html')) return 'home';
  if (path.includes('products') || path.includes('product')) return 'products';
  if (path.includes('repair')) return 'repair';
  if (path.includes('order-tracking')) return 'tracking';
  if (path.includes('contact')) return 'contact';
  if (path.includes('cart') || path.includes('checkout')) return 'cart';
  return '';
}

export function renderNavbar() {
  const active = getActivePage();
  
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.id = 'mainNavbar';
  nav.innerHTML = `
    <div class="container navbar-inner">
      <a href="/" class="navbar-brand">
        <span class="brand-icon">⚡</span>
        <span class="brand-text">Avatar Appliances</span>
      </a>
      <button class="navbar-toggle" id="navToggle" aria-label="Toggle navigation menu">
        <span></span><span></span><span></span>
      </button>
      <ul class="navbar-menu" id="navMenu">
        <li><a href="/" class="${active === 'home' ? 'active' : ''}">Home</a></li>
        <li><a href="/products.html" class="${active === 'products' ? 'active' : ''}">Products</a></li>
        <li><a href="/repair.html" class="${active === 'repair' ? 'active' : ''}">Repair</a></li>
        <li><a href="/order-tracking.html" class="${active === 'tracking' ? 'active' : ''}">Track Order</a></li>
        <li><a href="/contact.html" class="${active === 'contact' ? 'active' : ''}">Contact</a></li>
        <li>
          <a href="/cart.html" class="cart-link ${active === 'cart' ? 'active' : ''}">
            🛒 Cart <span class="cart-count" id="cartCount" data-count="0">0</span>
          </a>
        </li>
      </ul>
    </div>
  `;

  document.body.prepend(nav);

  // Hamburger toggle
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('open');
  });

  // Close menu on link click (mobile)
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('open');
    });
  });

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Update cart badge
  updateCartBadge();
}

export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <span class="brand-icon">⚡</span>
            Avatar Home Appliances
          </div>
          <p class="footer-description">
            Your trusted home appliance partner in Sujangarh. We provide quality products and expert repair services at the best prices, right in your neighborhood.
          </p>
          <a href="https://wa.me/919649383525" target="_blank" class="btn btn-whatsapp btn-sm">
            💬 Chat on WhatsApp
          </a>
        </div>
        <div>
          <h5>Quick Links</h5>
          <ul class="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/products.html">All Products</a></li>
            <li><a href="/repair.html">Repair Service</a></li>
            <li><a href="/order-tracking.html">Track Order</a></li>
            <li><a href="/contact.html">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h5>Categories</h5>
          <ul class="footer-links">
            <li><a href="/products.html?category=fan">Fans</a></li>
            <li><a href="/products.html?category=tv">TVs</a></li>
            <li><a href="/products.html?category=cooler">Coolers</a></li>
            <li><a href="/products.html?category=cooler_parts">Cooler Parts</a></li>
            <li><a href="/products.html?category=sewing_machine">Sewing Machines</a></li>
          </ul>
        </div>
        <div>
          <h5>Contact Info</h5>
          <div class="footer-contact-item">
            <span>📍</span>
            <span>Near PCB School, Sujangarh, Rajasthan 331507</span>
          </div>
          <div class="footer-contact-item">
            <span>📞</span>
            <span><a href="tel:+919649383525" style="color: inherit;">9649383525</a></span>
          </div>
          <div class="footer-contact-item">
            <span>💬</span>
            <span><a href="https://wa.me/919649383525" target="_blank" style="color: inherit;">WhatsApp Us</a></span>
          </div>
          <div class="footer-contact-item">
            <span>🕐</span>
            <span>Mon - Sat: 9AM - 8PM</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p style="margin:0;">© ${new Date().getFullYear()} Avatar Home Appliances, Sujangarh. All rights reserved.</p>
      </div>
    </div>
  `;

  document.body.appendChild(footer);
}

export function renderWhatsAppFloat() {
  const btn = document.createElement('a');
  btn.className = 'whatsapp-float';
  btn.href = 'https://wa.me/919649383525?text=' + encodeURIComponent('Hi Avatar Home Appliances, I have a query. Please help.');
  btn.target = '_blank';
  btn.setAttribute('aria-label', 'Chat on WhatsApp');
  btn.innerHTML = `
    💬
    <span class="tooltip">Chat with us on WhatsApp</span>
  `;
  document.body.appendChild(btn);
}

export function initPage() {
  renderNavbar();
  renderFooter();
  renderWhatsAppFloat();
}

export { CATEGORY_LABELS };
