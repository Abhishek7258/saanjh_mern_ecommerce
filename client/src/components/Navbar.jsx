import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="nav">
      <Link to="/" className="logo" onClick={close}>saanjh<i /></Link>
      <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}><span /><span /></button>
      <nav className={open ? 'links open' : 'links'}>
        <NavLink to="/shop" onClick={close}>Shop</NavLink>
        {user && <NavLink to="/orders" onClick={close}>My orders</NavLink>}
        {user && <NavLink to="/account" onClick={close}>Account</NavLink>}
        {user?.isAdmin && <NavLink to="/admin" onClick={close}>Admin</NavLink>}
        {user ? (
          <button className="linkbtn" onClick={() => { logout(); close(); nav('/'); }}>Log out ({user.name.split(' ')[0]})</button>
        ) : (
          <NavLink to="/login" onClick={close}>Log in</NavLink>
        )}
        <Link to="/cart" className="cartbtn" onClick={close}>
          Cart
          <motion.b key={count} initial={{ scale: 1.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>{count}</motion.b>
        </Link>
      </nav>
    </header>
  );
}
