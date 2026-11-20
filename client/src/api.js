import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';
export default api;
