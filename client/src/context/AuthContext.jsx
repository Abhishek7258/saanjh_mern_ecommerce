import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.get('/auth/me').then((r) => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);

  const save = ({ data }) => { localStorage.setItem('token', data.token); setUser(data); return data; };
  const login = (email, password) => api.post('/auth/login', { email, password }).then(save);
  const register = (name, email, password) => api.post('/auth/register', { name, email, password }).then(save);
  const update = (body) => api.put('/auth/me', body).then(save);
  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, register, update, logout }}>{children}</Ctx.Provider>;
}
