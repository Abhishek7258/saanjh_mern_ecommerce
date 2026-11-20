import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { inr } from '../api';
import { useCart } from '../context/CartContext';
import { Img } from '../components/ProductCard';

export default function Product() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState(false);
  const { add } = useCart();
  const nav = useNavigate();

  useEffect(() => { setP(null); api.get(`/products/${id}`).then((r) => setP(r.data)).catch(() => setErr(true)); }, [id]);
  if (err) return <div className="empty"><h2>We could not find that product</h2><Link className="btn" to="/shop">Back to shop</Link></div>;
  if (!p) return <div className="center-load"><span className="spinner" /></div>;
  const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;

  return (
    <section className="section detail">
      <motion.div className="detail-img" initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <Img src={p.image} alt={p.name} />
      </motion.div>
      <div className="detail-info">
        <Link to={`/shop?category=${p.category}`} className="crumb">{p.category}</Link>
        <h1>{p.name}</h1>
        <div className="price lg">{inr(p.price)} {off > 0 && <><s>{inr(p.mrp)}</s><span className="tag inline">{off}% off</span></>}</div>
        <p className="desc">{p.description}</p>
        <p className={p.stock > 0 && p.stock <= 5 ? 'stock low' : 'stock'}>{p.stock < 1 ? 'Sold out' : p.stock <= 5 ? `Only ${p.stock} left` : 'In stock, ships in 2–5 days'}</p>
        <div className="buy">
          <div className="qty">
            <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Increase">+</button>
          </div>
          <button className="btn" disabled={p.stock < 1} onClick={() => { add(p, qty); toast.success('Added to cart'); }}>Add to cart</button>
          <button className="btn ghost" disabled={p.stock < 1} onClick={() => { add(p, qty); nav('/checkout'); }}>Buy now</button>
        </div>
      </div>
    </section>
  );
}
