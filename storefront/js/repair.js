// ============================================
// Repair Service Page
// ============================================

import { initPage } from './components.js';
import { supabase } from './supabase.js';
import { showToast } from './cart.js';
import { openRepairWhatsApp } from './whatsapp.js';

initPage();

// Handle responsive feature grid
function handleResponsive() {
  const grid = document.querySelector('.section .container > div[style]');
  if (grid && window.innerWidth <= 640) {
    grid.style.gridTemplateColumns = '1fr';
  }
}
handleResponsive();
window.addEventListener('resize', handleResponsive);

// Form submission
document.getElementById('repairForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = document.getElementById('submitRepairBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  const name = document.getElementById('repairName').value.trim();
  const phone = document.getElementById('repairPhone').value.trim();
  const applianceType = document.getElementById('applianceType').value;
  const issueDescription = document.getElementById('issueDesc').value.trim();

  try {
    const { error } = await supabase
      .from('service_requests')
      .insert({
        name,
        phone,
        appliance_type: applianceType,
        issue_description: issueDescription,
        status: 'pending'
      });

    if (error) throw error;

    document.getElementById('repairFormContainer').classList.add('hidden');
    document.getElementById('repairSuccess').classList.remove('hidden');

  } catch (error) {
    console.error('Repair submission error:', error);
    showToast('Failed to submit. Please try again or use WhatsApp.', 'error');
    btn.disabled = false;
    btn.textContent = '📋 Submit Request';
  }
});

// WhatsApp repair button
document.getElementById('whatsappRepairBtn').addEventListener('click', () => {
  const name = document.getElementById('repairName').value.trim() || 'Customer';
  const phone = document.getElementById('repairPhone').value.trim() || '';
  const appliance = document.getElementById('applianceType').value || 'appliance';
  openRepairWhatsApp(appliance, name, phone);
});
