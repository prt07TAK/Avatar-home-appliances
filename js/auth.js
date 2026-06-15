// ============================================
// Admin Auth Helpers — localStorage-based session
// ============================================

const ADMIN_SESSION_KEY = 'avatar_admin_session';

export function isAdminLoggedIn() {
  try {
    const session = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY));
    return session && session.isAdmin === true;
  } catch {
    return false;
  }
}

export function setAdminSession(username) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
    isAdmin: true,
    username: username,
    loginTime: Date.now()
  }));
}

export function getAdminSession() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY));
  } catch {
    return null;
  }
}

export function adminLogout() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.href = '/admin/';
}

export function requireAdmin() {
  if (!isAdminLoggedIn()) {
    window.location.href = '/admin/';
    return false;
  }
  return true;
}
