// ============================================
// WhatsApp Integration Helpers
// ============================================

const WHATSAPP_NUMBER = '919649383525';
const BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function openGeneralWhatsApp() {
  const message = encodeURIComponent(
    'Hi Avatar Home Appliances, I have a query. Please help.'
  );
  window.open(`${BASE_URL}?text=${message}`, '_blank');
}

export function openProductWhatsApp(productName, price) {
  const message = encodeURIComponent(
    `Hi Avatar Home Appliances, I want to order: ${productName} priced at ₹${Number(price).toLocaleString('en-IN')}. Please confirm availability.`
  );
  window.open(`${BASE_URL}?text=${message}`, '_blank');
}

export function openRepairWhatsApp(appliance, name, phone) {
  const message = encodeURIComponent(
    `Hi, I need repair service for my ${appliance}. My name is ${name} and my number is ${phone}.`
  );
  window.open(`${BASE_URL}?text=${message}`, '_blank');
}

export function openCustomerWhatsApp(customerName, customerPhone) {
  const message = encodeURIComponent(
    `Hi ${customerName}, this is Avatar Home Appliances, Sujangarh. Following up regarding your recent order/inquiry.`
  );
  window.open(`https://wa.me/91${customerPhone}?text=${message}`, '_blank');
}

export function getWhatsAppLink(message) {
  return `${BASE_URL}?text=${encodeURIComponent(message)}`;
}
