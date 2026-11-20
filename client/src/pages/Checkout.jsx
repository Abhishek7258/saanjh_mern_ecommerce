import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg, inr } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { payForOrder } from '../pay';

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, shipping, total, clear } = useCart();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState('razorpay');
  const [f, setF] = useState({ name: user.name, phone: '', address: '', city: '', state: '', pincode: '' });
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (!items.length) return <div className="empty"><h2>Nothing to check out</h2><Link className="btn" to="/shop">Browse the shop</Link></div>;

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(f.phone)) return toast.error('Enter a 10-digit phone number');
    if (!/^\d{6}$/.test(f.pincode)) return toast.error('Enter a 6-digit pincode');
    setBusy(true);
    try {
      const { data: order } = await api.post('/orders', { items: items.map(({ product, qty }) => ({ product, qty })), shipping: f, paymentMethod: method });
      const done = () => { clear(); nav('/orders', { state: { placed: order._id } }); };
      if (method === 'cod') return done();
      await payForOrder(order, user, {
        onSuccess: done,
        onDismiss: () => { setBusy(false); toast('Payment not completed. Your order is saved. You can pay from My orders.'); nav('/orders'); clear(); },
        onError: (m) => { setBusy(false); toast.error(m); },
      });
    } catch (err) { setBusy(false); toast.error(errMsg(err)); }
  };

  return (
    <form className="section checkout" onSubmit={submit}>
      <div>
        <h1 className="title">Checkout</h1>
        <fieldset>
          <legend>Delivery address</legend>
          <label>Full name<input required value={f.name} onChange={on('name')} /></label>
          <label>Phone<input required inputMode="numeric" maxLength={10} value={f.phone} onChange={on('phone')} /></label>
          <label className="wide">Address<input required value={f.address} onChange={on('address')} placeholder="House no., street, area" /></label>
          <label>City<input required value={f.city} onChange={on('city')} /></label>
          <label>State<input required value={f.state} onChange={on('state')} /></label>
          <label>Pincode<input required inputMode="numeric" maxLength={6} value={f.pincode} onChange={on('pincode')} /></label>
        </fieldset>
        <fieldset>
          <legend>Payment</legend>
          {[['razorpay', 'Pay online', 'UPI, cards, netbanking and wallets via Razorpay'], ['cod', 'Cash on delivery', 'Pay when your order arrives']].map(([v, t, d]) => (
            <label key={v} className={method === v ? 'radio on' : 'radio'}>
              <input type="radio" name="pay" checked={method === v} onChange={() => setMethod(v)} />
              <span><b>{t}</b><small>{d}</small></span>
            </label>
          ))}
        </fieldset>
      </div>
      <aside className="summary">
        <h3>In your order</h3>
        {items.map((i) => <div className="sum-row" key={i.product}><span>{i.name} × {i.qty}</span><span>{inr(i.price * i.qty)}</span></div>)}
        <hr />
        <div className="sum-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
        <div className="sum-row"><span>Shipping</span><span>{shipping ? inr(shipping) : 'Free'}</span></div>
        <div className="sum-row total"><span>Total</span><span>{inr(total)}</span></div>
        <button className="btn block" disabled={busy}>{busy ? 'Please wait…' : method === 'cod' ? 'Place order' : `Pay ${inr(total)}`}</button>
      </aside>
    </form>
  );
}
