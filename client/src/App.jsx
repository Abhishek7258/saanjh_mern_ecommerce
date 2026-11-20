import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RequireAuth, RequireAdmin } from './components/Guards';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import Orders from './pages/Orders';
import Account from './pages/Account';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';

const Page = ({ children }) => (
  <motion.main className="page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
    {children}
  </motion.main>
);

export default function App() {
  const loc = useLocation();
  const inAdmin = loc.pathname.startsWith('/admin');
  return (
    <>
      {!inAdmin && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={loc} key={inAdmin ? 'admin' : loc.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/shop" element={<Page><Shop /></Page>} />
          <Route path="/product/:id" element={<Page><Product /></Page>} />
          <Route path="/cart" element={<Page><Cart /></Page>} />
          <Route path="/login" element={<Page><Auth mode="login" /></Page>} />
          <Route path="/register" element={<Page><Auth mode="register" /></Page>} />
          <Route path="/checkout" element={<RequireAuth><Page><Checkout /></Page></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth><Page><Orders /></Page></RequireAuth>} />
          <Route path="/account" element={<RequireAuth><Page><Account /></Page></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<Page><div className="empty"><h2>Page not found</h2><a className="btn" href="/">Back to home</a></div></Page>} />
        </Routes>
      </AnimatePresence>
      {!inAdmin && <Footer />}
    </>
  );
}
