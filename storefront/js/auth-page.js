import { initPage } from './components.js';
import { supabase } from './supabase.js';
import { getSession } from './auth.js';

initPage();

// Redirect if already logged in
const params = new URLSearchParams(window.location.search);
const redirectUrl = params.get('redirect') || '/profile.html';

getSession().then(session => {
  if (session) {
    window.location.href = redirectUrl;
  }
});

// Tab switching
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
});

tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.classList.add('active');
  loginForm.classList.remove('active');
});

// Login Logic
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const errorEl = document.getElementById('loginError');
  
  btn.disabled = true;
  btn.textContent = 'Logging in...';
  errorEl.style.display = 'none';

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: document.getElementById('lEmail').value.trim(),
      password: document.getElementById('lPassword').value
    });

    if (error) throw error;
    window.location.href = redirectUrl;
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Login';
  }
});

// Register Logic
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('registerBtn');
  const errorEl = document.getElementById('registerError');
  
  btn.disabled = true;
  btn.textContent = 'Creating account...';
  errorEl.style.display = 'none';

  const email = document.getElementById('rEmail').value.trim();
  const password = document.getElementById('rPassword').value;
  const name = document.getElementById('rName').value.trim();
  const phone = document.getElementById('rPhone').value.trim();

  try {
    // 1. Sign up via Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) throw authError;

    // 2. Wait a brief moment to ensure the database trigger creates the profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. Update the auto-generated profile with the user's name and phone
    if (authData.user) {
      await supabase
        .from('users')
        .update({ name, phone })
        .eq('auth_id', authData.user.id);
    }

    // 4. Redirect to requested page
    window.location.href = redirectUrl;

  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
});

// Google Auth Logic
document.getElementById('googleAuthBtn').addEventListener('click', async () => {
  const btn = document.getElementById('googleAuthBtn');
  btn.disabled = true;
  btn.textContent = 'Redirecting to Google...';

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + redirectUrl
      }
    });
    if (error) throw error;
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    alert('Failed to sign in with Google. Please try again.');
    btn.disabled = false;
    btn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" width="18" height="18"> Continue with Google';
  }
});
