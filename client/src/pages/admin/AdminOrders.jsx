import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg, inr } from '../../api';

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(null);
  const load = () => api.get('/orders').then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);

  const setStatus = async (o, status) => {
    try { await api.put(`/orders/${o._id}/status`, { status }); toast.success(`Order marked ${status.toLowerCase()}`); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <>
      <h1 className="title">Orders</h1>
      <div className="panel scroll">
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
          <tbody>{orders.map((o) => (
            <Fragment key={o._id}>
              <tr className="click" onClick={() => setOpen(open === o._id ? null : o._id)}>
                <td>#{o._id.slice(-6).toUpperCase()}</td><td>{o.user?.name || 'Deleted user'}</td>
                <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td><td>{inr(o.total)}</td>
                <td><span className={`pill ${o.isPaid ? 'paid' : 'unpaid'}`}>{o.isPaid ? 'Paid' : o.paymentMethod === 'cod' ? 'COD' : 'Unpaid'}</span></td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select value={o.status} onChange={(e) => setStatus(o, e.target.value)}>{statuses.map((s) => <option key={s}>{s}</option>)}</select>
                </td>
              </tr>
              {open === o._id && (
                <tr key={o._id + 'd'} className="detail-row"><td colSpan="6">
                  <div className="two">
                    <div><b>Items</b>{o.items.map((i, k) => <div className="sum-row" key={k}><span>{i.name} × {i.qty}</span><span>{inr(i.price * i.qty)}</span></div>)}
                      <div className="sum-row"><span>Shipping</span><span>{inr(o.shippingPrice)}</span></div></div>
                    <div><b>Deliver to</b><p className="muted">{o.shipping.name}, {o.shipping.phone}<br />{o.shipping.address}, {o.shipping.city}, {o.shipping.state} {o.shipping.pincode}</p>
                      {o.razorpay?.paymentId && <small className="muted">Razorpay payment: {o.razorpay.paymentId}</small>}</div>
                  </div>
                </td></tr>
              )}
            </Fragment>))}</tbody>
        </table>
        {orders.length === 0 && <p className="muted">No orders yet.</p>}
      </div>
    </>
  );
}
