import { Link } from 'react-router-dom';
export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="logo big">saanjh<i /></div>
        <p>Handmade home things from small workshops across India. Packed by hand, shipped in 2–5 days.</p>
      </div>
      <div><h4>Shop</h4><Link to="/shop">All products</Link><Link to="/cart">Cart</Link><Link to="/orders">My orders</Link></div>
      <div><h4>Help</h4><span>Free shipping above ₹999</span><span>7-day easy returns</span><span>hello@saanjh.example</span></div>
      <small>© {new Date().getFullYear()} Saanjh. Payments secured by Razorpay.</small>
    </footer>
  );
}
