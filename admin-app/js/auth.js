import { supabase } from './supabase.js';

let currentSession = null;

export async function getAdminSession() {
  if (currentSession) return currentSession;
  const { data: { session } } = await supabase.auth.getSession();
  currentSession = session;
  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
      window.location.href = '/index.html';
    }
    return false;
  }

  // Optional: Check if they are actually in admin_roles, but for now
  // any logged in user on the admin app is considered an admin 
  // (we only create admin accounts via scripts).
  return true;
}

export async function adminLogout() {
  await supabase.auth.signOut();
  currentSession = null;
  window.location.href = '/index.html';
}
