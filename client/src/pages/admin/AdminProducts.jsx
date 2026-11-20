import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { errMsg, inr } from '../../api';
import { Img } from '../../components/ProductCard';

const blank = { name: '', category: '', price: '', mrp: '', discount: '', stock: '', image: '', description: '', featured: false };
const pct = (p) => (p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0);

export default function AdminProducts() {
  const [list, setList] = useState([]);
  const [edit, setEdit] = useState(null);
  const [q, setQ] = useState('');
  const load = () => api.get('/products').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const open = (p) => setEdit({ ...p, discount: p._id ? pct(p) || '' : '' });

  // Price, MRP and discount stay in sync: set MRP + discount % and the sale price is calculated, or type the sale price and the discount is calculated.
  const change = (k, v) => {
    const n = { ...edit, [k]: v };
    const mrp = +n.mrp, d = +n.discount;
    if ((k === 'mrp' || k === 'discount') && mrp > 0 && n.discount !== '') n.price = Math.round(mrp * (1 - Math.min(d, 100) / 100));
    if (k === 'price' && mrp > 0) n.discount = Math.max(0, Math.round((1 - +v / mrp) * 100));
    setEdit(n);
  };

  const save = async (e) => {
    e.preventDefault();
    const { discount, ...rest } = edit;
    const body = { ...rest, price: +edit.price, mrp: +edit.mrp || 0, stock: +edit.stock };
    if (body.mrp && body.mrp < body.price) return toast.error('MRP must be higher than the sale price');
    try {
      edit._id ? await api.put(`/products/${edit._id}`, body) : await api.post('/products', body);
      toast.success(edit._id ? 'Product updated' : 'Product added');
      setEdit(null); load();
    } catch (err) { toast.error(errMsg(err)); }
  };
  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await api.delete(`/products/${p._id}`); toast.success('Product deleted'); load();
  };
  const f = (k) => (e) => change(k, e.target.type === 'checkbox' ? e.target.checked : e.target.value);
  const shown = list.filter((p) => (p.name + p.category).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="head-row"><h1 className="title">Products ({list.length})</h1><button className="btn sm" onClick={() => setEdit(blank)}>Add product</button></div>
      <div className="admin-tools"><input placeholder="Search by name or category" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" /></div>
      <div className="panel scroll">
        <table>
          <thead><tr><th></th><th>Name</th><th>Category</th><th>MRP</th><th>Discount</th><th>Sale price</th><th>Stock</th><th></th></tr></thead>
          <tbody>{shown.map((p) => (
            <tr key={p._id}>
              <td><Img className="thumb" src={p.image} alt="" /></td>
              <td>{p.name}{p.featured && <span className="pill paid">Featured</span>}</td><td>{p.category}</td>
              <td>{p.mrp ? inr(p.mrp) : '—'}</td><td className="disc">{pct(p) ? `${pct(p)}%` : '—'}</td><td><b>{inr(p.price)}</b></td>
              <td className={p.stock <= 5 ? 'warn' : ''}>{p.stock}</td>
              <td className="acts"><button className="linkbtn" onClick={() => open(p)}>Edit</button><button className="linkbtn danger" onClick={() => del(p)}>Delete</button></td>
            </tr>))}</tbody>
        </table>
        {shown.length === 0 && <p className="muted">No products match.</p>}
      </div>
      <AnimatePresence>
        {edit && (
          <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && setEdit(null)}>
            <motion.form className="modal" onSubmit={save} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
              <h2>{edit._id ? 'Edit product' : 'Add product'}</h2>
              <label>Name<input required value={edit.name} onChange={f('name')} /></label>
              <label>Category<input required value={edit.category} onChange={f('category')} placeholder="e.g. Kitchen" /></label>
              <div className="cols3">
                <label>MRP (₹)<input type="number" min="0" value={edit.mrp} onChange={f('mrp')} /></label>
                <label>Discount %<input type="number" min="0" max="100" value={edit.discount} onChange={f('discount')} /></label>
                <label>Sale price (₹)<input required type="number" min="0" value={edit.price} onChange={f('price')} /></label>
              </div>
              <small className="hint-inline">Enter MRP and discount % and the sale price is calculated, or type the sale price directly.</small>
              <label>Stock<input required type="number" min="0" value={edit.stock} onChange={f('stock')} /></label>
              <label>Image URL<input value={edit.image} onChange={f('image')} placeholder="https://…" /></label>
              <label>Description<textarea rows="3" value={edit.description} onChange={f('description')} /></label>
              <label className="check"><input type="checkbox" checked={edit.featured} onChange={f('featured')} /> Show on the home page</label>
              <div className="modal-acts"><button type="button" className="btn ghost sm" onClick={() => setEdit(null)}>Cancel</button><button className="btn sm">Save product</button></div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
