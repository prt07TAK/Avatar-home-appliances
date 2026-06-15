// ============================================
// Home Page — Featured Products + Interactions
// ============================================

import { initPage, CATEGORY_LABELS } from './components.js';
import { supabase } from './supabase.js';
import { addToCart, formatPrice, getDiscount } from './cart.js';
import { openProductWhatsApp } from './whatsapp.js';

// Initialize shared components
initPage();

// Load featured products
async function loadFeaturedProducts() {
  const grid = document.getElementById('featuredGrid');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error loading featured products:', error);
    grid.innerHTML = '<p style="text-align:center;color:var(--text-light);grid-column:1/-1;">Unable to load products. Please try again later.</p>';
    return;
  }

  if (!products || products.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-light);grid-column:1/-1;">No featured products yet. Check back soon!</p>';
    return;
  }

  grid.innerHTML = products.map(product => {
    const discount = getDiscount(product.price, product.original_price);
    return `
      <div class="card product-card" data-id="${product.id}">
        <a href="/product.html?id=${product.id}">
          <div style="position:relative;">
            <img class="card-image" src="${product.image_url || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image'}" alt="${product.name}" loading="lazy">
            ${discount > 0 ? `<span class="product-badge">${discount}% OFF</span>` : ''}
          </div>
        </a>
        <div class="card-body">
          <a href="/product.html?id=${product.id}">
            <h3 class="card-title">${product.name}</h3>
          </a>
          <p class="card-text">${product.description || ''}</p>
          <div class="product-price">
            <span class="current">${formatPrice(product.price)}</span>
            ${product.original_price ? `<span class="original">${formatPrice(product.original_price)}</span>` : ''}
            ${discount > 0 ? `<span class="discount">${discount}% off</span>` : ''}
          </div>
          <div class="product-actions">
            <button class="btn btn-primary btn-sm add-to-cart" data-product='${JSON.stringify(product).replace(/'/g, "&#39;")}'>
              🛒 Add to Cart
            </button>
            <button class="btn btn-whatsapp btn-sm whatsapp-order" data-name="${product.name}" data-price="${product.price}">
              💬 WhatsApp
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Add event listeners
  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = JSON.parse(btn.dataset.product);
      addToCart(product);
    });
  });

  grid.querySelectorAll('.whatsapp-order').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openProductWhatsApp(btn.dataset.name, btn.dataset.price);
    });
  });
}

// Add scroll animation for sections
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'all 0.6s ease-out';
    observer.observe(section);
  });
}

// Responsive map section on mobile
function handleMapResponsive() {
  const mapGrid = document.querySelector('#location .container > div[style]');
  if (mapGrid && window.innerWidth <= 768) {
    mapGrid.style.gridTemplateColumns = '1fr';
  }
}

// Init
loadFeaturedProducts();
initScrollAnimations();
handleMapResponsive();
window.addEventListener('resize', handleMapResponsive);
