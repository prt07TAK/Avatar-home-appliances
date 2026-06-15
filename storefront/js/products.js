// ============================================
// Products Page — Filter, Search, Grid
// ============================================

import { initPage } from './components.js';
import { supabase } from './supabase.js';
import { addToCart, formatPrice, getDiscount } from './cart.js';
import { openProductWhatsApp } from './whatsapp.js';

initPage();

let allProducts = [];
let currentCategory = 'all';
let searchQuery = '';

// Get category from URL params
const urlParams = new URLSearchParams(window.location.search);
const urlCategory = urlParams.get('category');
if (urlCategory) {
  currentCategory = urlCategory;
}

async function loadProducts() {
  const grid = document.getElementById('productsGrid');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading products:', error);
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-light);">Unable to load products. Please try again.</p>';
    return;
  }

  allProducts = data || [];

  // Set active filter from URL
  if (urlCategory) {
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.category === urlCategory);
    });
  }

  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const countEl = document.getElementById('resultsCount');

  let filtered = allProducts;

  // Category filter
  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  // Search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  countEl.textContent = `Showing ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try changing your search or filter criteria</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const discount = getDiscount(product.price, product.original_price);
    return `
      <div class="card product-card">
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

  // Event listeners
  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      addToCart(JSON.parse(btn.dataset.product));
    });
  });

  grid.querySelectorAll('.whatsapp-order').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openProductWhatsApp(btn.dataset.name, btn.dataset.price);
    });
  });
}

// Filter pills
document.getElementById('filterPills').addEventListener('click', (e) => {
  const pill = e.target.closest('.filter-pill');
  if (!pill) return;

  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  currentCategory = pill.dataset.category;
  renderProducts();
});

// Search with debounce
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery = e.target.value.trim();
    renderProducts();
  }, 300);
});

loadProducts();
