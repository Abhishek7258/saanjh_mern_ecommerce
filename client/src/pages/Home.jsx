import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import ProductCard, { Img } from '../components/ProductCard';

const words = ['Things', 'for', 'the', 'hour', 'the', 'light', 'turns', 'gold.'];
const cats = ['Home Decor', 'Textiles', 'Kitchen', 'Lighting', 'Stationery'];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [hero, setHero] = useState([]);
  useEffect(() => {
    api.get('/products', { params: { featured: true } }).then((r) => { setFeatured(r.data.slice(0, 8)); setHero(r.data.slice(0, 3)); }).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <motion.div className="sun" initial={{ y: 220, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
        <div className="hero-copy">
          <h1>
            {words.map((w, i) => (
              <span className="mask" key={i}>
                <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 0.25 + i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>{w}&nbsp;</motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            Saanjh means evening. We make and ship handmade pots, linens, lamps and kitchenware from small workshops across India.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15 }} className="hero-cta">
            <Link to="/shop" className="btn">Shop the collection</Link>
            <Link to="/shop?category=Lighting" className="btn ghost">See lighting</Link>
          </motion.div>
        </div>
        <div className="hero-stack">
          {hero.map((p, i) => (
            <motion.div key={p._id} className={`stack s${i}`} initial={{ opacity: 0, y: 60, rotate: 0 }} animate={{ opacity: 1, y: 0, rotate: [-6, 4, -2][i] }}
              transition={{ delay: 0.6 + i * 0.15, type: 'spring', stiffness: 80, damping: 14 }} whileHover={{ rotate: 0, scale: 1.05, zIndex: 5 }}>
              <Link to={`/product/${p._id}`}><Img src={p.image} alt={p.name} /></Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="track">{[...cats, ...cats, ...cats, ...cats].map((c, i) => <span key={i}>{c}</span>)}</div>
      </div>

      <section className="section">
        <div className="section-head"><h2>Most loved this month</h2><Link to="/shop">View everything</Link></div>
        <div className="grid">{featured.map((p) => <ProductCard key={p._id} p={p} />)}</div>
      </section>

      <section className="section promise">
        {[['Made by hand', 'Every piece is made by a named workshop, never a factory line.'],
          ['Ships in 2–5 days', 'Free above ₹999. Packed in recycled paper, not plastic.'],
          ['Seven-day returns', 'If it is not right in your home, send it back. We cover the pickup.']].map(([t, d], i) => (
          <motion.div key={t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <h3>{t}</h3><p>{d}</p>
          </motion.div>
        ))}
      </section>
    </>
  );
}
