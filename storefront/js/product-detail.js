// ============================================
// Product Detail Page
// ============================================

import { initPage, CATEGORY_LABELS } from './components.js';
import { supabase } from './supabase.js';
import { addToCart, formatPrice, getDiscount } from './cart.js';
import { openProductWhatsApp } from './whatsapp.js';

initPage();

const productId = new URLSearchParams(window.location.search).get('id');

async function loadProduct() {
  if (!productId) {
    document.getElementById('productDetail').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">❓</div>
        <h3>Product not found</h3>
        <p>The product you're looking for doesn't exist.</p>
        <a href="/products.html" class="btn btn-primary">Browse Products</a>
      </div>
    `;
    return;
  }

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error || !product) {
    document.getElementById('productDetail').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">❓</div>
        <h3>Product not found</h3>
        <p>This product may have been removed or doesn't exist.</p>
        <a href="/products.html" class="btn btn-primary">Browse Products</a>
      </div>
    `;
    return;
  }

  // Update page title and breadcrumb
  document.title = `${product.name} — Avatar Home Appliances`;
  document.getElementById('breadcrumbName').textContent = product.name;

  const discount = getDiscount(product.price, product.original_price);
  const inStock = product.stock > 0;
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;

  document.getElementById('productDetail').innerHTML = `
    <div>
      <img class="product-detail-image" src="${product.image_url || 'https://placehold.co/600x600/e2e8f0/94a3b8?text=No+Image'}" alt="${product.name}">
    </div>
    <div class="product-detail-info">
      <span class="product-detail-category">${categoryLabel}</span>
      <h1>${product.name}</h1>
      <div class="product-price" style="margin:var(--space-lg) 0;">
        <span class="current" style="font-size:var(--text-3xl);">${formatPrice(product.price)}</span>
        ${product.original_price ? `<span class="original" style="font-size:var(--text-lg);">${formatPrice(product.original_price)}</span>` : ''}
        ${discount > 0 ? `<span class="discount">${discount}% off</span>` : ''}
      </div>
      <div class="stock-status">
        <span class="stock-dot ${inStock ? '' : 'out'}"></span>
        <span>${inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}</span>
      </div>
      <p class="product-detail-description">${product.description || 'No description available.'}</p>
      <div class="product-detail-actions">
        <button class="btn btn-primary btn-lg" id="addToCartBtn" ${!inStock ? 'disabled' : ''}>
          🛒 ${inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
        <button class="btn btn-whatsapp btn-lg" id="whatsappBtn">
          💬 Order via WhatsApp
        </button>
      </div>
    </div>
  `;

  // Add to cart handler
  document.getElementById('addToCartBtn').addEventListener('click', () => {
    addToCart(product);
  });

  // WhatsApp handler
  document.getElementById('whatsappBtn').addEventListener('click', () => {
    openProductWhatsApp(product.name, product.price);
  });

  // Load related products
  loadRelatedProducts(product.category, product.id);
}

async function loadRelatedProducts(category, excludeId) {
  const grid = document.getElementById('relatedGrid');

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .neq('id', excludeId)
    .limit(4);

  if (!products || products.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-light);grid-column:1/-1;">No related products found.</p>';
    return;
  }

  grid.innerHTML = products.map(product => {
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
          <a href="/product.html?id=${product.id}"><h3 class="card-title">${product.name}</h3></a>
          <div class="product-price">
            <span class="current">${formatPrice(product.price)}</span>
            ${product.original_price ? `<span class="original">${formatPrice(product.original_price)}</span>` : ''}
          </div>
          <div class="product-actions">
            <button class="btn btn-primary btn-sm add-to-cart-related" data-product='${JSON.stringify(product).replace(/'/g, "&#39;")}'>🛒 Add to Cart</button>
            <button class="btn btn-whatsapp btn-sm wa-related" data-name="${product.name}" data-price="${product.price}">💬 WhatsApp</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.add-to-cart-related').forEach(btn => {
    btn.addEventListener('click', () => addToCart(JSON.parse(btn.dataset.product)));
  });

  grid.querySelectorAll('.wa-related').forEach(btn => {
    btn.addEventListener('click', () => openProductWhatsApp(btn.dataset.name, btn.dataset.price));
  });
}

loadProduct();
