// ============================================
// Admin Products — CRUD Management
// ============================================

import { initAdmin } from './components.js';
import { supabase } from './supabase.js';
import { formatPrice, showToast } from './utils.js';

initAdmin('products');

const CATEGORY_LABELS = {
  fan: 'Fan', tv: 'TV', cooler: 'Cooler',
  cooler_parts: 'Cooler Parts', sewing_machine: 'Sewing Machine'
};

let allProducts = [];

// Modal controls
const modal = document.getElementById('productModal');
const backdrop = document.getElementById('modalBackdrop');

function openModal(title = 'Add Product') {
  document.getElementById('modalTitle').textContent = title;
  modal.classList.add('active');
  backdrop.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
  backdrop.classList.remove('active');
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  currentCroppedBlob = null;
}

document.getElementById('modalClose').addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);

document.getElementById('addProductBtn').addEventListener('click', () => {
  closeModal();
  openModal('Add Product');
});

// Load products
async function loadProducts() {
  const tbody = document.getElementById('productsBody');
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--danger);">Error loading products</td></tr>';
    return;
  }

  allProducts = data || [];
  renderProducts(allProducts);
}

function renderProducts(products) {
  const tbody = document.getElementById('productsBody');

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:var(--space-xl);color:var(--text-light);">No products found</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:var(--space-md);">
          <img src="${p.image_url || 'https://placehold.co/50x40/e2e8f0/94a3b8?text=IMG'}" alt="" style="width:50px;height:40px;object-fit:cover;border-radius:var(--radius-sm);">
          <div>
            <strong>${p.name}</strong>
            <div style="font-size:var(--text-xs);color:var(--text-light);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.description || ''}</div>
          </div>
        </div>
      </td>
      <td><span class="badge badge-confirmed">${CATEGORY_LABELS[p.category] || p.category}</span></td>
      <td>
        <strong>${formatPrice(p.price)}</strong>
        ${p.original_price ? `<div style="font-size:var(--text-xs);color:var(--text-light);text-decoration:line-through;">${formatPrice(p.original_price)}</div>` : ''}
      </td>
      <td>
        <span style="color:${p.stock > 0 ? 'var(--success)' : 'var(--danger)'};font-weight:600;">${p.stock}</span>
      </td>
      <td>
        <label class="toggle-switch">
          <input type="checkbox" ${p.is_featured ? 'checked' : ''} data-id="${p.id}" class="toggle-featured">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <div class="actions">
          <button class="btn btn-outline btn-sm edit-btn" data-id="${p.id}">✏️ Edit</button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${p.id}" data-name="${p.name}">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Event listeners
  tbody.querySelectorAll('.toggle-featured').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const featured = e.target.checked;
      const { error } = await supabase
        .from('products')
        .update({ is_featured: featured })
        .eq('id', id);
      if (error) showToast('Failed to update', 'error');
      else showToast(featured ? 'Marked as featured' : 'Removed from featured');
    });
  });

  tbody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editProduct(btn.dataset.id));
  });

  tbody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(btn.dataset.id, btn.dataset.name));
  });
}

// Edit product
let currentEditingImageUrl = '';

function editProduct(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  document.getElementById('productId').value = product.id;
  document.getElementById('pName').value = product.name;
  document.getElementById('pCategory').value = product.category;
  document.getElementById('pPrice').value = product.price;
  document.getElementById('pOriginalPrice').value = product.original_price || '';
  document.getElementById('pStock').value = product.stock;
  document.getElementById('pImageFile').value = ''; // Reset file input
  currentEditingImageUrl = product.image_url || '';
  currentCroppedBlob = null;
  document.getElementById('pDescription').value = product.description || '';
  document.getElementById('pFeatured').checked = product.is_featured;

  openModal('Edit Product');
}

// Delete product
async function deleteProduct(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    showToast('Failed to delete product', 'error');
  } else {
    showToast('Product deleted');
    loadProducts();
  }
}

// Save product (add or update)
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = document.getElementById('saveProductBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const id = document.getElementById('productId').value;
  let finalImageUrl = id ? currentEditingImageUrl : null;

  try {
    // 1. Handle file upload if an image was cropped
    if (currentCroppedBlob) {
      const fileExt = currentCroppedBlob.type.split('/')[1] || 'png';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, currentCroppedBlob, { contentType: currentCroppedBlob.type });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      finalImageUrl = publicUrlData.publicUrl;
    }

    // 2. Save product data
    const productData = {
      name: document.getElementById('pName').value.trim(),
      category: document.getElementById('pCategory').value,
      price: Number(document.getElementById('pPrice').value),
      original_price: document.getElementById('pOriginalPrice').value ? Number(document.getElementById('pOriginalPrice').value) : null,
      stock: Number(document.getElementById('pStock').value),
      image_url: finalImageUrl,
      description: document.getElementById('pDescription').value.trim() || null,
      is_featured: document.getElementById('pFeatured').checked
    };

    if (id) {
      // Update
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);
      if (error) throw error;
      showToast('Product updated successfully');
    } else {
      // Insert
      const { error } = await supabase
        .from('products')
        .insert(productData);
      if (error) throw error;
      showToast('Product added successfully');
    }

    closeModal();
    loadProducts();
  } catch (error) {
    console.error('Save error:', error);
    showToast('Failed to save product', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Product';
  }
});

// Search
let searchTimeout;
document.getElementById('productSearch').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = q
      ? allProducts.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
      : allProducts;
    renderProducts(filtered);
  }, 300);
});
// ==========================================
// Cropper.js Integration
// ==========================================
let cropper = null;
let currentCroppedBlob = null;
const cropModal = document.getElementById('cropModal');
const cropImage = document.getElementById('cropImage');
const fileInput = document.getElementById('pImageFile');

fileInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  if (/^image\/\w+/.test(file.type)) {
    cropImage.src = URL.createObjectURL(file);
    cropModal.classList.add('active');
    
    // Destroy previous cropper if exists
    if (cropper) {
      cropper.destroy();
    }
    
    // Initialize cropper after a tiny delay so modal layout resolves
    setTimeout(() => {
      cropper = new Cropper(cropImage, {
        viewMode: 0, // Allows zooming out beyond the image bounds
        autoCropArea: 1,
        dragMode: 'move' // Makes it easy to drag the image around
      });
    }, 100);
  } else {
    showToast('Please select an image file', 'error');
  }
});

function closeCropModal() {
  cropModal.classList.remove('active');
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  cropImage.src = '';
}

document.getElementById('cropModalClose').addEventListener('click', () => {
  closeCropModal();
  fileInput.value = ''; // Reset file input
});

document.getElementById('cancelCropBtn').addEventListener('click', () => {
  closeCropModal();
  fileInput.value = ''; // Reset file input
});

document.getElementById('zoomInBtn').addEventListener('click', (e) => {
  e.preventDefault();
  if (cropper) cropper.zoom(0.1);
});

document.getElementById('zoomOutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  if (cropper) cropper.zoom(-0.1);
});

document.getElementById('applyCropBtn').addEventListener('click', () => {
  if (!cropper) return;
  cropper.getCroppedCanvas({
    width: 800,
    height: 600,
    fillColor: '#fff',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  }).toBlob((blob) => {
    currentCroppedBlob = blob;
    closeCropModal();
    showToast('Image cropped. Click Save Product to apply.');
  }, 'image/jpeg', 0.9);
});

loadProducts();
