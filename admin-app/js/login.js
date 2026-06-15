import { supabase } from './supabase.js';
import { getAdminSession } from './auth.js';

// If already logged in, redirect
getAdminSession().then(session => {
  if (session) {
    window.location.href = '/dashboard.html';
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = document.getElementById('loginBtn');
  const errorEl = document.getElementById('loginError');
  const email = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  btn.disabled = true;
  btn.textContent = 'Signing in...';
  errorEl.style.display = 'none';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data.session) {
      window.location.href = '/dashboard.html';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorEl.textContent = 'Invalid credentials. Please try again.';
    errorEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});
