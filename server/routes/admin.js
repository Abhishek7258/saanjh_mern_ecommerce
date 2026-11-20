const router = require('express').Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const { wrap, httpError } = require('../utils/helpers');

router.use(protect, admin);

router.get('/stats', wrap(async (req, res) => {
  const [users, products, orders, lowStock] = await Promise.all([
    User.countDocuments(), Product.countDocuments(),
    Order.find().populate('user', 'name').sort({ createdAt: -1 }),
    Product.find({ stock: { $lte: 5 } }).select('name stock').limit(6),
  ]);
  const paid = orders.filter((o) => o.isPaid);
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i));
    return { start: +d, label: d.toLocaleDateString('en-IN', { weekday: 'short' }), total: 0 };
  });
  paid.forEach((o) => {
    const t = +new Date(o.createdAt);
    const day = days.find((d) => t >= d.start && t < d.start + 864e5);
    if (day) day.total += o.total;
  });
  res.json({
    users, products, orders: orders.length, lowStock,
    revenue: paid.reduce((s, o) => s + o.total, 0),
    pending: orders.filter((o) => ['Pending', 'Processing'].includes(o.status)).length,
    recent: orders.slice(0, 6),
    sales: days.map(({ label, total }) => ({ label, total })),
  });
}));

router.get('/users', wrap(async (req, res) => res.json(await User.find().select('-password').sort({ createdAt: -1 }))));

router.put('/users/:id/role', wrap(async (req, res) => {
  if (req.params.id === String(req.user._id)) throw httpError(400, 'You cannot change your own role');
  const u = await User.findByIdAndUpdate(req.params.id, { isAdmin: !!req.body.isAdmin }, { new: true }).select('-password');
  if (!u) throw httpError(404, 'User not found');
  res.json(u);
}));

router.delete('/users/:id', wrap(async (req, res) => {
  if (req.params.id === String(req.user._id)) throw httpError(400, 'You cannot delete your own account');
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

module.exports = router;
