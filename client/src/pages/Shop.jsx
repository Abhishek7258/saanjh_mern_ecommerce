import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(sp.get('q') || '');
  const category = sp.get('category') || 'All';
  const sort = sp.get('sort') || 'new';

  const set = (k, v) => { const n = new URLSearchParams(sp); v && v !== 'All' ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }); };

  useEffect(() => { api.get('/products/categories').then((r) => setCats(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.get('/products', { params: { q, category, sort } }).then((r) => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, category, sort]);

  return (
    <section className="section">
      <h1 className="title">Shop</h1>
      <div className="filters">
        <div className="chips">
          {['All', ...cats].map((c) => (
            <button key={c} className={c === category ? 'chip on' : 'chip'} onClick={() => set('category', c)}>
              {c === category && <motion.span layoutId="chip" className="chip-bg" />}
              <span>{c}</span>
            </button>
          ))}
        </div>
        <div className="tools">
          <input placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
          <select value={sort} onChange={(e) => set('sort', e.target.value)} aria-label="Sort">
            <option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
          </select>
        </div>
      </div>
      {loading && !products.length ? <div className="center-load"><span className="spinner" /></div> : products.length === 0 ? (
        <div className="empty"><h2>Nothing matches that</h2><p>Try a different word or clear the category.</p><button className="btn" onClick={() => { setQ(''); setSp({}); }}>Clear filters</button></div>
      ) : (
        <motion.div layout className="grid"><AnimatePresence>{products.map((p) => <ProductCard key={p._id} p={p} />)}</AnimatePresence></motion.div>
      )}
    </section>
  );
}
