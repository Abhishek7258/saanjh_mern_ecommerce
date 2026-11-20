import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { inr } from '../api';
import { useCart } from '../context/CartContext';
import { Img } from '../components/ProductCard';

export default function Cart() {
  const { items, setQty, remove, subtotal, shipping, total } = useCart();
  const nav = useNavigate();
  if (!items.length) return <div className="empty"><h2>Your cart is empty</h2><p>Add something you like and it will wait for you here.</p><Link className="btn" to="/shop">Browse the shop</Link></div>;

  return (
    <section className="section cart">
      <div>
        <h1 className="title">Your cart</h1>
        <AnimatePresence>
          {items.map((i) => (
            <motion.div key={i.product} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -60 }} className="line">
              <Img src={i.image} alt={i.name} />
              <div className="line-info">
                <Link to={`/product/${i.product}`}><h3>{i.name}</h3></Link>
                <div className="price">{inr(i.price)}</div>
                <div className="qty sm">
                  <button onClick={() => setQty(i.product, i.qty - 1)} aria-label="Decrease">−</button><span>{i.qty}</span><button onClick={() => setQty(i.product, i.qty + 1)} aria-label="Increase">+</button>
                </div>
              </div>
              <div className="line-end"><b>{inr(i.price * i.qty)}</b><button className="linkbtn" onClick={() => remove(i.product)}>Remove</button></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <aside className="summary">
        <h3>Order summary</h3>
        <div className="sum-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
        <div className="sum-row"><span>Shipping</span><span>{shipping ? inr(shipping) : 'Free'}</span></div>
        {shipping > 0 && <small className="hint">Add {inr(999 - subtotal)} more for free shipping</small>}
        <div className="sum-row total"><span>Total</span><span>{inr(total)}</span></div>
        <button className="btn block" onClick={() => nav('/checkout')}>Go to checkout</button>
      </aside>
    </section>
  );
}
