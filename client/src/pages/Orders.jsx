import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { inr } from '../api';
import { useAuth } from '../context/AuthContext';
import { payForOrder } from '../pay';
import { Img } from '../components/ProductCard';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const placed = useLocation().state?.placed;
  const load = () => api.get('/orders/mine').then((r) => setOrders(r.data)).catch(() => setOrders([]));
  useEffect(() => { load(); }, []);

  const payNow = (o) => payForOrder(o, user, {
    onSuccess: () => { toast.success('Payment received'); load(); },
    onDismiss: () => toast('Payment cancelled'),
    onError: (m) => toast.error(m),
  });

  if (!orders) return <div className="center-load"><span className="spinner" /></div>;
  return (
    <section className="section narrow">
      {placed && (
        <motion.div className="success" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <motion.svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><motion.path d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.5 }} /></motion.svg>
          <div><b>Order placed</b><span>Order #{placed.slice(-6).toUpperCase()} is confirmed. We will email updates as it ships.</span></div>
        </motion.div>
      )}
      <h1 className="title">My orders</h1>
      {orders.length === 0 ? <div className="empty"><h2>No orders yet</h2><Link className="btn" to="/shop">Start shopping</Link></div> : orders.map((o) => (
        <div className="order" key={o._id}>
          <div className="order-head">
            <div><b>#{o._id.slice(-6).toUpperCase()}</b><small>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div>
            <span className={`pill ${o.status.toLowerCase()}`}>{o.status}</span>
            <span className={`pill ${o.isPaid ? 'paid' : 'unpaid'}`}>{o.isPaid ? 'Paid' : o.paymentMethod === 'cod' ? 'Pay on delivery' : 'Payment due'}</span>
            <b className="grow">{inr(o.total)}</b>
          </div>
          <div className="order-items">{o.items.map((i, k) => <div key={k} title={i.name}><Img src={i.image} alt={i.name} /><span>{i.name} × {i.qty}</span></div>)}</div>
          {!o.isPaid && o.paymentMethod === 'razorpay' && o.status !== 'Cancelled' && <button className="btn sm" onClick={() => payNow(o)}>Pay {inr(o.total)} now</button>}
        </div>
      ))}
    </section>
  );
}
