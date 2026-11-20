import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = isLogin ? await login(f.email, f.password) : await register(f.name, f.email, f.password);
      toast.success(`Welcome, ${u.name.split(' ')[0]}`);
      nav(loc.state?.from || (u.isAdmin ? '/admin' : '/'), { replace: true });
    } catch (err) { toast.error(errMsg(err)); setBusy(false); }
  };

  return (
    <section className="auth">
      <motion.form onSubmit={submit} className="auth-card" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <h1>{isLogin ? 'Log in' : 'Create your account'}</h1>
        {!isLogin && <label>Name<input required value={f.name} onChange={on('name')} autoComplete="name" /></label>}
        <label>Email<input type="email" required value={f.email} onChange={on('email')} autoComplete="email" /></label>
        <label>Password<input type="password" required minLength={6} value={f.password} onChange={on('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} /></label>
        <button className="btn block" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
        <p className="swap">{isLogin ? <>New here? <Link to="/register" state={loc.state}>Create an account</Link></> : <>Already have an account? <Link to="/login" state={loc.state}>Log in</Link></>}</p>
      </motion.form>
    </section>
  );
}
