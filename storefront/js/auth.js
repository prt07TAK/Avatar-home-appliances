import { supabase } from './supabase.js';

let currentSession = null;
let currentProfile = null;

export async function getSession() {
  if (currentSession) return currentSession;
  const { data: { session } } = await supabase.auth.getSession();
  currentSession = session;
  return session;
}

export async function getProfile() {
  if (currentProfile) return currentProfile;
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', session.user.id)
    .single();

  if (data) {
    currentProfile = data;
    return data;
  }
  return null;
}

export async function logout() {
  await supabase.auth.signOut();
  currentSession = null;
  currentProfile = null;
  window.location.reload();
}
