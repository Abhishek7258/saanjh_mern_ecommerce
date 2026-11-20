import { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext();
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  useEffect(() => localStorage.setItem('cart', JSON.stringify(items)), [items]);

  const add = (p, qty = 1) => setItems((cur) => {
    const found = cur.find((i) => i.product === p._id);
    const max = p.stock ?? 99;
    if (found) return cur.map((i) => (i.product === p._id ? { ...i, qty: Math.min(i.qty + qty, max) } : i));
    return [...cur, { product: p._id, name: p.name, image: p.image, price: p.price, stock: max, qty: Math.min(qty, max) }];
  });
  const setQty = (id, qty) => setItems((cur) => cur.map((i) => (i.product === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i)));
  const remove = (id) => setItems((cur) => cur.filter((i) => i.product !== id));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 79;

  return <Ctx.Provider value={{ items, add, setQty, remove, clear, count, subtotal, shipping, total: subtotal + shipping }}>{children}</Ctx.Provider>;
}
