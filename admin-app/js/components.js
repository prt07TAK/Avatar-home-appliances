// ============================================
// Admin Shared Components — Sidebar + Navbar
// ============================================

import { requireAdmin, adminLogout, getAdminSession } from './auth.js';

export function initAdmin(activePage) {
  if (!requireAdmin()) return false;

  const session = getAdminSession();

  // Admin Navbar
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="container navbar-inner" style="max-width:100%;padding:0 var(--space-xl);">
      <a href="/dashboard.html" class="navbar-brand">
        <span class="brand-icon">⚡</span>
        <span class="brand-text">Avatar Admin</span>
      </a>
      <div style="display:flex;align-items:center;gap:var(--space-md);">
        <span style="font-size:var(--text-sm);color:var(--text-secondary);">👤 ${session?.user?.email || 'Admin'}</span>
        <a href="http://localhost:3000" class="btn btn-ghost btn-sm" target="_blank">🌐 View Site</a>
        <button class="btn btn-ghost btn-sm" id="logoutBtn">🚪 Logout</button>
      </div>
    </div>
  `;
  document.body.prepend(nav);

  // Sidebar
  const sidebar = document.createElement('aside');
  sidebar.className = 'admin-sidebar';
  sidebar.id = 'adminSidebar';
  sidebar.innerHTML = `
    <div class="sidebar-menu">
      <div class="sidebar-section">
        <div class="sidebar-section-title">Main</div>
        <a href="/dashboard.html" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''}">
          <span class="icon">📊</span> Dashboard
        </a>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">Management</div>
        <a href="/products.html" class="sidebar-link ${activePage === 'products' ? 'active' : ''}">
          <span class="icon">📦</span> Products
        </a>
        <a href="/orders.html" class="sidebar-link ${activePage === 'orders' ? 'active' : ''}">
          <span class="icon">🧾</span> Orders
        </a>
        <a href="/services.html" class="sidebar-link ${activePage === 'services' ? 'active' : ''}">
          <span class="icon">🔧</span> Service Requests
        </a>
        <a href="/customers.html" class="sidebar-link ${activePage === 'customers' ? 'active' : ''}">
          <span class="icon">👥</span> Customers
        </a>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">Quick Actions</div>
        <a href="https://wa.me/919649383525" target="_blank" class="sidebar-link">
          <span class="icon">💬</span> WhatsApp
        </a>
        <a href="http://localhost:3000" target="_blank" class="sidebar-link">
          <span class="icon">🌐</span> View Website
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(sidebar);

  // Mobile sidebar toggle
  const toggle = document.createElement('button');
  toggle.className = 'sidebar-toggle';
  toggle.innerHTML = '☰';
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
  document.body.appendChild(toggle);

  // Close sidebar on link click (mobile)
  sidebar.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => sidebar.classList.remove('open'));
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', adminLogout);

  return true;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
