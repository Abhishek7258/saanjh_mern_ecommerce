import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="admin">
      <aside className="side">
        <Link to="/" className="logo">saanjh<i /></Link>
        <small>Admin panel</small>
        <nav>
          <NavLink end to="/admin">Dashboard</NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
          <NavLink to="/admin/users">Customers</NavLink>
        </nav>
        <div className="side-foot">
          <Link to="/">View store</Link>
          <button className="linkbtn" onClick={() => { logout(); nav('/'); }}>Log out ({user.name.split(' ')[0]})</button>
        </div>
      </aside>
      <motion.main className="admin-main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><Outlet /></motion.main>
    </div>
  );
}
