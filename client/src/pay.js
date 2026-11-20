import api, { errMsg } from './api';

const loadScript = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

// Opens Razorpay Checkout for an existing order; verifies on the server after payment.
export async function payForOrder(order, user, { onSuccess, onDismiss, onError }) {
  try {
    if (!(await loadScript())) throw new Error('Could not load Razorpay. Check your connection.');
    const { data: rz } = await api.post('/payment/create', { orderId: order._id });
    new window.Razorpay({
      key: rz.key, amount: rz.amount, currency: rz.currency, order_id: rz.id,
      name: 'Saanjh', description: `Order #${order._id.slice(-6).toUpperCase()}`,
      prefill: { name: order.shipping?.name || user.name, email: user.email, contact: order.shipping?.phone },
      theme: { color: '#14193A' },
      handler: async (r) => {
        try {
          await api.post('/payment/verify', { orderId: order._id, ...r });
          onSuccess();
        } catch (e) { onError(errMsg(e)); }
      },
      modal: { ondismiss: onDismiss },
    }).open();
  } catch (e) { onError(errMsg(e)); }
}
