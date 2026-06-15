export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}

export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '12px 24px';
  toast.style.background = type === 'error' ? 'var(--danger)' : 'var(--success)';
  toast.style.color = 'white';
  toast.style.borderRadius = 'var(--radius-md)';
  toast.style.boxShadow = 'var(--shadow-md)';
  toast.style.zIndex = '9999';
  toast.style.fontWeight = '500';
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function openCustomerWhatsApp(name, phone) {
  if (!phone) {
    showToast('No phone number available', 'error');
    return;
  }
  const msg = encodeURIComponent(`Hi ${name}, this is Avatar Home Appliances.`);
  window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
}
