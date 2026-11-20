import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { inr } from '../api';
import { useCart } from '../context/CartContext';

export const Img = ({ src, alt, ...rest }) => (
  <img src={src} alt={alt} loading="lazy" {...rest}
    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="900"><rect width="100%" height="100%" fill="#E9E6F5"/></svg>'); }} />
);

export default function ProductCard({ p }) {
  const { add } = useCart();
  const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  return (
    <motion.article layout initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} exit={{ opacity: 0, scale: 0.95 }} className="card">
      <Link to={`/product/${p._id}`} className="card-img">
        <Img src={p.image} alt={p.name} />
        {off > 0 && <span className="tag">{off}% off</span>}
        {p.stock < 1 && <span className="tag dark">Sold out</span>}
      </Link>
      <div className="card-body">
        <small>{p.category}</small>
        <Link to={`/product/${p._id}`}><h3>{p.name}</h3></Link>
        <div className="row">
          <div className="price">{inr(p.price)} {p.mrp > p.price && <s>{inr(p.mrp)}</s>}</div>
          <motion.button whileTap={{ scale: 0.9 }} className="add" disabled={p.stock < 1} aria-label={`Add ${p.name} to cart`}
            onClick={() => { add(p); toast.success('Added to cart'); }}>+</motion.button>
        </div>
      </div>
    </motion.article>
  );
}
