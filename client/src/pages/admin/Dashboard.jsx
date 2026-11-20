import { useEffect, useState } from 'react';
import { animate, motion } from 'framer-motion';
import api, { inr } from '../../api';

function Count({ to, money }) {
  const [v, setV] = useState(0);
  useEffect(() => { const c = animate(0, to, { duration: 1, onUpdate: (x) => setV(Math.round(x)) }); return () => c.stop(); }, [to]);
  return <>{money ? inr(v) : v}</>;
}

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data)).catch(() => {}); }, []);
  if (!s) return <div className="center-load"><span className="spinner" /></div>;
  const max = Math.max(...s.sales.map((d) => d.total), 1);

  return (
    <>
      <h1 className="title">Dashboard</h1>
      <div className="stats">
        {[['Revenue (paid)', s.revenue, true], ['Orders', s.orders], ['Open orders', s.pending], ['Customers', s.users], ['Products', s.products]].map(([l, v, m]) => (
          <div className="stat" key={l}><small>{l}</small><b><Count to={v} money={m} /></b></div>
        ))}
      </div>
      <div className="two">
        <div className="panel">
          <h3>Sales, last 7 days</h3>
          <div className="bars">
            {s.sales.map((d, i) => (
              <div key={i} className="bar"><span>{d.total ? inr(d.total) : ''}</span>
                <motion.i initial={{ height: 0 }} animate={{ height: `${(d.total / max) * 100}%` }} transition={{ delay: 0.1 * i, duration: 0.6 }} style={{ minHeight: d.total ? 4 : 2 }} />
                <em>{d.label}</em></div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Low stock</h3>
          {s.lowStock.length === 0 ? <p className="muted">Everything is well stocked.</p> : s.lowStock.map((p) => <div className="sum-row" key={p._id}><span>{p.name}</span><b className="warn">{p.stock} left</b></div>)}
        </div>
      </div>
      <div className="panel">
        <h3>Recent orders</h3>
        <table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>{s.recent.map((o) => <tr key={o._id}><td>#{o._id.slice(-6).toUpperCase()}</td><td>{o.user?.name || 'Deleted user'}</td><td>{inr(o.total)}</td><td><span className={`pill ${o.status.toLowerCase()}`}>{o.status}</span></td></tr>)}</tbody></table>
        {s.recent.length === 0 && <p className="muted">No orders yet.</p>}
      </div>
    </>
  );
}
